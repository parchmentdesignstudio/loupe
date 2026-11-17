import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { ColorField as AriaColorField, ColorFieldContext, Group, Input, NumberField as AriaNumberField, parseColor, TextField as AriaTextField, useContextProps, } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { numberField } from './NumberField.js';
import { formatOklch, parseAnyColor } from './parseAnyColor.js';
import { textFieldInput } from './TextField.js';
import { composeClassName } from './tv.js';
/**
 * A colour, which takes any CSS colour pasted or typed into it, such as oklch(), rgb(), a name or hex, and shows it as
 * oklch once it's committed, on Enter, on leaving the field or straight away when pasted. It keeps a colour outside sRGB
 * exactly, though React Aria's Color, and so a picker's area and slider, hold the nearest sRGB. Its opacity sits beside
 * it, so a pasted colour with an alpha sets it, and one without keeps it. Given a channel, it types that one channel as a
 * number
 */
export function ColorField(props) {
    return props.channel ? _jsx(ChannelField, { ...props }) : _jsx(AnyColorField, { ...props });
}
function ChannelField({ label, description, errorMessage, placeholder, hasOpacity: _hasOpacity, format: _format, variant, size, onChange, ...props }) {
    return (_jsxs(AriaColorField, { ...props, onChange: (color) => onChange?.(color, oklchString(color)), className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx(Input, { placeholder: placeholder, className: (state) => textFieldInput({ ...state, variant, size }) }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
function AnyColorField(given) {
    // Inside a ColorPicker, its colour and setter arrive through React Aria's context, as they do for its own field
    const ref = useRef(null);
    const [props] = useContextProps(given, ref, ColorFieldContext);
    const { label, description, errorMessage, placeholder, hasOpacity = true, format = 'oklch', variant, size = 'medium', value, defaultValue, onChange, name, form, className } = props;
    const [own, setOwn] = useState(() => toEntry(defaultValue));
    const entry = value === undefined ? own : toEntry(value);
    const color = entry.color;
    // The exact colour last set here, kept while the Color given back is its nearest sRGB, as a picker's is
    const [kept, setKept] = useState(null);
    const exact = color ? (entry.exact ?? (kept && sameColor(kept, color) ? kept : oklchOf(color))) : null;
    const alpha = color?.getChannelValue('alpha') ?? 1;
    const [draft, setDraft] = useState(null);
    const set = (next, nextExact) => {
        if (value === undefined)
            setOwn({ color: next, exact: nextExact });
        setKept(nextExact);
        const css = next && nextExact ? formatOklch(nextExact, next.getChannelValue('alpha')) : null;
        const current = color && exact ? formatOklch(exact, alpha) : null;
        if (css !== current || next?.toString('hexa') !== color?.toString('hexa'))
            onChange?.(next, css);
    };
    // What was typed or pasted becomes the colour if it is one. Otherwise the field goes back to the colour it had
    const commit = (text = draft) => {
        setDraft(null);
        if (text === null)
            return;
        if (text.trim() === '')
            return set(null, null);
        const parsed = parseAnyColor(text);
        if (!parsed)
            return;
        const nextAlpha = parsed.hasAlpha || !color ? parsed.alpha : alpha;
        set(parsed.color.toFormat(color?.getColorSpace() ?? 'rgb').withChannelValue('alpha', nextAlpha), parsed.oklch);
    };
    // Without its own opacity, the text carries it
    const shown = !color || !exact ? '' : format === 'hex' ? color.toString(!hasOpacity && alpha < 1 ? 'hexa' : 'hex') : formatOklch(exact, hasOpacity ? 1 : alpha);
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
    return (_jsxs(AriaTextField, { "aria-label": props['aria-label'], "aria-labelledby": props['aria-labelledby'], "aria-describedby": props['aria-describedby'], id: props.id, autoFocus: props.autoFocus, isDisabled: props.isDisabled, isReadOnly: props.isReadOnly, isRequired: props.isRequired, isInvalid: props.isInvalid, validationBehavior: props.validationBehavior, value: draft ?? shown, onChange: setDraft, onBlur: (event) => {
            commit();
            props.onBlur?.(event);
        }, onFocus: props.onFocus, onKeyDown: onKeyDown, className: composeClassName(typeof className === 'string' ? className : undefined, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsxs(Group, { isDisabled: props.isDisabled, isInvalid: props.isInvalid, className: (state) => slots.group({ ...state, className: 'pr-0' }), children: [_jsx(Input, { ref: ref, placeholder: placeholder, spellCheck: false, autoComplete: "off", onPaste: onPaste, className: slots.input({ className: 'truncate' }) }), hasOpacity && (_jsx(AriaNumberField, { "aria-label": "Opacity", value: color ? color.getChannelValue('alpha') : Number.NaN, onChange: (next) => color && !Number.isNaN(next) && set(color.withChannelValue('alpha', next), exact), minValue: 0, maxValue: 1, step: 0.01, formatOptions: { style: 'percent' }, isDisabled: props.isDisabled || !color, isReadOnly: props.isReadOnly, className: "contents", children: _jsx(Input, { className: opacity }) }))] }), name && _jsx("input", { type: "hidden", name: name, form: form, value: color && exact ? (format === 'hex' ? color.toString('hexa') : formatOklch(exact, alpha)) : '' }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
function toEntry(value) {
    if (value == null)
        return { color: null, exact: null };
    if (typeof value !== 'string')
        return { color: value, exact: null };
    const parsed = parseAnyColor(value);
    return { color: safeParse(value) ?? parsed?.color ?? null, exact: parsed?.oklch ?? null };
}
function oklchOf(color) {
    return parseAnyColor(color.toString('rgb'))?.oklch ?? null;
}
function oklchString(color) {
    const exact = color && oklchOf(color);
    return color && exact ? formatOklch(exact, color.getChannelValue('alpha')) : null;
}
// Whether an exact colour comes to this Color in sRGB, so it's the same colour and can be shown as it was given
function sameColor(exact, color) {
    return parseAnyColor(formatOklch(exact))?.color.toString('hex') === color.toString('hex');
}
function safeParse(value) {
    try {
        return parseColor(value);
    }
    catch {
        return null;
    }
}
