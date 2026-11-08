import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input as RACInput, TextArea as RACTextArea, TextField as RACTextField, } from 'react-aria-components';
import { Description, FieldError, Label, fieldLayout, textInput } from './Field.js';
import { composeTailwindRenderProps } from './utils.js';
export function TextField({ label, description, errorMessage, placeholder, multiline, rows = 4, ...props }) {
    return (_jsxs(RACTextField, { ...props, className: composeTailwindRenderProps(props.className, fieldLayout), children: [label && _jsx(Label, { children: label }), multiline ? (_jsx(RACTextArea, { placeholder: placeholder, rows: rows, className: (renderProps) => textInput({ ...renderProps, className: 'resize-y leading-relaxed' }) })) : (_jsx(RACInput, { placeholder: placeholder, className: (renderProps) => textInput(renderProps) })), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
