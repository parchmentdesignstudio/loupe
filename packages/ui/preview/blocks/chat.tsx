import { useEffect, useRef, useState } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Composer, DialogClose, DialogHeading, Drawer, DrawerTrigger, Message, MessageList, Suggestion, Suggestions, TextEffect } from '../../src/index.js';
import { codeOf } from '../code.js';
import type { Node, Panel, Values } from '../genui/catalogue.js';
import { Generated } from '../genui/render.js';
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
	isError?: boolean;
}

const starters = ['What should I cook tonight?', 'Plan a week of lunches', 'What’s in season now?'];
const replies: Record<string, string[]> = {
	'What should I cook tonight?': ['A leek and potato soup is the quickest, about 40 minutes start to finish.', 'Soften the leeks in butter first, slowly, so they turn sweet rather than brown.'],
	'Plan a week of lunches': ['Make a big pot of lentils on Sunday. They’ll carry a salad on Monday, a soup by Wednesday and a stew to end the week.'],
	'What’s in season now?': ['Leeks, parsnips, kale and the last of the apples. Forced rhubarb starts soon.'],
};
const followUps = ['Could it be vegan?', 'How long does it keep?', 'What goes with it?'];
const fallback = ['Good question. In a real chat the answer would stream in here, a line at a time.'];
const claudeStarters = ['Show this month’s overdue invoices', 'A settings panel for notifications', 'How did the shop do this week?'];

type Answer = { text?: string; ui?: Node; title?: string; values?: Values; controls?: unknown; panel?: Panel[] };

// The page it's asked from, by its name in the tab's title and its route, so "this" means something to Claude
const pageOf = () => ({ title: document.title.split(' · ')[0], path: location.hash.slice(1) || '/' });

const failed = (text: string): Turn => ({ from: 'assistant', text, isError: true });

// The conversation so far, as the endpoint takes it, and its reply: words, and a view when one says it better. The
// endpoint sends each step it takes as a line of JSON as it starts, and the answer last, so onStep hears each in turn
async function askClaude(turns: Turn[], onStep: (step: string) => void): Promise<Turn> {
	const messages = turns.filter((turn) => !turn.isError).map(({ from, text, ui, values, controls, note }) => ({ role: from, text: note ? `${text}\n\n${note}` : text, ui, values, controls }));
	try {
		const response = await fetch('/__loupe/claude', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages, page: pageOf() }) });
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
}

/**
 * A conversation, held where it's made rather than in the drawer, which lets go of what it holds once it has slid shut.
 * So one kept by the page carries on, reply and all, however often its drawer is closed
 */
export function useConversation(source: Source = 'samples'): Conversation {
	const [turns, setTurns] = useState<Turn[]>([]);
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
		const note = moved?.length ? `[I've set the controls on your last view to: ${moved.map(([name, value]) => `${name} ${JSON.stringify(value)}`).join(', ')}]` : undefined;
		const asked: Turn = { from: 'user', text: question, note };
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
			void askClaude([...turns, asked], show).then((reply) => {
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
	};
	const tweak = (turn: Turn, values: Values) => setTurns((list) => list.map((item) => (item === turn ? { ...item, tweaked: values } : item)));
	return { source, turns, isThinking, step, ask, restart, tweak };
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
}

/** The drawer's contents: the conversation, what to ask, and the field to ask it in */
export function Chat({ title = 'Ask the kitchen', source = 'samples', conversation, isExpanded = false, onExpandedChange }: ChatProps) {
	const own = useConversation(source);
	const { turns, isThinking, step, ask, restart, tweak } = conversation ?? own;
	const isClaude = (conversation ?? own).source === 'claude';
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
			<div ref={log} className="-m-(--dialog-padding) flex min-h-0 flex-1 flex-col overflow-auto">
				{/* A toolbar, pinned over the conversation in the drawer's colour, see-through, so what scrolls under it shows
				    blurred. Inside the scroller, so the scrollbar runs over it rather than under */}
				<div className="sticky top-0 z-1 flex items-center gap-1 border-b border-bleed/8 bg-[color-mix(in_oklab,var(--drawer-surface,var(--color-panel))_80%,transparent)] py-2 ps-(--dialog-padding) pe-3 backdrop-blur-md">
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
					<DialogClose className="" />
				</div>
				<div className="flex flex-1 flex-col gap-6 px-(--dialog-padding) pt-4 pb-6">
					{isEmpty ? (
						<div className="mt-auto flex flex-col gap-3">
							<p className="text-body text-muted">{isClaude ? 'Ask for a view, such as a table, a form or a few figures, and Claude draws it with Loupe.' : 'Ask about what to cook, what’s in season, or how to use up what you have.'}</p>
							<Suggestions aria-label="Suggested questions">
								{(isClaude ? claudeStarters : starters).map((question) => (
									<Suggestion key={question} onPress={() => ask(question)}>
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
										? run[0].text
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
									<TextEffect variant="ray" loop className="text-muted">
										{step ?? 'Thinking'}
									</TextEffect>
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
					<Composer aria-label="Your question" placeholder="Ask anything" submitIcon={<Icon name="arrow-up" />} description="Enter sends, Shift-Enter starts a new line" onSubmit={ask} />
				</div>
			</div>
		</>
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
