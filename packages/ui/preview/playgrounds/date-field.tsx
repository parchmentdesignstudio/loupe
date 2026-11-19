import { useState } from 'react';
import { type DateValue, now as nowIn, getLocalTimeZone, parseDate, parseTime, toCalendarDateTime } from '@internationalized/date';
import type { TimeValue } from 'react-aria-components';
import { DateField, TimeField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, useRemembered } from '../playground.js';
import { InLocale, type LocaleName, limits, locales, now } from './dates.js';

const kinds = ['date', 'date and time', 'time'] as const;
const values = ['empty', 'today', 'past', 'far off'] as const;
const lengths = ['none', 'short', 'long'] as const;
const clocks = ['locale', '12', '24'] as const;
const widths = { narrow: 'w-36', medium: 'w-56', wide: 'w-full max-w-sm' } as const;
type Kind = (typeof kinds)[number];
type Value = (typeof values)[number];
type Width = keyof typeof widths;

const labels = { date: 'Deadline', 'date and time': 'Call booked for', time: 'Opens at' };
const descriptions = { date: 'When the first draft is due', 'date and time': 'In your time zone', time: 'The studio’s hours start here' };

// Past is a date before the limits, so turning them on shows the field invalid
const dateFor = (value: Value, kind: Kind): DateValue | null => {
	if (value === 'empty') return null;
	const day = value === 'today' ? now() : value === 'past' ? parseDate('2019-02-28') : parseDate('2087-11-30');
	return kind === 'date' ? day : toCalendarDateTime(day, value === 'today' ? parseTime('09:30') : parseTime('16:45'));
};
const timeFor = (value: Value): TimeValue | null => (value === 'empty' ? null : value === 'today' ? nowIn(getLocalTimeZone()) : value === 'past' ? parseTime('07:05') : parseTime('23:59'));

export function DateFieldPlayground() {
	const [kind, setKind] = useRemembered('kind', 'date', kinds);
	const [content, setContent] = useRemembered('content', 'today', values);
	const [date, setDate] = useState<DateValue | null>(() => dateFor(content, kind));
	const [time, setTime] = useState<TimeValue | null>(() => timeFor(content));
	const [locale, setLocale] = useRemembered('locale', 'page', Object.keys(locales) as LocaleName[]);
	const [clock, setClock] = useRemembered('clock', 'locale', clocks);
	const [label, setLabel] = useRemembered('label', 'short', lengths);
	const [description, setDescription] = useRemembered('description', 'short', lengths);
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [hasLimits, setLimits] = useRemembered('hasLimits', false);
	const [isInvalid, setInvalid] = useRemembered('isInvalid', false);
	const [isRequired, setRequired] = useRemembered('isRequired', false);
	const [isReadOnly, setReadOnly] = useRemembered('isReadOnly', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const fill = (next: Value, as: Kind = kind) => {
		setContent(next);
		setDate(dateFor(next, as));
		setTime(timeFor(next));
	};
	const changeKind = (next: Kind) => {
		setKind(next);
		fill(content, next);
	};
	const shuffle = () => {
		const nextKind = pick(kinds);
		setKind(nextKind);
		fill(pick(values), nextKind);
		setLocale(pick(Object.keys(locales) as LocaleName[]));
		setClock(pick(clocks));
		setLabel(pick(lengths));
		setDescription(pick(lengths));
		setWidth(pick(Object.keys(widths) as Width[]));
		setLimits(Math.random() < 0.3);
		setInvalid(Math.random() < 0.2);
		setRequired(Math.random() < 0.3);
		setReadOnly(Math.random() < 0.1);
		setDisabled(Math.random() < 0.1);
	};
	const shared = {
		label: label === 'none' ? undefined : label === 'long' ? longWords : labels[kind],
		'aria-label': label === 'none' ? labels[kind] : undefined,
		description: description === 'none' ? undefined : description === 'long' ? `${longWords}, and a second sentence to push it onto another line` : descriptions[kind],
		// Without a message of its own, an out of range value shows React Aria's
		errorMessage: isInvalid ? 'Choose a time the studio is open' : undefined,
		hourCycle: clock === 'locale' ? undefined : clock === '12' ? (12 as const) : (24 as const),
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
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Label" options={lengths} value={label} onChange={setLabel} />
						<Choice label="Description" options={lengths} value={description} onChange={setDescription} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Kind" options={kinds} value={kind} onChange={changeKind} />
						<Choice label="Locale" options={Object.keys(locales) as LocaleName[]} value={locale} onChange={setLocale} />
						{kind !== 'date' && <Choice label="Clock" options={clocks} value={clock} onChange={setClock} />}
						<SwitchControl label="A month either side of today" value={hasLimits} onChange={setLimits} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<Choice label="Value" options={values} value={content} onChange={(next) => fill(next)} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<InLocale name={locale}>
				{kind === 'time' ? (
					<TimeField key={`${kind}-${locale}`} {...shared} value={time} onChange={setTime} />
				) : (
					<DateField
						key={`${kind}-${locale}`}
						{...shared}
						value={date}
						onChange={setDate}
						granularity={kind === 'date' ? 'day' : 'minute'}
						minValue={hasLimits ? limits().minValue : undefined}
						maxValue={hasLimits ? limits().maxValue : undefined}
					/>
				)}
			</InLocale>
		</Playground>
	);
}
