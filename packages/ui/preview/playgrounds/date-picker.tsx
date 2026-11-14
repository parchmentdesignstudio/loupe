import { useState } from 'react';
import { type DateValue, parseDate, toCalendarDateTime } from '@internationalized/date';
import type { DateRange } from 'react-aria-components';
import { DatePicker, DateRangePicker } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick } from '../playground.js';
import { InLocale, type LocaleName, limits, locales, now, weekends } from './dates.js';

const kinds = ['single', 'range'] as const;
const granularities = ['day', 'minute'] as const;
const values = ['empty', 'today', 'across months', 'far off'] as const;
const lengths = ['none', 'short', 'long'] as const;
const months = ['auto', '1', '2'] as const;
const widths = { narrow: 'w-40', medium: 'w-64', wide: 'w-full max-w-sm' } as const;
type Kind = (typeof kinds)[number];
type Granularity = (typeof granularities)[number];
type Value = (typeof values)[number];
type Length = (typeof lengths)[number];
type Width = keyof typeof widths;

const labels = { single: 'Launch date', range: 'Away from the studio' };
const descriptions = { single: 'The site goes live at nine that morning', range: 'We’ll pause the project while you’re away' };

const rangeFor = (value: Value): { start: DateValue; end: DateValue } | null => {
	if (value === 'empty') return null;
	const start = value === 'today' ? now() : value === 'across months' ? now().set({ day: 24 }) : parseDate('2087-11-28');
	return { start, end: start.add({ days: value === 'today' ? 4 : 12 }) };
};

export function DatePickerPlayground() {
	const [kind, setKind] = useState<Kind>('single');
	const [granularity, setGranularity] = useState<Granularity>('day');
	const [content, setContent] = useState<Value>('empty');
	const [range, setRange] = useState(() => rangeFor('empty'));
	const [locale, setLocale] = useState<LocaleName>('page');
	const [visible, setVisible] = useState<(typeof months)[number]>('auto');
	const [label, setLabel] = useState<Length>('short');
	const [description, setDescription] = useState<Length>('short');
	const [width, setWidth] = useState<Width>('medium');
	const [hasLimits, setLimits] = useState(false);
	const [hasWeekends, setWeekends] = useState(false);
	const [isInvalid, setInvalid] = useState(false);
	const [isRequired, setRequired] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const fill = (next: Value) => {
		setContent(next);
		setRange(rangeFor(next));
	};
	const shuffle = () => {
		setKind(pick(kinds));
		setGranularity(Math.random() < 0.25 ? 'minute' : 'day');
		fill(pick(values));
		setLocale(pick(Object.keys(locales) as LocaleName[]));
		setVisible(pick(months));
		setLabel(pick(lengths));
		setDescription(pick(lengths));
		setWidth(pick(Object.keys(widths) as Width[]));
		setLimits(Math.random() < 0.3);
		setWeekends(Math.random() < 0.3);
		setInvalid(Math.random() < 0.2);
		setRequired(Math.random() < 0.3);
		setReadOnly(Math.random() < 0.1);
		setDisabled(Math.random() < 0.1);
	};
	const inUse = locales[locale] ?? navigator.language;
	const asValue = (date: DateValue | undefined) => (date && granularity === 'minute' ? toCalendarDateTime(date) : date) ?? null;
	const shared = {
		label: label === 'none' ? undefined : label === 'long' ? longWords : labels[kind],
		'aria-label': label === 'none' ? labels[kind] : undefined,
		description: description === 'none' ? undefined : description === 'long' ? `${longWords}, and a second sentence to push it onto another line` : descriptions[kind],
		errorMessage: isInvalid ? 'The studio is closed then' : undefined,
		granularity,
		minValue: hasLimits ? limits().minValue : undefined,
		maxValue: hasLimits ? limits().maxValue : undefined,
		isDateUnavailable: hasWeekends ? weekends(inUse) : undefined,
		isInvalid: isInvalid || undefined,
		isRequired,
		isReadOnly,
		isDisabled,
		className: widths[width],
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			box="items-start"
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Label" options={lengths} value={label} onChange={setLabel} />
						<Choice label="Description" options={lengths} value={description} onChange={setDescription} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Months shown" options={months} value={visible} onChange={setVisible} isDisabled={kind === 'single'} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Kind" options={kinds} value={kind} onChange={setKind} />
						<Choice label="Granularity" options={granularities} value={granularity} onChange={setGranularity} />
						<Choice label="Locale" options={Object.keys(locales) as LocaleName[]} value={locale} onChange={setLocale} />
						<SwitchControl label="A month either side of today" value={hasLimits} onChange={setLimits} />
						<SwitchControl label="Weekends unavailable" value={hasWeekends} onChange={setWeekends} />
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Value" options={values} value={content} onChange={fill} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<InLocale name={locale}>
				{kind === 'single' ? (
					<DatePicker key={`${granularity}-${locale}`} {...shared} value={asValue(range?.start)} onChange={(date) => setRange(date && { start: date, end: date })} />
				) : (
					<DateRangePicker
						key={`${granularity}-${locale}`}
						{...shared}
						value={range && { start: asValue(range.start)!, end: asValue(range.end)! }}
						onChange={(next: DateRange | null) => setRange(next)}
						visibleMonths={visible === 'auto' ? undefined : Number(visible)}
					/>
				)}
			</InLocale>
		</Playground>
	);
}

export function PickADate() {
	return <DatePicker label="Launch date" description="The site goes live at nine that morning" className="w-56" />;
}

export function PickARange() {
	return <DateRangePicker label="Away from the studio" defaultValue={{ start: now(), end: now().add({ days: 9 }) }} className="w-72" />;
}

export function PickADateAndTime() {
	return <DatePicker label="Call booked for" granularity="minute" defaultValue={toCalendarDateTime(now()).set({ hour: 10, minute: 30 })} isDateUnavailable={weekends(navigator.language)} className="w-64" />;
}
