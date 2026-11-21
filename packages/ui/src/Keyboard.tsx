import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';
import { Keyboard as AriaKeyboard, KeyboardContext, useSlottedContext } from 'react-aria-components';
import { tv } from './tv.js';

export interface KeyboardProps extends ComponentProps<typeof AriaKeyboard> {
	/** A key, raised off the text around it, or plain text in a quieter tone, as it is in a Tooltip */
	variant?: 'raised' | 'plain';
}

// What a Keyboard is drawn as where no variant is given, so a Tooltip's shortcuts are plain without being told
export const KeyboardVariantContext = createContext<NonNullable<KeyboardProps['variant']>>('raised');

const keyboard = tv({
	base: 'font-sans whitespace-nowrap',
	variants: {
		variant: {
			// At least as wide as it's tall, so a key of one character is square, like a key on a keyboard
			raised: 'mx-[0.25ch] inline-block min-w-[calc(1lh+var(--keyboard-padding-y)*2)] text-center rounded-(--keyboard-radius) bg-(--keyboard-fill,var(--color-raised)) px-(--keyboard-padding-x) py-(--keyboard-padding-y) text-(color:--keyboard-text,var(--color-ink)) shadow-raised [--shadow-raised-color:var(--keyboard-shadow)]',
			plain: 'text-current/64',
		},
	},
});

// The symbols, drawn on a grid as tall as a capital, so each stands as high as the letters beside it and its lines
// are as heavy as theirs. A font draws them at its own size and weight, which rarely matches its letters
const symbols: Record<string, { width: number; path: string }> = {
	'⌘': { width: 12, path: 'M4.5 4.5V2.75A1.75 1.75 0 1 0 2.75 4.5H9.25A1.75 1.75 0 1 0 7.5 2.75V9.25A1.75 1.75 0 1 0 9.25 7.5H2.75A1.75 1.75 0 1 0 4.5 9.25Z' },
	'⌥': { width: 12, path: 'M1 2H4L8 10H11M7.5 2H11' },
	'⇧': { width: 12, path: 'M6 1L11 6.5H8.25V11H3.75V6.5H1Z' },
	'⌃': { width: 12, path: 'M2 6L6 2L10 6' },
	'←': { width: 12, path: 'M11 6H1M5 2L1 6L5 10' },
	'→': { width: 12, path: 'M1 6H11M7 2L11 6L7 10' },
	'↑': { width: 12, path: 'M6 11V1M2 5L6 1L10 5' },
	'↓': { width: 12, path: 'M6 1V11M2 7L6 11L10 7' },
	'↵': { width: 12, path: 'M11 1.5V7H1M4.5 3.5L1 7L4.5 10.5' },
	'⏎': { width: 12, path: 'M11 1.5V7H1M4.5 3.5L1 7L4.5 10.5' },
	'⇥': { width: 12, path: 'M1 6H9.5M6 2.5L9.5 6L6 9.5M11.25 1.5V10.5' },
	'⌫': { width: 14, path: 'M4.5 1.5H13V10.5H4.5L1 6ZM7 4L10.5 8M10.5 4L7 8' },
	'⌦': { width: 14, path: 'M9.5 1.5H1V10.5H9.5L13 6ZM3.5 4L7 8M7 4L3.5 8' },
};

// Shortcuts written as text, split into their keys: a symbol on its own, and a run of anything else, such as Esc
const pattern = new RegExp(`[${Object.keys(symbols).join('')}]|[^${Object.keys(symbols).join('')}]+`, 'gu');
const split = (shortcut: string) => (shortcut.match(pattern) ?? []).map((key) => key.trim()).filter(Boolean);

// Space between keys, as a key's own characters have none
const gap = 'not-first:ms-[0.2em]';

function keys(children: ReactNode) {
	if (typeof children !== 'string') return children;
	return split(children).map((key, index) => {
		const symbol = symbols[key];
		if (!symbol)
			return (
				<span key={index} className={gap}>
					{key}
				</span>
			);
		// The character stays in the text, out of sight, so a screen reader names the key and copying keeps it
		return (
			<span key={index} className={gap}>
				<svg
					aria-hidden="true"
					viewBox={`0 0 ${symbol.width} 12`}
					className="inline-block h-[1cap] overflow-visible align-baseline"
					style={{ width: `calc(1cap * ${symbol.width / 12})` }}
					fill="none"
					stroke="currentColor"
					strokeWidth={1.2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d={symbol.path} />
				</svg>
				<span className="sr-only">{key}</span>
			</span>
		);
	});
}

/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export function Keyboard({ variant, children, ...props }: KeyboardProps) {
	// A menu item is described by its shortcut. Hidden, the shortcut stays its description but leaves its name
	const isDescription = useSlottedContext(KeyboardContext)?.id != null;
	const inherited = useContext(KeyboardVariantContext);
	return (
		<AriaKeyboard aria-hidden={isDescription || undefined} {...props} className={keyboard({ variant: variant ?? inherited, className: props.className })}>
			{keys(children as ReactNode)}
		</AriaKeyboard>
	);
}
