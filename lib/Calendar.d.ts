import { type CalendarProps as AriaCalendarProps, type DateValue, type RangeCalendarProps as AriaRangeCalendarProps } from 'react-aria-components';
export declare const calendar: import("tailwind-variants").TVReturnType<{}, {
    root: string;
    months: string;
    month: string;
    header: string;
    heading: string;
    spacer: string;
    grid: string;
    weekday: string;
}, undefined, undefined, undefined, undefined>;
export declare const calendarDay: import("tailwind-variants").TVReturnType<{
    isBand: {
        true: {
            cell: string;
        };
    };
    roundsStart: {
        true: {
            cell: string;
        };
    };
    roundsEnd: {
        true: {
            cell: string;
        };
    };
    isEnd: {
        true: {
            mark: string;
        };
    };
    isToday: {
        true: {
            mark: string;
        };
    };
    isHovered: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isUnavailable: {
        true: {
            mark: string;
        };
    };
    isDisabled: {
        true: {
            mark: string;
        };
    };
    isInvalid: {
        true: string;
    };
    isFocusVisible: {
        false: {
            mark: string;
        };
        true: {
            mark: string;
        };
    };
}, {
    cell: string;
    mark: string;
}, undefined, undefined, undefined, undefined>;
/** Some of each month to show at once, as `{ months: 2 }` */
type VisibleDuration = {
    months?: number;
};
export interface CalendarProps<T extends DateValue> extends Omit<AriaCalendarProps<T>, 'visibleDuration'> {
    /** How many months show side by side, as `{ months: 2 }`. The arrows move one page of them at a time unless pageBehavior is single */
    visibleDuration?: VisibleDuration;
    /** Shown under the calendar when it's invalid, such as when the value is outside minValue and maxValue */
    errorMessage?: string;
}
/**
 * A month of days to pick one from, with buttons for the months either side. Today has a dot under it. Dates
 * outside minValue and maxValue are dimmed, and those isDateUnavailable returns true for are struck through
 */
export declare function Calendar<T extends DateValue>({ errorMessage, visibleDuration, ...props }: CalendarProps<T>): import("react").JSX.Element;
export interface RangeCalendarProps<T extends DateValue> extends Omit<AriaRangeCalendarProps<T>, 'visibleDuration'> {
    /** How many months show side by side, as `{ months: 2 }`, so a range can cross from one to the next */
    visibleDuration?: VisibleDuration;
    /** Shown under the calendar when it's invalid, such as when the range is outside minValue and maxValue */
    errorMessage?: string;
}
/**
 * A range of days, picked by choosing its first and last. The days between fill in as a band as you move to the
 * end. A range can't cross a date isDateUnavailable returns true for, unless allowsNonContiguousRanges is set
 */
export declare function RangeCalendar<T extends DateValue>({ errorMessage, visibleDuration, ...props }: RangeCalendarProps<T>): import("react").JSX.Element;
export {};
