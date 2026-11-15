import { type ReactNode, type Ref, createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { type IconName, type IconVariant, iconNames } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, ComboBox, ListBoxItem, NumberField, Select, Switch, TextField, ToggleButton, ToggleButtonGroup } from '../src/index.js';
import { hex, surface } from './brand.js';
import { codeOf } from './code.js';

// A kit for each component's "Build one" story: the component in a box, a row of controls under it, each named on the
// left, a ground to set it on, and a Random button to shake it up. Solid is the icon set in use while the line icons are
// redrawn

export const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
export const capitalise = (word: string) => word[0].toUpperCase() + word.slice(1);
export const sampleWords = ['New project', 'Continue', 'Send an email', 'Book a call', 'Save', 'Sort by', 'Download', 'Share'];
export const longWords = 'A much longer label than anyone should write, to see where it wraps or truncates';

// The page as it is, or a brand colour with the library's roles re-set for it, as the brand page's grounds are
export const grounds = {
	page: undefined,
	marigold: () => surface(hex('Marigold'), hex('Pine')),
	slate: () => surface(hex('Slate'), hex('Pine')),
	pine: () => surface(hex('Pine'), hex('Chalk')),
} as const;
export type Ground = keyof typeof grounds;

// Which group a control's in, so two controls with one label in different groups are remembered apart
const Group = createContext('');

/**
 * A control's value, remembered for the page it's on, so a reload or a visit later shows what was last picked. Put
 * back before the page paints, and only when it's still a value the control takes. Storage can be unavailable, such
 * as in a private window, and then the control starts as the playground has it
 */
function useRemembered<T extends string | number | boolean>(label: string, value: T, onChange: (value: T) => void, takes: (stored: unknown) => boolean) {
	const group = useContext(Group);
	const [key] = useState(() => `loupe:${location.hash}:${group}:${label}`);
	const isRestored = useRef(false);
	const isFirst = useRef(true);
	// Once, when the control first shows, as the playground's setters are new on each render
	useLayoutEffect(() => {
		if (isRestored.current) return;
		isRestored.current = true;
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
			if (stored !== null && stored !== value && takes(stored)) onChange(stored as T);
		} catch {}
	}, [key, value, onChange, takes]);
	// Whatever sets it, the control or Random, but not the value it starts with, which would write over what's stored
	useEffect(() => {
		if (isFirst.current) {
			isFirst.current = false;
			return;
		}
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}, [key, value]);
}

// What the page's playground builds, as JSX, for the Component section at the top of its page
let built: string | undefined;
const builders = new Set<() => void>();
const setBuilt = (code: string | undefined) => {
	built = code;
	for (const listener of builders) listener();
};
export const useBuilt = () =>
	useSyncExternalStore(
		(listener) => {
			builders.add(listener);
			return () => builders.delete(listener);
		},
		() => built,
	);

export function ControlRow({ label, children, ref }: { label: string; children: ReactNode; ref?: Ref<HTMLDivElement> }) {
	return (
		<div ref={ref} className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-dotted border-bleed/8 py-1.5">
			<span className="text-control font-medium text-ink">{label}</span>
			{children}
		</div>
	);
}

/**
 * A heading over some of a playground's controls, so the component's own props sit apart from its placement, its
 * behaviour, the control that opens it, and the settings that only change the preview
 */
export function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
	return (
		<section aria-label={label} className="flex flex-col pt-8 first:pt-0">
			<h3 className="border-b border-bleed/8 pb-2 text-label font-medium text-muted">{label}</h3>
			<Group value={label}>{children}</Group>
		</section>
	);
}

/**
 * A few options side by side, for a variant, a size or anything else with a handful of values. Where they won't fit on
 * the row, even on a line of their own, as on a phone or with larger text, they fold into a select
 */
