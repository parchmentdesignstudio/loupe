import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { ColorField as AriaColorField, ColorFieldContext, Group, Input, NumberField as AriaNumberField, parseColor, TextField as AriaTextField, useContextProps, } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { numberField } from './NumberField.js';
import { parseAnyColor } from './parseAnyColor.js';
import { textFieldInput } from './TextField.js';
import { composeClassName } from './tv.js';
/**
 * A colour, which takes any CSS colour pasted or typed into it, such as oklch(), rgb(), a name or hex, and shows it as
 * hex once it's committed, on Enter, on leaving the field or straight away when pasted. Its opacity sits beside it, so a
 * pasted colour with an alpha sets it, and one without keeps it. Given a channel, it types that one channel as a number
 */
export function ColorField(props) {
    return props.channel ? _jsx(ChannelField, { ...props }) : _jsx(AnyColorField, { ...props });
}
function ChannelField({ label, description, errorMessage, placeholder, hasOpacity: _hasOpacity, variant, size, ...props }) {
    return (_jsxs(AriaColorField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx(Input, { placeholder: placeholder, className: (state) => textFieldInput({ ...state, variant, size }) }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
function AnyColorField(given) {
    // Inside a ColorPicker, its colour and setter arrive through React Aria's context, as they do for its own field
    const ref = useRef(null);
    const [props] = useContextProps(given, ref, ColorFieldContext);
    const { label, description, errorMessage, placeholder, hasOpacity = true, variant, size = 'medium', value, defaultValue, onChange, name, form, className } = props;
    const [own, setOwn] = useState(() => toColor(defaultValue));
    const color = value === undefined ? own : toColor(value);
    const [draft, setDraft] = useState(null);
    const set = (next) => {
        if (value === undefined)
            setOwn(next);
        if (next?.toString('hexa') !== color?.toString('hexa'))
            onChange?.(next);
    };
    // What was typed or pasted becomes the colour if it is one. Otherwise the field goes back to the colour it had
    const commit = (text = draft) => {
        setDraft(null);
        if (text === null)
            return;
        if (text.trim() === '')
            return set(null);
        const parsed = parseAnyColor(text);
        if (!parsed)
            return;
        const alpha = parsed.hasAlpha || !color ? parsed.color.getChannelValue('alpha') : color.getChannelValue('alpha');
        set(parsed.color.toFormat(color?.getColorSpace() ?? 'rgb').withChannelValue('alpha', alpha));
    };
    // React Aria stops a key here unless it's let through, so only Escape over an edit stays, to undo it rather than close a popover
    const onKeyDown = (event) => {
        if (event.key === 'Enter')
            commit();
        if (event.key === 'Escape' && draft !== null)
            return setDraft(null);
        event.continuePropagation();
    };
    // A paste over the whole value, or into an empty field, commits at once when it's a colour
    const onPaste = (event) => {
        const input = event.currentTarget;
        const text = event.clipboardData.getData('text');
        const isWhole = input.value === '' || (input.selectionStart === 0 && input.selectionEnd === input.value.length);
        if (!isWhole || !parseAnyColor(text))
            return;
        event.preventDefault();
        commit(text);
    };
    const slots = numberField({ variant, size, isInvalid: props.isInvalid, isDisabled: props.isDisabled });
    const opacity = numberField({ variant, size }).input({
        className: ['flex-none pl-2 text-right', size === 'small' ? 'w-14 pr-(--field-small-padding-x)' : 'w-16 pr-(--field-padding-x)'],
    });
    return (_jsxs(AriaTextField, { "aria-label": props['aria-label'], "aria-labelledby": props['aria-labelledby'], "aria-describedby": props['aria-describedby'], id: props.id, autoFocus: props.autoFocus, isDisabled: props.isDisabled, isReadOnly: props.isReadOnly, isRequired: props.isRequired, isInvalid: props.isInvalid, validationBehavior: props.validationBehavior, value: draft ?? (color ? color.toString('hex') : ''), onChange: setDraft, onBlur: (event) => {
            commit();
            props.onBlur?.(event);
        }, onFocus: props.onFocus, onKeyDown: onKeyDown, className: composeClassName(typeof className === 'string' ? className : undefined, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsxs(Group, { isDisabled: props.isDisabled, isInvalid: props.isInvalid, className: (state) => slots.group({ ...state, className: 'pr-0' }), children: [_jsx(Input, { ref: ref, placeholder: placeholder, spellCheck: false, autoComplete: "off", onPaste: onPaste, className: slots.input() }), hasOpacity && (_jsx(AriaNumberField, { "aria-label": "Opacity", value: color ? color.getChannelValue('alpha') : Number.NaN, onChange: (alpha) => color && !Number.isNaN(alpha) && set(color.withChannelValue('alpha', alpha)), minValue: 0, maxValue: 1, step: 0.01, formatOptions: { style: 'percent' }, isDisabled: props.isDisabled || !color, isReadOnly: props.isReadOnly, className: "contents", children: _jsx(Input, { className: opacity }) }))] }), name && _jsx("input", { type: "hidden", name: name, form: form, value: color ? color.toString(hasOpacity ? 'hexa' : 'hex') : '' }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
function toColor(value) {
    if (value == null)
        return null;
    if (typeof value !== 'string')
        return value;
    return safeParse(value) ?? parseAnyColor(value)?.color ?? null;
}
function safeParse(value) {
    try {
        return parseColor(value);
    }
    catch {
        return null;
    }
}
