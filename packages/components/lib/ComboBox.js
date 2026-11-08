import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from '@parchment/icons/react';
import { Button, ComboBox as RACComboBox, } from 'react-aria-components';
import { Description, FieldError, FieldGroup, Input, Label, fieldLayout } from './Field.js';
import { ListBox, ListBoxItem } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeTailwindRenderProps } from './utils.js';
export function ComboBox({ label, description, errorMessage, placeholder, children, items, ...props }) {
    return (_jsxs(RACComboBox, { ...props, items: items, className: composeTailwindRenderProps(props.className, fieldLayout), children: [label && _jsx(Label, { children: label }), _jsxs(FieldGroup, { className: "min-w-40", children: [_jsx(Input, { placeholder: placeholder }), _jsx(Button, { className: "mr-1 flex size-8 items-center justify-center rounded-sm text-muted outline-0 data-[hovered]:bg-surface data-[pressed]:bg-surface data-[disabled]:text-disabled", children: _jsx(Icon, { name: "chevron-down", "aria-hidden": true, className: "size-4" }) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { className: "min-w-(--trigger-width)", children: _jsx(ListBox, { className: "max-h-[inherit] overflow-auto", children: children }) })] }));
}
export function ComboBoxItem(props) {
    return _jsx(ListBoxItem, { ...props });
}
