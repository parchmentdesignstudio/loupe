import type { ComponentProps } from 'react';
import { Keyboard as AriaKeyboard, KeyboardContext, useSlottedContext } from 'react-aria-components';
import { tv } from './tv.js';

export type KeyboardProps = ComponentProps<typeof AriaKeyboard>;

const keyboard = tv({
	base: 'mx-[0.25ch] rounded-sm bg-raised px-1.5 py-px font-sans text-ink shadow-raised',
});

/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export function Keyboard(props: KeyboardProps) {
	// A menu item is described by its shortcut. Hidden, the shortcut stays its description but leaves its name
	const isDescription = useSlottedContext(KeyboardContext)?.id != null;
	return <AriaKeyboard aria-hidden={isDescription || undefined} {...props} className={keyboard({ className: props.className })} />;
}
