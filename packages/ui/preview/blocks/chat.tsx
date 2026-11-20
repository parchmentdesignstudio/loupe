import { useEffect, useRef, useState } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Composer, DialogClose, DialogHeading, Drawer, DrawerTrigger, Message, MessageList, Suggestion, Suggestions, TextEffect } from '../../src/index.js';
import { codeOf } from '../code.js';
import { bodyOf } from '../playgrounds/overlay.js';
import { Choice, ControlGroup, Playground, TextControl, pick, useRemembered } from '../playground.js';

// A chat in a drawer that pushes the page aside, so what's asked about stays in view. It opens on what to ask first,
// and after each reply offers what to ask next. While a reply is thought over, a ray loops over
// the word. Composer sits at the foot, as a drawer's actions do, and stays live, so a question can follow straight on

interface Turn {
	from: 'user' | 'assistant';
	text: string;
}

const starters = ['What should I cook tonight?', 'Plan a week of lunches', 'What’s in season now?'];
const replies: Record<string, string[]> = {
	'What should I cook tonight?': ['A leek and potato soup is the quickest, about 40 minutes start to finish.', 'Soften the leeks in butter first, slowly, so they turn sweet rather than brown.'],
	'Plan a week of lunches': ['Make a big pot of lentils on Sunday. They’ll carry a salad on Monday, a soup by Wednesday and a stew to end the week.'],
	'What’s in season now?': ['Leeks, parsnips, kale and the last of the apples. Forced rhubarb starts soon.'],
};
const followUps = ['Could it be vegan?', 'How long does it keep?', 'What goes with it?'];
const fallback = ['Good question. In a real chat the answer would stream in here, a line at a time.'];

// How long a reply takes to think over
const THINKING = 1600;

export interface ChatProps {
	title?: string;
}

/** The drawer's contents: the conversation, what to ask, and the field to ask it in */
export function Chat({ title = 'Ask the kitchen' }: ChatProps) {
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

	const ask = (question: string) => {
		setTurns((list) => [...list, { from: 'user', text: question }]);
		setThinking(true);
		clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			setThinking(false);
			setTurns((list) => [...list, ...(replies[question] ?? fallback).map((text) => ({ from: 'assistant' as const, text }))]);
		}, THINKING);
	};
	const restart = () => {
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
						<p className="text-body text-muted">Ask about what to cook, what’s in season, or how to use up what you have.</p>
						<Suggestions aria-label="Suggested questions">
							{starters.map((question) => (
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
								{run[0].from === 'user' ? run[0].text : run.map((turn) => <p key={turn.text}>{turn.text}</p>)}
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
				{!isEmpty && !isThinking && (
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
