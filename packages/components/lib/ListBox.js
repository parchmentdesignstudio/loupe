import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from '@parchment/icons/react';
import { Header, ListBox as RACListBox, ListBoxItem as RACListBoxItem, ListBoxSection, Collection, composeRenderProps, } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { composeTailwindRenderProps } from './utils.js';
export function ListBox({ children, ...props }) {
    return (_jsx(RACListBox, { ...props, className: composeTailwindRenderProps(props.className, 'outline-0 p-1'), children: children }));
}
// An option in a select, combo box or menu.
export const item = tv({
    base: 'group flex items-center gap-3 rounded-md py-2 pl-3 pr-2 text-sm text-ink outline-0 cursor-default select-none forced-color-adjust-none',
    variants: {
        isDisabled: { true: 'text-disabled' },
        isFocused: { true: 'bg-highlight' },
        isPressed: { true: 'bg-highlight' },
    },
});
export function ListBoxItem(props) {
    const textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
    return (_jsx(RACListBoxItem, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, renderProps) => item({ ...renderProps, className })), children: composeRenderProps(props.children, (children, { isSelected }) => (_jsxs(_Fragment, { children: [_jsx("span", { className: "flex flex-1 items-center gap-2 truncate group-data-[selected]:font-medium", children: children }), _jsx("span", { className: "flex size-4 items-center justify-center text-accent", children: isSelected && _jsx(Icon, { name: "checkmark", className: "size-4" }) })] }))) }));
}
export function ListBoxHeader({ children }) {
    return _jsx(Header, { className: "px-3 pt-2 pb-1 text-xs font-medium text-muted", children: children });
}
export function Section({ title, items, children, ...props }) {
    return (_jsxs(ListBoxSection, { ...props, className: "not-first:mt-1 not-first:border-t not-first:border-line not-first:pt-1", children: [title && _jsx(ListBoxHeader, { children: title }), _jsx(Collection, { items: items, children: children })] }));
}
