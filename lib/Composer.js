import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Form, Group, TextArea, TextField as AriaTextField } from 'react-aria-components';
import { Button } from './Button.js';
import { tv } from './tv.js';
const composer = tv({
    slots: {
        group: 'flex items-end gap-2 rounded-lg bg-raised py-2 pr-3.5 pl-3 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]',
        // One line to begin with, growing with what's written up to about six, then it scrolls
        input: 'max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2 text-control leading-6 text-ink outline-none field-sizing-content placeholder:text-muted',
        // Centres the send button on the line of text. It sits further in than the box's radius, so it takes the smallest
        // corner rather than a concentric one, which would be square
        send: 'mb-1.5 [--button-radius:var(--radius-sm)]',
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
/** A message field with its send button, as in the chat. Enter sends, Shift-Enter starts a new line, and an empty message can't be sent */
export function Composer({ label, placeholder, submitLabel = 'Send', submitIcon, onSubmit, value, defaultValue = '', onChange, isDisabled = false, className }) {
    const [draft, setDraft] = useState(defaultValue);
    const message = value ?? draft;
    const empty = message.trim() === '';
    const slots = composer();
    const change = (next) => {
        if (value === undefined)
            setDraft(next);
        onChange?.(next);
    };
    const send = (event) => {
        event.preventDefault();
        if (empty || isDisabled)
            return;
        onSubmit(message.trim());
        if (value === undefined)
            setDraft('');
    };
    // While an input method is composing, Enter picks the characters rather than sending
    const sendOnEnter = (event) => {
        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing)
            return;
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
    };
    return (_jsx(Form, { onSubmit: send, className: className, children: _jsx(AriaTextField, { "aria-label": label, value: message, onChange: change, isDisabled: isDisabled, children: _jsxs(Group, { className: (state) => slots.group(state), children: [_jsx(TextArea, { rows: 1, placeholder: placeholder, onKeyDown: sendOnEnter, className: slots.input() }), _jsx(Button, { type: "submit", "aria-label": submitLabel, shape: "square", size: "small", isDisabled: isDisabled || empty, className: slots.send(), children: submitIcon })] }) }) }));
}
