import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup, composeRenderProps } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { composeClassName, focusRing, tv } from './tv.js';
// A choice and its label. The label is part of what's pressed, so it's a large target
// Relative, so React Aria's hidden input stays inside the label. Otherwise focusing it can scroll the whole page. The box
// centres on the label's first line, so it stays put when the label wraps
export const choice = tv({
    base: 'group relative flex cursor-default items-start gap-2 py-1 font-(family-name:--typeface-body) text-control text-ink [-webkit-tap-highlight-color:transparent]',
    variants: {
        // Muted rather than faded, as a disabled button is, with each control going flat
        isDisabled: {
            true: 'text-muted',
        },
    },
});
// The box stays white whether it's ticked or not, and the tick draws itself in, so the mark alone says it's chosen.
// It rings for data-show-focus on the checkbox, its parent, and not on a list or table row the checkbox sits in, which
// rings itself
export const checkboxBox = tv({
    extend: focusRing,
    base: 'my-[calc((1lh-1rem)/2)] flex size-4 shrink-0 items-center justify-center rounded-(--checkbox-radius) bg-(--checkbox-fill,var(--color-raised)) text-(color:--checkbox-mark,var(--color-ink)) shadow-raised [--shadow-raised-color:var(--checkbox-shadow)] transition-[scale] duration-fast ease-standard motion-reduce:transition-none [[data-show-focus]>&]:outline-2',
    variants: {
        isPressed: {
            true: 'scale-(--checkbox-press-scale)',
        },
        isInvalid: {
            true: 'text-danger shadow-invalid',
        },
        isDisabled: {
            true: 'bg-bleed/12 text-muted shadow-none',
        },
    },
});
// The tick comes into focus as it grows from three-quarters size, and goes quicker than it came. It's drawn on a 16px
// grid at 12px, so its stroke of 2 shows as 1.5px
const mark = tv({
    base: 'size-3 shrink-0 fill-none stroke-current stroke-2 motion-reduce:transition-none',
    variants: {
        isSelected: {
            false: 'scale-75 opacity-0 blur-[3px] transition-[scale,opacity,filter] duration-100 ease-exit',
            true: 'transition-[scale,opacity,filter] duration-200 ease-standard',
        },
    },
});
export function Checkbox(props) {
    return (_jsx(AriaCheckbox, { ...props, className: composeRenderProps(props.className, (className, state) => choice({ ...state, className })), children: composeRenderProps(props.children, (children, { isSelected, isIndeterminate, ...state }) => (_jsxs(_Fragment, { children: [_jsx("span", { className: checkboxBox(state), children: _jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: mark({ isSelected: isSelected || isIndeterminate }), children: isIndeterminate ? _jsx("path", { d: "M4 8h8", strokeLinecap: "round" }) : _jsx("path", { d: "m3.5 8.5 3 3 6-7", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), children] }))) }));
}
/** Checkboxes under one label, sent as one field */
export function CheckboxGroup({ label, description, errorMessage, children, ...props }) {
    return (_jsxs(AriaCheckboxGroup, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx("div", { className: "flex flex-col", children: children }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
