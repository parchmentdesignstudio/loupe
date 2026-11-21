import { useState, useSyncExternalStore } from 'react';
import tokens from '../styles/theme.css?raw';
import { Button, Slider } from '../src/index.js';

// The colours the shadows are built from, each as strong as it is in the light and in the dark. The shadows themselves
// stay as styles/theme.css layers them, so a slider changes every surface that has that part. Locally, Save writes
// the strengths into styles/theme.css

type Part = 0 | 1 | null;

interface Side {
	/** The role that holds it */
	name: string;
	/** Which side of its light-dark, or none when the role is one colour */
	part: Part;
	/** What it mixes from where it's transparent now, so it can be turned up */
	base: string;
}

interface Knob {
	label: string;
	light?: Side;
	dark?: Side;
}

const white = 'var(--color-white)';
const black = 'var(--color-black)';
const bleed = 'var(--bleed)';
const both = (name: string, light: string, dark: string) => ({ light: { name, part: 0 as Part, base: light }, dark: { name, part: 1 as Part, base: dark } });

const groups: { name: string; knobs: Knob[] }[] = [
	{
		name: 'Light',
		knobs: [
			{ label: 'Top light', ...both('toplight', white, bleed) },
			{ label: 'Glow', ...both('glow', white, white) },
			{ label: 'Shade', ...both('shade', black, black) },
			{ label: 'Sheen', ...both('sheen', white, bleed) },
		],
	},
	{
		name: 'Edge',
		knobs: [{ label: 'Edge', light: { name: 'edge', part: 0, base: bleed }, dark: { name: 'dark-edge', part: null, base: black } }],
	},
	{
		name: 'Depth',
		knobs: [
			{ label: 'Raised', ...both('shadow-raised-color', bleed, black) },
			{ label: 'Floating', ...both('shadow-floating-color', bleed, black) },
			{ label: 'Overlay', ...both('shadow-overlay-color', bleed, black) },
			{ label: 'Deep', ...both('shadow-deep-color', bleed, black) },
			{ label: 'Handle', ...both('shadow-handle-color', bleed, black) },
			{ label: 'Well', ...both('shadow-well-color', bleed, black) },
		],
	},
];

// Splits at the commas between arguments, not those inside a color-mix
function args(text: string) {
	const out: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '(') depth++;
		if (text[i] === ')') depth--;
		if (text[i] === ',' && depth === 0) {
			out.push(text.slice(start, i).trim());
			start = i + 1;
		}
	}
	out.push(text.slice(start).trim());
	return out;
}

const declared = (name: string) => {
	const match = new RegExp(`^\\t+--${name}: (.*);$`, 'm').exec(tokens);
	if (!match) throw new Error(`No --${name} in styles/theme.css`);
	return match[1];
};

const sidesOf = (value: string) => (value.startsWith('light-dark(') ? args(value.slice('light-dark('.length, -1)) : [value]);

// A side's colour and strength, or nothing where it's another role, such as the edge in the dark, which is --dark-edge
function parse(value: string, base: string) {
	if (value === 'transparent') return { base, percent: 0 };
	const match = /^color-mix\(in oklab, (var\(--[\w-]+\)) ([\d.]+)%, transparent\)$/.exec(value);
	return match ? { base: match[1], percent: +match[2] } : undefined;
}

const mix = (base: string, percent: number) => (percent ? `color-mix(in oklab, ${base} ${percent}%, transparent)` : 'transparent');

const key = (side: Side) => `${side.name}:${side.part}`;

// Each side's strength as the file has it, by role and side
const saved: Record<string, { base: string; percent: number }> = {};
for (const { knobs } of groups)
	for (const knob of knobs)
		for (const side of [knob.light, knob.dark]) {
			if (!side) continue;
			const parsed = parse(sidesOf(declared(side.name))[side.part ?? 0], side.base);
			if (parsed) saved[key(side)] = parsed;
		}

let changes: Record<string, number> = {};
const listeners = new Set<() => void>();
// The same sheet again when the module reloads, as it does once Save changes the file
const sheet = (document.getElementById('loupe-shadows') as HTMLStyleElement | null) ?? document.head.appendChild(Object.assign(document.createElement('style'), { id: 'loupe-shadows' }));

// Each changed role in full, as a side can't be set alone
function rolesOf(current: Record<string, number>) {
	const roles: Record<string, string> = {};
	const names = new Set(Object.keys(current).map((side) => side.split(':')[0]));
	for (const name of names) {
		const values = sidesOf(declared(name));
		const sides = values.map((value, part) => {
			const side = `${name}:${values.length === 1 ? null : part}`;
			const was = saved[side];
			return was && side in current ? mix(was.base, current[side]) : value;
		});
		roles[name] = sides.length === 1 ? sides[0] : `light-dark(${sides.join(', ')})`;
	}
	return roles;
}

function setChanges(next: Record<string, number>) {
	changes = next;
	const roles = Object.entries(rolesOf(changes));
	sheet.textContent = roles.length ? `:root {\n${roles.map(([name, value]) => `\t--${name}: ${value};`).join('\n')}\n}\n` : '';
	for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

function Strength({ label, side }: { label: string; side: Side }) {
	const current = useSyncExternalStore(subscribe, () => changes);
	const was = saved[key(side)];
	if (!was) return null;
	return (
		<Slider
			label={label}
			minValue={0}
			maxValue={64}
			value={current[key(side)] ?? was.percent}
			onChange={(percent) => {
				const next = { ...changes, [key(side)]: percent };
				if (percent === was.percent) delete next[key(side)];
				setChanges(next);
			}}
			formatOptions={{ style: 'unit', unit: 'percent' }}
		/>
	);
}

/** The shadows' colours, in the settings column */
export function ShadowSettings() {
	const current = useSyncExternalStore(subscribe, () => changes);
	const isChanged = Object.keys(current).length > 0;
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	const save = async () => {
		setSaving(true);
		setError(undefined);
		try {
			const response = await fetch('/__loupe/tokens', { method: 'POST', body: JSON.stringify(rolesOf(changes)) });
			if (!response.ok) throw new Error(await response.text());
			// The file now has them, and the page takes it in as it reloads its styles
			for (const [side, percent] of Object.entries(changes)) saved[side] = { ...saved[side], percent };
			setChanges({});
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : String(caught));
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className="flex flex-col gap-6">
			<div className="-my-1 flex items-center justify-between">
				<h2 className="text-label text-muted">Shadows</h2>
				<Button variant="ghost" size="small" isDisabled={!isChanged} onPress={() => setChanges({})}>
					Reset
				</Button>
			</div>
			{groups.map((group) => (
				<div key={group.name} className="flex flex-col gap-4">
					<h3 className="text-label text-muted">{group.name}</h3>
					{group.knobs.map((knob) => (
						<div key={knob.label} className="flex flex-col gap-3">
							{knob.light && <Strength label={`${knob.label}, light`} side={knob.light} />}
							{knob.dark && <Strength label={`${knob.label}, dark`} side={knob.dark} />}
						</div>
					))}
				</div>
			))}
			{import.meta.env.DEV && (
				<div className="flex flex-col gap-2">
					<Button variant="secondary" size="small" isDisabled={!isChanged || isSaving} onPress={() => void save()}>
						{isSaving ? 'Saving' : 'Save to theme.css'}
					</Button>
					{error && <p className="text-label text-danger">{error}</p>}
				</div>
			)}
		</section>
	);
}
