import { jsx as _jsx } from "react/jsx-runtime";
import { Button as AriaButton, composeRenderProps, Group } from 'react-aria-components';
import { composeClassName, focusRing, tv } from './tv.js';
export const chip = tv({
    extend: focusRing,
    base: 'inline-flex cursor-default items-center rounded-full bg-paper px-3.5 py-2 text-body leading-none text-ink shadow-raised transition-[scale,background-color,opacity] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        isHovered: {
            true: 'bg-surface',
        },
        isPressed: {
            true: 'scale-97',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
});
/** A suggestion to tap, such as a reply in the chat. Several sit in a ChipGroup */
export function Chip(props) {
    return _jsx(AriaButton, { ...props, className: composeRenderProps(props.className, (className, state) => chip({ ...state, className })) });
}
/** Chips that go together, under a name for screen readers: give it an aria-label, or aria-labelledby */
export function ChipGroup(props) {
    return _jsx(Group, { ...props, className: composeClassName(props.className, 'flex flex-wrap gap-2') });
}
