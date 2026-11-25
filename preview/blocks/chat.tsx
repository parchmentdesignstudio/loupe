import { useEffect, useRef, useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, Chip, Composer, DialogClose, Header, Menu, MenuItem, MenuSection, MenuTrigger, Popover, DialogHeading, Drawer, DrawerTrigger, Message, MessageList, Scribble, Suggestion, Suggestions, TextEffect } from '../../src/index.js';
import { codeOf } from '../code.js';
import type { Node, Panel, Values } from '../genui/catalogue.js';
import { Generated } from '../genui/render.js';
import { efforts, models } from '../genui/models.mjs';
import { ParchmentLogo } from '../logo.js';
import { bodyOf } from '../playgrounds/overlay.js';
import { Choice, ControlGroup, Playground, TextControl, pick, useRemembered } from '../playground.js';

// A chat in a drawer that pushes the page aside, so what's asked about stays in view. It opens on what to ask first,
// and after each reply offers what to ask next. While a reply is thought over, a ray loops over
// the word. Composer sits at the foot, as a drawer's actions do, and stays live, so a question can follow straight on.
// While the preview runs locally it can ask Claude instead, which answers with views drawn from Loupe's own blocks

interface Turn {
	from: 'user' | 'assistant';
	text: string;
	/** A view Claude drew with render_ui, and its name */
	ui?: Node;
	title?: string;
	/** What its values start at, the controls Claude asked for, and those controls as they're drawn */
	values?: Values;
	controls?: unknown;
	panel?: Panel[];
	/** Its values as the controls have left them */
	tweaked?: Values;
	/** Sent with a question, unseen: where the last view's controls were left */
	note?: string;
	/** Files sent with a question. Their contents aren't kept over a reload, only their names */
	files?: Attachment[];
	isError?: boolean;
}

// Each with an icon in a colour of its own, so they're told apart at a glance
type Starter = { question: string; icon: IconName; colour: string };
const starters: Starter[] = [
	{ question: 'What should I cook tonight?', icon: 'clock', colour: 'var(--color-orange-41)' },
	{ question: 'Plan a week of lunches', icon: 'list-bullet-rectangle-portrait', colour: 'var(--color-green-46)' },
	{ question: 'What’s in season now?', icon: 'sun-max', colour: 'var(--color-blue-56)' },
];
const replies: Record<string, string[]> = {
	'What should I cook tonight?': ['A leek and potato soup is the quickest, about 40 minutes start to finish.', 'Soften the leeks in butter first, slowly, so they turn sweet rather than brown.'],
	'Plan a week of lunches': ['Make a big pot of lentils on Sunday. They’ll carry a salad on Monday, a soup by Wednesday and a stew to end the week.'],
	'What’s in season now?': ['Leeks, parsnips, kale and the last of the apples. Forced rhubarb starts soon.'],
};
const followUps = ['Could it be vegan?', 'How long does it keep?', 'What goes with it?'];
const fallback = ['Good question. In a real chat the answer would stream in here, a line at a time.'];
const claudeStarters: Starter[] = [
	{ question: 'Show this month’s overdue invoices', icon: 'tablecells', colour: 'var(--color-blue-56)' },
	{ question: 'A settings panel for notifications', icon: 'bell', colour: 'var(--color-violet-54)' },
	{ question: 'How did the shop do this week?', icon: 'sun-horizon', colour: 'var(--color-orange-41)' },
];

/** A file added in the composer, read in the browser, and sent with the next question */
interface Attachment {
	id: string;
	name: string;
	type: string;
	/** Text as it is, an image or PDF as base64. Gone after a reload */
	data?: string;
	/** Why it won't be sent, such as being too big */
	problem?: string;
}

