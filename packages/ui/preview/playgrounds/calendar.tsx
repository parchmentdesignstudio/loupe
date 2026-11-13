import { useState } from 'react';
import { type DateValue, parseDate } from '@internationalized/date';
import { Calendar, RangeCalendar } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, pick } from '../playground.js';
import { InLocale, type LocaleName, limits, locales, now, weekends } from './dates.js';

const kinds = ['single', 'range'] as const;
const values = ['empty', 'today', 'across months', 'far off'] as const;
const months = ['1', '2'] as const;
const firstDays = ['locale', 'sun', 'mon', 'sat'] as const;
type Kind = (typeof kinds)[number];
type Value = (typeof values)[number];

const rangeFor = (value: Value): { start: DateValue; end: DateValue } | null => {
	if (value === 'empty') return null;
	const start = value === 'today' ? now() : value === 'across months' ? now().set({ day: 24 }) : parseDate('2087-11-28');
	return { start, end: start.add({ days: value === 'today' ? 4 : 12 }) };
};

export function CalendarPlayground() {
	const [kind, setKind] = useState<Kind>('range');
	const [content, setContent] = useState<Value>('across months');
	const [range, setRange] = useState(() => rangeFor('across months'));
	const [locale, setLocale] = useState<LocaleName>('page');
	const [visible, setVisible] = useState<(typeof months)[number]>('1');
	const [firstDay, setFirstDay] = useState<(typeof firstDays)[number]>('locale');
	const [hasLimits, setLimits] = useState(false);
	const [hasWeekends, setWeekends] = useState(false);
	const [isInvalid, setInvalid] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const fill = (next: Value) => {
		setContent(next);
		setRange(rangeFor(next));
	};
	const shuffle = () => {
		setKind(pick(kinds));
		fill(pick(values));
		setLocale(pick(Object.keys(locales) as LocaleName[]));
		setVisible(pick(months));
		setFirstDay(pick(firstDays));
		setLimits(Math.random() < 0.3);
		setWeekends(Math.random() < 0.4);
		setInvalid(Math.random() < 0.15);
		setReadOnly(Math.random() < 0.1);
		setDisabled(Math.random() < 0.1);
	};
	const inUse = locales[locale] ?? navigator.language;
	const shared = {
		'aria-label': kind === 'single' ? 'Delivery' : 'Away from the studio',
		visibleDuration: { months: Number(visible) },
		firstDayOfWeek: firstDay === 'locale' ? undefined : firstDay,
		minValue: hasLimits ? limits().minValue : undefined,
		maxValue: hasLimits ? limits().maxValue : undefined,
		isDateUnavailable: hasWeekends ? weekends(inUse) : undefined,
		isInvalid: isInvalid || undefined,
		errorMessage: 'The studio is closed then',
		isReadOnly,
		isDisabled,
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Appearance">
						<Choice label="Months shown" options={months} value={visible} onChange={setVisible} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Kind" options={kinds} value={kind} onChange={setKind} />
						<Choice label="Locale" options={Object.keys(locales) as LocaleName[]} value={locale} onChange={setLocale} />
						<Choice label="Week starts" options={firstDays} value={firstDay} onChange={setFirstDay} />
						<SwitchControl label="A month either side of today" value={hasLimits} onChange={setLimits} />
						<SwitchControl label="Weekends unavailable" value={hasWeekends} onChange={setWeekends} />
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Value" options={values} value={content} onChange={fill} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<InLocale name={locale}>
				{kind === 'single' ? (
					<Calendar key={`${locale}-${content}`} {...shared} value={range?.start ?? null} onChange={(date) => setRange({ start: date, end: date })} />
				) : (
					<RangeCalendar key={`${locale}-${content}`} {...shared} value={range} onChange={setRange} />
				)}
			</InLocale>
		</Playground>
	);
}

export function PickADay() {
	return <Calendar aria-label="Delivery" defaultValue={now().add({ days: 3 })} />;
}

export function WeekendsUnavailable() {
	return <Calendar aria-label="Delivery" isDateUnavailable={weekends(navigator.language)} minValue={now()} />;
}

export function TwoMonths() {
	return <RangeCalendar aria-label="Away from the studio" visibleDuration={{ months: 2 }} defaultValue={{ start: now().set({ day: 24 }), end: now().set({ day: 24 }).add({ days: 12 }) }} />;
}
