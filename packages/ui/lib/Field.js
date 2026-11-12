import { jsx as _jsx } from "react/jsx-runtime";
import { FieldError as AriaFieldError, Label as AriaLabel, Text } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';
// The parts every field shares, so a select reads like a text field. A required field's label ends in a muted *,
// which screen readers skip, as the field already says it's required
export const field = tv({
    slots: {
        label: "w-fit cursor-default text-control text-ink in-data-required:after:ms-0.5 in-data-required:after:text-muted in-data-required:after:content-['*'_/_'']",
        description: 'text-label text-muted',
        error: 'text-label text-danger',
    },
});
const slots = field();
/** A read-only field keeps its edge but loses its fill and lift, so it reads as set rather than waiting for input */
export const readOnly = 'in-data-readonly:bg-transparent in-data-readonly:shadow-[0_0_0_.5px_var(--edge)]';
export function Label(props) {
    return _jsx(AriaLabel, { ...props, className: slots.label({ className: props.className }) });
}
export function Description(props) {
    return _jsx(Text, { ...props, slot: "description", className: slots.description({ className: props.className }) });
}
export function FieldError(props) {
    return _jsx(AriaFieldError, { ...props, className: composeClassName(props.className, slots.error()) });
}