// What Claude reads: images and PDFs as themselves, and text, from a note to a CSV or code. Anything else is turned back
const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const textNames = /\.(txt|md|markdown|csv|tsv|json|ya?ml|xml|svg|html?|css|jsx?|tsx?|mjs|py|rb|go|rs|swift|sql|log)$/i;
const kindOf = ({ name, type }: File) => (imageTypes.includes(type) ? 'image' : type === 'application/pdf' ? 'pdf' : type.startsWith('text/') || type === 'application/json' || textNames.test(name) ? 'text' : undefined);
// The API takes an image up to 5 MB. Text is held lower, as a long file costs a lot of tokens on every question after
const limits = { image: 5, pdf: 20, text: 1 };
const accept = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/*', '.md', '.csv', '.json', '.yaml', '.yml', '.ts', '.tsx', '.js', '.jsx'].join(',');

async function read(file: File): Promise<Attachment> {
	const kind = kindOf(file);
	const base = { id: crypto.randomUUID(), name: file.name, type: kind === 'text' ? 'text/plain' : file.type };
	if (!kind) return { ...base, problem: 'Can’t be read' };
	if (file.size > limits[kind] * 1024 * 1024) return { ...base, problem: `Over ${limits[kind]} MB` };
	if (kind === 'text') return { ...base, data: await file.text() };
	const url = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
	return { ...base, data: url.slice(url.indexOf(',') + 1) };
}

// Icons from the set there is: no photo or document glyph yet, so a frame for an image and a note for the rest
const fileIcon = ({ name, type }: Attachment) => (type.startsWith('image/') ? 'frame' : type === 'application/pdf' ? 'note' : /\.[ct]sv$/i.test(name) ? 'tablecells' : 'note-text');

type Answer = { text?: string; ui?: Node; title?: string; values?: Values; controls?: unknown; panel?: Panel[] };

// The page it's asked from, by its name in the tab's title and its route, so "this" means something to Claude
const pageOf = () => ({ title: document.title.split(' · ')[0], path: location.hash.slice(1) || '/' });

const failed = (text: string): Turn => ({ from: 'assistant', text, isError: true });

// The conversation so far, as the endpoint takes it, and its reply: words, and a view when one says it better. The
// endpoint sends each step it takes as a line of JSON as it starts, and the answer last, so onStep hears each in turn
async function askClaude(turns: Turn[], onStep: (step: string) => void, { model, effort, hasPage }: Pick<Conversation, 'model' | 'effort'> & { hasPage: boolean }): Promise<Turn> {
	const messages = turns.filter((turn) => !turn.isError).map(({ from, text, ui, values, controls, note, files }) => ({ role: from, text: note ? `${text}\n\n${note}` : text, ui, values, controls, files }));
	try {
		const response = await fetch('/__loupe/claude', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages, page: hasPage ? pageOf() : undefined, model, effort }) });
		if (!response.ok || !response.body) {
			const reply = (await response.json().catch(() => ({}))) as { error?: string };
			return failed(reply.error ?? `Claude didn’t answer (${response.status})`);
		}
		const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
		let buffer = '';
		for (;;) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += value;
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines.filter(Boolean)) {
				const event = JSON.parse(line) as { step?: string; answer?: Answer; error?: string };
				if (event.step) onStep(event.step);
				if (event.error) return failed(event.error);
				if (event.answer) return { from: 'assistant', text: event.answer.text ?? '', ui: event.answer.ui, title: event.answer.title, values: event.answer.values, controls: event.answer.controls, panel: event.answer.panel };
			}
		}
		return failed('Claude stopped before answering');
	} catch {
		return failed('Claude is only here while the preview runs locally, with pnpm dev');
	}
}

// The least a step shows for, so one followed straight away by the next can still be read
const STEP = 900;

// How long a reply takes to think over
const THINKING = 1600;

type Source = 'samples' | 'claude';

// Kept in the browser, so a refresh, or a reload as the preview rebuilds, doesn't lose the conversation or a question
// half written. A browser that won't keep it, as a private window may not, just starts afresh
const keyOf = (source: Source, part: 'turns' | 'draft' | 'model' | 'effort' | 'attached' | 'files') => `loupe:chat:${source}:${part}`;
function recall<T>(key: string, fallback: T): T {
	try {
		const stored = localStorage.getItem(key);
		return stored === null ? fallback : (JSON.parse(stored) as T);
	} catch {
		return fallback;
	}
}
function keep(key: string, value: unknown, isEmpty: boolean) {
	try {
		if (isEmpty) localStorage.removeItem(key);
		else localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}

// A question left without its answer, as when the page reloads while it's thought over, goes back in the field to send
// again, rather than sitting unanswered
function restore(source: Source) {
	const turns = recall<Turn[]>(keyOf(source, 'turns'), []);
	const draft = recall<string>(keyOf(source, 'draft'), '');
	const files = recall<Attachment[]>(keyOf(source, 'files'), []);
	const attached = recall<string[]>(keyOf(source, 'attached'), [PAGE]);
	const last = turns.at(-1);
	if (last?.from !== 'user') return { turns, draft, files, attached };
	// Its files go back with it, to send again
	return { turns: turns.slice(0, -1), draft: draft || last.text, files: [...(last.files ?? []), ...files], attached };
}

// A file's contents, which can run to megabytes, kept in IndexedDB rather than with the rest, which localStorage
// can't hold much of. Keyed by source and the file's id, so the samples chat and Claude's tidy only their own
const fileStore = <T,>(mode: IDBTransactionMode, use: (store: IDBObjectStore) => IDBRequest<T>) =>
	new Promise<T>((resolve, reject) => {
		const opening = indexedDB.open('loupe:chat', 1);
		opening.onupgradeneeded = () => opening.result.createObjectStore('files');
		opening.onerror = () => reject(opening.error);
		opening.onsuccess = () => {
			const request = use(opening.result.transaction('files', mode).objectStore('files'));
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		};
	});
const fileKey = (source: Source, id: string) => `${source}:${id}`;
const saveData = (source: Source, { id, data }: Attachment) => data !== undefined && fileStore('readwrite', (store) => store.put(data, fileKey(source, id))).catch(() => {});
async function loadData(source: Source, attachments: Attachment[]) {
	const found = await Promise.all(attachments.map((file) => fileStore<string | undefined>('readonly', (store) => store.get(fileKey(source, file.id))).catch(() => undefined)));
	return new Map(attachments.flatMap((file, at) => (found[at] === undefined ? [] : [[file.id, found[at]] as const])));
}
// Drops what nothing refers to any more, as a removed file or one from a conversation started over
async function tidyData(source: Source, keep: Set<string>) {
	const keys = await fileStore<IDBValidKey[]>('readonly', (store) => store.getAllKeys()).catch(() => []);
	const gone = keys.map(String).filter((key) => key.startsWith(`${source}:`) && !keep.has(key.slice(source.length + 1)));
	await Promise.all(gone.map((key) => fileStore('readwrite', (store) => store.delete(key)).catch(() => {})));
}

export interface Conversation {
	source: Source;
	turns: Turn[];
	isThinking: boolean;
	/** What Claude is doing while it thinks, such as Reading the forms guide */
	step?: string;
	ask: (question: string) => void;
	restart: () => void;
	/** Keeps where a view's controls were left, for the next question to carry */
	tweak: (turn: Turn, values: Values) => void;
	/** What's written in the field and not yet sent */
	draft: string;
	setDraft: (draft: string) => void;
	/** Who answers, and how hard it thinks, when Claude does */
	model: string;
	setModel: (model: string) => void;
	effort: Effort;
	setEffort: (effort: Effort) => void;
	/** What the next question is sent with: the page it's asked from, and views from earlier to ask about */
	attached: string[];
	setAttached: (attached: string[]) => void;
	/** Files added for the next question, read and ready, or turned back with why */
	files: Attachment[];
	addFiles: (files: File[]) => void;
	removeFile: (id: string) => void;
}

