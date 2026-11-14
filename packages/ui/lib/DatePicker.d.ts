import { type DatePickerProps as AriaDatePickerProps, type DateRangePickerProps as AriaDateRangePickerProps, type DateValue } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export declare const datePicker: import("tailwind-variants").TVReturnType<{}, {
    group: string;
    input: string;
    dash: string;
    button: string;
}, undefined, undefined, undefined, undefined>;
export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T>, FieldTextProps {
}
/**
 * A date field with a button that opens a calendar. Typing and picking both set it, in the user’s locale. With a
 * granularity of hour or minute it takes a time too, typed in the field or under the calendar
 */
export declare function DatePicker<T extends DateValue>({ label, description, errorMessage, ...props }: DatePickerProps<T>): import("react").JSX.Element;
export interface DateRangePickerProps<T extends DateValue> extends AriaDateRangePickerProps<T>, FieldTextProps {
    /** How many months the calendar shows. Two where the window is at least 640px wide, otherwise one */
    visibleMonths?: number;
}
/** A start and end date, typed in one field or picked from a calendar that opens below it, two months at a time on wider screens */
export declare function DateRangePicker<T extends DateValue>({ label, description, errorMessage, visibleMonths, ...props }: DateRangePickerProps<T>): import("react").JSX.Element;
