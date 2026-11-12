import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Group, Input, NumberField as AriaNumberField } from 'react-aria-components';
import { Description, FieldError, Label, readOnly } from './Field.js';
import { Dash, Plus } from './glyphs.js';
import { composeClassName, tv } from './tv.js';
// Sized like a text field, with its steppers inside as the combo box has its button
const numberField = tv({
    slots: {
        group: ['flex items-center rounded-lg bg-raised [--bleed:var(--raised-bleed)] pr-1 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]', readOnly],
        input: 'min-w-0 flex-1 bg-transparent py-1.5 pl-3 text-control text-ink tabular-nums outline-none placeholder:text-muted',
        stepper: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:opacity-40 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
    },
    variants: {
        isFocusWithin: {
            false: { group: 'outline-0' },
            true: { group: 'outline-2' },
        },
        isInvalid: {
            true: { group: 'outline-danger shadow-invalid' },
        },
        isDisabled: {
            true: { group: 'opacity-50' },
        },
    },
});
/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export function NumberField({ label, description, errorMessage, placeholder, ...props }) {
    return (_jsx(AriaNumberField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: ({ isInvalid, isDisabled }) => {
            const slots = numberField({ isInvalid, isDisabled });
            return (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Group, { className: (state) => slots.group(state), children: [_jsx(Input, { placeholder: placeholder, className: slots.input() }), _jsx(Button, { slot: "decrement", className: slots.stepper(), children: _jsx(Dash, {}) }), _jsx(Button, { slot: "increment", className: slots.stepper(), children: _jsx(Plus, {}) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
        } }));
}
