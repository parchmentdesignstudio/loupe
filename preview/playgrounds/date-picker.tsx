import { useState } from 'react';
import { type DateValue, parseDate, toCalendarDateTime } from '@internationalized/date';
import type { DateRange } from 'react-aria-components';
import { DatePicker, DateRangePicker } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, useRemembered } from '../playground.js';
import { InLocale, type LocaleName, limits, locales, now, weekends } from './dates.js';

const kinds = ['single', 'range'] as const;
const granularities = ['day', 'minute'] as const;
const values = ['empty', 'today', 'across months', 'far off'] as const;
const lengths = ['none', 'short', 'long'] as const;
const months = ['auto', '1', '2'] as const;
const widths = { narrow: 'w-40', medium: 'w-64', wide: 'w-full max-w-sm' } as const;
type Value = (typeof values)[number];
type Width = keyof typeof widths;

const labels = { single: 'Launch date', range: 'Away from the studio' };
const descriptions = { single: 'The site goes live at nine that morning', range: 'We’ll pause the project while you’re away' };

const rangeFor = (value: Value): { start: DateValue; end: DateValue } | null => {
	if (value === 'empty') return null;
	const start = value === 'today' ? now() : value === 'across months' ? now().set({ day: 24 }) : parseDate('2087-11-28');
	return { start, end: start.add({ days: value === 'today' ? 4 : 12 }) };
};

export function DatePickerPlayground() {
	const [kind, setKind] = useRemembered('kind', 'single', kinds);
	const [granularity, setGranularity] = useRemembered('granularity', 'day', granularities);
	const [content, setContent] = useRemembered('content', 'empty', values);
	const [range, setRange] = useState(() => rangeFor(content));
	const [locale, setLocale] = useRemembered('locale', 'page', Object.keys(locales) as LocaleName[]);
	const [visible, setVisible] = useRemembered('visible', 'auto', months);
	const [label, setLabel] = useRemembered('label', 'short', lengths);
	const [description, setDescription] = useRemembered('description', 'short', lengths);
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [hasLimits, setLimits] = useRemembered('hasLimits', false);
	const [hasWeekends, setWeekends] = useRemembered('hasWeekends', false);
	const [isInvalid, setInvalid] = useRemembered('isInvalid', false);
	const [isRequired, setRequired] = useRemembered('isRequired', false);
	const [isReadOnly, setReadOnly] = useRemembered('isReadOnly', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
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
		'data-show-focus': isFocused || undefined,
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
						{kind !== 'single' && <Choice label="Months shown" options={months} value={visible} onChange={setVisible} />}
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Kind" options={kinds} value={kind} onChange={setKind} />
						<Choice label="Granularity" options={granularities} value={granularity} onChange={setGranularity} />
						<Choice label="Locale" options={Object.keys(locales) as LocaleName[]} value={locale} onChange={setLocale} />
						<SwitchControl label="A month either side of today" value={hasLimits} onChange={setLimits} />
						<SwitchControl label="Weekends unavailable" value={hasWeekends} onChange={setWeekends} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
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
						visibleDuration={visible === 'auto' ? undefined : { months: Number(visible) }}
					/>
				)}
			</InLocale>
		</Playground>
	);
}
