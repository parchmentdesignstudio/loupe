import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Radio as RACRadio, RadioGroup as RACRadioGroup, composeRenderProps, } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label } from './Field.js';
import { composeTailwindRenderProps, focusRing } from './utils.js';
export function RadioGroup({ label, description, errorMessage, children, ...props }) {
    return (_jsxs(RACRadioGroup, { ...props, className: composeTailwindRenderProps(props.className, 'group flex flex-col gap-2'), children: [label && _jsx(Label, { children: label }), _jsx("div", { className: "flex gap-x-5 gap-y-1 group-data-[orientation=vertical]:flex-col", children: children }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
const dot = tv({
    extend: focusRing,
    base: 'size-[18px] shrink-0 rounded-full border bg-raised transition-all',
    variants: {
        isSelected: {
            false: 'border-line-strong',
            true: 'border-[5px] border-accent',
        },
        isHovered: { true: '' },
        isPressed: { true: 'scale-95' },
        isInvalid: { true: 'border-critical' },
        isDisabled: { true: 'border-line bg-surface' },
    },
    compoundVariants: [
        { isSelected: false, isHovered: true, isDisabled: false, class: 'border-ink' },
        { isSelected: true, isHovered: true, isDisabled: false, class: 'border-accent-hover' },
        { isSelected: true, isDisabled: true, class: 'border-disabled' },
    ],
});
export function Radio(props) {
    return (_jsx(RACRadio, { ...props, className: composeTailwindRenderProps(props.className, 'group flex items-center gap-2.5 py-1 text-sm text-ink cursor-default disabled:text-disabled [-webkit-tap-highlight-color:transparent]'), children: composeRenderProps(props.children, (children, renderProps) => (_jsxs(_Fragment, { children: [_jsx("span", { className: dot(renderProps) }), children] }))) }));
}
