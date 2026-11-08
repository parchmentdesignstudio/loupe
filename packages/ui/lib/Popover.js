import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OverlayArrow, Popover as AriaPopover, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';
// Shared by popovers and the lists of selects, combo boxes and menus
export const popover = tv({
    base: 'rounded-2xl bg-paper text-ink shadow-overlay outline-0',
    variants: {
        isEntering: {
            true: 'animate-enter motion-reduce:animate-fade-in',
        },
        isExiting: {
            true: 'animate-exit motion-reduce:animate-fade-out',
        },
    },
});
/** Content that floats beside what opened it, such as a DialogTrigger's button */
export function Popover({ showArrow = false, children, ...props }) {
    return (_jsxs(AriaPopover, { offset: showArrow ? 12 : 8, ...props, className: composeRenderProps(props.className, (className, state) => popover({ ...state, className })), children: [showArrow && (_jsx(OverlayArrow, { className: "group", children: _jsx("svg", { "aria-hidden": "true", width: 14, height: 8, viewBox: "0 0 14 8", className: "block fill-paper drop-shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_8%,transparent)] group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90", children: _jsx("path", { d: "M0 0 7 7 14 0Z" }) }) })), children] }));
}
