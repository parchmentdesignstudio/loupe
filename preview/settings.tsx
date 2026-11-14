import { Icon } from '@parchment/icons/react';
import { ThemeSettings } from './theme.js';
import { type Appearance as Scheme, Switch, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger, useAppearance, useOnOffLabels } from '../src/index.js';

// Kept between visits where the browser lets it, and forgotten quietly where it doesn't
export function remembered<T extends string>(key: string, fallback: T): T {
	try {
		return (localStorage.getItem(key) as T | null) ?? fallback;
	} catch {
		return fallback;
	}
}

export function remember(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {}
}

// Each as an icon alone, so the three fit the column at any text size, with its name in a tooltip
const schemes = [
	{ id: 'light', name: 'Light', icon: 'sun-max' },
	{ id: 'auto', name: 'Auto', icon: 'display' },
	{ id: 'dark', name: 'Dark', icon: 'moon' },
] as const;

/** Light, dark, or as the system has it, for the whole preview */
export function Appearance() {
	const [appearance, setAppearance] = useAppearance();

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-label text-muted">Appearance</h2>
			<ToggleButtonGroup
				aria-label="Appearance"
				selectionMode="single"
				disallowEmptySelection
				selectedKeys={[appearance]}
				onSelectionChange={(keys) => setAppearance([...keys][0] as Scheme)}
			>
				{schemes.map(({ id, name, icon }) => (
					<TooltipTrigger key={id}>
						<ToggleButton id={id} aria-label={name}>
							<Icon name={icon} />
						</ToggleButton>
						<Tooltip>{name}</Tooltip>
					</TooltipTrigger>
				))}
			</ToggleButtonGroup>
		</section>
	);
}

/** As iOS's accessibility setting, a | and an O in every switch. They show anyway where the system asks for more contrast */
export function OnOffLabels() {
	const [isOn, setOn] = useOnOffLabels();

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-label text-muted">Accessibility</h2>
			<Switch isSelected={isOn} onChange={setOn}>
				On/off labels
			</Switch>
		</section>
	);
}

/** The preview's own settings, in the column on the right */
export function Settings() {
	return (
		<aside aria-label="Preview settings" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 overflow-y-auto px-6 py-6 md:flex">
			<Appearance />
			<OnOffLabels />
			<ThemeSettings />
		</aside>
	);
}
