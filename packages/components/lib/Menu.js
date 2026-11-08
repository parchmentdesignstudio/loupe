import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from '@parchment/icons/react';
import { Menu as RACMenu, MenuItem as RACMenuItem, MenuSection as RACMenuSection, Collection, Separator, composeRenderProps, } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { ListBoxHeader, item } from './ListBox.js';
import { Popover } from './Popover.js';
export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
export function Menu({ placement, ...props }) {
    return (_jsx(Popover, { placement: placement, className: "min-w-48", children: _jsx(RACMenu, { ...props, className: "max-h-[inherit] overflow-auto p-1 outline-0" }) }));
}
const menuItem = tv({
    extend: item,
    variants: {
        variant: {
            default: '',
            critical: 'text-critical',
        },
    },
});
export function MenuItem({ variant, ...props }) {
    const textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
    return (_jsx(RACMenuItem, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, renderProps) => menuItem({ ...renderProps, variant, className })), children: composeRenderProps(props.children, (children, { selectionMode, isSelected, hasSubmenu }) => (_jsxs(_Fragment, { children: [selectionMode !== 'none' && (_jsx("span", { className: "flex size-4 items-center justify-center text-accent", children: isSelected && _jsx(Icon, { name: "checkmark", className: "size-4" }) })), _jsx("span", { className: "flex flex-1 items-center gap-2 truncate", children: children }), hasSubmenu && _jsx(Icon, { name: "chevron-right", "aria-hidden": true, className: "size-4 text-muted" })] }))) }));
}
export function MenuSection({ title, items, children, ...props }) {
    return (_jsxs(RACMenuSection, { ...props, className: "not-first:mt-1 not-first:border-t not-first:border-line not-first:pt-1", children: [title && _jsx(ListBoxHeader, { children: title }), _jsx(Collection, { items: items, children: children })] }));
}
export function MenuSeparator(props) {
    return _jsx(Separator, { ...props, className: "mx-3 my-1 border-b border-line" });
}
