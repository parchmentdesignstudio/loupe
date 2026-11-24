import { useEffect, useState } from 'react';
import { Button, Code, EmptyState, ListBoxItem, Select, TextField, ToggleButton, ToggleButtonGroup } from '../../../src/index.js';
import { type Node, type Panel, type Values } from '../catalogue.js';
import { Generated } from '../render.js';

// Ask Loupe's test asks, as a run of run.mjs answered them, one under another: what was asked and what good looks like,
// what Claude said and drew, and what it took. Each can be marked good or not with a note. While the preview runs
// locally, reviews are saved beside the runs, in reviews/, where a conversation about what to fix can read them. The
// whole review can still be copied, and the hosted preview keeps them in this browser

interface Trace {
	model: string;
	effort: string;
	steps: { label: string; at: number }[];
	problems: number;
	errors: string[];
	calls: number;
	drawn: number;
	ms: number;
	cost?: number;
	usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
}

interface Answer {
	text: string;
	ui?: Node;
	title?: string;
	values?: Values;
	panel?: Panel[];
	trace: Trace;
}

interface Result {
	id: string;
	name: string;
	ask: string;
	then?: string;
	expect: string;
	page?: { title: string; path?: string };
	turns: Answer[];
	error?: string;
}

interface Run {
	id: string;
	at: string;
	model: string;
	effort: string;
	totals: { asks: number; failed: number; cost: number; medianSeconds: number; problems: number };
	results: Result[];
}

type Verdict = 'good' | 'fix';
interface Review {
	verdict?: Verdict;
	note: string;
}

// Each run's file, loaded when it's picked, newest first by its name, which is when it started
const files = import.meta.glob<Run>('./results/*.json', { import: 'default' });
const names = Object.keys(files).toSorted().toReversed();

