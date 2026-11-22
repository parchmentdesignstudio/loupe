// Claude for the preview's chat, while it runs locally: POST /__loupe/claude with the conversation so far and the page
// it's asked from, and it answers in words and, when a view says it better, a tree of Loupe blocks drawn through
// render_ui. Before drawing it can read Loupe's guides and look up a component, and each step is sent as it starts, a
// line of JSON at a time, so the chat can say what it's doing. The key is read on this side, from ANTHROPIC_API_KEY or
// packages/ui/.env or .env.local, so it never reaches the page. A tree that breaks the catalogue goes back to Claude
// with what's wrong, for it to draw again, so the page only gets one that draws
import Anthropic, { APIError, AuthenticationError, RateLimitError } from '@anthropic-ai/sdk';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { loadEnv } from 'vite';

export const path = '/__loupe/claude';
// The models and efforts a request may pick, for the evals to compare and, later, a picker in the composer. Opus at
// medium unless it says otherwise. Haiku has no server-side fallback, and it's only been tried with Opus, so only Opus
// asks for one
export const models = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];
export const efforts = ['low', 'medium', 'high'];
const fallsBack = (model) => model.startsWith('claude-opus');
// Drawing again after an error is rare, and three goes is plenty to tell a tree that won't come right
const attempts = 3;
// Every call in an answer, lookups and drawing together, so one that keeps looking things up still ends
const steps = 8;

const system = `You answer questions in a chat inside Loupe, a component library's preview. When a view would answer better than words, such as a table of records, a form, a few stats or a settings panel, call render_ui once with a tree of Loupe's blocks. Otherwise answer in words alone.

Your words show as plain paragraphs, so write no Markdown: no bold, lists or headings. Alongside a view, say in two or three sentences what stands out, as the view carries the detail; don't list what it contains.

The schema is the whole of what exists: every block, prop and option is listed, and nothing else can be drawn. Sample data you make up should be plausible and specific, with real-looking names, dates and amounts in British English.

How Loupe is used:
- One primary Button in the whole view, for its one next step. Everything else is secondary, or ghost where space is tight. A Button's action is sent back to you as the next message, so give it one that asks for what it would do.
- A page's root is a Stack with gap 8 between sections. A Heading with level page names the view once. A section is a Heading with level section over its content at gap 4.
- A Table is its own box: never in a Card. Amounts and counts are align end. Exactly one column is the row header, the one that names each row. Status goes in its own column as a Status, never a word on its own.
- Cards are only for things among other cards, such as stats in a Grid: a group label, then the figure as Text with size title.
- Settings are Switches, which take effect at once, with no Save button. A form that is submitted ends with its one primary Button.
- Labels and headings are sentence case. Buttons say what happens, such as Send invoice, never Submit or OK.

Controls, when asked for them, or to tweak, adjust or try out a view:
- Name what's worth adjusting in values, set to what you'd pick, and have each prop read its value with {"$value": name}. A value read by several props moves them together, such as every section gap. To show or hide a block, give it when, with the name of a true or false value.
- List the controls in groups, such as Spacing, Content and Style, each naming a label and a value. Don't say what kind of control it is or how far it goes: that comes from the props that read the value, so a gap gets a slider over Loupe's steps and a variant a choice of its options.
- Offer controls rather than buttons that ask you to redraw the view. They change it as they move, without you.
- The user's next message says where they left the controls. Draw from there when you draw again.

Looking things up:
- Loupe's guides say which component to use over its alternative, which variant applies where, and how a form, a list or a page is laid out. They're written for code, but render_ui's blocks are those components, so the same choices hold. Before drawing a form, a table, a settings panel or anything with more than a few blocks, read the guide for it with read_guide, unless you've read it already for this answer. The overview is below.
- To answer a question about a component, such as what it's for or what it takes, look it up with get_component rather than from memory.
- Don't look up what a simple view doesn't need. Each lookup is a step the user watches.`;

// Each guide is one of the Loupe skill's references, or the skill on product design, read from skills as the agent
// skill ships them, without their front matter
const topics = {
	actions: 'loupe/references/actions.md',
	collections: 'loupe/references/collections.md',
	content: 'loupe/references/content.md',
	feedback: 'loupe/references/feedback.md',
	forms: 'loupe/references/forms.md',
	overlays: 'loupe/references/overlays.md',
	tokens: 'loupe/references/tokens.md',
	'product-design': 'product-design/SKILL.md',
};
const withoutFrontMatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n+/, '');

// A component as get_component answers: what it's for, and its props, with their options and defaults, compact
const componentOf = (detail) =>
	JSON.stringify({
		name: detail.name,
		doc: detail.doc,
		props: detail.props?.map(({ name, type, options, default: initial, doc, required }) => ({ name, ...(options?.length ? { options } : type && { type: type.length > 80 ? `${type.slice(0, 80)}…` : type }), ...(initial && { default: initial }), ...(required && { required }), ...(doc && { doc }) })),
		...(detail.parts?.length && { drawsWith: detail.parts }),
	});

let client;
let tools;
let validate;
let panelOf;
let guides;
let overview;
let components;

