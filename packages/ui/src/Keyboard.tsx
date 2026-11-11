import type { ComponentProps } from 'react';
import { Keyboard as AriaKeyboard, KeyboardContext, useSlottedContext } from 'react-aria-components';
import { tv } from './tv.js';

export type KeyboardProps = ComponentProps<typeof AriaKeyboard>;

const keyboard = tv({
	base: 'font-sans bg-white shadow-raised rounded-sm px-1.5 py-0.25 mx-[0.25ch]'
});

/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export function Keyboard(props: KeyboardProps) {
	// A menu item is described by its shortcut. Hidden, the shortcut stays its description but leaves its name
	const isDescription = useSlottedContext(KeyboardContext)?.id != null;
	return <AriaKeyboard aria-hidden={isDescription || undefined} {...props} className={keyboard({ className: props.className })} />;
}
