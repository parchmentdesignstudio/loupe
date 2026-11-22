// Runs Ask Loupe's test asks against the preview's own chat server, as the chat sends them, and saves what came back to
// results, for the gallery at #/evals to show side by side. The preview must be running: pnpm --filter @parchment/ui dev
//
//   node preview/genui/evals/run.mjs                      every ask, on Opus at medium
//   node preview/genui/evals/run.mjs --only booking,faq   just these
//   node preview/genui/evals/run.mjs --model claude-sonnet-5-5 --effort low
//   node preview/genui/evals/run.mjs --dry                no Claude: each ask gets a fixed view, to check the gallery
//
// Every run but a dry one is billed, so it says what it will run and waits for Enter first, unless given --yes
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const flags = process.argv.slice(2);
const flag = (name) => {
	const at = flags.indexOf(`--${name}`);
	return at === -1 ? undefined : flags[at + 1];
};
const has = (name) => flags.includes(`--${name}`);

const port = flag('port') ?? '5199';
const model = flag('model') ?? 'claude-opus-5-5';
const effort = flag('effort') ?? 'medium';
const only = flag('only')?.split(',');
// A few at once, so a run takes minutes rather than a quarter of an hour, without leaning on the rate limit
const together = Number(flag('together') ?? 3);
const isDry = has('dry');

const asks = JSON.parse(await readFile(join(here, 'asks.json'), 'utf8')).filter((ask) => !only || only.includes(ask.id));
if (!asks.length) throw new Error(`No asks match --only ${only}`);

// Dollars per million tokens, from Anthropic's price list on 22 November 2026. A cache write is 1.25 times input
const prices = {
	'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
	'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.1 },
	// Haiku's cache read isn't listed, so it's taken as a tenth of input, as the others are near
	'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheRead: 0.01 },
};
const costOf = (usage, of) => {
	const price = prices[of];
	if (!price || !usage) return 0;
	return (usage.input * price.input + usage.output * price.output + usage.cacheRead * price.cacheRead + usage.cacheWrite * price.input * 1.25) / 1e6;
};

// One turn, as the chat sends it, reading the steps and the answer off the stream as lines of JSON
async function turn(messages, page) {
	const response = await fetch(`http://localhost:${port}/__loupe/claude`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ messages, page, model, effort }),
	}).catch(() => {
		throw new Error(`Nothing at localhost:${port}. Start the preview first: pnpm --filter @parchment/ui dev`);
	});
	let found;
	let failed;
	if (!response.ok && !response.headers.get('content-type')?.includes('ndjson')) failed = (await response.json()).error;
	else {
		const lines = (await response.text()).split('\n').filter(Boolean).map((line) => JSON.parse(line));
		found = lines.find((line) => line.answer)?.answer;
		failed = lines.find((line) => line.error)?.error;
	}
	if (failed) throw new Error(failed);
	return found;
}

// In a dry run, every ask gets the same small view, so the gallery can be checked without spending anything
const dry = (ask) => ({
	text: `A dry run: this is where Claude’s words about “${ask.ask}” would be.`,
	title: ask.name,
	summary: 'A dry run',
	ui: { type: 'Stack', gap: 4, children: [{ type: 'Heading', level: 'section', text: ask.name }, { type: 'Text', text: ask.expect, tone: 'muted' }, { type: 'Button', label: 'Do the thing', variant: 'primary' }] },
	trace: { model: 'dry', effort, steps: [{ label: 'Drawing the view', at: 0 }], problems: 0, errors: [], calls: 1, drawn: 1, ms: 0, usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
});

async function run(ask) {
	const started = Date.now();
	try {
		if (isDry) return { ...ask, turns: [dry(ask), ...(ask.then ? [dry({ ...ask, ask: ask.then })] : [])] };
		const first = await turn([{ role: 'user', text: ask.ask }], ask.page);
		const turns = [first];
		// A follow-up goes with the first answer and its view, as the chat sends them
		if (ask.then) turns.push(await turn([{ role: 'user', text: ask.ask }, { role: 'assistant', text: first.text, ui: first.ui, values: first.values, controls: first.controls }, { role: 'user', text: ask.then }], ask.page));
		return { ...ask, turns };
	} catch (error) {
		return { ...ask, turns: [], error: error instanceof Error ? error.message : String(error), ms: Date.now() - started };
	} finally {
		console.log(`  ${ask.id} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
	}
}

console.log(`${isDry ? 'A dry run of' : 'Running'} ${asks.length} asks${isDry ? '' : ` on ${model} at ${effort} effort`}, ${together} at a time`);
if (!isDry && !has('yes')) {
	const line = createInterface({ input: process.stdin, output: process.stdout });
	await line.question('It’s billed to the key in packages/ui/.env.local. Enter to go on, Ctrl-C to stop ');
	line.close();
}

const started = new Date();
const results = Array.from({ length: asks.length });
let next = 0;
await Promise.all(
	Array.from({ length: Math.min(together, asks.length) }, async () => {
		while (next < asks.length) {
			const at = next++;
			results[at] = await run(asks[at]);
		}
	}),
);

for (const result of results) for (const answer of result.turns) answer.trace.cost = costOf(answer.trace.usage, answer.trace.model);
const all = results.flatMap((result) => result.turns);
const seconds = all.map((answer) => answer.trace.ms / 1000).toSorted((a, b) => a - b);
const totals = {
	asks: results.length,
	failed: results.filter((result) => result.error).length,
	cost: all.reduce((sum, answer) => sum + answer.trace.cost, 0),
	medianSeconds: seconds[Math.floor(seconds.length / 2)] ?? 0,
	problems: all.reduce((sum, answer) => sum + answer.trace.problems, 0),
};
const id = started.toISOString().replace(/[:.]/g, '-');
const saved = { id, at: started.toISOString(), model: isDry ? 'dry' : model, effort, totals, results };
await mkdir(join(here, 'results'), { recursive: true });
await writeFile(join(here, 'results', `${id}.json`), `${JSON.stringify(saved, null, '\t')}\n`);

console.log(`\n${totals.asks} asks, ${totals.failed} failed, ${totals.problems} problems sent back, median ${totals.medianSeconds.toFixed(0)}s, $${totals.cost.toFixed(2)}`);
for (const result of results.filter((each) => each.error)) console.log(`  ${result.id}: ${result.error}`);
console.log(`Saved to preview/genui/evals/results/${id}.json. See it at http://localhost:${port}/#/evals`);
