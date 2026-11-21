import { type ReactNode, useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { type IconName, type IconVariant, iconNames, matchesIcon } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, ComboBox, ListBoxItem } from '../src/index.js';
import { hex, surface } from './brand.js';
import { Choice, ControlGroup, ControlRow } from './controls.js';

// The rows of controls, in a module of their own so a view drawn elsewhere, as Claude's are, can use them without the
// whole playground
export { Choice, ControlGroup, ControlRow, NumberControl, SliderControl, SwitchControl, TextControl, capitalise } from './controls.js';
import { codeOf } from './code.js';

// A kit for each component's "Build one" story: the component in a box, a row of controls under it, each named on the
// left, a ground to set it on, and a Random button to shake it up. Solid is the icon set in use while the line icons are
// redrawn

export const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
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
const groundNames = Object.keys(grounds) as Ground[];

/**
 * State that's remembered for the page it's on, so a reload or a visit later shows what was last set, by a control or
 * by Random. It's read as the playground first renders, whichever controls are showing. A name has to be unique on its
 * page, and Playground has `ground`. `takes`, the options or a test, turns away a stored value the playground no longer
 * takes, such as an option since removed. For strings, numbers and booleans. Storage can be unavailable, such as in a
 * private window, and then it starts as `initial`
 */
export function useRemembered<T>(name: string, initial: T, takes?: readonly T[] | ((stored: T) => boolean)) {
	const [key] = useState(() => `loupe:${location.hash}:${name}`);
	const [value, setValue] = useState(() => {
		try {
			const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
			if (typeof stored === typeof initial && (typeof takes === 'function' ? takes(stored as T) : (takes?.includes(stored as T) ?? true))) return stored as T;
		} catch {}
		return initial;
	});
	// Kept only while it differs from where the playground starts it, so a value left alone follows the playground if that
	// changes
	useEffect(() => {
		try {
			if (value === initial) localStorage.removeItem(key);
			else localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}, [key, value, initial]);
	return [value, setValue] as const;
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

/**
 * Shows the focus ring of what's in it, through data-show-focus, for a component that keeps its props off its own
 * element, as a ColorPicker and a Composer do. It's there either way, so turning it on doesn't remount what's in it
 */
export function ShowFocus({ when, children }: { when: boolean; children: ReactNode }) {
	return (
		<div data-show-focus={when || undefined} className="contents">
			{children}
		</div>
	);
}

/** Every 16px icon in a set, to type into and filter, by its name or what it's for */
export function IconPicker({ label, value, onChange, variant = 'solid' }: { label: string; value: IconName; onChange: (name: IconName) => void; variant?: IconVariant }) {
	const items = iconNames({ variant, size: 16 }).map((name) => ({ id: name }));
	return (
		<ControlRow label={label}>
			<ComboBox aria-label={label} defaultItems={items} defaultFilter={matchesIcon} selectedKey={value} onSelectionChange={(key) => key && onChange(key as IconName)} className="w-56">
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
	const [ground, setGround] = useRemembered('ground', 'page', groundNames);
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
			<div style={grounds[ground]?.()} className={['relative flex min-h-36 items-center justify-center rounded-lg bg-panel px-6 py-12 outline outline-ground', box].filter(Boolean).join(' ')}>
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
					<Choice label="Ground" options={groundNames} value={ground} onChange={setGround} />
					{preview}
				</ControlGroup>
			</div>
		</div>
	);
}
