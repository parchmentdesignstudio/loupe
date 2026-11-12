// A scratch page for trying colours with the mark. Nothing here is settled, and none of it is a token: delete this
// file and its entry in stories.tsx to drop it
import type { CSSProperties } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Chip, ChipGroup, Switch, TextField } from '../src/index.js';
import { Lockup, marks } from './logo.js';

// The palette from Sketch's light-final. The brand first, from the idea frame: two grounds, slate and pine, claret, and
// marigold, apricot and olive without ramps. Then the UI's hues, each with a light, base and dark step. Blue and
// violet's bases are lifted from #436cf1 and #7c4fe7 so pine text reaches 4.5:1 on them, as on every other base
const neutrals = [
	{ name: 'Chalk', hex: '#fcfafa' },
	{ name: 'Linen', hex: '#f9f5f6' },
	{ name: 'Slate', hex: '#bdd6d6' },
	{ name: 'Pine', hex: '#0c2920' },
] as const;

const accents = [
	{ name: 'Apricot', hex: '#f68543' },
	{ name: 'Olive', hex: '#516426' },
] as const;

const hues = ['Claret', 'Red', 'Orange', 'Marigold', 'Green', 'Teal', 'Sky', 'Blue', 'Violet', 'Pink'] as const;
type Hue = (typeof hues)[number];

// Light, base and dark. Claret is rose and claret from the idea frame: a red for the brand, softer and a little towards
// pink, away from the danger red. Its light step is rose's hue made pale, and nearly meets red's
const ramp: Record<Hue, [string, string | null, string]> = {
	Red: ['#facfd0', '#f75860', '#720006'],
	Claret: ['#fbd3d2', '#eea3a3', '#64262b'],
	Orange: ['#f9dac7', '#f5803c', '#6d2c05'],
	Marigold: ['#ffe5a6', '#f5c03c', '#603702'],
	Green: ['#d0eca1', '#75b318', '#145c03'],
	Teal: ['#ace7df', '#09bfa6', '#005348'],
	Sky: ['#acd9f7', '#47aef0', '#043d62'],
	Blue: ['#b8c8f9', '#5d84fb', '#12296f'],
	Violet: ['#dbc5fd', '#9872f9', '#33157e'],
	Pink: ['#f5c1df', '#f162af', '#64093a'],
};

type Stepped = Exclude<Hue, 'Claret'>;
type Name = (typeof neutrals)[number]['name'] | (typeof accents)[number]['name'] | 'Claret light' | 'Rose' | 'Claret' | Stepped | `${Stepped} light` | `${Stepped} dark`;

// Each step's name, light, base and dark
const names = (hue: Hue): [Name, Name | null, Name] => (hue === 'Claret' ? ['Claret light', 'Rose', 'Claret'] : [`${hue} light`, hue, `${hue} dark`]);

const colours: { name: Name; hex: string }[] = [
	...neutrals,
	...accents,
	...hues.flatMap((hue) => names(hue).flatMap((name, i) => (name ? [{ name, hex: ramp[hue][i]! }] : []))),
];
export const hex = (name: Name) => colours.find((colour) => colour.name === name)!.hex;

