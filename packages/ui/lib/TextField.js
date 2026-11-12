import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, TextArea, TextField as AriaTextField } from 'react-aria-components';
import { Description, FieldError, Label, readOnly } from './Field.js';
import { composeClassName, tv } from './tv.js';
// Control text, which is 16px on touch screens, as iOS zooms into anything smaller. Like a button, the padding and the
// 20px line make it 32px tall. Chrome ignores an input's line if it's no taller than the text, so a 16px line, an
// icon's, would make it 37px on a touch screen. A field shows its focus however it was focused
export const input = tv({
    base: ['w-full rounded-lg bg-raised px-3 py-1.5 text-control text-ink shadow-raised outline-offset-0 outline-ink placeholder:text-muted forced-colors:outline-[Highlight]', readOnly],
    variants: {
        isFocused: {
            false: 'outline-0',
            true: 'outline-2',
        },
        isInvalid: {
            true: 'outline-danger shadow-invalid',
        },
        isDisabled: {
            true: 'opacity-50',
        },
    },
});
/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export function TextField({ label, description, errorMessage, placeholder, multiline = false, rows = 4, ...props }) {
    return (_jsxs(AriaTextField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), multiline ? (_jsx(TextArea, { placeholder: placeholder, rows: rows, className: (state) => input({ ...state, className: 'resize-y leading-[1.5]' }) })) : (_jsx(Input, { placeholder: placeholder, className: (state) => input(state) })), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
