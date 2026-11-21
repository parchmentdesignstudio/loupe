import { Icon } from '@parchment/icons/react';
import { useState, useSyncExternalStore } from 'react';
import { ThemeSettings } from './theme.js';
import { type Appearance as Scheme, Drawer, Switch, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger, useAppearance, useOnOffLabels } from '../src/index.js';

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

// One section at a time, as an inspector, so the column has room for more of them. Icons, as the names don't fit the
// column side by side, with each name in a tooltip
const panels = [
	{ id: 'appearance', name: 'Appearance', icon: 'circle-lefthalf-filled' },
	{ id: 'accessibility', name: 'Accessibility', icon: 'accessibility' },
	{ id: 'theme', name: 'Theme', icon: 'paintpalette' },
] as const;

type Panel = (typeof panels)[number]['id'];

/** The settings sections behind a row of icons */
export function SettingsPanels() {
	const [panel, setPanel] = useState<Panel>(() => remembered('settings-panel', 'appearance'));

	return (
		<div className="flex flex-col gap-6">
			<ToggleButtonGroup
				aria-label="Settings"
				variant="raised"
				size="small"
				width="fill"
				selectionMode="single"
				disallowEmptySelection
				selectedKeys={[panel]}
				onSelectionChange={(keys) => {
					const next = [...keys][0] as Panel;
					setPanel(next);
					remember('settings-panel', next);
				}}
			>
				{panels.map(({ id, name, icon }) => (
					<TooltipTrigger key={id}>
						<ToggleButton id={id} aria-label={name}>
							<Icon name={icon} />
						</ToggleButton>
						<Tooltip>{name}</Tooltip>
					</TooltipTrigger>
				))}
			</ToggleButtonGroup>
			{panel === 'appearance' && <Appearance />}
			{panel === 'accessibility' && <OnOffLabels />}
			{panel === 'theme' && <ThemeSettings />}
		</div>
	);
}

const wide = '(min-width: 48rem)';
const subscribe = (onChange: () => void) => {
	const list = matchMedia(wide);
	list.addEventListener('change', onChange);
	return () => list.removeEventListener('change', onChange);
};

/**
 * The preview's own settings, in a drawer at the card's end that pushes the page aside, so the theme is tuned against a
 * page that stays in view and undimmed. It sits in the card's scrolling row, so it's pinned under the bar at the card's
 * height. It takes the card's colour, and the card's bleed for its lines and controls, so it's one surface with the page
 * and the hairline between. Below md the phone's own drawer holds them, so there's none here
 */
export function SettingsDrawer({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }) {
	const isWide = useSyncExternalStore(subscribe, () => matchMedia(wide).matches, () => true);
	if (!isWide) return null;
	return (
		<div className="sticky top-12 h-[calc(100dvh-4rem)] shrink-0 self-start [--drawer-push-fill:var(--color-panel)] [--ground-bleed:var(--panel-bleed)]">
			<Drawer mode="push" position="end" isOpen={isOpen} onOpenChange={onOpenChange} aria-label="Preview settings">
				<SettingsPanels />
			</Drawer>
		</div>
	);
}
