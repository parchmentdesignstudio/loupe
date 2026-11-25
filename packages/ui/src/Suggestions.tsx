import { createContext, type ReactNode, useContext } from 'react';
import { Group, type PressEvent } from 'react-aria-components';
import { Button } from './Button.js';
import { ChevronRight } from './glyphs.js';
import { TextEffect } from './TextEffect.js';
import { tv } from './tv.js';

// Starters are what to ask first, each a raised row across the column, there to be noticed. Quiet starters are plain
// rows, for a list under a greeting, where each one's icon does the noticing. Follow-ups come after a reply, so they're
// ghost rows, quieter than the reply above them. Either way they fade in one after another, 40ms
// apart, and as an animation rather than a transition, so the delay never holds back a hover
export const suggestions = tv({
	base: 'flex flex-col *:[animation-fill-mode:backwards] *:motion-safe:animate-fade-in *:nth-2:[animation-delay:40ms] *:nth-3:[animation-delay:80ms] *:nth-4:[animation-delay:120ms] *:nth-5:[animation-delay:160ms]',
	variants: {
		variant: {
			starter: 'gap-(--suggestions-gap)',
			quiet: 'gap-0.5',
			'follow-up': 'gap-0.5',
		},
	},
});

// The row fills the column, its text at the start and the arrow at the end. The arrow is faint, and nudges along on hover
const row = {
	starter: 'group/suggestion w-full justify-start py-2.5 text-start [&>span]:w-full',
	// Ghost rows drawn in their own padding, which is given back, so the icons line up with the text above
	quiet: 'group/suggestion -mx-(--button-padding-x) w-[calc(100%+var(--button-padding-x)*2)] justify-start text-start [&>span]:w-full',
	'follow-up': 'group/suggestion w-full justify-start text-start text-muted data-hovered:text-ink [&>span]:w-full',
};
const arrow = 'ms-auto opacity-50 transition-[translate] duration-150 ease-out group-data-hovered/suggestion:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-data-hovered/suggestion:-translate-x-0.5';

type Variant = 'starter' | 'quiet' | 'follow-up';
const VariantContext = createContext<Variant>('starter');

export interface SuggestionsProps {
	/** Names the group for a screen reader, such as Suggested questions */
	'aria-label': string;
	/** Starter rows are raised, for what to ask first. Quiet ones are plain rows with icons, for a list under a greeting.
	    Follow-ups are plain and muted, for after a reply */
	variant?: Variant;
	children: ReactNode;
	className?: string;
}

/** Questions to ask, each a Suggestion to press: what to start with, or what to follow a reply with */
export function Suggestions({ variant = 'starter', children, className, ...props }: SuggestionsProps) {
	return (
		<VariantContext.Provider value={variant}>
			<Group aria-label={props['aria-label']} className={suggestions({ variant, className })}>
				{children}
			</Group>
		</VariantContext.Provider>
	);
}

export interface SuggestionProps {
	/** The question. When it changes, a ray crosses it */
	children: string;
	/** Before the question, such as an Icon in a colour of its own, to tell the questions apart at a glance */
	icon?: ReactNode;
	onPress?: (event: PressEvent) => void;
	isDisabled?: boolean;
	className?: string;
}

/** A question in Suggestions, which asks it when pressed */
export function Suggestion({ children, icon, onPress, isDisabled, className }: SuggestionProps) {
	const variant = useContext(VariantContext);
	return (
		<Button variant={variant === 'starter' ? 'secondary' : 'ghost'} onPress={onPress} isDisabled={isDisabled} start={icon} end={<ChevronRight className={`size-4 shrink-0 fill-none stroke-current stroke-[1.5] ${arrow}`} />} className={`${row[variant]} ${className ?? ''}`}>
			<TextEffect variant="ray" className="px-[round(1em*4/13,1px)]">
				{children}
			</TextEffect>
		</Button>
	);
}
