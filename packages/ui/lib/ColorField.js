import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ColorField as AriaColorField, Input } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { input } from './TextField.js';
import { composeClassName } from './tv.js';
/** A colour typed as hex, such as #fbf6ef, or one channel of it as a number when given a channel */
export function ColorField({ label, description, errorMessage, placeholder, ...props }) {
    return (_jsxs(AriaColorField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx(Input, { placeholder: placeholder, className: (state) => input(state) }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