// The page, when it's attached, and each earlier view by where its turn is, as the menu and the chips both key them
const PAGE = 'page';
const viewKey = (at: number) => `view-${at}`;

type Effort = (typeof efforts)[number];

/**
 * A conversation, held where it's made rather than in the drawer, which lets go of what it holds once it has slid shut.
 * So one kept by the page carries on, reply and all, however often its drawer is closed
 */
export function useConversation(source: Source = 'samples', isRemembered = true): Conversation {
	const [restored] = useState(() => (isRemembered ? restore(source) : { turns: [], draft: '', files: [], attached: [PAGE] }));
	const [turns, setTurns] = useState<Turn[]>(restored.turns);
	const [draft, setDraft] = useState(restored.draft);
	useEffect(() => {
		// A file's contents can be megabytes, more than the browser keeps, so only its name is remembered
		const kept = turns.map((turn) => (turn.files ? { ...turn, files: turn.files.map(({ data: _, ...file }) => file) } : turn));
		if (isRemembered) keep(keyOf(source, 'turns'), kept, turns.length === 0);
	}, [isRemembered, source, turns]);
	useEffect(() => {
		if (isRemembered) keep(keyOf(source, 'draft'), draft, draft === '');
	}, [isRemembered, source, draft]);
	// Remembered whatever isRemembered says, as it's a setting rather than part of the conversation. One that's since
	// left the list goes back to the first
	const [model, setModel] = useState(() => models.find((each) => each.id === recall<string>(keyOf(source, 'model'), ''))?.id ?? models[0].id);
	const [effort, setEffort] = useState<Effort>(() => efforts.find((each) => each === recall<string>(keyOf(source, 'effort'), '')) ?? 'default');
	useEffect(() => keep(keyOf(source, 'model'), model, model === models[0].id), [source, model]);
	useEffect(() => keep(keyOf(source, 'effort'), effort, effort === 'default'), [source, effort]);
	// The page starts attached, as it's what's usually asked about. It stays until it's taken off, where views go once sent
	const [attached, setAttached] = useState<string[]>(restored.attached);
	const [files, setFiles] = useState<Attachment[]>(restored.files);
	useEffect(() => {
		if (isRemembered) keep(keyOf(source, 'attached'), attached, attached.length === 1 && attached[0] === PAGE);
	}, [isRemembered, source, attached]);
	useEffect(() => {
		if (isRemembered) keep(keyOf(source, 'files'), files.map(({ data: _, ...file }) => file), files.length === 0);
	}, [isRemembered, source, files]);
	// After a reload, each file's contents come back from IndexedDB, for the files waiting to go and those already sent
	useEffect(() => {
		if (!isRemembered) return;
		const waiting = restored.files.filter((file) => !file.problem);
		const sent = restored.turns.flatMap((turn) => turn.files ?? []);
		void loadData(source, [...waiting, ...sent]).then((found) => {
			if (found.size === 0) return;
			const fill = (file: Attachment) => (found.has(file.id) ? { ...file, data: found.get(file.id) } : file);
			setFiles((list) => list.map(fill));
			setTurns((list) => list.map((turn) => (turn.files ? { ...turn, files: turn.files.map(fill) } : turn)));
		});
	}, [isRemembered, restored, source]);
	useEffect(() => {
		if (isRemembered) void tidyData(source, new Set([...files, ...turns.flatMap((turn) => turn.files ?? [])].map((file) => file.id)));
	}, [isRemembered, source, files, turns]);
	// Each shows as it's read, so a big one doesn't hold up the rest
	const addFiles = (added: File[]) =>
		added.forEach((file) =>
			void read(file).then(
				(attachment) => {
					if (isRemembered) void saveData(source, attachment);
					setFiles((list) => [...list, attachment]);
				},
				() => setFiles((list) => [...list, { id: crypto.randomUUID(), name: file.name, type: file.type, problem: 'Couldn’t be read' }]),
			),
		);
	const removeFile = (id: string) => setFiles((list) => list.filter((file) => file.id !== id));
	const [isThinking, setThinking] = useState(false);
	const [step, setStep] = useState<string>();
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);

	// A reply that comes after a restart belongs to a conversation that's gone
	const conversation = useRef(0);
	const isClaude = source === 'claude';
	const ask = (question: string) => {
		// Where the latest view's controls were left, if they've moved, so Claude can draw on from there
		const view = turns.findLast((turn) => turn.ui);
		const moved = view?.tweaked && Object.entries(view.tweaked).filter(([name, value]) => view.values?.[name] !== value);
		const controls = moved?.length ? `[I've set the controls on your last view to: ${moved.map(([name, value]) => `${name} ${JSON.stringify(value)}`).join(', ')}]` : undefined;
		const views = turns.flatMap((turn, at) => (turn.ui && attached.includes(viewKey(at)) ? [`[About the view “${turn.title ?? 'View'}” from earlier]`] : []));
		const note = [controls, ...views].filter(Boolean).join('\n') || undefined;
		const sent = files.filter((file) => !file.problem);
		const asked: Turn = { from: 'user', text: question, note, ...(sent.length && { files: sent }) };
		setFiles([]);
		setTurns((list) => [...list, asked]);
		setThinking(true);
		clearTimeout(timer.current);
		if (isClaude) {
			const id = conversation.current;
			setStep(undefined);
			// Steps can come in the same moment, a lookup and then what follows it, so each holds for a beat to be read
			let shownUntil = 0;
			const show = (next: string) => {
				const wait = Math.max(0, shownUntil - Date.now());
				shownUntil = Date.now() + wait + STEP;
				setTimeout(() => id === conversation.current && setStep(next), wait);
			};
			setAttached((list) => list.filter((key) => key === PAGE));
			void askClaude([...turns, asked], show, { model, effort, hasPage: attached.includes(PAGE) }).then((reply) => {
				if (id !== conversation.current) return;
				setThinking(false);
				setStep(undefined);
				setTurns((list) => [...list, reply]);
			});
			return;
		}
		timer.current = setTimeout(() => {
			setThinking(false);
			setTurns((list) => [...list, ...(replies[question] ?? fallback).map((text) => ({ from: 'assistant' as const, text }))]);
		}, THINKING);
	};
	const restart = () => {
		conversation.current++;
		clearTimeout(timer.current);
		setThinking(false);
		setStep(undefined);
		setTurns([]);
		setAttached([PAGE]);
		setFiles([]);
	};
	const tweak = (turn: Turn, values: Values) => setTurns((list) => list.map((item) => (item === turn ? { ...item, tweaked: values } : item)));
	return { source, turns, isThinking, step, ask, restart, tweak, draft, setDraft, model, setModel, effort, setEffort, attached, setAttached, files, addFiles, removeFile };
}

