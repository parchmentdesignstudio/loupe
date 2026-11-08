import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button as RACButton, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils.js';
export const button = tv({
    extend: focusRing,
    base: 'relative inline-flex items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap transition-colors cursor-default [-webkit-tap-highlight-color:transparent]',
    variants: {
        variant: {
            primary: 'border-transparent bg-accent text-on-accent',
            secondary: 'border-line bg-raised text-ink',
            quiet: 'border-transparent bg-transparent text-ink',
            critical: 'border-transparent bg-critical text-on-critical',
        },
        size: {
            small: 'h-8 px-3 text-sm',
            medium: 'h-10 px-4 text-sm',
        },
        isHovered: { true: '' },
        isPressed: { true: 'scale-[0.98]' },
        isDisabled: { true: 'border-transparent bg-surface text-disabled' },
    },
    compoundVariants: [
        { variant: 'primary', isHovered: true, isDisabled: false, class: 'bg-accent-hover' },
        { variant: ['secondary', 'quiet'], isHovered: true, isDisabled: false, class: 'bg-surface' },
        { variant: 'critical', isHovered: true, isDisabled: false, class: 'opacity-90' },
        { variant: 'quiet', isDisabled: true, class: 'bg-transparent' },
    ],
    defaultVariants: { variant: 'primary', size: 'medium' },
});
export function Button({ variant, size, ...props }) {
    return (_jsx(RACButton, { ...props, className: composeRenderProps(props.className, (className, renderProps) => button({ ...renderProps, variant, size, className })), children: composeRenderProps(props.children, (children, { isPending }) => (_jsxs(_Fragment, { children: [_jsx("span", { className: isPending ? 'invisible inline-flex items-center gap-2' : 'contents', children: children }), isPending && (_jsx("span", { "aria-hidden": true, className: "absolute inset-0 flex items-center justify-center", children: _jsxs("svg", { className: "size-4 animate-spin text-current", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeOpacity: "0.25", strokeWidth: "3" }), _jsx("path", { d: "M21 12a9 9 0 0 0-9-9", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" })] }) }))] }))) }));
}
