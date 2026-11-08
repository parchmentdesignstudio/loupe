import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, TextArea, TextField as AriaTextField } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { composeClassName, tv } from './tv.js';
// 16px text, as iOS zooms into anything smaller. A field shows its focus however it was focused
export const input = tv({
    base: 'min-h-11 w-full rounded-2xl bg-paper px-4 py-2.5 text-base text-ink shadow-raised outline-offset-0 outline-ink placeholder:text-muted forced-colors:outline-[Highlight]',
    variants: {
        isFocused: {
            false: 'outline-0',
            true: 'outline-2',
        },
        isInvalid: {
            true: 'outline-danger shadow-[0_0_0_1px_var(--color-danger)]',
        },
        isDisabled: {
            true: 'opacity-50',
        },
    },
});
/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export function TextField({ label, description, errorMessage, placeholder, multiline = false, rows = 4, ...props }) {
    return (_jsxs(AriaTextField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), multiline ? (_jsx(TextArea, { placeholder: placeholder, rows: rows, className: (state) => input({ ...state, className: 'resize-y' }) })) : (_jsx(Input, { placeholder: placeholder, className: (state) => input(state) })), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
