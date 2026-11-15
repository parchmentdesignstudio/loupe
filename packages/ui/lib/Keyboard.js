import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { Keyboard as AriaKeyboard, KeyboardContext, useSlottedContext } from 'react-aria-components';
import { tv } from './tv.js';
// What a Keyboard is drawn as where no variant is given, so a Tooltip's shortcuts are plain without being told
export const KeyboardVariantContext = createContext('raised');
const keyboard = tv({
    base: 'font-sans',
    variants: {
        variant: {
            raised: 'mx-[0.25ch] rounded-sm bg-raised px-1.5 py-px text-ink shadow-raised',
            plain: 'text-current/64',
        },
    },
});
/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export function Keyboard({ variant, ...props }) {
    // A menu item is described by its shortcut. Hidden, the shortcut stays its description but leaves its name
    const isDescription = useSlottedContext(KeyboardContext)?.id != null;
    const inherited = useContext(KeyboardVariantContext);
    return _jsx(AriaKeyboard, { "aria-hidden": isDescription || undefined, ...props, className: keyboard({ variant: variant ?? inherited, className: props.className }) });
}
