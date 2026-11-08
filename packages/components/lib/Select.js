import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from '@parchment/icons/react';
import { Button, Select as RACSelect, SelectValue, } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label, fieldBorder, fieldLayout } from './Field.js';
import { ListBox, ListBoxItem } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeTailwindRenderProps, focusRing } from './utils.js';
const trigger = tv({
    extend: [focusRing, fieldBorder],
    base: 'flex h-10 w-full min-w-40 items-center gap-2 rounded-md bg-raised pl-3 pr-2.5 text-left text-sm text-ink cursor-default [-webkit-tap-highlight-color:transparent]',
    variants: {
        isDisabled: { true: 'text-disabled' },
    },
});
export function Select({ label, description, errorMessage, items, children, ...props }) {
    return (_jsx(RACSelect, { ...props, className: composeTailwindRenderProps(props.className, fieldLayout), children: ({ isInvalid }) => (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Button, { className: (renderProps) => trigger({ ...renderProps, isInvalid }), children: [_jsx(SelectValue, { className: "flex-1 truncate data-[placeholder]:text-muted", children: ({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? defaultChildren : selectedText) }), _jsx(Icon, { name: "chevron-down", "aria-hidden": true, className: "size-4 text-muted group-data-[disabled]:text-disabled" })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { className: "min-w-(--trigger-width)", children: _jsx(ListBox, { items: items, className: "max-h-[inherit] overflow-auto", children: children }) })] })) }));
}
export function SelectItem(props) {
    return _jsx(ListBoxItem, { ...props });
}
