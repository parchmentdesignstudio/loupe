import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { Form, Group, Text, TextArea, TextField as AriaTextField } from 'react-aria-components';
import { Button } from './Button.js';
import { tv } from './tv.js';
const composer = tv({
    slots: {
        // Context, when there is any, takes a row of its own above the text
        group: 'flex flex-wrap items-end gap-x-2 rounded-(--field-radius) bg-(--field-fill,var(--color-raised)) py-1 pr-2.5 pl-(--field-padding-x) shadow-raised [--shadow-raised-color:var(--field-shadow)] outline-offset-2 outline-(color:--field-focus-ring,var(--color-ink)) forced-colors:outline-[Highlight] in-data-[show-focus]:outline-2',
        // One line to begin with, growing with what's written up to about six, then it scrolls
        context: 'flex basis-full flex-wrap gap-1 pt-1.5',
        input: 'max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2 font-(family-name:--typeface-body) text-control leading-6 text-(color:--field-text,var(--color-ink)) outline-none field-sizing-content placeholder:text-(color:--field-placeholder,var(--color-muted))',
        // Centres the send button on the line of text. It sits further in than the box's radius, so it takes the smallest
        // corner rather than a concentric one, which would be square
        send: 'mb-1.5 [--button-radius:var(--radius-sm)]',
        // With a start or actions, the text takes the box's width and a toolbar under it holds them and the send button,
        // as Claude's composer does: what to add at the start, how it's sent at the end, by the button that sends it
        toolbar: 'flex basis-full items-center gap-1 pb-1.5',
        // Mirrors the send button: as far in from the start as it is from the end, and with its corner, so both sit in the
        // box's corners alike. Too far in for a concentric radius, so the smallest, as send has
        start: '-ms-[calc(var(--field-padding-x)-0.625rem)] flex items-center gap-1 [--button-radius:var(--radius-sm)]',
        actions: 'ms-auto flex items-center gap-1',
    },
    variants: {
        hasToolbar: {
            true: { input: 'basis-full', send: 'mb-0' },
        },
        isFocusWithin: {
            false: { group: 'outline-0' },
            true: { group: 'outline-2' },
        },
        isDisabled: {
            true: { group: 'bg-bleed/12 shadow-none', input: 'text-muted' },
        },
    },
});
// Sending nothing doesn't send, but it isn't ignored either: the field takes focus, so its ring shows where to write,
// and gives a short shake, a no it can't be mistaken for a lag. Still, with reduced motion
const shake = [{ translate: '0' }, { translate: '-4px' }, { translate: '3px' }, { translate: '-2px' }, { translate: '0' }];
// While an input method is composing, Enter picks the characters rather than sending
function sendOnEnter(event) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing)
        return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
}
/**
 * A message field with its send button, as in the chat. Enter sends, Shift-Enter starts a new line. The button is
 * always live: an empty message isn't sent, and the field says so by taking focus with a shake
 */
export function Composer({ 'aria-label': label, placeholder, submitLabel = 'Send', submitIcon, onSubmit, value, defaultValue = '', onChange, context, start, actions, description, maxLength, isDisabled = false, className }) {
    const [draft, setDraft] = useState(defaultValue);
    const message = value ?? draft;
    const empty = message.trim() === '';
    const hasToolbar = Boolean(start || actions);
    const slots = composer({ hasToolbar });
    const field = useRef(null);
    const change = (next) => {
        if (value === undefined)
            setDraft(next);
        onChange?.(next);
    };
    const send = (event) => {
        event.preventDefault();
        if (isDisabled)
            return;
        if (empty) {
            field.current?.focus();
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
                field.current?.parentElement?.animate?.(shake, { duration: 280, easing: 'ease-out' });
            return;
        }
        onSubmit(message.trim());
        if (value === undefined)
            setDraft('');
    };
    const sendButton = (_jsx(Button, { type: "submit", variant: "secondary", "aria-label": submitLabel, size: "small", isDisabled: isDisabled, className: slots.send(), children: submitIcon }));
    return (_jsx(Form, { onSubmit: send, className: className, children: _jsxs(AriaTextField, { "aria-label": label, value: message, onChange: change, maxLength: maxLength, isDisabled: isDisabled, children: [_jsxs(Group, { className: (state) => slots.group(state), children: [context && _jsx("div", { className: slots.context(), children: context }), _jsx(TextArea, { ref: field, rows: 1, placeholder: placeholder, enterKeyHint: "send", onKeyDown: sendOnEnter, className: slots.input() }), hasToolbar ? (_jsxs("div", { className: slots.toolbar(), children: [start && _jsx("div", { className: slots.start(), children: start }), _jsxs("div", { className: slots.actions(), children: [actions, sendButton] })] })) : (sendButton)] }), description && (_jsx(Text, { slot: "description", className: "sr-only", children: description }))] }) }));
}
