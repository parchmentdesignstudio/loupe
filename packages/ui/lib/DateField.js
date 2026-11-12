import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DateField as AriaDateField, DateInput, DateSegment, TimeField as AriaTimeField, } from 'react-aria-components';
import { Description, FieldError, Label, readOnly } from './Field.js';
import { composeClassName, tv } from './tv.js';
// The box a date sits in, sized and lifted like a text field. Each segment pads 2px for its focus fill, so the box pads
// 10px rather than 12px and the digits line up with a text field's text. A date picker's button sits in it too
export const dateInput = tv({
    base: ['flex w-full min-w-0 items-center rounded-lg bg-raised [--bleed:var(--raised-bleed)] px-2.5 py-1.5 text-control text-ink shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]', readOnly],
    variants: {
        isFocusWithin: {
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
// One part of a date, such as the day or the year, which the arrow keys and typing change. Tabular figures keep the
// field from shifting as the numbers change. The literals between them, such as the slashes, stay muted. Each keeps its
// spaces, as a space alone in a flex row would collapse
export const dateSegment = tv({
    base: 'rounded-sm px-0.5 whitespace-pre tabular-nums caret-transparent outline-0 forced-color-adjust-none',
    variants: {
        isLiteral: {
            true: 'px-0 text-muted',
        },
        isPlaceholder: {
            true: 'text-muted',
        },
        isFocused: {
            true: 'bg-highlight text-ink forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
        },
    },
});
/** A date input's segments, for a field or picker to put in its box */
export function DateSegments(props) {
    return (_jsx(DateInput, { ...props, children: (segment) => _jsx(DateSegment, { segment: segment, className: (state) => dateSegment({ ...state, isLiteral: segment.type === 'literal' }) }) }));
}
/**
 * A date typed a part at a time, in the order the user’s locale writes it, so dd/mm/yyyy in the UK. Give it a
 * CalendarDate from @internationalized/date, or a CalendarDateTime with a granularity of minute to take a time too
 */
export function DateField({ label, description, errorMessage, ...props }) {
    return (_jsxs(AriaDateField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx(DateSegments, { className: (state) => dateInput(state) }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
/** A time of day typed a part at a time, on the user’s 12 or 24 hour clock unless hourCycle sets one */
export function TimeField({ label, description, errorMessage, ...props }) {
    return (_jsxs(AriaTimeField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsx(DateSegments, { className: (state) => dateInput(state) }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
}
