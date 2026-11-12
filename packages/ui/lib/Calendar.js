import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DateFormatter } from '@internationalized/date';
import { Calendar as AriaCalendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, RangeCalendar as AriaRangeCalendar, Text, useLocale, } from 'react-aria-components';
import { Button } from './Button.js';
import { field } from './Field.js';
import { ChevronLeft, ChevronRight } from './glyphs.js';
import { composeClassName, tv } from './tv.js';
// Months sit side by side, wrapping under each other where there isn't room. Each has its own heading, flanked by the
// previous button on the first and the next on the last, so two months read as one spread
export const calendar = tv({
    slots: {
        root: 'flex w-fit max-w-full flex-col gap-3 text-control text-ink data-[disabled]:opacity-50',
        months: 'flex flex-wrap items-start gap-x-6 gap-y-4',
        month: 'flex flex-col gap-2',
        header: 'flex items-center gap-1',
        heading: 'min-w-0 flex-1 truncate text-center font-medium',
        // The width of a small square button, holding the place of a missing one so the headings line up
        spacer: 'size-7 shrink-0',
        grid: 'border-collapse [&_td]:p-0',
        weekday: 'size-8 pb-1 text-label font-normal text-muted',
    },
});
// A day is a 32px square. In a range, the cell carries the band, rounded where a week, a month or the range begins or
// ends, and the mark inside it the number, the hover and the filled ends, so the band runs unbroken between them. Days
// from the months either side stay hidden, as their dates show in their own month. Today has a dot under its number
export const calendarDay = tv({
    slots: {
        cell: 'size-8 cursor-default text-control tabular-nums outline-0 data-[outside-month]:invisible [td:first-child_&]:rounded-s-md [td:last-child_&]:rounded-e-md',
        mark: 'relative flex size-full items-center justify-center rounded-md outline-offset-2 outline-ink transition-[background-color,color] duration-150 ease-out forced-color-adjust-none motion-reduce:transition-none forced-colors:outline-[Highlight]',
    },
    variants: {
        isBand: {
            true: { cell: 'bg-bleed/8 forced-colors:bg-[Highlight]/40' },
        },
        roundsStart: {
            true: { cell: 'rounded-s-md' },
        },
        roundsEnd: {
            true: { cell: 'rounded-e-md' },
        },
        isEnd: {
            true: { mark: 'bg-ink font-medium text-paper forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]' },
        },
        isToday: {
            true: { mark: 'after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-accent' },
        },
        isHovered: {
            true: '',
        },
        isPressed: {
            true: '',
        },
        isUnavailable: {
            true: { mark: 'text-muted line-through' },
        },
        isDisabled: {
            true: { mark: 'text-muted opacity-50' },
        },
        isInvalid: {
            true: '',
        },
        isFocusVisible: {
            false: { mark: 'outline-0' },
            true: { mark: 'outline-2' },
        },
    },
    compoundVariants: [
        { isEnd: false, isHovered: true, class: { mark: 'bg-bleed/8' } },
        { isEnd: false, isPressed: true, class: { mark: 'bg-bleed/12' } },
        { isEnd: true, isHovered: true, class: { mark: 'bg-ink/88' } },
        { isEnd: true, isToday: true, class: { mark: 'after:bg-paper' } },
        { isEnd: true, isInvalid: true, class: { mark: 'bg-danger' } },
        { isBand: true, isInvalid: true, class: { cell: 'bg-danger/12' } },
    ],
});
const { root, months, month, header, heading, spacer, grid, weekday } = calendar();
const { error } = field();
// The month and year over each grid. React Aria reads the whole visible range out from a hidden heading of its own, so
// these are hidden from screen readers
function MonthHeading({ state, offset }) {
    const { locale } = useLocale();
    const start = state.visibleRange.start.add({ months: offset });
    const formatter = new DateFormatter(locale, { month: 'long', year: 'numeric', calendar: start.calendar.identifier, timeZone: state.timeZone });
    return (_jsx("span", { "aria-hidden": "true", className: heading(), children: formatter.format(start.toDate(state.timeZone)) }));
}
function Month({ state, offset, count, isRange }) {
    return (_jsxs("div", { className: month(), children: [_jsxs("div", { className: header(), children: [offset === 0 ? (_jsx(Button, { slot: "previous", variant: "ghost", size: "small", shape: "square", className: "text-muted", children: _jsx(ChevronLeft, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] rtl:rotate-180" }) })) : (_jsx("span", { className: spacer() })), _jsx(MonthHeading, { state: state, offset: offset }), offset === count - 1 ? (_jsx(Button, { slot: "next", variant: "ghost", size: "small", shape: "square", className: "text-muted", children: _jsx(ChevronRight, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] rtl:rotate-180" }) })) : (_jsx("span", { className: spacer() }))] }), _jsxs(CalendarGrid, { offset: { months: offset }, className: grid(), children: [_jsx(CalendarGridHeader, { children: (day) => _jsx(CalendarHeaderCell, { className: weekday(), children: day }) }), _jsx(CalendarGridBody, { children: (date) => _jsx(Day, { date: date, isRange: isRange }) })] })] }));
}
// Unavailable and disabled days don't answer to the pointer
const dayState = (state, isRange) => {
    const isInert = state.isUnavailable || state.isDisabled;
    return { ...state, isEnd: isRange ? state.isSelectionStart || state.isSelectionEnd : state.isSelected, isHovered: state.isHovered && !isInert, isPressed: state.isPressed && !isInert };
};
function Day({ date, isRange }) {
    // The band rounds off at each end of the month too, where the next day is hidden or in the next grid. The ends of
    // each week round off in the cell's own classes
    const isFirst = date.day === 1;
    const isLast = date.day === date.calendar.getDaysInMonth(date);
    return (_jsx(CalendarCell, { date: date, className: (state) => calendarDay({
            ...dayState(state, isRange),
            isBand: isRange && state.isSelected,
            roundsStart: isRange && (state.isSelectionStart || isFirst),
            roundsEnd: isRange && (state.isSelectionEnd || isLast),
        }).cell(), children: (state) => _jsx("span", { className: calendarDay(dayState(state, isRange)).mark(), children: state.formattedDate }) }));
}
/**
 * A month of days to pick one from, with buttons for the months either side. Today has a dot under it. Dates
 * outside minValue and maxValue are dimmed, and those isDateUnavailable returns true for are struck through
 */
