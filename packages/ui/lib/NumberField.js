import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Group, Input, NumberField as AriaNumberField } from 'react-aria-components';
import { boxField, boxLabel, Description, FieldError, Label, readOnly } from './Field.js';
import { Dash, Plus } from './glyphs.js';
import { composeClassName, tv } from './tv.js';
// Sized like a text field, with its steppers inside as the combo box has its button
export const numberField = tv({
    slots: {
        group: ['flex items-center rounded-(--field-radius) pe-1 outline-offset-2 outline-(color:--field-focus-ring,var(--color-ink)) forced-colors:outline-[Highlight] in-data-[show-focus]:outline-2', readOnly],
        input: 'min-w-0 flex-1 bg-transparent text-control text-(color:--field-text,var(--color-ink)) tabular-nums outline-none placeholder:text-(color:--field-placeholder,var(--color-muted))',
        stepper: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:text-bleed/24 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
    },
    variants: {
        // As a text field's. Raised tints its steppers' hover from white's bleed, and filled keeps the layer's
        variant: {
            raised: { group: 'bg-(--field-fill,var(--color-raised)) [--bleed:var(--raised-bleed)] shadow-raised [--shadow-raised-color:var(--field-shadow)]' },
            filled: { group: 'bg-bleed/8 shadow-none' },
        },
        // As a text field's: 32px, or 28px when small
        size: {
            medium: { input: 'py-(--field-padding-y) ps-(--field-padding-x)' },
            small: { input: 'py-(--field-small-padding-y) ps-(--field-small-padding-x)', stepper: 'p-0.5' },
        },
        isFocusWithin: {
            false: { group: 'outline-0' },
            true: { group: 'outline-2' },
        },
        isInvalid: {
            true: { group: 'outline-danger shadow-invalid' },
        },
        isDisabled: {
            true: { group: 'bg-bleed/12 shadow-none', input: 'text-muted' },
        },
    },
    compoundVariants: [{ variant: 'filled', isDisabled: true, class: { group: 'bg-bleed/4' } }],
    defaultVariants: { variant: 'raised', size: 'medium' },
});
/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export function NumberField({ label, description, errorMessage, placeholder, variant, size, ...props }) {
    return (_jsx(AriaNumberField, { ...props, className: composeClassName(props.className, boxField), children: ({ isInvalid, isDisabled }) => {
            const slots = numberField({ isInvalid, isDisabled, variant, size });
            return (_jsxs(_Fragment, { children: [label && _jsx(Label, { className: boxLabel, children: label }), _jsxs(Group, { className: (state) => slots.group(state), children: [_jsx(Input, { placeholder: placeholder, className: slots.input() }), _jsx(Button, { slot: "decrement", className: slots.stepper(), children: _jsx(Dash, {}) }), _jsx(Button, { slot: "increment", className: slots.stepper(), children: _jsx(Plus, {}) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
        } }));
}