function luminance(value: string) {
	const [r, g, b] = [1, 3, 5].map((at) => {
		const channel = parseInt(value.slice(at, at + 2), 16) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG's contrast ratio. A mark is a graphic, so 3:1 is enough */
function contrast(a: string, b: string) {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

// Text on a swatch: pine or chalk, whichever reads better
const textOn = (background: string) => (contrast(background, hex('Pine')) >= contrast(background, hex('Chalk')) ? hex('Pine') : hex('Chalk'));

// A hex as OKLCH, so a shade can keep a colour's hue and chroma and move only its lightness
function oklch(value: string) {
	const [r, g, b] = [1, 3, 5].map((at) => {
		const channel = parseInt(value.slice(at, at + 2), 16) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
	const [l, m, s] = [
		0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
		0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
		0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
	].map(Math.cbrt);
	const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const bee = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	return { l: lightness, c: Math.hypot(a, bee), h: ((Math.atan2(bee, a) * 180) / Math.PI + 360) % 360 };
}

/** The background a step towards the mark: its own hue and chroma, at a lightness part way to the mark's. A curl in it
    reads as the background's shadow, where 24% of the mark mixes the two into a third colour, as pine on marigold goes khaki */
function tonal(background: string, page: string, amount = 0.32) {
	const ground = oklch(background);
	const mark = oklch(page);
	return `oklch(${(ground.l + (mark.l - ground.l) * amount).toFixed(3)} ${ground.c.toFixed(3)} ${ground.h.toFixed(1)})`;
}

/** The mark at any size, from its 24px drawing. The curl takes a colour of its own, or a tonal shade of the background
    when it's given one, or else the page's colour at 24% */
function Mark({ size, page, background, curl }: { size: number | string; page: string; background?: string; curl?: string }) {
	const { curl: curlPath, page: pagePath } = marks[24];
	const fill = curl ?? (background && tonal(background, page));
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: size, height: size }} className="shrink-0">
			<path d={curlPath} fill={fill ?? page} opacity={fill ? 1 : 0.24} />
			<path d={pagePath} fill={page} />
		</svg>
	);
}

const tile = (background: string): CSSProperties => ({ background });

const Swatch = ({ name, value, className = '' }: { name: string; value: string; className?: string }) => (
	<div style={{ ...tile(value), color: textOn(value) }} className={`flex min-w-0 flex-col justify-end gap-0.5 overflow-hidden rounded-xl p-2 inset-ring inset-ring-[#0c2920]/8 ${className}`}>
		<span className="truncate text-label font-medium">{name}</span>
		<span className="truncate font-mono text-[0.625rem] opacity-80">{value}</span>
	</div>
);

// The brand's columns as Sketch lays them out, light at the top, with a gap where a column has no step
const brandColumns: (Name | null)[][] = [
	['Chalk', 'Linen', null],
	[null, 'Slate', 'Pine'],
	['Claret light', 'Rose', 'Claret'],
	['Marigold', 'Apricot', 'Olive'],
];

const Column = ({ steps, labels }: { steps: (Name | null)[]; labels?: string[] }) => (
	<div className="flex flex-col gap-1">
		{steps.map((name, i) => (name ? <Swatch key={name} name={labels?.[i] ?? name} value={hex(name)} className="aspect-square" /> : <div key={i} className="aspect-square" />))}
	</div>
);

/** The brand's colours, then below a rule the UI's ramps, each a column with light at the top, as they're laid out in Sketch */
export function Palette() {
	const ui = hues.filter((hue) => hue !== 'Claret');
	return (
		<div className="flex w-full flex-col gap-4">
			<div className="flex flex-col gap-2">
				<span className="text-label text-muted">Brand</span>
				<div className="grid grid-cols-4 gap-2 sm:grid-cols-9">
					{brandColumns.map((steps, i) => (
						<Column key={i} steps={steps} />
					))}
				</div>
			</div>
			<div className="flex flex-col gap-2 border-t border-bleed/12 pt-4">
				<span className="text-label text-muted">UI</span>
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
					{ui.map((hue) => (
						<Column key={hue} steps={names(hue)} labels={['Light', hue, 'Dark']} />
					))}
				</div>
			</div>
		</div>
	);
}

// Pairs picked to try, each at least 3:1, mostly a hue's own steps together. The third is the curl's own colour
const icons: [Name, Name, Name?][] = [
	['Pine', 'Chalk'],
	['Chalk', 'Pine'],
	['Marigold', 'Marigold dark'],
	['Orange', 'Orange dark'],
	['Rose', 'Claret'],
	['Claret', 'Rose'],
	['Green dark', 'Green light'],
	['Teal light', 'Teal dark'],
	['Sky', 'Sky dark'],
	['Blue', 'Blue dark'],
	['Violet dark', 'Violet light'],
	['Pink', 'Pink dark'],
	['Slate', 'Pine'],
	['Olive', 'Chalk'],
	['Apricot', 'Pine'],
	['Pine', 'Chalk', 'Apricot'],
	['Linen', 'Pine', 'Marigold'],
	['Marigold', 'Marigold dark', 'Orange'],
];

export function AppIcons() {
	return (
		<ul className="grid w-full grid-cols-4 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))]">
			{icons.map(([background, page, curl]) => (
				<li key={`${background}${page}${curl ?? ''}`} className="flex flex-col items-center gap-2">
					<div style={tile(hex(background))} className="flex aspect-square w-full max-w-22 items-center justify-center rounded-[22.5%] shadow-raised">
						<Mark size="55%" page={hex(page)} background={hex(background)} curl={curl && hex(curl)} />
					</div>
					<span className="text-center text-label text-muted">
						{page} on {background.toLowerCase()}
						{curl && `, ${curl.toLowerCase()} curl`}
					</span>
				</li>
			))}
		</ul>
	);
}

// The pairings inside a ramp, and with the ink, as background and mark: light, base and dark are 0, 1 and 2, and 3 is pine
const within: [number, number, string][] = [
	[0, 2, 'Dark on light'],
	[1, 2, 'Dark on base'],
	[1, 3, 'Pine on base'],
	[2, 0, 'Light on dark'],
	[2, 1, 'Base on dark'],
	[3, 1, 'Base on pine'],
];

/** Each hue's own pairings, with a gap where the pair is under 3:1 */
export function Pairings() {
	const step = (hue: Hue, i: number) => (i === 3 ? hex('Pine') : ramp[hue][i]);
	return (
		<div className="grid w-full grid-cols-[auto_repeat(6,minmax(0,1fr))] items-center gap-1">
			<span />
			{within.map(([, , label]) => (
				<span key={label} className="text-center text-label text-muted">
					{label}
				</span>
			))}
			{hues.map((hue) => [
				<span key={`row-${hue}`} className="pe-2 text-label text-muted">
					{hue}
				</span>,
				...within.map(([background, page, label]) => {
					const [ground, mark] = [step(hue, background), step(hue, page)];
					if (!ground || !mark) return <div key={`${hue}-${label}`} className="aspect-[4/3]" />;
					const ratio = contrast(ground, mark);
					return ratio >= 3 ? (
						<div key={`${hue}-${label}`} title={`${label}, ${ratio.toFixed(1)}:1`} style={tile(ground)} className="flex aspect-[4/3] items-center justify-center rounded-md">
							<Mark size="44%" page={mark} background={ground} />
						</div>
					) : (
						<div key={`${hue}-${label}`} title={`${label}, ${ratio.toFixed(1)}:1`} className="aspect-[4/3] rounded-md border border-dashed border-bleed/12" />
					);
				}),
			])}
		</div>
	);
}

// Cards in the spirit of a set of brand pillars: a solid colour, the mark large, and a line at the foot
const cards: [Name, Name, string][] = [
	['Marigold', 'Marigold dark', 'Design'],
	['Teal light', 'Teal dark', 'Development'],
	['Orange', 'Orange dark', 'Studio'],
	['Claret', 'Rose', 'Design'],
	['Pine', 'Marigold', 'Development'],
	['Blue', 'Blue dark', 'Studio'],
];

export function Cards() {
	return (
		<div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
			{cards.map(([background, page, label]) => (
				<div key={`${background}${page}`} style={{ ...tile(hex(background)), color: hex(page) }} className="flex aspect-[3/4] flex-col rounded-2xl p-4">
					<div className="flex flex-1 items-center justify-center">
						<Mark size="45%" page={hex(page)} background={hex(background)} />
					</div>
					<div className="flex items-baseline justify-between gap-2 text-label font-medium">
						<span>Parchment</span>
						<span className="opacity-72">{label}</span>
					</div>
				</div>
			))}
		</div>
	);
}

// The mark too big for its tile, cropped as a logotype runs off a box
const crops: [Name, Name][] = [
	['Orange', 'Orange dark'],
	['Pine', 'Teal light'],
	['Pink light', 'Pink dark'],
	['Marigold', 'Green dark'],
];

export function Crops() {
	return (
		<div className="grid w-full grid-cols-2 gap-2">
			{crops.map(([background, page]) => (
				<div key={`${background}${page}`} style={tile(hex(background))} className="relative aspect-square overflow-hidden rounded-2xl">
					<div className="absolute -right-[18%] -bottom-[22%] size-[110%]">
						<Mark size="100%" page={hex(page)} background={hex(background)} />
					</div>
				</div>
			))}
		</div>
	);
}

/** The mark beside the name, on each background it reads on, as a header or a business card would carry it */
export function Lockups() {
	const pairs: [Name, Name][] = [
		['Chalk', 'Pine'],
		['Pine', 'Chalk'],
		['Marigold', 'Pine'],
		['Claret', 'Rose'],
		['Teal light', 'Teal dark'],
		['Blue dark', 'Blue light'],
	];
	return (
		<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
			{pairs.map(([background, page]) => (
				<div key={`${background}${page}`} style={{ ...tile(hex(background)), color: hex(page) }} className="flex h-24 items-center gap-2 rounded-2xl px-6 inset-ring inset-ring-bleed/8">
					<Lockup word="parchment" height={28} page={hex(page)} curl={tonal(hex(background), hex(page))} />
				</div>
			))}
		</div>
	);
}

/** Three curls for a few pairs: the general 24%, a tonal shade of the background, and a colour from the palette */
export function Curls() {
	const pairs: [Name, Name, Name][] = [
		['Marigold', 'Pine', 'Orange'],
		['Orange', 'Orange dark', 'Marigold'],
		['Teal light', 'Teal dark', 'Orange'],
		['Claret', 'Rose', 'Orange'],
		['Pine', 'Chalk', 'Marigold'],
		['Blue dark', 'Blue light', 'Pink'],
	];
	const kinds = ['At 24%', 'Tonal', 'In the palette'];
	return (
		<div className="grid w-full grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-2">
			<span />
			{kinds.map((kind) => (
				<span key={kind} className="text-center text-label text-muted">
					{kind}
				</span>
			))}
			{pairs.map(([background, page, accent]) => [
				<span key={`row-${background}`} className="pe-2 text-label text-muted">
					{page} on {background.toLowerCase()}
				</span>,
				...kinds.map((kind, i) => (
					<div key={`${background}-${kind}`} style={tile(hex(background))} className="flex aspect-[4/3] items-center justify-center rounded-xl">
						<Mark size="40%" page={hex(page)} background={i === 1 ? hex(background) : undefined} curl={i === 2 ? hex(accent) : undefined} />
					</div>
				)),
			])}
		</div>
	);
}

/** The library’s roles re-set for a brand colour: ink and its tints become the mark's colour, and the fills a tonal
    shade, so the components take on the colour without changing. Primary and accent keep their own fills */
export function surface(background: string, page: string): CSSProperties {
	const isDark = oklch(background).l < 0.6;
	return {
		background,
		color: page,
		colorScheme: isDark ? 'dark' : 'light',
		'--color-ink': page,
		'--color-muted': `color-mix(in oklab, ${page} 80%, ${background})`,
		'--bleed': page,
		'--edge': `color-mix(in oklab, ${page} 20%, transparent)`,
		'--color-raised': isDark ? tonal(background, page, 0.1) : 'var(--color-white)',
		'--color-surface': tonal(background, page, isDark ? 0.16 : 0.06),
		'--color-paper': background,
		'--color-panel': background,
	} as CSSProperties;
}

const grounds: [Name, Name][] = [
	['Chalk', 'Pine'],
	['Marigold', 'Pine'],
	['Teal light', 'Teal dark'],
	['Rose', 'Claret'],
	['Claret', 'Rose'],
	['Pine', 'Chalk'],
	['Green dark', 'Green light'],
	['Blue dark', 'Blue light'],
	['Slate', 'Pine'],
	['Olive', 'Chalk'],
];

export function OnColour() {
	return (
		<div className="flex w-full flex-col gap-2">
			{grounds.map(([background, page]) => (
				<section key={background} style={surface(hex(background), hex(page))} className="flex flex-col gap-4 rounded-2xl p-5">
					<div className="flex items-center justify-between gap-3">
						<p className="flex items-center gap-1.5 font-medium">
							<Mark size={20} page={hex(page)} background={hex(background)} />
							{page} on {background.toLowerCase()}
						</p>
						<Switch defaultSelected>Updates</Switch>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="primary">Start a project</Button>
						<Button variant="accent">Book a call</Button>
						<Button variant="secondary" start={<Icon name="envelope" />}>
							Email
						</Button>
						<Button variant="outline">See the work</Button>
						<Button variant="ghost">Not now</Button>
					</div>
					<ChipGroup aria-label="Or start with">
						<Chip>A new website</Chip>
						<Chip>Rework my site</Chip>
						<Chip>Not sure yet</Chip>
					</ChipGroup>
					<TextField label="Your name" placeholder="Sam Smith" description="As you’d like Steve to say it" className="max-w-80" />
				</section>
			))}
		</div>
	);
}

// A card: the image is a block of colour with the mark, then a title, a line and a full width secondary button. The
// first name is the card, the second the image, the third the mark on it
const projects: { card: Name; image: Name; mark: Name; title: string; description: string; action: string }[] = [
	{ card: 'Chalk', image: 'Marigold', mark: 'Marigold dark', title: 'Website design', description: 'A site that’s yours to update, designed and built in one go', action: 'See how it works' },
	{ card: 'Chalk', image: 'Teal light', mark: 'Teal dark', title: 'Ongoing support', description: 'Changes, fixes and new pages each month, without a new quote each time', action: 'Find out more' },
	{ card: 'Chalk', image: 'Claret', mark: 'Rose', title: 'Brand identity', description: 'A name, a mark, and the colours and type to carry them', action: 'See the work' },
	{ card: 'Pine', image: 'Marigold', mark: 'Pine', title: 'Website design', description: 'A site that’s yours to update, designed and built in one go', action: 'See how it works' },
	{ card: 'Claret', image: 'Rose', mark: 'Claret', title: 'Brand identity', description: 'A name, a mark, and the colours and type to carry them', action: 'See the work' },
	{ card: 'Marigold', image: 'Pine', mark: 'Marigold', title: 'Ongoing support', description: 'Changes, fixes and new pages each month, without a new quote each time', action: 'Find out more' },
	{ card: 'Teal light', image: 'Orange', mark: 'Orange dark', title: 'Website design', description: 'A site that’s yours to update, designed and built in one go', action: 'See how it works' },
	{ card: 'Pink light', image: 'Pink dark', mark: 'Pink light', title: 'Brand identity', description: 'A name, a mark, and the colours and type to carry them', action: 'See the work' },
	{ card: 'Green dark', image: 'Green light', mark: 'Green dark', title: 'Ongoing support', description: 'Changes, fixes and new pages each month, without a new quote each time', action: 'Find out more' },
];

// Ink on each card colour, for its text and button: the other end of its own ramp, so pine only on chalk
const inkOn: Partial<Record<Name, Name>> = {
	Pine: 'Chalk',
	Marigold: 'Marigold dark',
	'Claret': 'Rose',
	'Teal light': 'Teal dark',
	'Pink light': 'Pink dark',
	'Green dark': 'Green light',
};

export function ProjectCards() {
	return (
		<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
			{projects.map(({ card, image, mark, title, description, action }) => {
				const ink = hex(inkOn[card] ?? 'Pine');
				// A chalk card is a raised layer on the page, so it takes the library's own roles and shadow
				const isPlain = card === 'Chalk';
				return (
					<article
						key={`${card}${image}${title}`}
						style={isPlain ? undefined : surface(hex(card), ink)}
						className={['flex flex-col gap-3 rounded-2xl p-2 pb-3', isPlain ? 'bg-raised shadow-raised [--bleed:var(--raised-bleed)]' : ''].join(' ')}
					>
						<div style={tile(hex(image))} className="flex aspect-[4/3] items-center justify-center rounded-xl">
							<Mark size="32%" page={hex(mark)} background={hex(image)} />
						</div>
						<div className="flex flex-1 flex-col gap-1 px-2">
							<h3 className="font-medium text-ink">{title}</h3>
							<p className="text-pretty text-muted">{description}</p>
						</div>
						<div className="px-1">
							<Button variant="secondary" className="w-full">
								{action}
							</Button>
						</div>
					</article>
				);
			})}
		</div>
	);
}

// Each step's nearest colour in the library today, by distance in OKLab ×100: under 2 looks the same, under 5 is the
// same colour tuned differently
const nearest: Record<Name, string> = {
	Chalk: 'linen-99, 0.2 away',
	Slate: 'teal-88, 3.9 away',
	Apricot: 'orange-72, 3.7 away',
	Olive: 'green-46, 6.7 away',
	Linen: 'linen-97, 0.6 away',
	Pine: 'Is pine-26',
	'Red light': 'orange-89, 1.7 away',
	Red: 'Is red-67',
	'Red dark': 'Is red-35',
	'Claret light': 'red-87, 2.9 away',
	Rose: 'red-81, 3.3 away',
	Claret: 'red-35, 5.7 away',
	'Orange light': 'orange-89, 2.1 away',
	Orange: 'orange-72, 3.3 away',
	'Orange dark': 'yellow-40, 2.6 away',
	'Marigold light': 'yellow-91, 2.1 away',
	Marigold: 'Primary button, 3.2 away',
	'Marigold dark': 'yellow-40, 3.5 away',
	'Green light': 'lime-91, 0.7 away',
	Green: 'green-68, 2.2 away',
	'Green dark': 'green-46, 4.6 away',
	'Teal light': 'teal-88, 0.9 away',
	Teal: 'teal-69, 2.9 away',
	'Teal dark': 'pine-35, 5.8 away',
	'Sky light': 'sky-85, 1.0 away',
	Sky: 'sky-69, 3.4 away',
	'Sky dark': 'sky-37, 2.4 away',
	'Blue light': 'blue-82, 1.9 away',
	Blue: 'Lifted from #436cf1',
	'Blue dark': 'blue-29, 2.7 away',
	'Violet light': 'violet-82, 3.8 away',
	Violet: 'Lifted from #7c4fe7',
	'Violet dark': 'violet-27, 5.3 away',
	'Pink light': 'Is pink-87',
	Pink: 'Is pink-70',
	'Pink dark': 'Is pink-33',
};

const stepNames = ['Light', 'Base', 'Dark'];

function SystemStep({ name, index }: { name: Name; index: number }) {
	const value = hex(name);
	const { l, c, h } = oklch(value);
	const text = textOn(value);
	return (
		<div className="flex flex-col gap-1">
			<div style={{ ...tile(value), color: text }} className="flex h-16 flex-col justify-end rounded-xl p-2 inset-ring inset-ring-[#0c2920]/8">
				<span className="text-label font-medium">
					{stepNames[index]} <span className="font-normal opacity-80">· {contrast(value, text).toFixed(1)}:1</span>
				</span>
				<span className="font-mono text-[0.625rem] opacity-80">
					{value} · {l.toFixed(2)} {c.toFixed(3)} {h.toFixed(0)}
				</span>
			</div>
			<span className="text-label opacity-70">{nearest[name]}</span>
		</div>
	);
}

/** Each hue as a light, base and dark step, on the ground they were picked on, with the contrast of the text on each
    and what each is closest to in the library today */
export function System() {
	const rows: { name: string; steps: (Name | null)[] }[] = [
		{ name: 'Chalk', steps: [null, 'Chalk', null] },
		{ name: 'Linen', steps: [null, 'Linen', null] },
		{ name: 'Slate', steps: [null, 'Slate', null] },
		{ name: 'Pine', steps: [null, 'Pine', null] },
		{ name: 'Apricot', steps: [null, 'Apricot', null] },
		{ name: 'Olive', steps: [null, 'Olive', null] },
		...hues.map((hue) => ({ name: hue, steps: names(hue) })),
	];
	return (
		<div style={tile('#fbfaf9')} className="flex w-full flex-col gap-3 rounded-2xl p-4 text-[#0c2920]">
			<div className="hidden grid-cols-[6rem_repeat(3,minmax(0,1fr))] gap-2 text-label opacity-70 sm:grid">
				<span />
				{stepNames.map((step) => (
					<span key={step}>{step}</span>
				))}
			</div>
			{rows.map(({ name, steps }) => (
				<div key={name} className="grid grid-cols-3 items-start gap-2 sm:grid-cols-[6rem_repeat(3,minmax(0,1fr))]">
					<span className="col-span-3 pt-1 font-medium sm:col-span-1">{name}</span>
					{steps.map((step, i) => (step ? <SystemStep key={step} name={step} index={i} /> : <span key={stepNames[i]} />))}
				</div>
			))}
		</div>
	);
}

// The brand's colours as the button's fill, each set through the --fill that primary and accent read. Accent's
// --rim keeps the fill's hue, so the border follows each colour without leaning orange
const buttonFills: Name[] = ['Marigold', 'Slate', 'Apricot', 'Rose', 'Claret', 'Olive', 'Pine'];
const buttonGrounds: [string, Name | 'Own', Name][] = [
	['On chalk', 'Chalk', 'Pine'],
	['On its own colour', 'Own', 'Pine'],
	['On pine', 'Pine', 'Chalk'],
];

/** Each brand colour as a button, on chalk, on itself, where only its border and shadow lift it, and on pine */
export function BrandButtons() {
	return (
		<div className="grid w-full grid-cols-[auto_repeat(3,minmax(0,1fr))] items-stretch gap-2">
			<span />
			{buttonGrounds.map(([label]) => (
				<span key={label} className="text-label text-muted">
					{label}
				</span>
			))}
			{buttonFills.map((fill) => [
				<span key={`row-${fill}`} className="self-center pe-2 text-label text-muted">
					{fill}
				</span>,
				...buttonGrounds.map(([label, ground, ink]) => {
					const background = ground === 'Own' ? fill : ground;
					return (
						<div key={`${fill}-${label}`} style={surface(hex(background), ground === 'Own' ? textOn(hex(fill)) : hex(ink))} className="flex items-center justify-center rounded-xl px-3 py-5">
							<Button variant="accent" style={{ '--fill': hex(fill), color: textOn(hex(fill)) } as CSSProperties}>
								Start a project
							</Button>
						</div>
					);
				}),
			])}
		</div>
	);
}
