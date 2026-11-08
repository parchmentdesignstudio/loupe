import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OverlayArrow, Popover as RACPopover, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
// Shared by popovers, select and combo box lists, menus and tooltips.
export const popover = tv({
    base: 'rounded-lg border border-line bg-raised text-ink bg-clip-padding shadow-lg shadow-ink/10 outline-0',
    variants: {
        isEntering: { true: 'animate-pc-in motion-reduce:animate-pc-fade-in' },
        isExiting: { true: 'animate-pc-out motion-reduce:animate-pc-fade-out' },
    },
});
export function Popover({ children, showArrow, className, ...props }) {
    return (_jsxs(RACPopover, { offset: showArrow ? 12 : 6, ...props, className: composeRenderProps(className, (className, renderProps) => popover({ ...renderProps, className })), children: [showArrow && (_jsx(OverlayArrow, { className: "group", children: _jsx("svg", { width: 12, height: 12, viewBox: "0 0 12 12", className: "block fill-raised stroke-line group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90", children: _jsx("path", { d: "M0 0 L6 6 L12 0" }) }) })), children] }));
}
