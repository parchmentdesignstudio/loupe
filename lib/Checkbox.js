import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup, composeRenderProps } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { Check, Dash } from './glyphs.js';
import { composeClassName, focusRing, tv } from './tv.js';
// A choice and its label. The label is part of what's pressed, so it's a large target
// Relative, so React Aria's hidden input stays inside the label. Otherwise focusing it can scroll the whole page
export const choice = tv({
    base: 'group relative flex cursor-default items-center gap-3 py-1 text-control text-ink [-webkit-tap-highlight-color:transparent]',
    variants: {
        isDisabled: {
            true: 'opacity-40',
        },
    },
});
export const box = tv({
    extend: focusRing,
    base: 'flex size-5 shrink-0 items-center justify-center rounded-md transition-[scale,background-color] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        isSelected: {
            false: 'bg-raised text-transparent shadow-raised',
            true: 'bg-ink text-paper',
        },
        isHovered: {
            true: '',
        },
        isPressed: {
            true: 'scale-90',
        },
        isInvalid: {
            true: '',
        },
    },
    compoundVariants: [
        { isSelected: false, isHovered: true, class: 'bg-surface' },
        { isSelected: true, isHovered: true, class: 'bg-ink/88' },
        { isSelected: false, isInvalid: true, class: 'shadow-invalid' },
        { isSelected: true, isInvalid: true, class: 'bg-danger' },
    ],
});
/** A checkbox with its label as children. isIndeterminate shows a dash, for a parent of others that are mixed */
export function Checkbox(props) {
    return (_jsx(AriaCheckbox, { ...props, className: composeRenderProps(props.className, (className, state) => choice({ ...state, className })), children: composeRenderProps(props.children, (children, { isSelected, isIndeterminate, ...state }) => (_jsxs(_Fragment, { children: [_jsx("span", { className: box({ ...state, isSelected: isSelected || isIndeterminate }), children: isIndeterminate ? _jsx(Dash, {}) : _jsx(Check, {}) }), children] }))) }));
}
/** Checkboxes under one label, sent as one field */
export function CheckboxGroup({ label, description, errorMessage, children, ...props }) {
    return (_jsxs(AriaCheckboxGroup, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx("div", { className: "flex flex-col", children: children }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
