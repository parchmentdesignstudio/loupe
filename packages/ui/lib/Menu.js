import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu as AriaMenu, MenuItem as AriaMenuItem, MenuSection as AriaMenuSection, Separator, composeRenderProps } from 'react-aria-components';
import { Check, ChevronRight } from './glyphs.js';
import { option, section } from './ListBox.js';
import { Popover } from './Popover.js';
import { tv } from './tv.js';
export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
/** A menu of actions, opened by the Button beside it in a MenuTrigger */
export function Menu({ placement, ...props }) {
    return (_jsx(Popover, { placement: placement, className: "min-w-52", children: _jsx(AriaMenu, { ...props, className: "max-h-[inherit] overflow-auto p-1.5 outline-0" }) }));
}
const menuItem = tv({
    extend: option,
    variants: {
        variant: {
            default: '',
            danger: 'text-danger',
        },
    },
});
export function MenuItem({ variant, ...props }) {
    const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
    return (_jsx(AriaMenuItem, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, state) => menuItem({ ...state, variant, className })), children: composeRenderProps(props.children, (children, { selectionMode, isSelected, hasSubmenu }) => (_jsxs(_Fragment, { children: [selectionMode !== 'none' && _jsx("span", { className: "flex size-4 shrink-0", children: isSelected && _jsx(Check, {}) }), _jsx("span", { className: "flex min-w-0 flex-1 items-center gap-2 truncate [&>kbd]:ms-auto [&>kbd]:ps-4", children: children }), hasSubmenu && _jsx(ChevronRight, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" })] }))) }));
}
/** Menu items grouped under a Header, which goes first inside it */
export function MenuSection(props) {
    return _jsx(AriaMenuSection, { ...props, className: section({ className: props.className }) });
}
export function MenuSeparator() {
    return _jsx(Separator, { className: "mx-3 my-1.5 border-b border-bleed/8" });
}
