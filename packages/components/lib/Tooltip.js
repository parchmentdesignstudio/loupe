import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OverlayArrow, Tooltip as RACTooltip, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
export { TooltipTrigger } from 'react-aria-components';
const tooltip = tv({
    base: 'max-w-64 rounded-md bg-ink px-2.5 py-1.5 text-xs text-paper shadow-md will-change-transform',
    variants: {
        isEntering: { true: 'animate-pc-in motion-reduce:animate-pc-fade-in' },
        isExiting: { true: 'animate-pc-fade-out' },
    },
});
export function Tooltip({ children, ...props }) {
    return (_jsxs(RACTooltip, { offset: 8, ...props, className: composeRenderProps(props.className, (className, renderProps) => tooltip({ ...renderProps, className })), children: [_jsx(OverlayArrow, { className: "group", children: _jsx("svg", { width: 8, height: 8, viewBox: "0 0 8 8", className: "block fill-ink group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90", children: _jsx("path", { d: "M0 0 L4 4 L8 0" }) }) }), children] }));
}
