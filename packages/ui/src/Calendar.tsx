import { type CalendarDate, DateFormatter } from '@internationalized/date';
import {
	Calendar as AriaCalendar,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	type CalendarProps as AriaCalendarProps,
	type CalendarState,
	type DateValue,
	RangeCalendar as AriaRangeCalendar,
	type RangeCalendarProps as AriaRangeCalendarProps,
	type RangeCalendarState,
	Text,
	useLocale,
} from 'react-aria-components';
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
function MonthHeading({ state, offset }: { state: CalendarState | RangeCalendarState; offset: number }) {
	const { locale } = useLocale();
	const start = state.visibleRange.start.add({ months: offset });
	const formatter = new DateFormatter(locale, { month: 'long', year: 'numeric', calendar: start.calendar.identifier, timeZone: state.timeZone });
	return (
		<span aria-hidden="true" className={heading()}>
			{formatter.format(start.toDate(state.timeZone))}
		</span>
	);
}

function Month({ state, offset, count, isRange }: { state: CalendarState | RangeCalendarState; offset: number; count: number; isRange: boolean }) {
	return (
		<div className={month()}>
			<div className={header()}>
				{offset === 0 ? (
					<Button slot="previous" variant="ghost" size="small" shape="square" className="text-muted">
						<ChevronLeft className="size-4 shrink-0 fill-none stroke-current stroke-[1.5] rtl:rotate-180" />
					</Button>
				) : (
					<span className={spacer()} />
				)}
				<MonthHeading state={state} offset={offset} />
				{offset === count - 1 ? (
					<Button slot="next" variant="ghost" size="small" shape="square" className="text-muted">
						<ChevronRight className="size-4 shrink-0 fill-none stroke-current stroke-[1.5] rtl:rotate-180" />
					</Button>
				) : (
					<span className={spacer()} />
				)}
			</div>
			<CalendarGrid offset={{ months: offset }} className={grid()}>
				<CalendarGridHeader>{(day) => <CalendarHeaderCell className={weekday()}>{day}</CalendarHeaderCell>}</CalendarGridHeader>
				<CalendarGridBody>{(date) => <Day date={date} isRange={isRange} />}</CalendarGridBody>
			</CalendarGrid>
		</div>
	);
}

// Unavailable and disabled days don't answer to the pointer
const dayState = <S extends { isSelected: boolean; isSelectionStart: boolean; isSelectionEnd: boolean; isHovered: boolean; isPressed: boolean; isUnavailable: boolean; isDisabled: boolean }>(state: S, isRange: boolean) => {
	const isInert = state.isUnavailable || state.isDisabled;
	return { ...state, isEnd: isRange ? state.isSelectionStart || state.isSelectionEnd : state.isSelected, isHovered: state.isHovered && !isInert, isPressed: state.isPressed && !isInert };
};

function Day({ date, isRange }: { date: CalendarDate; isRange: boolean }) {
	// The band rounds off at each end of the month too, where the next day is hidden or in the next grid. The ends of
	// each week round off in the cell's own classes
	const isFirst = date.day === 1;
	const isLast = date.day === date.calendar.getDaysInMonth(date);
	return (
		<CalendarCell
			date={date}
			className={(state) =>
				calendarDay({
					...dayState(state, isRange),
					isBand: isRange && state.isSelected,
					roundsStart: isRange && (state.isSelectionStart || isFirst),
					roundsEnd: isRange && (state.isSelectionEnd || isLast),
				}).cell()
			}
		>
			{(state) => <span className={calendarDay(dayState(state, isRange)).mark()}>{state.formattedDate}</span>}
		</CalendarCell>
	);
}

/** Some of each month to show at once, as `{ months: 2 }` */
type VisibleDuration = { months?: number };

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
export function Calendar<T extends DateValue>({ errorMessage, visibleDuration, ...props }: CalendarProps<T>) {
	const count = visibleDuration?.months ?? 1;
	return (
		<AriaCalendar {...props} visibleDuration={{ months: count }} className={composeClassName(props.className, root())}>
			{({ state, isInvalid }) => (
				<>
					<div className={months()}>
						{Array.from({ length: count }, (_, offset) => (
							<Month key={offset} state={state} offset={offset} count={count} isRange={false} />
						))}
					</div>
					{isInvalid && errorMessage && (
						<Text slot="errorMessage" className={error()}>
							{errorMessage}
						</Text>
					)}
				</>
			)}
		</AriaCalendar>
	);
}

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
export function RangeCalendar<T extends DateValue>({ errorMessage, visibleDuration, ...props }: RangeCalendarProps<T>) {
	const count = visibleDuration?.months ?? 1;
	return (
		<AriaRangeCalendar {...props} visibleDuration={{ months: count }} className={composeClassName(props.className, root())}>
			{({ state, isInvalid }) => (
				<>
					<div className={months()}>
						{Array.from({ length: count }, (_, offset) => (
							<Month key={offset} state={state} offset={offset} count={count} isRange />
						))}
					</div>
					{isInvalid && errorMessage && (
						<Text slot="errorMessage" className={error()}>
							{errorMessage}
						</Text>
					)}
				</>
			)}
		</AriaRangeCalendar>
	);
}
