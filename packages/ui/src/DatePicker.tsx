import { useContext, useSyncExternalStore } from 'react';
import {
	Button,
	DatePicker as AriaDatePicker,
	type DatePickerProps as AriaDatePickerProps,
	DatePickerStateContext,
	DateRangePicker as AriaDateRangePicker,
	type DateRangePickerProps as AriaDateRangePickerProps,
	type DateValue,
	Group,
} from 'react-aria-components';
import { Calendar, RangeCalendar } from './Calendar.js';
import { DateSegments, TimeField, dateInput } from './DateField.js';
import { Dialog } from './Dialog.js';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
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
		button: 'ms-auto flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:opacity-40 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12 data-[focus-visible]:bg-bleed/12',
	},
});

const slots = datePicker();

// The time under the calendar, when the picker takes one, bound to the picker's own
function PickerTime({ granularity, hourCycle }: Pick<AriaDatePickerProps<DateValue>, 'granularity' | 'hourCycle'>) {
	const state = useContext(DatePickerStateContext);
	if (!state || granularity === 'day' || granularity === undefined) return null;
	return <TimeField label="Time" value={state.timeValue} onChange={(value) => value && state.setTimeValue(value)} granularity={granularity} hourCycle={hourCycle} className="mt-3" />;
}

export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T>, FieldTextProps {}

/**
 * A date field with a button that opens a calendar. Typing and picking both set it, in the user’s locale. With a
 * granularity of hour or minute it takes a time too, typed in the field or under the calendar
 */
export function DatePicker<T extends DateValue>({ label, description, errorMessage, ...props }: DatePickerProps<T>) {
	return (
		<AriaDatePicker {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<Group className={(state) => dateInput({ ...state, className: slots.group() })}>
				<DateSegments className={slots.input()} />
				<Button className={slots.button()}>
					<CalendarGlyph />
				</Button>
			</Group>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
			<Popover placement="bottom start">
				<Dialog>
					<Calendar />
					<PickerTime granularity={props.granularity} hourCycle={props.hourCycle} />
				</Dialog>
			</Popover>
		</AriaDatePicker>
	);
}

// Two months side by side where there's room for them, or one on a phone
const wide = '(min-width: 40rem)';
const subscribe = (onChange: () => void) => {
	const query = matchMedia(wide);
	query.addEventListener('change', onChange);
	return () => query.removeEventListener('change', onChange);
};
const useWide = () => useSyncExternalStore(subscribe, () => matchMedia(wide).matches, () => false);

export interface DateRangePickerProps<T extends DateValue> extends AriaDateRangePickerProps<T>, FieldTextProps {
	/** How many months the calendar shows. Two where the window is at least 640px wide, otherwise one */
	visibleMonths?: number;
}

/** A start and end date, typed in one field or picked from a calendar that opens below it, two months at a time on wider screens */
export function DateRangePicker<T extends DateValue>({ label, description, errorMessage, visibleMonths, ...props }: DateRangePickerProps<T>) {
	const isWide = useWide();
	return (
		<AriaDateRangePicker {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<Group className={(state) => dateInput({ ...state, className: slots.group() })}>
				<DateSegments slot="start" className={slots.input()} />
				<span aria-hidden="true" className={slots.dash()}>
					–
				</span>
				<DateSegments slot="end" className={slots.input()} />
				<Button className={slots.button()}>
					<CalendarGlyph />
				</Button>
			</Group>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
			<Popover placement="bottom start">
				<Dialog>
					<RangeCalendar visibleDuration={{ months: visibleMonths ?? (isWide ? 2 : 1) }} pageBehavior="single" />
				</Dialog>
			</Popover>
		</AriaDateRangePicker>
	);
}
