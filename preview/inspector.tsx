import { type ReactNode, useId } from 'react';
import details from 'virtual:details';
import { Link, Swatch as LoupeSwatch } from '../src/index.js';
import type { Colour, Place, TokenKind, TypeToken } from './details.mjs';
import { href } from './routes.js';
import { type Entry, library } from './stories.js';

// The page each export is on: the one it leads, as FileTrigger has its own besides DropZone’s, or else the first
const entries = library.flatMap((group) => group.components);
const pages = new Map<string, string>();
for (const entry of entries) if (entry.exports && !pages.has(entry.exports[0])) pages.set(entry.exports[0], href(entry));
for (const entry of entries) for (const name of entry.exports ?? []) if (!pages.has(name)) pages.set(name, href(entry));

// React Aria documents a part on its family’s page, as MenuItem on Menu’s
const families: Record<string, string> = {
	ColorSwatchPickerItem: 'ColorSwatchPicker',
	ColorThumb: 'ColorSlider',
	Dialog: 'Modal',
	DialogTrigger: 'Modal',
	DisclosurePanel: 'Disclosure',
	FieldError: 'forms',
	GridListHeader: 'GridList',
	GridListItem: 'GridList',
	GridListSection: 'GridList',
	Header: 'ListBox',
	Heading: 'Modal',
	Input: 'TextField',
	Keyboard: 'Menu',
	Label: 'forms',
	ListBoxItem: 'ListBox',
	ListBoxSection: 'ListBox',
	MenuItem: 'Menu',
	MenuSection: 'Menu',
	MenuTrigger: 'Menu',
	ModalOverlay: 'Modal',
	NavigationTreeHeader: 'NavigationTree',
	NavigationTreeItem: 'NavigationTree',
	NavigationTreeItemContent: 'NavigationTree',
	NavigationTreeSection: 'NavigationTree',
	OverlayArrow: 'Popover',
	Radio: 'RadioGroup',
	SelectValue: 'Select',
	SelectionIndicator: 'ToggleButtonGroup',
	SheetBackdrop: 'Sheet',
	SheetContent: 'Sheet',
	SheetOverlay: 'Sheet',
	SheetTrigger: 'Sheet',
	SliderFill: 'Slider',
	SliderOutput: 'Slider',
	SliderThumb: 'Slider',
	SliderTrack: 'Slider',
	SubmenuTrigger: 'Menu',
	Tab: 'Tabs',
	TabList: 'Tabs',
	TabPanel: 'Tabs',
	Tag: 'TagGroup',
	TagList: 'TagGroup',
	Text: 'forms',
	TextArea: 'TextField',
	ToastContent: 'Toast',
	ToastQueue: 'Toast',
	ToastRegion: 'Toast',
	TooltipTrigger: 'Tooltip',
};

// Toasts are still UNSTABLE_ in React Aria
const plain = (name: string) => name.replace(/^UNSTABLE_/, '');

export const prefixes: Record<Exclude<TokenKind, 'colours'>, string> = { text: 'text-', fonts: 'font-', shadows: 'shadow-', corners: 'rounded-', animations: 'animate-' };

// The components that use each token, by kind, for the colour and typography pages
const users = new Map<string, string[]>();
for (const detail of Object.values(details.components)) {
	if (detail.kind !== 'component') continue;
	for (const [kind, names] of Object.entries(detail.tokens ?? {})) for (const name of names) users.set(`${kind}:${name}`, [...(users.get(`${kind}:${name}`) ?? []), detail.name]);
}

export function groupBy<T>(items: T[], keyOf: (item: T) => string) {
	const groups = new Map<string, T[]>();
	for (const item of items) groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]);
	return [...groups];
}

// Opens a place in Nova, through scripts/locate.mjs
const open = (place: Place) => void fetch('/__locate', { method: 'POST', body: `${place.file}:${place.line}:${place.column}` }).catch(() => {});

export function Source({ place, label, isStrong, children }: { place: Place; label?: string; isStrong?: boolean; children: ReactNode }) {
	return (
		<Link onPress={() => open(place)} aria-label={label} className={`font-mono no-underline hover:text-ink hover:underline ${isStrong ? 'text-ink' : 'text-muted'}`}>
			{children}
		</Link>
	);
}

export function Aria({ name }: { name: string }) {
	const label = plain(name);
	if (!/^[A-Z]/.test(label)) return <code>{label}</code>;
	return (
		<Link href={`https://react-aria.adobe.com/${families[label] ?? label}`} target="_blank" className="font-mono">
			{label}
		</Link>
	);
}

export function Part({ name }: { name: string }) {
	const page = pages.get(name);
	return page ? (
		<Link href={page} className="font-mono">
			{name}
		</Link>
	) : (
		<code>{name}</code>
	);
}

function Row({ term, children }: { term: ReactNode; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<dt className="text-muted">{term}</dt>
			<dd>{children}</dd>
		</div>
	);
}

export function List({ children }: { children: ReactNode }) {
	return <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono">{children}</ul>;
}

