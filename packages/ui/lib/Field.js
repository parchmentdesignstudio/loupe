import { jsx as _jsx } from "react/jsx-runtime";
import { FieldError as AriaFieldError, Label as AriaLabel, Text } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';
// The parts every field shares, so a select reads like a text field
export const field = tv({
    slots: {
        label: 'w-fit cursor-default font-mono text-label text-ink',
        description: 'text-label text-muted',
        error: 'text-label text-danger',
    },
});
const slots = field();
export function Label(props) {
    return _jsx(AriaLabel, { ...props, className: slots.label({ className: props.className }) });
}
export function Description(props) {
    return _jsx(Text, { ...props, slot: "description", className: slots.description({ className: props.className }) });
}
export function FieldError(props) {
    return _jsx(AriaFieldError, { ...props, className: composeClassName(props.className, slots.error()) });
}
