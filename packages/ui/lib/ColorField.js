import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { ColorField as AriaColorField, ColorFieldContext, Group, Input, NumberField as AriaNumberField, parseColor, TextField as AriaTextField, useContextProps, } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { numberField } from './NumberField.js';
import { formatOklch, fromOklch, parseAnyColor } from './parseAnyColor.js';
import { Swatch } from './Swatch.js';
import { textFieldInput } from './TextField.js';
import { composeClassName } from './tv.js';
/**
 * A colour, which takes any CSS colour pasted or typed into it, such as oklch(), rgb(), a name or hex, and shows it as
 * oklch once it's committed, on Enter, on leaving the field or straight away when pasted. It keeps a colour outside sRGB
 * exactly, though React Aria's Color, and so a picker's area and slider, hold the nearest sRGB. A swatch of it sits
 * before the text, as a picker's does, and its opacity after, so a pasted colour with an alpha sets it, and one without
 * keeps it. Given a channel, it types that one channel as a number
 */
export function ColorField(props) {
    return props.channel ? _jsx(ChannelField, { ...props }) : _jsx(AnyColorField, { ...props });
}
function ChannelField({ label, description, errorMessage, placeholder, hasOpacity: _hasOpacity, format: _format, variant, size, onChange, ...props }) {
    return (_jsxs(AriaColorField, { ...props, onChange: (color) => onChange?.(color, oklchString(color)), className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx(Input, { placeholder: placeholder, className: (state) => textFieldInput({ ...state, variant, size }) }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
function AnyColorField({ ref: givenRef, ...given }) {
    // Inside a ColorPicker, its colour and setter arrive through React Aria's context, as they do for its own field
    const [props, ref] = useContextProps(given, givenRef, ColorFieldContext);
    const { label, description, errorMessage, placeholder, hasOpacity = true, format = 'oklch', variant, size = 'medium', value, defaultValue, onChange, name, form, validate, onBlur, onKeyDown, className, children: _children, channel: _channel, colorSpace: _colorSpace, isWheelDisabled: _isWheelDisabled, slot: _slot, ...rest } = props;
    const input = useRef(null);
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
        const parsed = parseAnyColor(text);
        if (text.trim() === '')
            set(null, null);
        else if (parsed) {
            const nextAlpha = parsed.hasAlpha || !color || !hasOpacity ? parsed.alpha : alpha;
            set(parsed.color.toFormat(color?.getColorSpace() ?? 'rgb').withChannelValue('alpha', nextAlpha), parsed.oklch);
        }
        // React Aria shows the field's validation once its input says it changed, which a paste or Enter doesn't, so it's
        // said here. It doesn't bubble, so it reaches React Aria's own listener and nothing else
        input.current?.dispatchEvent(new Event('change'));
    };
    // A form's reset puts the colour back as it started, as React Aria's own fields do. The text and opacity inside reset
    // themselves to what they first showed, so what they set is ignored until it's over
    const [start] = useState(() => (value === undefined ? defaultValue : value));
    const isResetting = useRef(false);
    useEffect(() => {
        const owner = input.current?.form;
        if (!owner)
            return;
        // The document, or the shadow root when there is one, as a reset doesn't leave it
        const root = owner.getRootNode();
        const reset = (event) => {
            if (event.target !== owner)
                return;
            isResetting.current = true;
            setTimeout(() => {
                isResetting.current = false;
            });
            const first = toEntry(start);
            setDraft(null);
            set(first.color, first.color && (first.exact ?? oklchOf(first.color)));
        };
        // Caught on its way down to the form, so it's ahead of the text and opacity fields' own
        root.addEventListener('reset', reset, true);
        return () => root.removeEventListener('reset', reset, true);
    });
    // Without its own opacity, the text carries it
    const shown = !color || !exact ? '' : format === 'hex' ? color.toString(!hasOpacity && alpha < 1 ? 'hexa' : 'hex') : formatOklch(exact, hasOpacity ? 1 : alpha);
    // The colour exactly, with its opacity, as the swatch shows it and a form submits it
    const css = color && exact ? formatOklch(exact, alpha) : null;
    // React Aria stops a key here unless it's let through, so only Escape over an edit stays, to undo it rather than close a popover
    const keyDown = (event) => {
        if (event.key === 'Enter')
            commit();
        if (event.key === 'Escape' && draft !== null)
            setDraft(null);
        else
            event.continuePropagation();
        onKeyDown?.(event);
    };
    // A paste over the whole value, or into an empty field, commits at once when it's a colour. A read-only field still
    // takes a paste, as does a disabled one clicked into, so it's left alone there, as it is when the caller's handler
    // prevented it
    const onPaste = (event) => {
        if (event.defaultPrevented || props.isReadOnly || props.isDisabled)
            return;
        const target = event.currentTarget;
        const text = event.clipboardData.getData('text');
        const isWhole = target.value === '' || (target.selectionStart === 0 && target.selectionEnd === target.value.length);
        if (!isWhole || !parseAnyColor(text))
            return;
        event.preventDefault();
        commit(text);
    };
    // The field's padding at its end, which the opacity takes or, without one, the text
    const end = size === 'small' ? 'pr-(--field-small-padding-x)' : 'pr-(--field-padding-x)';
    const opacity = ['flex-none pl-2 text-right', size === 'small' ? 'w-14' : 'w-16', end];
    // The swatch sits as far in from the edge as from the top, and as far again from the text, as a picker's does
    const inset = size === 'small' ? 'pl-1.5' : 'pl-2';
    return (_jsx(AriaTextField, { ...rest, ref: ref, name: name, form: form, value: draft ?? shown, onChange: (text) => {
            if (!isResetting.current)
                setDraft(text);
        }, validate: validate && (() => validate(color)), onBlur: (event) => {
            commit();
            onBlur?.(event);
        }, onKeyDown: keyDown, className: composeClassName(className, 'flex flex-col gap-1.5'), children: ({ isInvalid, isDisabled }) => {
            const slots = numberField({ variant, size, isInvalid, isDisabled });
            return (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Group, { isDisabled: isDisabled, isInvalid: isInvalid, className: (state) => slots.group({ ...state, className: ['pr-0', inset] }), children: [_jsx(Swatch, { color: css ?? undefined, size: "field" }), _jsx(Input, { ref: input, name: name ? '' : undefined, placeholder: placeholder, spellCheck: false, autoComplete: "off", onPaste: onPaste, className: slots.input({ className: ['truncate', inset, hasOpacity ? 'pr-2' : end] }) }), hasOpacity && _jsx("span", { className: "h-4 shrink-0 border-l border-bleed/8" }), hasOpacity && (_jsx(AriaNumberField, { "aria-label": "Opacity", value: color ? color.getChannelValue('alpha') : Number.NaN, onChange: (next) => {
                                    if (!isResetting.current && color && !Number.isNaN(next))
                                        set(color.withChannelValue('alpha', next), exact);
                                }, minValue: 0, maxValue: 1, step: 0.01, formatOptions: { style: 'percent' }, isDisabled: isDisabled || !color, isReadOnly: props.isReadOnly, className: "contents", children: _jsx(Input, { className: slots.input({ className: opacity }) }) }))] }), name && _jsx("input", { type: "hidden", name: name, form: form, disabled: isDisabled, value: color && css ? (format === 'hex' ? color.toString('hexa') : css) : '' }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
        } }));
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
// Whether an exact colour comes to this Color in sRGB, so it's the same colour and can be shown as it was given. From the
// numbers, not formatOklch's text, as rounding them can land a step away
function sameColor(exact, color) {
    return fromOklch(exact)?.color.toString('hex') === color.toString('hex');
}
function safeParse(value) {
    try {
        return parseColor(value);
    }
    catch {
        return null;
    }
}
