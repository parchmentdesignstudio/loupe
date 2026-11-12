import { type ReactNode, useState } from 'react';
import { type IconName, type IconVariant, iconNames } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, ComboBox, ListBoxItem, NumberField, Switch, TextField, ToggleButton, ToggleButtonGroup } from '../src/index.js';
import { hex, surface } from './brand.js';

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

export function ControlRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-bleed/8 py-1.5">
			<span className="text-control text-muted">{label}</span>
			{children}
		</div>
	);
}

/** A few options side by side, for a variant, a size or anything else with a handful of values */
export function Choice<T extends string>({ label, options, value, onChange, isDisabled }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void; isDisabled?: boolean }) {
	return (
		<ControlRow label={label}>
			<ToggleButtonGroup aria-label={label} size="small" selectedKeys={[value]} onSelectionChange={(keys) => onChange([...keys][0] as T)} isDisabled={isDisabled}>
				{options.map((option) => (
					<ToggleButton key={option} id={option}>
						{capitalise(option)}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
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

export function SwitchControl({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
	return (
		<ControlRow label={label}>
			<Switch aria-label={label} isSelected={value} onChange={onChange} />
		</ControlRow>
	);
}

/** Every 16px icon in a set, to type into and filter */
export function IconPicker({ label, value, onChange, variant = 'solid' }: { label: string; value: IconName; onChange: (name: IconName) => void; variant?: IconVariant }) {
	const items = iconNames({ variant, size: 16 }).map((name) => ({ id: name }));
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
 * ground and the component's own controls. `box` adds classes to the box, such as `items-start` for something tall
 */
export function Playground({ children, controls, onRandom, box }: { children: ReactNode; controls: ReactNode; onRandom?: () => void; box?: string }) {
	const [ground, setGround] = useState<Ground>('page');
	return (
		<div className="flex w-full flex-col gap-4">
			<div style={grounds[ground]?.()} className={['relative flex min-h-36 items-center justify-center rounded-lg bg-panel px-6 py-12', box].filter(Boolean).join(' ')}>
				{children}
				{onRandom && (
					<Button variant="ghost" size="small" onPress={onRandom} className="absolute top-2 right-2">
						Random
					</Button>
				)}
			</div>
			<div className="flex flex-col">
				<Choice label="Ground" options={Object.keys(grounds) as Ground[]} value={ground} onChange={setGround} />
				{controls}
			</div>
		</div>
	);
}