// Run ids are when each started, as their files are named
const idOf = (name: string) => name.replace(/^.*\//, '').replace(/\.json$/, '');

// The browser's copy, for the hosted preview, which can't save files. A private window or cleared storage just starts
// them empty
const storeKey = (run: string) => `loupe-evals:${run}`;
const load = (run: string): Record<string, Review> => {
	try {
		return JSON.parse(localStorage.getItem(storeKey(run)) ?? '{}');
	} catch {
		return {};
	}
};
const save = (run: string, reviews: Record<string, Review>) => {
	try {
		localStorage.setItem(storeKey(run), JSON.stringify(reviews));
	} catch {
		// Nowhere to keep it, so it lasts as long as the page
	}
};

// Every run's reviews from the files, or nothing on the hosted preview, which doesn't have them
async function fetchReviews(): Promise<Record<string, Record<string, Review>>> {
	try {
		const response = await fetch('/__loupe/reviews');
		return response.ok ? await response.json() : {};
	} catch {
		return {};
	}
}
const send = (run: string, reviews: Record<string, Review>) => void fetch('/__loupe/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ run, reviews }) }).catch(() => {});

// How an ask went in the latest run before this one to mark it, to judge this one against
interface Earlier extends Review {
	run: string;
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(0)}s`;
const dollars = (cost = 0) => `$${cost.toFixed(cost < 0.1 ? 3 : 2)}`;
const thousands = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const dateOf = (at: string) => new Date(at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Turn({ asked, answer }: { asked: string; answer: Answer }) {
	const { trace } = answer;
	return (
		<div className="flex flex-col gap-3">
			<p className="self-end rounded-xl bg-[color-mix(in_oklab,var(--color-bleed)_8%,transparent)] px-3 py-2 text-body">{asked}</p>
			<p className="text-body text-pretty">{answer.text}</p>
			<p className="text-label text-muted tabular-nums">
				{seconds(trace.ms)} · {trace.steps.map((step) => step.label).join(', ') || 'no steps'} · {trace.problems ? `${trace.problems} sent back` : 'drawn first time'} · {thousands(trace.usage.output)} out, {thousands(trace.usage.input + trace.usage.cacheRead + trace.usage.cacheWrite)} in · {dollars(trace.cost)}
			</p>
			{trace.errors.length > 0 && <Code title="What the checker sent back" code={trace.errors.join('\n')} isCopyable={false} />}
			{answer.ui && <Generated ui={answer.ui} title={answer.title} values={answer.values} panel={answer.panel} />}
		</div>
	);
}

function Case({ result, review, earlier, onReview }: { result: Result; review: Review; earlier?: Earlier; onReview: (review: Review) => void }) {
	// The note keeps its own text as it's typed, and hands it up once typing pauses, as each review redraws every view
	const [note, setNote] = useState(review.note);
	const commit = () => {
		if (note !== review.note) onReview({ ...review, note });
	};
	useEffect(() => {
		if (note === review.note) return;
		const timer = setTimeout(() => onReview({ ...review, note }), 400);
		return () => clearTimeout(timer);
	}, [note, review, onReview]);
	return (
		<section id={result.id} aria-labelledby={`${result.id}-name`} className="flex scroll-mt-6 flex-col gap-4 border-t border-bleed/8 pt-8">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<h2 id={`${result.id}-name`} className="text-body font-medium">
						{result.name}
					</h2>
					<p className="max-w-[65ch] text-label text-muted">
						{result.page && <>From the {result.page.title} page. </>}Good looks like: {result.expect}
					</p>
					{earlier && (
						<p className="max-w-[65ch] text-label text-muted">
							Last marked in the run of {dateOf(earlier.run.replace(/T(\d+)-(\d+)-(\d+)-(\d+)Z$/, 'T$1:$2:$3.$4Z'))}: {earlier.verdict === 'good' ? 'good' : earlier.verdict === 'fix' ? 'needs work' : 'not marked'}
							{earlier.note ? `. ${earlier.note}` : ''}
						</p>
					)}
				</div>
				<ToggleButtonGroup aria-label={`How ${result.name} went`} size="small" selectionMode="single" disallowEmptySelection={false} selectedKeys={review.verdict ? [review.verdict] : []} onSelectionChange={(keys) => onReview({ ...review, verdict: [...keys][0] as Verdict | undefined })}>
					<ToggleButton id="good">Good</ToggleButton>
					<ToggleButton id="fix">Needs work</ToggleButton>
				</ToggleButtonGroup>
			</div>
			{result.error ? (
				<p className="text-body text-danger">It failed: {result.error}</p>
			) : (
				result.turns.map((answer, index) => <Turn key={index} asked={index === 0 ? result.ask : (result.then ?? '')} answer={answer} />)
			)}
			<TextField label="Note" description="What to change, in the guides, a block’s doc or the checker" isMultiline value={note} onChange={setNote} onBlur={commit} />
		</section>
	);
}

/** The gallery of eval runs, at #/evals */
export function Evals() {
	const [name, setName] = useState(names[0]);
	const [run, setRun] = useState<Run>();
	const [reviews, setReviews] = useState<Record<string, Review>>({});
	const [saved, setSaved] = useState<Record<string, Record<string, Review>>>();
	const [isCopied, setCopied] = useState(false);
	// Reviews made before they were saved to files are still in this browser, so any the files don't have go to them
	useEffect(() => {
		void fetchReviews().then((files) => {
			const all = { ...files };
			try {
				for (const key of Object.keys(localStorage).filter((each) => each.startsWith(storeKey('')))) {
					const run = key.slice(storeKey('').length);
					const local = load(run);
					if (all[run] || Object.keys(local).length === 0) continue;
					all[run] = local;
					send(run, local);
				}
			} catch {}
			setSaved(all);
		});
	}, []);
	useEffect(() => {
		document.title = 'Evals · loupe';
	}, []);
	// The saved reviews, or this browser's on the hosted preview. Only a new run or the first load of reviews loads one,
	// not each review saved
	const hasSaved = saved !== undefined;
	useEffect(() => {
		if (!name || !saved) return;
		let isCurrent = true;
		void files[name]().then((loaded) => {
			if (!isCurrent) return;
			setRun(loaded);
			setReviews(saved[loaded.id] ?? load(loaded.id));
		});
		return () => {
			isCurrent = false;
		};
	}, [name, hasSaved]);
	useEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [isCopied]);

	const review = (id: string, next: Review) => {
		if (!run) return;
		const all = { ...reviews, [id]: next };
		setReviews(all);
		save(run.id, all);
		send(run.id, all);
		setSaved((before) => ({ ...before, [run.id]: all }));
	};
	const earlierOf = (ask: string): Earlier | undefined => {
		if (!run || !saved) return undefined;
		for (const older of names.slice(names.indexOf(name) + 1).map(idOf)) {
			const each = saved[older]?.[ask];
			if (each?.verdict || each?.note) return { ...each, run: older };
		}
		return undefined;
	};
	// The review as text to paste: each ask that's been looked at, with its verdict and note
	const copy = () => {
		if (!run) return;
		const lines = run.results.flatMap((result) => {
			const each = reviews[result.id];
			if (!each?.verdict && !each?.note) return [];
			return [`- ${result.id} (${result.name}): ${each.verdict === 'good' ? 'good' : each.verdict === 'fix' ? 'needs work' : 'not marked'}${each.note ? `. ${each.note}` : ''}`];
		});
		void navigator.clipboard.writeText(`Eval run ${run.id}, ${run.model} at ${run.effort}\n${lines.join('\n') || 'Nothing reviewed yet'}`).then(() => setCopied(true));
	};

	const marked = run ? run.results.filter((result) => reviews[result.id]?.verdict).length : 0;
	const good = run ? run.results.filter((result) => reviews[result.id]?.verdict === 'good').length : 0;

	return (
		<div className="min-h-dvh bg-panel text-ink">
			<main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-10">
				<header className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<h1 className="text-title">Ask Loupe evals</h1>
						<p className="max-w-[65ch] text-muted">The test asks as a run answered them. Mark each one and say what to change, to fix the guides rather than the answers. Marks are saved beside the runs, where Claude can read them.</p>
					</div>
					{names.length > 0 && (
						<div className="flex flex-wrap items-end gap-3">
							<Select label="Run" items={names.map((id) => ({ id }))} selectedKey={name} onSelectionChange={(key) => setName(String(key))} className="w-72">
								{(item) => <ListBoxItem id={item.id}>{item.id.replace(/^.*\//, '').replace(/\.json$/, '')}</ListBoxItem>}
							</Select>
							<Button variant="secondary" onPress={copy}>
								{isCopied ? 'Copied' : 'Copy review'}
							</Button>
						</div>
					)}
					{run && (
						<p className="text-label text-muted tabular-nums">
							{dateOf(run.at)} · {run.model} at {run.effort} · {run.totals.asks} asks, {run.totals.failed} failed · {run.totals.problems} sent back by the checker · median {run.totals.medianSeconds.toFixed(0)}s · {dollars(run.totals.cost)} · {marked ? `${good} of ${marked} marked good` : 'none marked yet'}
						</p>
					)}
				</header>
				{names.length === 0 ? (
					<EmptyState title="No runs yet">
						Start the preview, then run the asks with node preview/genui/evals/run.mjs from packages/ui. Add --dry to check this page without spending anything.
					</EmptyState>
				) : (
					run?.results.map((result) => <Case key={`${run.id}-${result.id}`} result={result} review={reviews[result.id] ?? { note: '' }} earlier={earlierOf(result.id)} onReview={(next) => review(result.id, next)} />)
				)}
			</main>
		</div>
	);
}
