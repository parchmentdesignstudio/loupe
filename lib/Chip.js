import { jsx as _jsx } from "react/jsx-runtime";
import { Button as AriaButton, composeRenderProps, Group } from 'react-aria-components';
import { composeClassName, focusRing, tv } from './tv.js';
export const chip = tv({
    extend: focusRing,
    // The after reaches at least 44 × 44 around the chip, so a small one still takes a finger
    base: 'relative inline-flex cursor-default after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-11 after:min-w-11 after:-translate-1/2 items-center bg-(--chip-fill,var(--color-raised)) text-(color:--chip-text,var(--color-ink)) shadow-raised [--shadow-raised-color:var(--chip-shadow)] transition-[scale,background-color,opacity] duration-fast ease-standard motion-reduce:transition-none',
    variants: {
        // Small and medium share the label's 16px line, so a swatch or 12px icon sits level with the text
        size: {
            small: 'gap-1 rounded-(--chip-small-radius) px-(--chip-small-padding-x) py-(--chip-small-padding-y) font-(family-name:--typeface-body) text-label',
            medium: 'gap-1 rounded-(--chip-medium-radius) px-(--chip-medium-padding-x) py-(--chip-medium-padding-y) font-(family-name:--typeface-body) text-label',
            large: 'gap-1.5 rounded-(--chip-radius) px-(--chip-padding-x) py-(--chip-padding-y) font-(family-name:--typeface-body) text-control',
        },
        isHovered: {
            true: 'bg-(--chip-hover-fill,var(--color-surface))',
        },
        isPressed: {
            true: 'scale-(--chip-press-scale)',
        },
        isDisabled: {
            true: 'bg-bleed/12 text-muted shadow-none',
        },
    },
    defaultVariants: { size: 'large' },
});
/** A suggestion to tap, such as a reply in the chat. Several sit in a ChipGroup */
export function Chip({ size, ...props }) {
    return _jsx(AriaButton, { ...props, className: composeRenderProps(props.className, (className, state) => chip({ ...state, size, className })) });
}
/** Chips that go together, under a name for screen readers: give it an aria-label, or aria-labelledby */
export function ChipGroup(props) {
    // A chip's reach runs past the gap into the next row, where a later chip's would take a press on this one, so the
    // reaches go under every chip. Isolated, so they stay above what the group sits on
    return _jsx(Group, { ...props, className: composeClassName(props.className, 'isolate flex flex-wrap gap-2 *:after:-z-1') });
}
