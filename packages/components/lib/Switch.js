import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch as RACSwitch, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { composeTailwindRenderProps, focusRing } from './utils.js';
const track = tv({
    extend: focusRing,
    base: 'flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors',
    variants: {
        isSelected: {
            false: 'bg-line-strong',
            true: 'bg-accent',
        },
        isHovered: { true: '' },
        isDisabled: { true: 'bg-line' },
    },
    compoundVariants: [
        { isSelected: true, isHovered: true, isDisabled: false, class: 'bg-accent-hover' },
        { isSelected: false, isHovered: true, isDisabled: false, class: 'bg-muted' },
    ],
});
const handle = tv({
    base: 'size-4 rounded-full bg-raised shadow-sm transition-transform duration-200',
    variants: {
        isSelected: { true: 'translate-x-4' },
        isPressed: { true: 'scale-90' },
        isDisabled: { true: 'bg-surface' },
    },
});
export function Switch({ children, ...props }) {
    return (_jsx(RACSwitch, { ...props, className: composeTailwindRenderProps(props.className, 'group flex items-center gap-2.5 py-1 text-sm text-ink cursor-default disabled:text-disabled [-webkit-tap-highlight-color:transparent]'), children: composeRenderProps(children, (children, renderProps) => (_jsxs(_Fragment, { children: [_jsx("span", { className: track(renderProps), children: _jsx("span", { className: handle(renderProps) }) }), children] }))) }));
}
