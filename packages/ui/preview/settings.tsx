import { Icon } from '@parchment/icons/react';
import { type Appearance as Scheme, ToggleButton, ToggleButtonGroup, useAppearance } from '../src/index.js';

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
				<ToggleButton id="light">
					<Icon name="sun-max" />
					Light
				</ToggleButton>
				<ToggleButton id="auto">Auto</ToggleButton>
				<ToggleButton id="dark">
					<Icon name="moon" />
					Dark
				</ToggleButton>
			</ToggleButtonGroup>
		</section>
	);
}

/** The preview's own settings, in the column on the right */
export function Settings() {
	return (
		<aside aria-label="Preview settings" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 overflow-y-auto px-6 py-6 md:flex">
			<Appearance />
		</aside>
	);
}
