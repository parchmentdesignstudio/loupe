import { useEffect, useState, useSyncExternalStore } from 'react';
import { parseColor } from 'react-aria-components';
import tokens from '../tokens.css?raw';
import { Button, ColorPicker, ListBoxItem, Select, Slider } from '../src/index.js';

// A theme to try the library in, kept in the browser. It writes over the tokens on :root, so it reaches every page and
// screen, and Copy CSS gives the overrides to keep

type Typeface = 'elza' | 'system' | 'serif' | 'mono';

interface Theme {
	primary: string;
	quiet: string;
	hue: number;
	chroma: number;
	corners: number;
	spacing: number;
	text: number;
	typeface: Typeface;
}

const typefaces: { id: Typeface; name: string; stack?: string }[] = [
	{ id: 'elza', name: 'Elza Round' },
	{ id: 'system', name: 'System', stack: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" },
	{ id: 'serif', name: 'Serif', stack: "ui-serif, 'New York', Georgia, serif" },
	{ id: 'mono', name: 'Mono', stack: 'var(--font-mono)' },
];

// The tokens as tokens.css has them, so each override works from the real value
const oklchOf = (name: string) => {
	const match = new RegExp(`--color-${name}:\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`).exec(tokens);
	if (!match) throw new Error(`No --color-${name} in tokens.css`);
	return match.slice(1).map(Number) as [number, number, number];
};
// The neutrals: pine for ink and the dark layers, linen and cream for the light ones, and umber under them
const neutrals = [...tokens.matchAll(/--color-((?:pine|linen|cream|umber)-\d+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)].map(([, name, l, c, h]) => ({ name, l: +l, c: +c, h: +h }));
const pineHue = oklchOf('pine-26')[2];
const radii = [...tokens.matchAll(/--radius-([\w-]+):\s*([\d.]+)rem/g)].map(([, name, value]) => ({ name, value: +value }));
// Sizes, and the line heights set in rem, as the others are a multiple of their size already
const sizes = [...tokens.matchAll(/--text-([\w-]+):\s*([\d.]+)rem/g)].map(([, name, value]) => ({ name, value: +value }));

const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const linear = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

function hexOf([l, c, h]: [number, number, number]) {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const rgb = [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
	return `#${rgb.map((x) => Math.round(Math.min(1, Math.max(0, gamma(x))) * 255).toString(16).padStart(2, '0')).join('')}`;
}

// OKLCH's lightness, which says whether ink or white reads on a fill
function lightnessOf(hex: string) {
	const color = parseColor(hex).toFormat('rgb');
	const [r, g, b] = (['red', 'green', 'blue'] as const).map((channel) => linear(color.getChannelValue(channel) / 255));
	const l = Math.cbrt(0.4122214708 * r + 0.5363288246 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

const initial: Theme = {
	primary: hexOf(oklchOf('marigold-83')),
	quiet: hexOf(oklchOf('slate-86')),
	hue: Math.round(pineHue),
	chroma: 1,
	corners: 1,
	spacing: 1,
	text: 1,
	typeface: 'elza',
};

const round = (n: number) => +n.toFixed(4);

// Ink on a light fill and white on a dark one, as the 0.6 lightness line between them
const on = (hex: string) => (lightnessOf(hex) > 0.6 ? 'var(--color-pine-26)' : 'var(--color-white)');

/** The overrides as CSS, empty when nothing has changed */
function cssOf(theme: Theme) {
	const lines: string[] = [];
	if (theme.primary !== initial.primary) lines.push(`--color-primary: ${theme.primary};`, `--color-on-primary: ${on(theme.primary)};`);
	if (theme.quiet !== initial.quiet) lines.push(`--color-quiet: ${theme.quiet};`, `--color-on-quiet: ${on(theme.quiet)};`);
	if (theme.hue !== initial.hue || theme.chroma !== 1) {
		const turn = theme.hue - pineHue;
		for (const { name, l, c, h } of neutrals) lines.push(`--color-${name}: oklch(${l} ${round(c * theme.chroma)} ${round((h + turn + 360) % 360)});`);
	}
	if (theme.corners !== 1) for (const { name, value } of radii) lines.push(`--radius-${name}: ${round(value * theme.corners)}rem;`);
	if (theme.spacing !== 1) lines.push(`--spacing: ${round(0.25 * theme.spacing)}rem;`);
	if (theme.text !== 1) for (const { name, value } of sizes) lines.push(`--text-${name}: ${round(value * theme.text)}rem;`);
	const stack = typefaces.find((face) => face.id === theme.typeface)?.stack;
	if (stack) lines.push(`--font-sans: ${stack};`);
	return lines.length ? `:root {\n\t${lines.join('\n\t')}\n}\n` : '';
}

// Kept between visits where the browser lets it, as the panel's other settings are
function load(): Theme {
	try {
		return { ...initial, ...JSON.parse(localStorage.getItem('theme') ?? '{}') };
	} catch {
		return initial;
	}
}

let theme = load();
const listeners = new Set<() => void>();
const sheet = document.createElement('style');
sheet.id = 'loupe-theme';
sheet.textContent = cssOf(theme);
document.head.append(sheet);

function setTheme(next: Theme) {
	theme = next;
	sheet.textContent = cssOf(theme);
	try {
		localStorage.setItem('theme', JSON.stringify(theme));
	} catch {}
	for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

const percent = { style: 'percent' } as const;

/** The theme's controls, in the settings column */
export function ThemeSettings() {
	const current = useSyncExternalStore(subscribe, () => theme);
	const set = (change: Partial<Theme>) => setTheme({ ...current, ...change });
	const css = cssOf(current);
	const [isCopied, setCopied] = useState(false);
	useEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [isCopied]);

	return (
		<section className="flex flex-col gap-4">
			<div className="-my-1 flex items-center justify-between">
				<h2 className="text-label text-muted">Theme</h2>
				<Button variant="ghost" size="small" isDisabled={!css} onPress={() => setTheme(initial)}>
					Reset
				</Button>
			</div>
			<ColorPicker label="Primary" value={current.primary} onChange={(color) => set({ primary: color.toString('hex').toLowerCase() })} />
			<ColorPicker label="Accent" value={current.quiet} onChange={(color) => set({ quiet: color.toString('hex').toLowerCase() })} />
			<Slider label="Neutral hue" minValue={0} maxValue={359} value={current.hue} onChange={(hue) => set({ hue })} formatOptions={{ style: 'unit', unit: 'degree', unitDisplay: 'narrow' }} />
			<Slider label="Neutral chroma" minValue={0} maxValue={3} step={0.05} value={current.chroma} onChange={(chroma) => set({ chroma })} formatOptions={percent} />
			<Slider label="Corners" minValue={0} maxValue={3} step={0.05} value={current.corners} onChange={(corners) => set({ corners })} formatOptions={percent} />
			<Slider label="Spacing" minValue={0.75} maxValue={1.5} step={0.05} value={current.spacing} onChange={(spacing) => set({ spacing })} formatOptions={percent} />
			<Slider label="Text size" minValue={0.85} maxValue={1.3} step={0.05} value={current.text} onChange={(text) => set({ text })} formatOptions={percent} />
			<Select label="Typeface" selectedKey={current.typeface} onSelectionChange={(typeface) => set({ typeface: typeface as Typeface })} items={typefaces}>
				{(face) => <ListBoxItem id={face.id}>{face.name}</ListBoxItem>}
			</Select>
			<Button
				variant="secondary"
				size="small"
				isDisabled={!css}
				onPress={() => {
					void navigator.clipboard.writeText(css).then(() => setCopied(true));
				}}
			>
				{isCopied ? 'Copied' : 'Copy CSS'}
			</Button>
		</section>
	);
}
