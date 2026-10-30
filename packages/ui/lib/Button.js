import { jsx as _jsx } from "react/jsx-runtime";
import { Button as AriaButton, composeRenderProps } from 'react-aria-components';
import { focusRing, tv } from './tv.js';
// The states are React Aria's render props, so each variant is named for the one it answers to
export const button = tv({
    extend: focusRing,
    base: 'inline-flex shrink-0 cursor-default items-center justify-center gap-2 rounded-full leading-none font-medium transition-[scale,background-color,opacity] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        variant: {
            solid: 'bg-ink text-paper',
            plain: 'bg-paper text-ink shadow-raised',
            quiet: 'text-ink',
        },
        shape: {
            pill: '',
            circle: '',
        },
        size: {
            medium: 'h-10 px-4',
            small: 'h-9 px-3.5',
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
        { variant: 'solid', isHovered: true, class: 'bg-ink/88' },
        { variant: 'plain', isHovered: true, class: 'bg-surface' },
        { variant: 'quiet', isHovered: true, class: 'bg-ink/5' },
        // After the sizes' padding, so a circle stays round
        { shape: 'circle', size: 'medium', class: 'size-10 px-0' },
        { shape: 'circle', size: 'small', class: 'size-9 px-0' },
    ],
    defaultVariants: {
        variant: 'solid',
        shape: 'pill',
        size: 'medium',
    },
});
/** A button for any action. A circle holds just an icon, so it needs an aria-label */
export function Button({ variant, shape, size, ...props }) {
    return _jsx(AriaButton, { ...props, className: composeRenderProps(props.className, (className, state) => button({ ...state, variant, shape, size, className })) });
}
