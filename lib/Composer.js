import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Form, Group, Input, TextField as AriaTextField } from 'react-aria-components';
import { Button } from './Button.js';
import { tv } from './tv.js';
const composer = tv({
    slots: {
        group: 'flex items-end gap-2 rounded-lg bg-raised py-2 pr-3.5 pl-3 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]',
        input: 'min-w-0 flex-1 bg-transparent py-2 text-control leading-6 text-ink outline-none placeholder:text-muted',
        // Centres the send button on the line of text
        send: 'mb-1.5',
    },
    variants: {
        isFocusWithin: {
            false: { group: 'outline-0' },
            true: { group: 'outline-2' },
        },
        isDisabled: {
            true: { group: 'opacity-50' },
        },
    },
});
/** A message field with its send button, as in the chat. Enter sends, and an empty message can't be sent */
export function Composer({ label, placeholder, submitLabel = 'Send', submitIcon, onSubmit, isDisabled = false, className }) {
    const [message, setMessage] = useState('');
    const empty = message.trim() === '';
    const slots = composer();
    const send = (event) => {
        event.preventDefault();
        if (empty || isDisabled)
            return;
        onSubmit(message.trim());
        setMessage('');
    };
    return (_jsx(Form, { onSubmit: send, className: className, children: _jsx(AriaTextField, { "aria-label": label, value: message, onChange: setMessage, isDisabled: isDisabled, children: _jsxs(Group, { className: (state) => slots.group(state), children: [_jsx(Input, { placeholder: placeholder, className: slots.input() }), _jsx(Button, { type: "submit", "aria-label": submitLabel, shape: "circle", size: "small", isDisabled: isDisabled || empty, className: slots.send(), children: submitIcon })] }) }) }));
}
