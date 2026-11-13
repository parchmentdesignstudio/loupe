import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useSyncExternalStore } from 'react';
import { Button, DatePicker as AriaDatePicker, DatePickerStateContext, DateRangePicker as AriaDateRangePicker, Group, } from 'react-aria-components';
import { Calendar, RangeCalendar } from './Calendar.js';
import { DateSegments, TimeField, dateInput } from './DateField.js';
import { Dialog } from './Dialog.js';
import { Description, FieldError, Label } from './Field.js';
import { CalendarGlyph } from './glyphs.js';
import { Popover } from './Popover.js';
import { composeClassName, tv } from './tv.js';
// The field, with its button inside at the end as the combo box has its chevron: 4px in, so 4px corners inside the
// field's 8px. A range's two dates sit at their own widths with an en dash between, and the button keeps to the end
export const datePicker = tv({
    slots: {
        group: 'pr-1',
        input: 'flex min-w-0',
        dash: 'px-1 text-muted',
        button: 'ms-auto flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:text-bleed/24 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12 data-[focus-visible]:bg-bleed/12',
    },
});
const slots = datePicker();
// The time under the calendar, when the picker takes one, bound to the picker's own
function PickerTime({ granularity, hourCycle }) {
    const state = useContext(DatePickerStateContext);
    if (!state || granularity === 'day' || granularity === undefined)
        return null;
    return _jsx(TimeField, { label: "Time", value: state.timeValue, onChange: (value) => value && state.setTimeValue(value), granularity: granularity, hourCycle: hourCycle, className: "mt-3" });
}
/**
 * A date field with a button that opens a calendar. Typing and picking both set it, in the user’s locale. With a
 * granularity of hour or minute it takes a time too, typed in the field or under the calendar
 */
export function DatePicker({ label, description, errorMessage, ...props }) {
    return (_jsxs(AriaDatePicker, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsxs(Group, { className: (state) => dateInput({ ...state, className: slots.group() }), children: [_jsx(DateSegments, { className: slots.input() }), _jsx(Button, { className: slots.button(), children: _jsx(CalendarGlyph, {}) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { placement: "bottom start", children: _jsxs(Dialog, { children: [_jsx(Calendar, {}), _jsx(PickerTime, { granularity: props.granularity, hourCycle: props.hourCycle })] }) })] }));
}
// Two months side by side where there's room for them, or one on a phone
const wide = '(min-width: 40rem)';
const subscribe = (onChange) => {
    const query = matchMedia(wide);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
};
const useWide = () => useSyncExternalStore(subscribe, () => matchMedia(wide).matches, () => false);
/** A start and end date, typed in one field or picked from a calendar that opens below it, two months at a time on wider screens */
export function DateRangePicker({ label, description, errorMessage, visibleMonths, ...props }) {
    const isWide = useWide();
    return (_jsxs(AriaDateRangePicker, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: [label && _jsx(Label, { children: label }), _jsxs(Group, { className: (state) => dateInput({ ...state, className: slots.group() }), children: [_jsx(DateSegments, { slot: "start", className: slots.input() }), _jsx("span", { "aria-hidden": "true", className: slots.dash(), children: "\u2013" }), _jsx(DateSegments, { slot: "end", className: slots.input() }), _jsx(Button, { className: slots.button(), children: _jsx(CalendarGlyph, {}) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { placement: "bottom start", children: _jsx(Dialog, { children: _jsx(RangeCalendar, { visibleDuration: { months: visibleMonths ?? (isWide ? 2 : 1) }, pageBehavior: "single" }) }) })] }));
}
