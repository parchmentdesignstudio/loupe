import { jsx as _jsx } from "react/jsx-runtime";
import { FieldError as RACFieldError, Group, Input as RACInput, Label as RACLabel, Text, composeRenderProps, } from 'react-aria-components';
import { cn, tv } from 'tailwind-variants';
import { composeTailwindRenderProps, focusRing } from './utils.js';
export function Label(props) {
    return _jsx(RACLabel, { ...props, className: cn('w-fit text-sm font-medium text-ink cursor-default', props.className) });
}
export function Description(props) {
    return _jsx(Text, { ...props, slot: "description", className: cn('text-sm text-muted', props.className) });
}
export function FieldError(props) {
    return _jsx(RACFieldError, { ...props, className: composeTailwindRenderProps(props.className, 'text-sm text-critical') });
}
// Border colours for anything that looks like a field.
export const fieldBorder = tv({
    base: 'border border-line',
    variants: {
        isHovered: { true: 'border-line-strong' },
        isFocused: { true: 'border-line-strong' },
        isFocusWithin: { true: 'border-line-strong' },
        isInvalid: { true: 'border-critical' },
        isDisabled: { true: 'border-line bg-surface' },
    },
});
export const fieldGroup = tv({
    extend: [focusRing, fieldBorder],
    base: 'group flex h-10 items-center overflow-hidden rounded-md bg-raised',
});
// A text input that stands alone rather than inside a FieldGroup.
export const textInput = tv({
    extend: [focusRing, fieldBorder],
    base: 'min-w-0 rounded-md bg-raised px-3 py-2 text-sm text-ink placeholder:text-muted disabled:text-disabled',
});
export function FieldGroup(props) {
    return (_jsx(Group, { ...props, className: composeRenderProps(props.className, (className, renderProps) => fieldGroup({ ...renderProps, className })) }));
}
export function Input(props) {
    return (_jsx(RACInput, { ...props, className: composeTailwindRenderProps(props.className, 'min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-0 placeholder:text-muted disabled:text-disabled') }));
}
// The label, control, description and error stacked in one column.
export const fieldLayout = 'group flex flex-col gap-1.5';
