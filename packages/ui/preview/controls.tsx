import { type ReactNode, type Ref, useLayoutEffect, useRef, useState } from 'react';
import { ListBoxItem, NumberField, Select, Slider, Switch, TextField, ToggleButton, ToggleButtonGroup } from '../src/index.js';

// The rows of a playground's controls, each named on the left, under a group's heading. Kept apart from the playground,
// so a view with controls of its own, such as one Claude draws, can use them without what the playground brings in

export const capitalise = (word: string) => word[0].toUpperCase() + word.slice(1);

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
			{children}
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
		// oxlint-disable-next-line react/exhaustive-deps
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
	return (
		<ControlRow label={label}>
			<TextField aria-label={label} value={value} onChange={onChange} className="w-56" />
		</ControlRow>
	);
}

export function NumberControl({ label, value, onChange, minValue, maxValue, step }: { label: string; value: number; onChange: (value: number) => void; minValue?: number; maxValue?: number; step?: number }) {
	return (
		<ControlRow label={label}>
			<NumberField aria-label={label} value={value} onChange={onChange} minValue={minValue} maxValue={maxValue} step={step} className="w-32" />
		</ControlRow>
	);
}

/**
 * A number dragged between limits. With steps, it snaps to the nearest of them, such as Loupe's gaps, which aren't
 * evenly spaced. Scale shows each as something else, such as a gap's step as its pixels, with the unit in its name
 */
export function SliderControl({ label, value, onChange, minValue, maxValue, steps, scale = 1, unit }: { label: string; value: number; onChange: (value: number) => void; minValue: number; maxValue: number; steps?: readonly number[]; scale?: number; unit?: 'px' }) {
	// The nearest step, or where that's the one it's on, the next in the way it moved, so an arrow key always gets there
	const snap = (shown: number) => {
		if (!steps) return shown / scale;
		const nearest = steps.reduce((best, step) => (Math.abs(step * scale - shown) < Math.abs(best * scale - shown) ? step : best));
		if (nearest !== value || shown === value * scale) return nearest;
		const index = steps.indexOf(value);
		return steps[Math.min(steps.length - 1, Math.max(0, index + (shown > value * scale ? 1 : -1)))] ?? nearest;
	};
	const step = steps ? Math.min(...steps.slice(1).map((item, index) => item - steps[index])) * scale : 1;
	return (
		// The unit in the name, as Intl has no pixels to show a slider's value in
		<ControlRow label={unit ? `${label} (${unit})` : label}>
			<Slider
				aria-label={unit ? `${label} in pixels` : label}
				value={value * scale}
				minValue={minValue * scale}
				maxValue={maxValue * scale}
				step={step}
				onChange={(shown) => onChange(snap(shown))}
				className="w-48"
			/>
		</ControlRow>
	);
}

export function SwitchControl({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
	return (
		<ControlRow label={label}>
			<Switch aria-label={label} isSelected={value} onChange={onChange} />
		</ControlRow>
	);
}

