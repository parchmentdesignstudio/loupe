import { type ReactNode, useId } from 'react';
import details from 'virtual:details';
import { Link } from '../src/index.js';
import type { Colour, Detail, Place, TokenKind, TypeToken, Use } from './details.mjs';
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

const prefixes: Record<Exclude<TokenKind, 'colours'>, string> = { text: 'text-', fonts: 'font-', shadows: 'shadow-', corners: 'rounded-', animations: 'animate-' };

// The components that use each token, by kind, for the colour and typography pages
const users = new Map<string, string[]>();
for (const detail of Object.values(details.components)) {
	if (detail.kind !== 'component') continue;
	for (const [kind, names] of Object.entries(detail.tokens ?? {})) for (const name of names) users.set(`${kind}:${name}`, [...(users.get(`${kind}:${name}`) ?? []), detail.name]);
}

function groupBy<T>(items: T[], keyOf: (item: T) => string) {
	const groups = new Map<string, T[]>();
	for (const item of items) groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]);
	return [...groups];
}

// Opens a place in Nova, through scripts/locate.mjs
const open = (place: Place) => void fetch('/__locate', { method: 'POST', body: `${place.file}:${place.line}:${place.column}` }).catch(() => {});

function Source({ place, label, children }: { place: Place; label?: string; children: ReactNode }) {
	return (
		<Link onPress={() => open(place)} aria-label={label} className="font-mono text-muted no-underline hover:text-ink hover:underline">
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

function Part({ name }: { name: string }) {
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

function List({ children }: { children: ReactNode }) {
	return <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono">{children}</ul>;
}

function Swatch({ colour }: { colour?: string }) {
	return <span className="size-2.5 shrink-0 rounded-full ring-1 ring-bleed/16" style={{ background: colour }} />;
}

// A section’s name, where it’s written, and a line on what it is
function Header({ name, place, children }: { name: string; place?: Place; children?: ReactNode }) {
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

function Tokens({ tokens }: { tokens: NonNullable<Detail['tokens']> }) {
	const { colours = [], ...others } = tokens;
	const named = (Object.keys(prefixes) as (keyof typeof prefixes)[]).flatMap((kind) => (others[kind] ?? []).map((name) => prefixes[kind] + name));
	return (
		<div className="flex flex-col gap-1.5">
			{colours.length > 0 && (
				<List>
					{colours.map((name) => (
						<li key={name} className="flex items-center gap-1.5">
							<Swatch colour={details.colours[name]?.value} />
							{name}
						</li>
					))}
				</List>
			)}
			{named.length > 0 && (
				<List>
					{named.map((name) => (
						<li key={name}>{name}</li>
					))}
				</List>
			)}
		</div>
	);
}

type Placed = Use & { via?: string };

// Where it’s used, and where its style function is outside its file, as ColorField uses TextField’s input()
function usesOf(detail: Detail): Placed[] {
	const own = details.project;
	return [
		...detail.uses,
		...(detail.styles ?? []).flatMap((style) => (details.components[style]?.uses ?? []).filter((use) => use.file !== detail.place.file).map((use) => ({ ...use, via: style }))),
	].toSorted((a, b) => Number(a.project === own) - Number(b.project === own) || a.project.localeCompare(b.project) || a.path.localeCompare(b.path) || a.line - b.line);
}

function Uses({ uses }: { uses: Placed[] }) {
	if (!uses.length) return <p className="text-muted">Nowhere yet</p>;
	return (
		<div className="flex flex-col gap-2">
			{groupBy(uses, (use) => use.project).map(([project, inProject]) => (
				<div key={project} className="flex flex-col gap-1">
					<p className="text-muted">{project}</p>
					<ul className="flex flex-col gap-1">
						{groupBy(inProject, (use) => use.path).map(([path, inFile]) => (
							<li key={path} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
								<Source place={inFile[0]}>
									<span className="text-ink">{path}</span>
								</Source>
								{inFile.map((use) => (
									<Source key={`${use.line}:${use.column}`} place={use} label={`${path}, line ${use.line}`}>
										{use.line}
										{use.via && ` ${use.via}()`}
									</Source>
								))}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}

function Export({ detail }: { detail: Detail }) {
	const uses = usesOf(detail);
	return (
		<section className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
			<Header name={detail.name} place={detail.place}>
				{detail.kind === 'aria' ? (
					<>
						React Aria’s <Aria name={detail.name} />, passed on as it is
					</>
				) : (
					detail.doc
				)}
			</Header>
			<dl className="flex flex-col gap-4 text-label">
				{detail.kind === 'class' && detail.rest?.[0]?.aria && (
					<Row term="Extends">
						React Aria’s <Aria name={detail.rest[0].aria} />
					</Row>
				)}
				{detail.kind !== 'aria' && detail.aria?.length ? (
					<Row term="Built on">
						<List>
							{detail.aria.map((name) => (
								<li key={name}>
									<Aria name={name} />
								</li>
							))}
						</List>
					</Row>
				) : null}
				{detail.parts?.length ? (
					<Row term="Contains">
						<List>
							{detail.parts.map((name) => (
								<li key={name}>
									<Part name={name} />
								</li>
							))}
						</List>
					</Row>
				) : null}
				{detail.styles?.length ? (
					<Row term="Styles">
						<List>
							{detail.styles.map((name) => {
								const styles = details.components[name];
								return <li key={name}>{styles ? <Source place={styles.place}>{name}()</Source> : `${name}()`}</li>;
							})}
						</List>
					</Row>
				) : null}
				{detail.states?.length ? (
					<Row term="States">
						<List>
							{detail.states.map((state) => (
								<li key={state}>{state}</li>
							))}
						</List>
					</Row>
				) : null}
				{detail.tokens && Object.keys(detail.tokens).length > 0 && (
					<Row term="Tokens">
						<Tokens tokens={detail.tokens} />
					</Row>
				)}
				<Row term={uses.length ? `Used in ${uses.length} ${uses.length === 1 ? 'place' : 'places'}` : 'Used in'}>
					<Uses uses={uses} />
				</Row>
			</dl>
		</section>
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

/** The code beside a page: each of its exports as the code has them, or on the colour and typography pages, each token and the components that use it */
export function Inspector({ entry }: { entry: Entry }) {
	const heading = useId();
	const sections = entry.exports
		? entry.exports.map((name) => {
				const detail = details.components[name];
				return detail && <Export key={name} detail={detail} />;
			})
		: entry.id === 'colour'
			? Object.entries(details.colours).map(([name, colour]) => <Role key={name} name={name} colour={colour} />)
			: entry.id === 'typography' && [
					...details.type.sizes.toSorted(bySize).map((token) => <Type key={`text-${token.name}`} token={token} kind="text" />),
					...details.type.families.map((token) => <Type key={`font-${token.name}`} token={token} kind="fonts" />),
				];
	if (!sections) return null;
	return (
		<aside
			id="code"
			aria-labelledby={heading}
			className="scroll-mt-26 border-t border-bleed/8 px-4 py-10 md:px-10 xl:sticky xl:top-12 xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:h-[calc(100dvh-4rem)] xl:overflow-y-auto xl:border-t-0 xl:px-6 xl:pt-12 xl:pb-6"
		>
			{/* Under the stories, it lines up with them */}
			<div className="mx-auto flex max-w-[40rem] flex-col gap-6 xl:max-w-none">
				<h2 id={heading} className="font-medium">
					Code
				</h2>
				<div className="flex flex-col divide-y divide-bleed/8">{sections}</div>
			</div>
		</aside>
	);
}
