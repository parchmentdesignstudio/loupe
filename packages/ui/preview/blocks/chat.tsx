import { useEffect, useRef, useState } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Composer, DialogClose, DialogHeading, Drawer, DrawerTrigger, Message, MessageList, Suggestion, Suggestions, TextEffect } from '../../src/index.js';
import { codeOf } from '../code.js';
import type { Node } from '../genui/catalogue.js';
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
	/** A view Claude drew with render_ui */
	ui?: Node;
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

// The conversation so far, as the endpoint takes it, and its reply: words, and a view when one says it better
async function askClaude(turns: Turn[]): Promise<Turn> {
	const messages = turns.filter((turn) => !turn.isError).map(({ from, text, ui }) => ({ role: from, text, ui }));
	try {
		const response = await fetch('/__loupe/claude', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages }) });
		const reply = (await response.json()) as { text?: string; ui?: Node; error?: string };
		if (!response.ok || reply.error) return { from: 'assistant', text: reply.error ?? `Claude didn’t answer (${response.status})`, isError: true };
		return { from: 'assistant', text: reply.text ?? '', ui: reply.ui };
	} catch {
		return { from: 'assistant', text: 'Claude is only here while the preview runs locally, with pnpm dev', isError: true };
	}
}

// How long a reply takes to think over
const THINKING = 1600;

export interface ChatProps {
	title?: string;
	/** Samples answers from a few written in, and Claude asks Claude, while the preview runs locally */
	source?: 'samples' | 'claude';
}

/** The drawer's contents: the conversation, what to ask, and the field to ask it in */
export function Chat({ title = 'Ask the kitchen', source = 'samples' }: ChatProps) {
	const [turns, setTurns] = useState<Turn[]>([]);
	const [isThinking, setThinking] = useState(false);
	const log = useRef<HTMLDivElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);

	// The newest message stays in view as the conversation grows
	useEffect(() => {
		const element = log.current;
		if (element) element.scrollTo({ top: element.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	}, [turns, isThinking]);

	// A reply that comes after a restart belongs to a conversation that's gone
	const conversation = useRef(0);
	const isClaude = source === 'claude';
	const ask = (question: string) => {
		const asked: Turn = { from: 'user', text: question };
		setTurns((list) => [...list, asked]);
		setThinking(true);
		clearTimeout(timer.current);
		if (isClaude) {
			const id = conversation.current;
			void askClaude([...turns, asked]).then((reply) => {
				if (id !== conversation.current) return;
				setThinking(false);
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
		setTurns([]);
	};

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
			<DialogHeading>{title}</DialogHeading>
			<Button variant="ghost" shape="full" size="small" aria-label="New conversation" isDisabled={isEmpty} onPress={restart} className="absolute top-5 right-14">
				<Icon name="note-text-badge-pencil" />
			</Button>
			<DialogClose />
			<div ref={log} className="-mx-(--dialog-padding) mt-4 flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-(--dialog-padding) pb-4">
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
												{turn.ui && <Generated ui={turn.ui} onAction={ask} />}
											</div>
										))}
							</Message>
						))}
						{isThinking && (
							<Message from="assistant">
								<TextEffect variant="ray" loop className="text-muted">
									Thinking
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
			<Composer aria-label="Your question" placeholder="Ask anything" submitIcon={<Icon name="arrow-up" />} description="Enter sends, Shift-Enter starts a new line" onSubmit={ask} />
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
					<div className="flex min-w-0 flex-1 flex-col items-start gap-3 overflow-auto p-6">
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
				<div className="flex min-w-0 flex-1 flex-col items-start gap-3 overflow-auto p-6">
					<Button variant="secondary" start={<Icon name="note-text-badge-pencil" />}>
						Ask
					</Button>
					<p className="max-w-prose text-body text-muted">{bodyOf('long').join(' ')}</p>
				</div>
				<Drawer mode="push" position="end">
					<Chat title="Ask Claude" source="claude" />
				</Drawer>
			</div>
		</DrawerTrigger>
	);
}
