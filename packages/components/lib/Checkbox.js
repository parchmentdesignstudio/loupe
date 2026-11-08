import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from '@parchment/icons/react';
import { Checkbox as RACCheckbox, CheckboxGroup as RACCheckboxGroup, composeRenderProps, } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label } from './Field.js';
import { composeTailwindRenderProps, focusRing } from './utils.js';
export function CheckboxGroup({ label, description, errorMessage, children, ...props }) {
    return (_jsxs(RACCheckboxGroup, { ...props, className: composeTailwindRenderProps(props.className, 'flex flex-col gap-2'), children: [label && _jsx(Label, { children: label }), _jsx("div", { className: "flex flex-col gap-1", children: children }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
const checkbox = tv({
    base: 'group flex items-center gap-2.5 py-1 text-sm text-ink cursor-default [-webkit-tap-highlight-color:transparent]',
    variants: {
        isDisabled: { true: 'text-disabled' },
    },
});
const box = tv({
    extend: focusRing,
    base: 'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
    variants: {
        isSelected: {
            false: 'border-line-strong bg-raised',
            true: 'border-transparent bg-accent text-on-accent',
        },
        isHovered: { true: '' },
        isPressed: { true: 'scale-95' },
        isInvalid: { true: '' },
        isDisabled: { true: 'border-line bg-surface text-disabled' },
    },
    compoundVariants: [
        { isSelected: false, isHovered: true, isDisabled: false, class: 'border-ink' },
        { isSelected: true, isHovered: true, isDisabled: false, class: 'bg-accent-hover' },
        { isInvalid: true, isSelected: false, class: 'border-critical' },
        { isInvalid: true, isSelected: true, class: 'bg-critical text-on-critical' },
    ],
});
export function Checkbox(props) {
    return (_jsx(RACCheckbox, { ...props, className: composeRenderProps(props.className, (className, renderProps) => checkbox({ ...renderProps, className })), children: composeRenderProps(props.children, (children, { isSelected, isIndeterminate, ...renderProps }) => (_jsxs(_Fragment, { children: [_jsx("span", { className: box({ isSelected: isSelected || isIndeterminate, ...renderProps }), children: isIndeterminate ? (_jsx(Icon, { name: "minus", className: "size-3.5" })) : isSelected ? (_jsx(Icon, { name: "checkmark", className: "size-3.5" })) : null }), children] }))) }));
}
