import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup, composeRenderProps } from 'react-aria-components';
import { choice } from './Checkbox.js';
import { Description, FieldError, Label } from './Field.js';
import { composeClassName, focusRing, tv } from './tv.js';
const dot = tv({
    extend: focusRing,
    base: 'flex size-5 shrink-0 items-center justify-center rounded-full transition-[scale,background-color] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        isSelected: {
            false: 'bg-paper shadow-raised',
            true: 'bg-ink',
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
        { isSelected: false, isInvalid: true, class: 'shadow-[0_0_0_1px_var(--color-danger)]' },
        { isSelected: true, isInvalid: true, class: 'bg-danger' },
    ],
});
/** One option in a RadioGroup, with its label as children */
export function Radio(props) {
    return (_jsx(AriaRadio, { ...props, className: composeRenderProps(props.className, (className, state) => choice({ ...state, className })), children: composeRenderProps(props.children, (children, state) => (_jsxs(_Fragment, { children: [_jsx("span", { className: dot(state), children: state.isSelected && _jsx("span", { className: "size-2 rounded-full bg-paper" }) }), children] }))) }));
}
/** Options where only one can be chosen. Set orientation to horizontal to lay them in a row */
export function RadioGroup({ label, description, errorMessage, children, ...props }) {
    return (_jsxs(AriaRadioGroup, { ...props, className: composeClassName(props.className, 'group flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx("div", { className: "flex flex-col group-data-[orientation=horizontal]:flex-row group-data-[orientation=horizontal]:flex-wrap group-data-[orientation=horizontal]:gap-x-6", children: children }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
