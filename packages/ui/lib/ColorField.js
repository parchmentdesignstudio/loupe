import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorField as AriaColorField, ColorFieldContext, Group, Input, NumberField as AriaNumberField, parseColor, TextField as AriaTextField, useContextProps, useLocale, } from 'react-aria-components';
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
// The opacity's format, which its box is sized to at 100%, the widest it gets
const percent = { style: 'percent' };
function AnyColorField({ ref: givenRef, ...given }) {
    // Inside a ColorPicker, its colour and setter arrive through React Aria's context, as they do for its own field
    const [props, ref] = useContextProps(given, givenRef, ColorFieldContext);
    const { label, description, errorMessage, placeholder, hasOpacity = true, format = 'oklch', variant, size = 'medium', value, defaultValue, onChange, name, form, validate, onBlur, onKeyDown, className, children: _children, channel: _channel, colorSpace: _colorSpace, isWheelDisabled: _isWheelDisabled, slot: _slot, ...rest } = props;
    const input = useRef(null);
    const opacityInput = useRef(null);
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
    // The divider sits 8px from the opacity at its widest, as it does from the colour, and the opacity keeps the field's
    // padding at its end
    const opacity = ['ps-2 text-end', size === 'small' ? 'pe-(--field-small-padding-x)' : 'pe-(--field-padding-x)'];
    const { locale } = useLocale();
    const widest = useMemo(() => new Intl.NumberFormat(locale, percent).format(1), [locale]);
    // The swatch sits as far in from the edge as from the top, and as far again from the colour, as a picker's does
    const inset = size === 'small' ? '[--inset:--spacing(1.5)]' : '[--inset:--spacing(2)]';
    // The colour keeps 8px from the divider or, without an opacity, the field's padding from its end
    const far = hasOpacity ? '[--far:--spacing(2)]' : size === 'small' ? '[--far:var(--field-small-padding-x)]' : '[--far:var(--field-padding-x)]';
    // The colour's written left to right whichever way the field runs, as CSS is. Right to left it's set to the right, by
    // the swatch, so its gaps swap sides. The one where it starts is an indent, not padding, so a long colour scrolled
    // along as it's typed fades out there rather than being cut off short of it. The caret rarely sits in the fade, as a
    // browser brings one that goes out of view back well inside
    const behind = [
        far,
        '[--lead:var(--inset)] [--trail:var(--far)] rtl:[--lead:var(--far)] rtl:[--trail:var(--inset)] rtl:text-right',
        'ps-0 indent-(--lead) pe-(--trail) [mask-image:linear-gradient(to_right,transparent,black_var(--lead))]',
    ];
    return (_jsx(AriaTextField, { ...rest, ref: ref, name: name, form: form, value: draft ?? shown, onChange: (text) => {
            if (!isResetting.current)
                setDraft(text);
        }, validate: validate && (() => validate(color)), onBlur: (event) => {
            commit();
            onBlur?.(event);
        }, onKeyDown: keyDown, className: composeClassName(className, 'flex flex-col gap-1.5'), children: ({ isInvalid, isDisabled }) => {
            const slots = numberField({ variant, size, isInvalid, isDisabled });
            return (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Group, { isDisabled: isDisabled, isInvalid: isInvalid, className: (state) => slots.group({ ...state, className: ['pe-0 ps-(--inset)', inset] }), children: [_jsx(Swatch, { color: css ?? undefined, size: "field" }), _jsx(Input, { ref: input, dir: "ltr", name: name ? '' : undefined, placeholder: placeholder, spellCheck: false, autoComplete: "off", onPaste: onPaste, onKeyDown: (event) => cross(event, opacityInput.current, 'end'), className: slots.input({ className: ['truncate', behind] }) }), hasOpacity && _jsx("span", { className: "h-4 shrink-0 border-s border-bleed/8" }), hasOpacity && (_jsx(AriaNumberField, { "aria-label": "Opacity", value: color ? color.getChannelValue('alpha') : Number.NaN, onChange: (next) => {
                                    if (!isResetting.current && color && !Number.isNaN(next))
                                        set(color.withChannelValue('alpha', next), exact);
                                }, minValue: 0, maxValue: 1, step: 0.01, formatOptions: percent, isDisabled: isDisabled || !color, isReadOnly: props.isReadOnly, className: "contents", children: _jsxs("span", { className: "relative flex-none", children: [_jsx("span", { "aria-hidden": true, className: slots.input({ className: ['invisible block whitespace-pre', opacity] }), children: widest }), _jsx(Input, { ref: opacityInput, onKeyDown: (event) => cross(event, input.current, 'start'), className: slots.input({ className: ['absolute inset-0 size-full', opacity] }) })] }) }))] }), name && _jsx("input", { type: "hidden", name: name, form: form, disabled: isDisabled, value: color && css ? (format === 'hex' ? color.toString('hexa') : css) : '' }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
        } }));
}
// An arrow at the very edge of the colour toward its opacity goes on into it, and back again from the opacity's edge
// toward the colour, as between a date's parts, since the two read as one field. Only from a caret at that edge, so a
// selection collapses first, and not with a modifier, which moves by word or selects, or as a held key repeats, so
// holding it to reach the edge stops there. Nor while an input method composes, which moves through its choices with
// them. On the inputs themselves, after React Aria's own handlers, as a NumberField's are shortcuts
function cross(event, to, toward) {
    const from = event.currentTarget;
    const right = event.key === 'ArrowRight';
    if ((!right && event.key !== 'ArrowLeft') || event.defaultPrevented || event.repeat || event.nativeEvent.isComposing || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey)
        return;
    // Which side that is follows the way the field runs, read from around the input, as the colour itself is always left
    // to right
    const toRight = (toward === 'end') !== (getComputedStyle(from.parentElement ?? from).direction === 'rtl');
    const at = edge(from, right);
    if (right !== toRight || !to || to.disabled || from.selectionStart !== at || from.selectionEnd !== at)
        return;
    event.preventDefault();
    event.stopPropagation();
    to.focus();
    const caret = edge(to, !right);
    to.setSelectionRange(caret, caret);
}
// The caret at an input's right edge, or its left. Right to left, an arrow takes its start as the right edge and its end
// as the left, even when its digits show left to right, as an opacity's do
function edge(input, right) {
    return right === (getComputedStyle(input).direction === 'rtl') ? 0 : input.value.length;
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
