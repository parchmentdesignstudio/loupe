import { jsx as _jsx } from "react/jsx-runtime";
import { Button as AriaButton, composeRenderProps } from 'react-aria-components';
import { focusRing, tv } from './tv.js';
// The states are React Aria's render props, so each variant is named for the one it answers to
export const button = tv({
    extend: focusRing,
    base: 'inline-flex shrink-0 cursor-default items-center justify-center gap-2 rounded-lg text-control font-medium [&>svg]:my-[calc((1lh-1rem)/2)] transition-[scale,background-color,opacity] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        // Solid is the accent, for what a page leads with. Void is ink, for where the accent is too loud
        variant: {
            solid: 'bg-accent text-paper',
            void: 'bg-ink text-paper',
            plain: 'bg-raised text-ink shadow-raised',
            quiet: 'text-ink',
        },
        shape: {
            circle: 'rounded-full',
        },
        // No set height: the padding adds to the 20px line, so 32px medium and 28px small. An icon sits on the line, as
        // text does, so a button with only an icon is as tall
        size: {
            medium: 'px-3 py-1.5',
            small: 'px-2.5 py-1',
        },
        isHovered: {
            true: '',
        },
        isPressed: {
            true: 'scale-97',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
    compoundVariants: [
        { variant: 'solid', isHovered: true, class: 'bg-accent/88' },
        { variant: 'void', isHovered: true, class: 'bg-ink/88' },
        { variant: 'plain', isHovered: true, class: 'bg-surface' },
        { variant: 'quiet', isHovered: true, class: 'bg-bleed/4' },
        // After the sizes' padding: a circle pads its icon evenly, counting the line it sits on, so it stays round
        { shape: 'circle', size: 'medium', class: 'px-2 py-1.5' },
        { shape: 'circle', size: 'small', class: 'px-1.5 py-1' },
    ],
    defaultVariants: {
        variant: 'solid',
        size: 'medium',
    },
});
/** A button for any action. A circle holds just an icon, so it needs an aria-label */
export function Button({ variant, shape, size, ...props }) {
    return _jsx(AriaButton, { ...props, className: composeRenderProps(props.className, (className, state) => button({ ...state, variant, shape, size, className })) });
}
