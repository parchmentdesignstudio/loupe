import { type DateFieldProps as AriaDateFieldProps, type DateInputProps, type DateValue, type TimeFieldProps as AriaTimeFieldProps, type TimeValue } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export declare const dateInput: import("tailwind-variants").TVReturnType<{
    isFocusWithin: {
        false: string;
        true: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, string[], undefined, undefined, undefined>;
export declare const dateSegment: import("tailwind-variants").TVReturnType<{
    isLiteral: {
        true: string;
    };
    isPlaceholder: {
        true: string;
    };
    isFocused: {
        true: string;
    };
}, undefined, "rounded-sm px-0.5 whitespace-pre tabular-nums caret-transparent outline-0 forced-color-adjust-none", undefined, undefined, undefined>;
/** A date input's segments, for a field or picker to put in its box */
export declare function DateSegments(props: Omit<DateInputProps, 'children'>): import("react").JSX.Element;
export interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T>, FieldTextProps {
}
/**
 * A date typed a part at a time, in the order the user’s locale writes it, so dd/mm/yyyy in the UK. Give it a
 * CalendarDate from @internationalized/date, or a CalendarDateTime with a granularity of minute to take a time too
 */
export declare function DateField<T extends DateValue>({ label, description, errorMessage, ...props }: DateFieldProps<T>): import("react").JSX.Element;
export interface TimeFieldProps<T extends TimeValue> extends AriaTimeFieldProps<T>, FieldTextProps {
}
/** A time of day typed a part at a time, on the user’s 12 or 24 hour clock unless hourCycle sets one */
export declare function TimeField<T extends TimeValue>({ label, description, errorMessage, ...props }: TimeFieldProps<T>): import("react").JSX.Element;
