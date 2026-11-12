import { CalendarDate, getDayOfWeek, isWeekend, parseDate } from '@internationalized/date';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, DateField, DatePicker, DateRangePicker, RangeCalendar, TimeField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

// In the UK, so dates read day first whatever the machine's locale
const british = (children: ReactNode) => render(<I18nProvider locale="en-GB">{children}</I18nProvider>);

// A day's cell in the calendar, by its number, leaving out the hidden days of the months either side
const day = (grid: HTMLElement, number: number) => within(grid).getAllByRole('button').find((cell) => cell.textContent === String(number) && !cell.hasAttribute('data-outside-month'))!;

describe('DateField', () => {
	it('sets its value as each segment is typed', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<DateField label="Deadline" onChange={onChange} />);
		const [dayPart, month, year] = screen.getAllByRole('spinbutton');
		expect(dayPart.getAttribute('aria-label')).toMatch(/day/i);
		await user.click(dayPart);
		await user.keyboard('25062026');
		expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2026, 6, 25));
		expect(month.textContent).toBe('06');
		expect(year.textContent).toBe('2026');
	});

	it('shows its error to screen readers', () => {
		british(<DateField label="Deadline" isInvalid errorMessage="Pick a weekday" />);
		expect(screen.getByText('Pick a weekday')).toBeTruthy();
	});
});

describe('TimeField', () => {
	it('takes a time on a 24 hour clock', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<TimeField label="Start" onChange={onChange} />);
		await user.click(screen.getAllByRole('spinbutton')[0]);
		await user.keyboard('0930');
		expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ hour: 9, minute: 30 }));
	});
});

describe('DatePicker', () => {
	it('opens a calendar, and choosing a day sets it', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<DatePicker label="Deadline" defaultValue={parseDate('2026-06-03')} onChange={onChange} />);
		await user.click(screen.getByRole('button', { name: /Calendar/ }));
		const dialog = await screen.findByRole('dialog');
		await user.click(day(within(dialog).getByRole('grid'), 15));
		expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2026, 6, 15));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('shows a time field under the calendar when it takes a time', async () => {
		const user = userEvent.setup();
		british(<DatePicker label="Call" granularity="minute" />);
		await user.click(screen.getByRole('button', { name: /Calendar/ }));
		const dialog = await screen.findByRole('dialog');
		expect(within(dialog).getByText('Time')).toBeTruthy();
	});
});

describe('RangeCalendar', () => {
	it('picks a range with its first and last day', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<RangeCalendar aria-label="Trip" defaultFocusedValue={parseDate('2026-06-01')} onChange={onChange} />);
		const grid = screen.getByRole('grid');
		await user.click(day(grid, 10));
		await user.click(day(grid, 14));
		expect(onChange).toHaveBeenLastCalledWith({ start: new CalendarDate(2026, 6, 10), end: new CalendarDate(2026, 6, 14) });
		expect(day(grid, 12).getAttribute('data-selected')).toBe('true');
	});

	it('picks a range from the date range picker', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<DateRangePicker label="Trip" visibleMonths={1} defaultValue={{ start: parseDate('2026-06-01'), end: parseDate('2026-06-02') }} onChange={onChange} />);
		await user.click(screen.getByRole('button', { name: /Calendar/ }));
		const grid = within(await screen.findByRole('dialog')).getByRole('grid');
		await user.click(day(grid, 8));
		await user.click(day(grid, 19));
		expect(onChange).toHaveBeenLastCalledWith({ start: new CalendarDate(2026, 6, 8), end: new CalendarDate(2026, 6, 19) });
	});
});

describe('Calendar', () => {
	it('won’t choose an unavailable day', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<Calendar aria-label="Delivery" defaultFocusedValue={parseDate('2026-06-01')} isDateUnavailable={(date) => isWeekend(date, 'en-GB')} onChange={onChange} />);
		const grid = screen.getByRole('grid');
		// 6 June 2026 is a Saturday
		expect(getDayOfWeek(parseDate('2026-06-06'), 'en-GB')).toBe(5);
		await user.click(day(grid, 6));
		expect(onChange).not.toHaveBeenCalled();
		await user.click(day(grid, 8));
		expect(onChange).toHaveBeenLastCalledWith(new CalendarDate(2026, 6, 8));
	});

	it('won’t choose a day outside its limits', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		british(<Calendar aria-label="Delivery" defaultFocusedValue={parseDate('2026-06-10')} minValue={parseDate('2026-06-05')} onChange={onChange} />);
		await user.click(day(screen.getByRole('grid'), 2));
		expect(onChange).not.toHaveBeenCalled();
	});
});

describe('Dates', () => {
	it('have nothing for axe to flag', async () => {
		const { container } = british(
			<>
				<DateField label="Deadline" description="When the brief is due" isRequired />
				<TimeField label="Start" />
				<DatePicker label="Launch" />
				<DateRangePicker label="Trip" />
				<Calendar aria-label="Delivery" defaultValue={parseDate('2026-06-10')} />
				<RangeCalendar aria-label="Trip" defaultValue={{ start: parseDate('2026-06-10'), end: parseDate('2026-06-14') }} />
			</>,
		);
		await expectAccessible(container);
	});
});