export function Calendar({ errorMessage, visibleDuration, ...props }) {
    const count = visibleDuration?.months ?? 1;
    return (_jsx(AriaCalendar, { ...props, visibleDuration: { months: count }, className: composeClassName(props.className, root()), children: ({ state, isInvalid }) => (_jsxs(_Fragment, { children: [_jsx("div", { className: months(), children: Array.from({ length: count }, (_, offset) => (_jsx(Month, { state: state, offset: offset, count: count, isRange: false }, offset))) }), isInvalid && errorMessage && (_jsx(Text, { slot: "errorMessage", className: error(), children: errorMessage }))] })) }));
}
/**
 * A range of days, picked by choosing its first and last. The days between fill in as a band as you move to the
 * end. A range can't cross a date isDateUnavailable returns true for, unless allowsNonContiguousRanges is set
 */
export function RangeCalendar({ errorMessage, visibleDuration, ...props }) {
    const count = visibleDuration?.months ?? 1;
    return (_jsx(AriaRangeCalendar, { ...props, visibleDuration: { months: count }, className: composeClassName(props.className, root()), children: ({ state, isInvalid }) => (_jsxs(_Fragment, { children: [_jsx("div", { className: months(), children: Array.from({ length: count }, (_, offset) => (_jsx(Month, { state: state, offset: offset, count: count, isRange: true }, offset))) }), isInvalid && errorMessage && (_jsx(Text, { slot: "errorMessage", className: error(), children: errorMessage }))] })) }));
}
