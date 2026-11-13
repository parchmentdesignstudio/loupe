import {
	DateField as AriaDateField,
	type DateFieldProps as AriaDateFieldProps,
	DateInput,
	type DateInputProps,
	DateSegment,
	type DateValue,
	TimeField as AriaTimeField,
	type TimeFieldProps as AriaTimeFieldProps,
	type TimeValue,
} from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label, readOnly } from './Field.js';
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
			true: 'bg-bleed/12 text-muted shadow-none',
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
export function DateSegments(props: Omit<DateInputProps, 'children'>) {
	return (
		<DateInput {...props}>
			{(segment) => <DateSegment segment={segment} className={(state) => dateSegment({ ...state, isLiteral: segment.type === 'literal' })} />}
		</DateInput>
	);
}

export interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T>, FieldTextProps {}

/**
 * A date typed a part at a time, in the order the user’s locale writes it, so dd/mm/yyyy in the UK. Give it a
 * CalendarDate from @internationalized/date, or a CalendarDateTime with a granularity of minute to take a time too
 */
export function DateField<T extends DateValue>({ label, description, errorMessage, ...props }: DateFieldProps<T>) {
	return (
		<AriaDateField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<DateSegments className={(state) => dateInput(state)} />
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaDateField>
	);
}

export interface TimeFieldProps<T extends TimeValue> extends AriaTimeFieldProps<T>, FieldTextProps {}

/** A time of day typed a part at a time, on the user’s 12 or 24 hour clock unless hourCycle sets one */
export function TimeField<T extends TimeValue>({ label, description, errorMessage, ...props }: TimeFieldProps<T>) {
	return (
		<AriaTimeField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<DateSegments className={(state) => dateInput(state)} />
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaTimeField>
	);
}