export function Choice<T extends string>({
	label,
	options,
	labels,
	value,
	onChange,
	isDisabled,
}: {
	label: string;
	options: readonly T[];
	/** What to call options that capitalising gets wrong, such as JSON or iamsteve */
	labels?: Partial<Record<T, string>>;
	value: T;
	onChange: (value: T) => void;
	isDisabled?: boolean;
}) {
	useRemembered(label, value, onChange, (stored) => options.includes(stored as T));
	const name = (option: T) => labels?.[option] ?? capitalise(option);
	const row = useRef<HTMLDivElement>(null);
	const group = useRef<HTMLDivElement>(null);
	// The group's own width, kept from when it last showed, to know when there's room for it again
	const wanted = useRef(0);
	const [isFolded, setFolded] = useState(false);

	useLayoutEffect(() => {
		const element = row.current;
		if (!element) return;
		const measure = () => {
			if (group.current) wanted.current = group.current.scrollWidth;
			setFolded(wanted.current > element.clientWidth);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		// The group too, as larger text widens it without the row changing
		if (group.current?.firstElementChild) observer.observe(group.current.firstElementChild);
		return () => observer.disconnect();
		// isFolded isn't read, but each switch swaps the group in or out, so the observer starts again on what's there
	}, [isFolded]);

	return (
		<ControlRow ref={row} label={label}>
			{isFolded ? (
				<Select aria-label={label} size="small" selectedKey={value} onSelectionChange={(key) => onChange(key as T)} isDisabled={isDisabled} className="w-40">
					{options.map((option) => (
						<ListBoxItem key={option} id={option}>
							{name(option)}
						</ListBoxItem>
					))}
				</Select>
			) : (
				// Wrapped, as the group takes no ref, and its scrollWidth is the group's whole width even when it overflows
				<div ref={group} className="flex min-w-0">
					<ToggleButtonGroup aria-label={label} size="small" selectedKeys={[value]} onSelectionChange={(keys) => onChange([...keys][0] as T)} isDisabled={isDisabled}>
						{options.map((option) => (
							<ToggleButton key={option} id={option}>
								{name(option)}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</div>
			)}
		</ControlRow>
	);
}

export function TextControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
	useRemembered(label, value, onChange, (stored) => typeof stored === 'string');
	return (
		<ControlRow label={label}>
			<TextField aria-label={label} value={value} onChange={onChange} className="w-56" />
		</ControlRow>
	);
}

export function NumberControl({ label, value, onChange, minValue, maxValue, step }: { label: string; value: number; onChange: (value: number) => void; minValue?: number; maxValue?: number; step?: number }) {
	useRemembered(label, value, onChange, (stored) => typeof stored === 'number' && (minValue == null || stored >= minValue) && (maxValue == null || stored <= maxValue));
	return (
		<ControlRow label={label}>
			<NumberField aria-label={label} value={value} onChange={onChange} minValue={minValue} maxValue={maxValue} step={step} className="w-32" />
		</ControlRow>
	);
}

export function SwitchControl({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
	useRemembered(label, value, onChange, (stored) => typeof stored === 'boolean');
	return (
		<ControlRow label={label}>
			<Switch aria-label={label} isSelected={value} onChange={onChange} />
		</ControlRow>
	);
}

/** Every 16px icon in a set, to type into and filter */
export function IconPicker({ label, value, onChange, variant = 'solid' }: { label: string; value: IconName; onChange: (name: IconName) => void; variant?: IconVariant }) {
	const items = iconNames({ variant, size: 16 }).map((name) => ({ id: name }));
	useRemembered(label, value, onChange, (stored) => items.some((item) => item.id === stored));
	return (
		<ControlRow label={label}>
			<ComboBox aria-label={label} defaultItems={items} selectedKey={value} onSelectionChange={(key) => key && onChange(key as IconName)} className="w-56">
				{(item) => (
					<ListBoxItem id={item.id} textValue={item.id}>
						<Icon name={item.id} variant={variant} />
						{item.id}
					</ListBoxItem>
				)}
			</ComboBox>
		</ControlRow>
	);
}

/** Every 16px solid icon's name, for Random to pick from */
export const solidIcons = () => iconNames({ variant: 'solid', size: 16 });

/**
 * The component in a box on the chosen ground, with Random in its corner when there's something to shake up, then the
 * component's own controls in groups, and Copy code for it as JSX, or as `code` has it where the JSX would show the preview's own values, then the ground and anything else that only changes the preview. `box` adds classes to the box, such as `items-start` for something tall
 */
export function Playground({ children, controls, preview, onRandom, box, code: written }: { children: ReactNode; controls: ReactNode; preview?: ReactNode; onRandom?: () => void; box?: string; code?: string }) {
	const [ground, setGround] = useState<Ground>('page');
	const [isCopied, setCopied] = useState(false);
	const code = written ?? codeOf(children);
	useEffect(() => setBuilt(code), [code]);
	useEffect(() => () => setBuilt(undefined), []);
	useLayoutEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [isCopied]);
	return (
		<div className="flex w-full flex-col gap-4">
			<div style={grounds[ground]?.()} className={['relative flex min-h-36 items-center justify-center rounded-lg bg-panel px-6 py-12', box].filter(Boolean).join(' ')}>
				{children}
				<div className="absolute top-2 right-2 flex gap-1">
					<Button variant="ghost" size="small" onPress={() => void navigator.clipboard.writeText(code).then(() => setCopied(true))}>
						{isCopied ? 'Copied' : 'Copy code'}
					</Button>
					{onRandom && (
						<Button variant="ghost" size="small" onPress={onRandom}>
							Random
						</Button>
					)}
				</div>
			</div>
			<div className="flex flex-col">
				{controls}
				<ControlGroup label="Preview">
					<Choice label="Ground" options={Object.keys(grounds) as Ground[]} value={ground} onChange={setGround} />
					{preview}
				</ControlGroup>
			</div>
		</div>
	);
}