export function Swatch({ colour }: { colour?: string }) {
	return <LoupeSwatch color={colour ?? 'transparent'} size="small" />;
}

// A section’s name, where it’s written, and a line on what it is
export function Header({ name, place, children }: { name: string; place?: Place; children?: ReactNode }) {
	const file = place?.file.slice(place.file.lastIndexOf('/') + 1);
	return (
		<header className="flex flex-col gap-1">
			<div className="flex items-baseline justify-between gap-3 text-label">
				<h3 className="font-mono text-control font-medium">{name}</h3>
				{place && (
					<Source place={place} label={`Open ${file} at line ${place.line}`}>
						{file}:{place.line}
					</Source>
				)}
			</div>
			{children && <p className="text-label text-muted">{children}</p>}
		</header>
	);
}

// What a role is set to, named as the colour page names it: var(--color-pine-26) as pine-26, and a colour mixed with transparent as olive-91 at 24%
function Shade({ value, when }: { value: string; when?: string }) {
	const mixed = /^color-mix\(in \w+, var\(--(?:color-)?([\w-]+)\) ([\d.]+%), transparent\)$/.exec(value);
	return (
		<span className="inline-flex items-center gap-1.5">
			<Swatch colour={value} />
			<span className="font-mono text-ink">{mixed ? `${mixed[1]} at ${mixed[2]}` : (/^var\(--(?:color-)?([\w-]+)\)$/.exec(value)?.[1] ?? value)}</span>
			{when}
		</span>
	);
}

function Role({ name, colour }: { name: string; colour: Colour }) {
	const used = (users.get(`colours:${name}`) ?? []).toSorted((a, b) => a.localeCompare(b));
	return (
		<section className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
			<Header name={name} place={colour.place}>
				{colour.light && (
					<span className="flex flex-wrap gap-x-3 gap-y-1">
						<Shade value={colour.light} when={colour.dark && 'in the light'} />
						{colour.dark && <Shade value={colour.dark} when="in the dark" />}
					</span>
				)}
			</Header>
			<UsedBy used={used} />
		</section>
	);
}

function UsedBy({ used }: { used: string[] }) {
	return (
		<dl className="flex flex-col gap-4 text-label">
			<Row term={used.length ? `Used by ${used.length} ${used.length === 1 ? 'component' : 'components'}` : 'Used by'}>
				{used.length ? (
					<List>
						{used.map((component) => (
							<li key={component}>
								<Part name={component} />
							</li>
						))}
					</List>
				) : (
					<p className="text-muted">No component yet</p>
				)}
			</Row>
		</dl>
	);
}

// 0.9375rem as 15px
const pixels = (value?: string) => (value?.endsWith('rem') ? `${parseFloat(value) * 16}px` : value);

// A line in pixels, and a multiple as what it comes to, as 1.4 of 15px is 21px (1.4×)
function lineOf({ size, lineHeight }: TypeToken) {
	if (!lineHeight || lineHeight.endsWith('rem')) return pixels(lineHeight);
	return `${Math.round(parseFloat(lineHeight) * parseFloat(size ?? '0') * 16)}px (${lineHeight}×)`;
}

const bySize = (a: TypeToken, b: TypeToken) => parseFloat(b.size ?? '0') - parseFloat(a.size ?? '0');

/** A size or a family: what it's set to, where, and the components that use it */
function Type({ token, kind }: { token: TypeToken; kind: 'text' | 'fonts' }) {
	const used = (users.get(`${kind}:${token.name}`) ?? []).toSorted((a, b) => a.localeCompare(b));
	return (
		<section className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
			<Header name={`${kind === 'text' ? 'text' : 'font'}-${token.name}`} place={token.place}>
				{kind === 'text' ? `${pixels(token.size)} on ${lineOf(token)}` : token.value}
			</Header>
			<UsedBy used={used} />
		</section>
	);
}

// Whether a page lists its tokens under its stories
export const hasInspector = (entry?: Entry) => entry?.id === 'colour' || entry?.id === 'typography';

/** Under the colour and typography pages' stories, each token as the code has it, and the components that use it */
export function Inspector({ entry }: { entry: Entry }) {
	const heading = useId();
	const sections =
		entry.id === 'colour'
			? Object.entries(details.colours).map(([name, colour]) => <Role key={name} name={name} colour={colour} />)
			: entry.id === 'typography' && [
					...details.type.sizes.toSorted(bySize).map((token) => <Type key={`text-${token.name}`} token={token} kind="text" />),
					...details.type.families.map((token) => <Type key={`font-${token.name}`} token={token} kind="fonts" />),
				];
	if (!sections) return null;
	return (
		<section id="code" aria-labelledby={heading} className="flex scroll-mt-25 flex-col gap-6 md:scroll-mt-18">
			<h2 id={heading} className="font-medium">
				Code
			</h2>
			<div className="flex flex-col divide-y divide-bleed/8">{sections}</div>
		</section>
	);
}