async function setUp(server) {
	// The preview's root is preview, so the package's own .env.local is a folder up
	const root = dirname(server.config.root);
	const env = loadEnv(server.config.mode, root, '');
	// Made again when the key changes, so one added while the preview runs is used without a restart. With no key in
	// either place, the SDK looks for an ant auth login profile of its own
	const key = process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY;
	if (!client || client.apiKey !== (key ?? client.apiKey)) client = new Anthropic(key ? { apiKey: key } : {});
	// Loaded each time, so the catalogue and the guides follow the source as it changes, as virtual:details does
	const { default: details } = await server.ssrLoadModule('virtual:details');
	const catalogue = await server.ssrLoadModule('/genui/catalogue.ts');
	const schema = catalogue.inputSchemaOf(catalogue.blocksOf(details));
	const skills = join(root, 'skills');
	guides = Object.fromEntries(await Promise.all(Object.entries(topics).map(async ([topic, file]) => [topic, withoutFrontMatter(await readFile(join(skills, file), 'utf8'))])));
	overview = withoutFrontMatter(await readFile(join(skills, 'loupe/SKILL.md'), 'utf8'));
	components = Object.fromEntries(Object.values(details.components).filter((detail) => detail.kind === 'component').map((detail) => [detail.name, detail]));
	tools = [
		{
			name: 'read_guide',
			description: 'Reads one of Loupe’s guides: which component to use over its alternative, which variant applies where, and how it’s laid out. actions: buttons, links, menus, toolbars. collections: tables, lists, tabs, navigation. content: prose, quotes, code, chat. feedback: status, alerts, empty states, progress. forms: fields, choices, dates, files, search, and how a form is laid out. overlays: dialogs, drawers, popovers, toasts. tokens: colour, type, space, corners and shadows. product-design: how buttons give feedback rather than being disabled',
			input_schema: { type: 'object', properties: { topic: { enum: Object.keys(topics) } }, required: ['topic'], additionalProperties: false },
		},
		{
			name: 'get_component',
			description: 'Looks up one of Loupe’s components by name: what it’s for, and its props with their options and defaults, from the source',
			input_schema: { type: 'object', properties: { name: { enum: Object.keys(components).toSorted() } }, required: ['name'], additionalProperties: false },
		},
		{
			name: 'render_ui',
			description: 'Draws a view with Loupe’s components, in the conversation under your reply. Use it when the answer is records, a form, stats or settings, and say in words what it shows',
			input_schema: schema,
			eager_input_streaming: true,
		},
	];
	validate = (input) => catalogue.validate(input, schema);
	panelOf = (input) => catalogue.panelOf(input, schema);
}

// What the page sends: each turn's words, and the view it was shown, with its values and controls, which Claude is
// told of as words of its own
const historyOf = (messages) =>
	messages.map(({ role, text, ui, values, controls }) => ({
		role,
		content: ui ? `${text}\n\n[The view drawn with render_ui]\n${JSON.stringify({ ui, values, controls })}` : text,
	}));

// What the user watches while Claude works, as each step starts
const guideNames = { actions: 'the actions guide', collections: 'the collections guide', content: 'the content guide', feedback: 'the feedback guide', forms: 'the forms guide', overlays: 'the overlays guide', tokens: 'the tokens guide', 'product-design': 'the product design guide' };
const stepOf = (call) => {
	if (call.name === 'read_guide') return `Reading ${guideNames[call.input?.topic] ?? 'a guide'}`;
	if (call.name === 'get_component') return `Looking up ${call.input?.name ?? 'a component'}`;
};

// Where the user is in the preview, so "this" and "here" mean something
const placeOf = (page) => (page?.title ? ` They're on the preview's page for ${page.title}${page.path ? `, at ${page.path}` : ''}.` : '');

