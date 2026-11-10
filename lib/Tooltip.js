import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OverlayArrow, Tooltip as AriaTooltip, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';
export { TooltipTrigger } from 'react-aria-components';
const tooltip = tv({
    base: 'max-w-64 rounded-lg bg-inverse px-2.5 py-1.5 text-label text-paper [&_kbd]:ms-2 [&_kbd]:text-paper/70',
    variants: {
        isEntering: {
            true: 'animate-enter motion-reduce:animate-fade-in',
        },
        isExiting: {
            true: 'animate-fade-out',
        },
    },
});
/** A short label for a control, shown on hover and keyboard focus. It sits in a TooltipTrigger with the control */
export function Tooltip({ showArrow = false, children, ...props }) {
    return (_jsxs(AriaTooltip, { offset: 8, ...props, className: composeRenderProps(props.className, (className, state) => tooltip({ ...state, className })), children: [showArrow && (_jsx(OverlayArrow, { className: "group", children: _jsx("svg", { "aria-hidden": "true", width: 10, height: 5, viewBox: "0 0 10 5", className: "block fill-inverse group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90", children: _jsx("path", { d: "M0 0 5 5 10 0Z" }) }) })), children] }));
}
