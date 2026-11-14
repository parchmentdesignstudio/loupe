import { jsx as _jsx } from "react/jsx-runtime";
import { Keyboard as AriaKeyboard, KeyboardContext, useSlottedContext } from 'react-aria-components';
import { tv } from './tv.js';
const keyboard = tv({
    base: 'mx-[0.25ch] rounded-sm bg-raised px-1.5 py-px font-sans text-ink shadow-raised',
});
/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export function Keyboard(props) {
    // A menu item is described by its shortcut. Hidden, the shortcut stays its description but leaves its name
    const isDescription = useSlottedContext(KeyboardContext)?.id != null;
    return _jsx(AriaKeyboard, { "aria-hidden": isDescription || undefined, ...props, className: keyboard({ className: props.className }) });
}