async function answer(messages, page, onStep, { model = models[0], effort = 'medium' } = {}) {
	const conversation = historyOf(messages);
	let ui;
	let summary;
	let title;
	let values;
	let panel;
	let controls;
	let drawn = 0;
	// What the answer took, for the evals: each step and when it started, the trees sent back, and the tokens
	const started = Date.now();
	const trace = { model, effort, steps: [], problems: 0, errors: [], calls: 0, usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };
	const step = (label) => {
		trace.steps.push({ label, at: Date.now() - started });
		onStep(label);
	};
	const reply = (text) => ({ text, ui, summary, title, values, controls, panel, trace: { ...trace, drawn, ms: Date.now() - started } });
	for (let turn = 0; turn < steps; turn++) {
		const stream = client.beta.messages.stream({
			model,
			max_tokens: 64000,
			// Said outright, so a change of model doesn't quietly change it
			output_config: { effort },
			// A decline goes on to a model picked for its kind, rather than ending the reply
			...(fallsBack(model) && { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }),
			cache_control: { type: 'ephemeral' },
			// The date and the page last, after what's cached, so made-up records are this month's rather than the model's
			// guess at it
			system: [
				{ type: 'text', text: `${system}\n\nThe overview of Loupe's guide:\n\n${overview}` },
				{ type: 'text', text: `Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.${placeOf(page)}` },
			],
			tools,
			messages: conversation,
		});
		// Drawing is the long part, so it's said as it starts. A lookup is said once its input is whole
		stream.on('streamEvent', (event) => {
			if (event.type === 'content_block_start' && event.content_block.type === 'tool_use' && event.content_block.name === 'render_ui') step(drawn ? 'Drawing it again' : 'Drawing the view');
		});
		stream.on('contentBlock', (block) => {
			const label = block.type === 'tool_use' && stepOf(block);
			if (label) step(label);
		});
		const response = await stream.finalMessage();
		trace.calls++;
		trace.usage.input += response.usage.input_tokens ?? 0;
		trace.usage.output += response.usage.output_tokens ?? 0;
		trace.usage.cacheRead += response.usage.cache_read_input_tokens ?? 0;
		trace.usage.cacheWrite += response.usage.cache_creation_input_tokens ?? 0;
		const words = response.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n\n').trim();
		if (response.stop_reason === 'refusal') return { ...reply(words || 'Claude couldn’t help with that one.'), ui: undefined };
		if (response.stop_reason === 'max_tokens') return reply(words || 'That reply ran too long to finish.');
		const calls = response.content.filter((block) => block.type === 'tool_use');
		if (response.stop_reason !== 'tool_use' || !calls.length) return reply(words);

		// Every call gets its result back in the one message, and only a tree that passes is kept
		let problems = 0;
		const results = calls.map((call) => {
			const result = (content, isError = false) => ({ type: 'tool_result', tool_use_id: call.id, content, ...(isError && { is_error: true }) });
			if (call.name === 'read_guide') return guides[call.input?.topic] ? result(guides[call.input.topic]) : result(`There's no guide called ${call.input?.topic}`, true);
			if (call.name === 'get_component') return components[call.input?.name] ? result(componentOf(components[call.input.name])) : result(`There's no component called ${call.input?.name}`, true);
			if (call.name !== 'render_ui') return result(`There's no tool called ${call.name}`, true);
			if (++drawn > attempts) return result('That’s as many goes as there are. Say in words what you meant to show.', true);
			const errors = validate(call.input);
			if (errors.length) {
				problems += errors.length;
				trace.problems += errors.length;
				trace.errors.push(...errors);
				return result(`It can't be drawn:\n${errors.join('\n')}\nFix these and call render_ui again.`, true);
			}
			ui = call.input.ui;
			summary = call.input.summary;
			title = call.input.title;
			values = call.input.values;
			controls = call.input.controls;
			panel = controls ? panelOf(call.input) : undefined;
			return result('Drawn under your reply.');
		});
		if (problems) step(problems === 1 ? 'Fixing a problem' : `Fixing ${problems} problems`);
		else if (calls.some((call) => call.name === 'render_ui')) step('Writing it up');
		else step('Thinking it over');
		conversation.push({ role: 'assistant', content: response.content }, { role: 'user', content: results });
	}
	return reply(ui ? 'Here’s the view. I ran out of steps before saying more about it.' : 'Claude couldn’t finish that in the steps it has. Try asking for less at once.');
}

export function claude() {
	return {
		name: 'claude',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(path, (req, res) => {
				const reply = (status, body) => {
					res.statusCode = status;
					res.setHeader('content-type', 'application/json');
					res.end(JSON.stringify(body));
				};
				if (req.method !== 'POST') return reply(405, { error: 'POST the conversation' });
				// Each step as a line of JSON while Claude works, and the answer as the last. An error before the first step
				// still gets a status of its own
				const line = (body) => {
					if (!res.headersSent) {
						res.statusCode = 200;
						res.setHeader('content-type', 'application/x-ndjson');
						res.setHeader('cache-control', 'no-cache');
					}
					res.write(`${JSON.stringify(body)}\n`);
				};
				const fail = (status, error) => (res.headersSent ? res.end(`${JSON.stringify({ error })}\n`) : reply(status, { error }));
				void (async () => {
					try {
						let body = '';
						for await (const chunk of req) body += chunk;
						const { messages, page, model, effort } = JSON.parse(body);
						if (!Array.isArray(messages) || !messages.length) return reply(400, { error: 'Send { messages: [{ role, text }] }' });
						if (model !== undefined && !models.includes(model)) return reply(400, { error: `model is one of ${models.join(', ')}` });
						if (effort !== undefined && !efforts.includes(effort)) return reply(400, { error: `effort is one of ${efforts.join(', ')}` });
						await setUp(server);
						line({ answer: await answer(messages, page, (step) => line({ step }), { model, effort }) });
						res.end();
					} catch (error) {
						if (error instanceof AuthenticationError || (!(error instanceof APIError) && /authentication method/i.test(String(error)))) return fail(503, 'No key for Claude. Put ANTHROPIC_API_KEY in packages/ui/.env.local');
						if (error instanceof RateLimitError) return fail(429, 'Claude is busy. Try again in a moment');
						if (error instanceof APIError) return fail(502, `Claude said ${error.status}: ${error.message}`);
						fail(500, error instanceof Error ? error.message : String(error));
					}
				})();
			});
		},
	};
}
