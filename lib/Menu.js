import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Collection, Menu as AriaMenu, MenuItem as AriaMenuItem, MenuSection as AriaMenuSection, Separator, composeRenderProps } from 'react-aria-components';
import { Check, ChevronRight } from './glyphs.js';
import { option, SectionHeader } from './ListBox.js';
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
    return (_jsx(AriaMenuItem, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, state) => menuItem({ ...state, variant, className })), children: composeRenderProps(props.children, (children, { selectionMode, isSelected, hasSubmenu }) => (_jsxs(_Fragment, { children: [selectionMode !== 'none' && _jsx("span", { className: "flex size-4 shrink-0", children: isSelected && _jsx(Check, {}) }), _jsx("span", { className: "flex min-w-0 flex-1 items-center gap-2 truncate", children: children }), hasSubmenu && _jsx(ChevronRight, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" })] }))) }));
}
/** Menu items grouped under a heading */
export function MenuSection({ title, items, children, ...props }) {
    return (_jsxs(AriaMenuSection, { ...props, className: "not-first:mt-1.5 not-first:border-t not-first:border-ink/8 not-first:pt-1.5", children: [title && _jsx(SectionHeader, { children: title }), _jsx(Collection, { items: items, children: children })] }));
}
export function MenuSeparator() {
    return _jsx(Separator, { className: "mx-3 my-1.5 border-b border-ink/8" });
}