export interface ChatProps {
	title?: string;
	/** Samples answers from a few written in, and Claude asks Claude, while the preview runs locally */
	source?: Source;
	/** One kept outside, from useConversation, so it outlasts the drawer. Otherwise the chat keeps its own */
	conversation?: Conversation;
	/** Wider, for a view with more to it. With onExpandedChange, the bar has a button to widen it and back */
	isExpanded?: boolean;
	onExpandedChange?: (isExpanded: boolean) => void;
	/** Whether the bar has its own button to close it. Off where something outside it does, such as a shell's toggle */
	isClosable?: boolean;
}

/** The drawer's contents: the conversation, what to ask, and the field to ask it in */
export function Chat({ title = 'Ask the kitchen', source = 'samples', conversation, isExpanded = false, onExpandedChange, isClosable = true }: ChatProps) {
	// Unused when one's kept outside, so it mustn't remember over that one
	const own = useConversation(source, !conversation);
	const { turns, isThinking, step, ask, restart, tweak, draft, setDraft } = conversation ?? own;
	const current = conversation ?? own;
	const isClaude = current.source === 'claude';
	const log = useRef<HTMLDivElement>(null);

	// The newest message stays in view as the conversation grows, and in view again as the drawer opens on it
	useEffect(() => {
		const element = log.current;
		if (element) element.scrollTo({ top: element.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	}, [turns, isThinking]);

	// Replies come as a run of paragraphs, so each run is one message
	const grouped = turns.reduce<Turn[][]>((runs, turn) => {
		const last = runs.at(-1);
		if (last && last[0].from === turn.from && turn.from === 'assistant') last.push(turn);
		else runs.push([turn]);
		return runs;
	}, []);
	const isEmpty = turns.length === 0;

	return (
		<>
			{/* The drawer's padding given back, so the conversation scrolls its full height, under the bar and the field */}
			<div ref={log} className="-m-(--dialog-padding) flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain">
				{/* A toolbar, pinned over the conversation in the drawer's colour, see-through, so what scrolls under it shows
				    blurred. Inside the scroller, so the scrollbar runs over it rather than under. 48px, level with a shell's bar
				    beside it, and in a shell its end leaves room for the toggles over it, 14px in, with 4px before them */}
				<div className="sticky top-0 z-1 flex h-12 shrink-0 items-center gap-1 border-b border-bleed/8 bg-[color-mix(in_oklab,var(--drawer-surface,var(--color-panel))_80%,transparent)] ps-(--dialog-padding) pe-[calc(var(--docs-toggles,-0.375rem)+1.125rem)] backdrop-blur-md">
					<DialogHeading className="min-w-0 flex-1 truncate pr-0 text-body font-medium">{title}</DialogHeading>
					{/* Only once there's a conversation to start over from */}
					{!isEmpty && (
						<Button variant="ghost" shape="full" size="small" aria-label="New conversation" onPress={restart}>
							<Icon name="note-text-badge-pencil" />
						</Button>
					)}
					{onExpandedChange && (
						<Button variant="ghost" shape="full" size="small" aria-label={isExpanded ? 'Narrow' : 'Expand'} aria-pressed={isExpanded} onPress={() => onExpandedChange(!isExpanded)}>
							<Icon name={isExpanded ? 'arrow-down-left-and-arrow-up-right' : 'arrow-up-right-and-arrow-down-left'} />
						</Button>
					)}
					{isClosable && <DialogClose className="" />}
				</div>
				<div className="flex flex-1 flex-col gap-6 px-(--dialog-padding) pt-4 pb-6">
					{isEmpty ? (
						<div className="mt-auto flex flex-col gap-4">
							{/* Who's answering: Loupe's mark for now, on a raised disc, as Notion's assistant has its face */}
							<span className="grid size-12 place-items-center rounded-full bg-raised shadow-raised [&>svg]:ml-0">
								<ParchmentLogo size={24} />
							</span>
							<div className="flex flex-col gap-1">
								<p className="text-title">How can I help today?</p>
								<p className="text-body text-muted">{isClaude ? 'Ask for a view, such as a table, a form or a few figures, and Claude draws it with Loupe.' : 'Ask about what to cook, what’s in season, or how to use up what you have.'}</p>
							</div>
							<Suggestions aria-label="Suggested questions" variant="quiet">
								{(isClaude ? claudeStarters : starters).map(({ question, icon, colour }) => (
									<Suggestion key={question} icon={<Icon name={icon} style={{ color: colour }} />} onPress={() => ask(question)}>
										{question}
									</Suggestion>
								))}
							</Suggestions>
						</div>
					) : (
						<MessageList aria-label="Conversation">
							{grouped.map((run, index) => (
								<Message key={index} from={run[0].from}>
									{run[0].from === 'user'
										? (
												<>
													{run[0].files && (
														<span className="mb-1 flex flex-wrap gap-x-3 gap-y-1 text-label text-muted">
															{run[0].files.map((file) => (
																<span key={file.id} className="inline-flex min-w-0 items-center gap-1">
																	<Icon name={fileIcon(file)} />
																	<span className="truncate">{file.name}</span>
																</span>
															))}
														</span>
													)}
													{run[0].text}
												</>
											)
										: run.map((turn, at) => (
												<div key={at} className="flex flex-col gap-3">
													{turn.text
														.split(/\n{2,}/)
														.filter(Boolean)
														.map((paragraph) => (
															<p key={paragraph} className={turn.isError ? 'text-danger' : undefined}>
																{paragraph}
															</p>
														))}
													{turn.ui && <Generated ui={turn.ui} title={turn.title} values={turn.tweaked ?? turn.values} panel={turn.panel} onAction={ask} onValuesChange={(values) => tweak(turn, values)} />}
												</div>
											))}
								</Message>
							))}
							{isThinking && (
								<Message from="assistant">
									{/* Each step as Claude takes it, the ray running on over the words as they change */}
									<p className="flex items-center gap-2 text-muted">
										<Scribble />
										<TextEffect variant="ray" loop>
											{step ?? 'Thinking'}
										</TextEffect>
									</p>
								</Message>
							)}
						</MessageList>
					)}
					{!isEmpty && !isThinking && !isClaude && (
						<Suggestions key={turns.length} aria-label="Follow-up questions" variant="follow-up" className="-mx-2">
							{followUps.map((question) => (
								<Suggestion key={question} onPress={() => ask(question)}>
									{question}
								</Suggestion>
							))}
						</Suggestions>
					)}
				</div>
				{/* Over the conversation's foot, on nothing of its own: what scrolls under it blurs, more so further down */}
				<div className="sticky bottom-0 px-(--dialog-padding) pt-6 pb-(--dialog-padding) before:absolute before:inset-0 before:-z-1 before:mask-[linear-gradient(transparent,black_60%)] before:backdrop-blur-sm">
					<Composer aria-label="Your question" placeholder="Ask anything" submitIcon={<Icon name="arrow-up" />} description="Enter sends, Shift-Enter starts a new line"
						value={draft}
						onChange={setDraft}
						// Only while it runs locally, on the key of whoever's running it. The hosted preview has no Claude to pick
						start={isClaude && import.meta.env.DEV ? <ContextPicker conversation={current} /> : undefined}
						context={isClaude && import.meta.env.DEV ? <ContextChips conversation={current} /> : undefined}
						actions={isClaude && import.meta.env.DEV ? <ModelPicker conversation={current} /> : undefined}
						onSubmit={(question) => {
							setDraft('');
							ask(question);
						}}
					/>
				</div>
			</div>
		</>
	);
}

// What can go with a question: the page, and each view drawn so far, newest first, under the names they're shown by
function contextOf({ turns }: Conversation) {
	const page = { key: PAGE, name: pageOf().title || 'This page', icon: 'rectangle-split-3x1' as const };
	const views = turns.flatMap((turn, at) => (turn.ui ? [{ key: viewKey(at), name: turn.title ?? 'View', icon: 'square-grid-3x3' as const }] : [])).reverse();
	return [page, ...views];
}

// The plus at the composer's start. Each item is ticked while it's attached, and choosing it again takes it off
function ContextPicker({ conversation }: { conversation: Conversation }) {
	const options = contextOf(conversation);
	const [page, ...views] = options;
	const select = (keys: 'all' | Set<React.Key>, among: string[]) => {
		if (keys === 'all') return;
		const others = conversation.attached.filter((key) => !among.includes(key));
		conversation.setAttached([...others, ...among.filter((key) => keys.has(key))]);
	};
	const input = useRef<HTMLInputElement>(null);
	return (
		<>
		{/* Opened from the menu. Cleared after each pick, so the same file can be added again */}
		<input ref={input} type="file" multiple accept={accept} hidden onChange={(event) => {
			conversation.addFiles([...(event.currentTarget.files ?? [])]);
			event.currentTarget.value = '';
		}} />
		<MenuTrigger>
			<Button variant="ghost" size="small" aria-label="Add context">
				<Icon name="plus" />
			</Button>
			<Menu placement="top start">
				<MenuSection>
					<MenuItem id="files" onAction={() => input.current?.click()}>
						<Icon name="paperclip" />
						Add files…
					</MenuItem>
				</MenuSection>
				<MenuSection selectionMode="multiple" selectedKeys={conversation.attached.filter((key) => key === PAGE)} onSelectionChange={(keys) => select(keys, [PAGE])}>
					<Header>Page</Header>
					<MenuItem id={page.key}>{page.name}</MenuItem>
				</MenuSection>
				{views.length > 0 && (
					<MenuSection selectionMode="multiple" selectedKeys={conversation.attached.filter((key) => key !== PAGE)} onSelectionChange={(keys) => select(keys, views.map((view) => view.key))}>
						<Header>Views</Header>
						{views.map((view) => (
							<MenuItem key={view.key} id={view.key}>
								{view.name}
							</MenuItem>
						))}
					</MenuSection>
				)}
			</Menu>
		</MenuTrigger>
		</>
	);
}

// What's attached, above the text, so it's plain what Claude will see. Pressing one takes it off
function ContextChips({ conversation }: { conversation: Conversation }) {
	const [page, ...views] = contextOf(conversation);
	const hasPage = conversation.attached.includes(PAGE);
	const shown = views.filter((option) => conversation.attached.includes(option.key));
	return (
		<>
			{/* The page is always there to ask about, so it stays in the row. Off, it's only an outline, dashed, to press
			    to put back */}
			<Chip size="small" aria-label={`Send ${page.name} with the question`} aria-pressed={hasPage}
				className={hasPage ? undefined : 'bg-transparent text-muted shadow-none outline-1 -outline-offset-1 outline-bleed/24 outline-dashed'}
				onPress={() => conversation.setAttached(hasPage ? conversation.attached.filter((key) => key !== PAGE) : [...conversation.attached, PAGE])}>
				<Icon name={page.icon} />
				{page.name}
			</Chip>
			{shown.map((option) => (
				<Chip key={option.key} size="small" aria-label={`Remove ${option.name}`} onPress={() => conversation.setAttached(conversation.attached.filter((key) => key !== option.key))}>
					<Icon name={option.icon} />
					{option.name}
					<Icon name="xmark" className="text-muted" />
				</Chip>
			))}
			{/* One that can't be sent says why, in place, and stays until it's taken off, rather than going quietly */}
			{conversation.files.map((file) => (
				<Chip key={file.id} size="small" aria-label={`Remove ${file.name}${file.problem ? `, ${file.problem.toLowerCase()}` : ''}`} onPress={() => conversation.removeFile(file.id)}>
					<Icon name={file.problem ? 'exclamationmark-circle' : fileIcon(file)} className={file.problem ? 'text-danger' : undefined} />
					<span className="max-w-40 truncate">{file.name}</span>
					{file.problem && <span className="text-danger">{file.problem}</span>}
					<Icon name="xmark" className="text-muted" />
				</Chip>
			))}
		</>
	);
}

const titled = (word: string) => word[0].toUpperCase() + word.slice(1);

// How a model rates out of 5, as five dashes, the first few in ink
function Rating({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex items-center justify-between gap-6">
			<dt className="text-muted">{label}</dt>
			<dd className="flex gap-1" aria-label={`${value} out of 5`}>
				{[1, 2, 3, 4, 5].map((step) => (
					<span key={step} className={`h-1 w-4 rounded-full ${step <= value ? 'bg-ink' : 'bg-bleed/16'}`} />
				))}
			</dd>
		</div>
	);
}

// Who answers and how hard it thinks, in one menu, named on its button as Opus 5.5 Medium, or just Opus 5.5 when it's
// left to the model. Each model has a card beside the menu, shown while it's pointed at or reached by keyboard, saying
// what it's for and how it rates, as Notion's picker does
function ModelPicker({ conversation: { model, setModel, effort, setEffort } }: { conversation: Conversation }) {
	const name = models.find((each) => each.id === model)?.name ?? model;
	// The model described, and its item, which the card lines up with
	const [described, setDescribed] = useState<{ id: string; item: Element }>();
	const shown = models.find((each) => each.id === described?.id);
	return (
		<MenuTrigger onOpenChange={(isOpen) => !isOpen && setDescribed(undefined)}>
			{/* The model in ink and its effort muted, as Claude's own composer has them */}
			<Button variant="ghost" size="small">
				{name}
				{effort !== 'default' && <span className="text-muted">{titled(effort)}</span>}
			</Button>
			<Menu placement="top end">
				<MenuSection selectionMode="single" selectedKeys={[model]} onSelectionChange={(keys) => keys !== 'all' && keys.size && setModel(String([...keys][0]))}>
					<Header>Model</Header>
					{models.map((each) => (
						<MenuItem
							key={each.id}
							id={each.id}
							aria-description={`${each.summary}. Speed ${each.speed} out of 5, intelligence ${each.intelligence} out of 5`}
							onHoverStart={(event) => setDescribed({ id: each.id, item: event.target })}
							onFocus={(event) => setDescribed({ id: each.id, item: event.currentTarget })}
						>
							{each.name}
						</MenuItem>
					))}
				</MenuSection>
				<MenuSection selectionMode="single" selectedKeys={[effort]} onSelectionChange={(keys) => keys !== 'all' && keys.size && setEffort([...keys][0] as Effort)}>
					<Header>Effort</Header>
					{efforts.map((each) => (
						<MenuItem key={each} id={each} onHoverStart={() => setDescribed(undefined)} onFocus={() => setDescribed(undefined)}>
							{titled(each)}
						</MenuItem>
					))}
				</MenuSection>
			</Menu>
			{/* Beside the menu, level with the model it's about. Only to look at: it takes no focus and the pointer passes
			    through, so the menu keeps working under it. Screen readers hear the same from each item's description */}
			{shown && (
				<Popover isOpen isNonModal triggerRef={{ current: described!.item }} placement="start top" offset={12} className="pointer-events-none w-64 p-4" aria-hidden>
					<p className="text-body font-medium">Claude {shown.name}</p>
					<p className="mt-1 text-label text-muted">{shown.summary}</p>
					<dl className="mt-3 flex flex-col gap-2 border-t border-bleed/8 pt-3 text-label">
						<Rating label="Speed" value={shown.speed} />
						<Rating label="Intelligence" value={shown.intelligence} />
					</dl>
				</Popover>
			)}
		</MenuTrigger>
	);
}

const sides = ['end', 'start'] as const;
const reflows = ['once', 'continuous'] as const;
const titles = ['Ask the kitchen', 'Ask about this recipe', 'Help'];

// On a stand-in page, which the drawer pushes aside. Below md it slides over the page instead
export function ChatPlayground() {
	const [side, setSide] = useRemembered('side', 'end', sides);
	const [reflow, setReflow] = useRemembered('reflow', 'once', reflows);
	const [title, setTitle] = useRemembered('title', 'Ask the kitchen');
	const button = (
		<Button variant="secondary" start={<Icon name="note-text-badge-pencil" />}>
			Ask
		</Button>
	);
	const drawer = (
		<Drawer mode="push" position={side} reflow={reflow}>
			<Chat title={title || undefined} />
		</Drawer>
	);
	return (
		<Playground
			onRandom={() => {
				setSide(pick(sides));
				setReflow(pick(reflows));
				setTitle(pick(titles));
			}}
			code={codeOf(
				<DrawerTrigger>
					{button}
					{drawer}
				</DrawerTrigger>,
			)}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Title" value={title} onChange={setTitle} />
					</ControlGroup>
					<ControlGroup label="Placement">
						<Choice label="Position" options={sides} value={side} onChange={setSide} />
						<Choice label="Reflow" options={reflows} value={reflow} onChange={setReflow} />
					</ControlGroup>
				</>
			}
		>
			<DrawerTrigger defaultOpen>
				<div className="flex h-[36rem] w-full overflow-hidden rounded-lg bg-ground [--bleed:var(--ground-bleed)]">
					{side === 'start' && drawer}
					<div data-drawer-follows className="flex min-w-0 flex-1 flex-col items-start gap-3 overflow-auto p-6">
						{button}
						<p className="max-w-prose text-body text-muted">{bodyOf('long').join(' ')}</p>
					</div>
					{side === 'end' && drawer}
				</div>
			</DrawerTrigger>
		</Playground>
	);
}

// The chat with Claude behind it, in a drawer wide enough for a table. Locally only, as the key stays on the server
export function ClaudeChatPlayground() {
	return (
		<DrawerTrigger defaultOpen>
			<div className="flex h-[44rem] w-full overflow-hidden rounded-lg bg-ground [--bleed:var(--ground-bleed)] [--drawer-push-width:32rem]">
				<div data-drawer-follows className="flex min-w-0 flex-1 flex-col items-start gap-3 overflow-auto p-6">
					<Button variant="secondary" start={<Icon name="note-text-badge-pencil" />}>
						Ask
					</Button>
					<p className="max-w-prose text-body text-muted">{bodyOf('long').join(' ')}</p>
				</div>
				<Drawer mode="push" position="end">
					<Chat title="Ask Loupe" source="claude" />
				</Drawer>
			</div>
		</DrawerTrigger>
	);
}
