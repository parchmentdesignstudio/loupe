import { useSyncExternalStore } from 'react';

export type Appearance = 'light' | 'auto' | 'dark';

const key = 'scheme';
const listeners = new Set<() => void>();

// Kept between visits where the browser lets it, and forgotten quietly where it doesn't
let current: Appearance = (() => {
	try {
		const value = localStorage.getItem(key);
		return value === 'light' || value === 'dark' ? value : 'auto';
	} catch {
		return 'auto';
	}
})();

// The tokens follow color-scheme, so setting it on the root is all it takes
const apply = () => {
	document.documentElement.style.colorScheme = current === 'auto' ? '' : current;
};

// As soon as the page loads, before any control for it shows
if (typeof document !== 'undefined') apply();

export function setAppearance(appearance: Appearance) {
	current = appearance;
	apply();
	try {
		localStorage.setItem(key, appearance);
	} catch {}
	for (const listener of listeners) listener();
}

/** Light, dark, or auto to follow the system, for the whole page, kept between visits. Every control using it stays in step */
export function useAppearance() {
	const appearance = useSyncExternalStore(
		(listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		() => current,
		() => 'auto' as Appearance,
	);
	return [appearance, setAppearance] as const;
}
