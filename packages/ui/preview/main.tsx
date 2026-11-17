import { Component, type ReactNode, StrictMode, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@parchment/icons/react';
// Loupe's one version, which every package is released at (pnpm bump)
import manifest from '../../../package.json?raw';
import {
	Breadcrumb,
	Breadcrumbs,
	Button,
	Code,
	Link,
	Navigation,
	NavigationTree,
	NavigationTreeItem,
	NavigationTreeItemContent,
	Sheet,
	SheetTrigger,
	Tooltip,
	TooltipTrigger,
} from '../src/index.js';
import { Contents, ContentsMenu, type Heading } from './contents.js';
import { Inspector, hasInspector } from './inspector.js';
import { Reference, hasReference } from './reference.js';
import { Lockup, ParchmentLogo } from './logo.js';
import { Search, SearchButton } from './search.js';
import { Settings, SettingsPanels, remember, remembered } from './settings.js';
import { type Crumb, forward, href, pageAt } from './routes.js';
import { screenAt } from './screens/index.js';
import { type Entry, areas, blocks, library } from './stories.js';
import { Category, categoryId } from './blocks/card.js';
import { useBuilt } from './playground.js';
import { highlight, useHighlight } from '../src/shiki.js';


const subscribe = (onChange: () => void) => {
	window.addEventListener('hashchange', onChange);
	return () => window.removeEventListener('hashchange', onChange);
};

const useAddress = () => useSyncExternalStore(subscribe, () => window.location.hash.replace(/^#\/?/, ''));

const { version } = JSON.parse(manifest) as { version: string };

// A component page has its code beside it, and so do colour and typography, with their tokens. The other areas of loupe don't

// A group isn't a page of its own, so its key can't be an entry's id, as Navigation is both
const groupKey = (name: string) => `group-${name}`;

const Page = ({ entry }: { entry: Entry }) => (
	<NavigationTreeItem id={entry.id} href={href(entry)} textValue={entry.name}>
		<NavigationTreeItemContent>{entry.name}</NavigationTreeItemContent>
	</NavigationTreeItem>
);

const foundations = library.find((group) => group.name === 'Foundations');
const componentGroups = library.filter((group) => group !== foundations);
// Loupe's own pages, A–Z, with the foundations among them as a folder of their own
const loupePages = [...areas.filter((area) => area.id !== 'blocks'), ...(foundations ? [{ id: groupKey(foundations.name), name: foundations.name }] : [])].toSorted((a, b) =>
	a.name.localeCompare(b.name),
);

// Three titles that fold: Loupe's own pages, the components in their groups and the blocks. Components and Blocks are
// pages too, so their titles link to them, and everything starts open so it's all in view
function Tree({ current }: { current: string }) {
	return (
		<NavigationTree
			hasTitles
			aria-label="Loupe"
			selectedRoute={`#/${current}`}
			defaultExpandedKeys={['loupe', 'components', 'blocks', ...library.map((group) => groupKey(group.name))]}
		>
			<NavigationTreeItem id="loupe" textValue="Loupe">
				<NavigationTreeItemContent icon={<Icon name="books-vertical" />}>Loupe</NavigationTreeItemContent>
				{loupePages.map((page) =>
					page.id === groupKey('Foundations') && foundations ? (
						<NavigationTreeItem key={page.id} id={page.id} textValue={page.name}>
							<NavigationTreeItemContent>{page.name}</NavigationTreeItemContent>
							{foundations.components.map((entry) => (
								<Page key={entry.id} entry={entry} />
							))}
						</NavigationTreeItem>
					) : (
						<NavigationTreeItem key={page.id} id={page.id} href={`#/${page.id}`} textValue={page.name}>
							<NavigationTreeItemContent>{page.name}</NavigationTreeItemContent>
						</NavigationTreeItem>
					),
				)}
			</NavigationTreeItem>
			<NavigationTreeItem id="components" href="#/ui" textValue="Components">
				<NavigationTreeItemContent icon={<Icon name="component" />}>Components</NavigationTreeItemContent>
				{componentGroups.map((group) => (
					<NavigationTreeItem key={group.name} id={groupKey(group.name)} textValue={group.name}>
						<NavigationTreeItemContent>{group.name}</NavigationTreeItemContent>
						{group.components.map((entry) => (
							<Page key={entry.id} entry={entry} />
						))}
					</NavigationTreeItem>
				))}
			</NavigationTreeItem>
			<NavigationTreeItem id="blocks" href="#/blocks" textValue="Blocks">
				<NavigationTreeItemContent icon={<Icon name="batteryblock" />}>Blocks</NavigationTreeItemContent>
				{blocks.map((entry) => (
					<Page key={entry.id} entry={entry} />
				))}
			</NavigationTreeItem>
		</NavigationTree>
	);
}

function Sidebar({ current }: { current: string }) {
	// Navigation has its own button for phones, which the phone bar takes the place of
	return (
		<div className="contents max-md:hidden">
			<Navigation aria-label="Components" className="md:border-r-0">
				{/* As tall as the page's bar and level with it, so the logo lines up with the breadcrumbs */}
				<div className="-mt-4 flex h-12 shrink-0 items-center gap-2.5 px-3">
					<Lockup word="loupe" height={16} />
					<Version />
				</div>
				<Tree current={current} />
			</Navigation>
		</div>
	);
}

// Loupe's version, beside the logo in the sidebar and the phone bar. Before 1.0 it's an alpha: usable, as React Aria
// stands behind it, but not yet at the quality to rely on, which 1.0 will mark
const isAlpha = version.startsWith('0.');

function Version() {
	return (
		<span className="rounded-full bg-bleed/8 px-2 py-0.5 font-mono text-label text-muted">
			v{version}
			{isAlpha && ' alpha'}
		</span>
	);
}

// Three dots, as the icons have no ellipsis yet
function More() {
	return (
		<svg viewBox="0 0 16 16" className="size-4 fill-current" aria-hidden>
			<circle cx="3" cy="8" r="1.5" />
			<circle cx="8" cy="8" r="1.5" />
			<circle cx="13" cy="8" r="1.5" />
		</svg>
	);
}

// On phones, the library's name and version, with search and the components
function PhoneBar({ current, onSearch }: { current: string; onSearch: () => void }) {
	const [isOpen, setOpen] = useState(false);
	// Choosing a page closes the sheet, to show it
	const [shown, setShown] = useState(current);
	if (shown !== current) {
		setShown(current);
		setOpen(false);
	}
	return (
		<header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-ground px-4 py-2 [--bleed:var(--ground-bleed)] md:hidden">
			<div className="flex items-center gap-2.5">
				<Link href="#/" className="flex items-center no-underline">
					<Lockup word="loupe" height={16} />
				</Link>
				<Version />
			</div>
			<div className="-mr-1.5 flex items-center gap-1">
				<SearchButton onPress={onSearch} />
				<SheetTrigger isOpen={isOpen} onOpenChange={setOpen}>
					<Button variant="ghost" shape="full" size="small" aria-label="Components">
						<More />
					</Button>
					<Sheet position="end" aria-label="Components">
						<div className="flex flex-col gap-6">
							<Tree current={current} />
							<div className="flex flex-col gap-6 px-3">
								<SettingsPanels />
							</div>
						</div>
					</Sheet>
				</SheetTrigger>
			</div>
		</header>
	);
}

/** A damped spring from 0 to 1 as a CSS linear() easing. Bounce 0 settles without passing its end, and more passes it further */
function spring(bounce: number, samples = 60) {
	const damping = 1 - bounce;
	const stiffness = 10;
	const ringing = stiffness * Math.sqrt(1 - damping * damping);
	const points = Array.from({ length: samples + 1 }, (_, i) => {
		const t = i / samples;
		if (i === samples) return 1;
		// Critically damped at bounce 0, where there's no ringing to divide by
		if (damping >= 1) return 1 - (1 + stiffness * t) * Math.exp(-stiffness * t);
		return 1 - Math.exp(-damping * stiffness * t) * (Math.cos(ringing * t) + ((damping * stiffness) / ringing) * Math.sin(ringing * t));
	});
	return `linear(${points.map((point) => Number(point.toFixed(4))).join(', ')})`;
}

// sidebar-right split into the window's frame and its main pane, as the icons have no parts yet. The pane runs under the
// frame's left edge so no seam shows, and scales from there, so its right edge is what moves: 8.5 open, 11 closed
const frame = 'M3,2 L13,2 C13.552,2 14,2.448 14,3 L14,13 C14,13.552 13.552,14 13,14 L3,14 C2.448,14 2,13.552 2,13 L2,3 C2,2.448 2.448,2 3,2 Z M3.5,3.5 L3.5,12.5 L12.5,12.5 L12.5,3.5 Z';
const anchor = 3;
const edges = { open: 8.5, closed: 11 };
// Decided in the icon motion prototype: still on hover, a 1.5px lean towards where a press takes it, then a 500ms spring
const lean = 1.5;
const settle = `scale 500ms ${spring(0.3)}`;
const answer = 'scale 150ms cubic-bezier(0.23, 1, 0.32, 1)';

/** The settings toggle's icon. Pressing leans the pane towards where the press takes it, and letting go springs it there */
function SidebarIcon({ isOpen, isPressed }: { isOpen: boolean; isPressed: boolean }) {
	const edge = (isOpen ? edges.open : edges.closed) + (isPressed ? (isOpen ? lean : -lean) : 0);
	return (
		<svg aria-hidden="true" viewBox="0 0 16 16" className="block size-4 fill-current">
			<path d={frame} fillRule="evenodd" />
			<rect x={anchor} y={3.5} width={edges.open - anchor} height={9} className="origin-[3px_8px] [transform-box:view-box] motion-reduce:transition-none!" style={{ scale: `${(edge - anchor) / (edges.open - anchor)} 1`, transition: isPressed ? answer : settle }} />
		</svg>
	);
}

// Where the page sits in the library, with its sections where there's no room for their column, and the search and settings
function Bar({ trail, headings, isOpen, onToggle, onSearch }: { trail: Crumb[]; headings: Heading[]; isOpen: boolean; onToggle: () => void; onSearch: () => void }) {
	const label = isOpen ? 'Hide settings' : 'Show settings';
	return (
		// Sticks below the phone's header, which is as tall as its 28px buttons and its padding
		<div className="sticky top-11 z-10 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-bleed/8 bg-panel px-4 md:top-0 md:px-5">
			<div className="flex min-w-0 flex-1 items-center gap-2">
				{headings.length > 0 && <ContentsMenu headings={headings} />}
				<Breadcrumbs>
					{/* On phones the bar above has loupe's name. A group, such as Actions, has no page, so it isn't a link */}
					{[{ name: 'loupe', href: '#/' }, ...trail].map((crumb, index) => (
						<Breadcrumb key={`${index}${crumb.name}`} href={crumb.href} className="first:max-md:hidden">
							{crumb.name}
						</Breadcrumb>
					))}
				</Breadcrumbs>
			</div>
			<div className="-mr-1.5 flex items-center gap-1 max-md:hidden">
				<TooltipTrigger>
					<SearchButton onPress={onSearch} />
					<Tooltip>Search ⌘K</Tooltip>
				</TooltipTrigger>
				<TooltipTrigger>
					<Button variant="ghost" shape="full" size="small" aria-label={label} aria-expanded={isOpen} onPress={onToggle}>
						{({ isPressed }) => <SidebarIcon isOpen={isOpen} isPressed={isPressed} />}
					</Button>
					<Tooltip>{label}</Tooltip>
				</TooltipTrigger>
			</div>
		</div>
	);
}

// A story that throws shows its error in its own box, rather than blanking the whole page
class StoryBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
	state: { error?: Error } = {};
	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	render() {
		if (!this.state.error) return this.props.children;
		return (
			<div className="flex w-full flex-col items-start gap-3 rounded-lg bg-danger/8 p-4">
				<p className="text-control text-danger">{this.state.error.message}</p>
				<Button variant="secondary" size="small" onPress={() => this.setState({ error: undefined })}>
					Try again
				</Button>
			</div>
		);
	}
}

function Stories({ entry, heading: Heading }: { entry: Entry; heading: 'h2' | 'h3' }) {
	if (entry.empty) return <div className="rounded-lg border border-bleed/8">{entry.empty()}</div>;
	return entry.stories.map((story, index) => (
		<section key={story.name} id={`${entry.id}-${index}`} className="flex scroll-mt-25 md:scroll-mt-18 flex-col gap-3">
			<Heading className="font-sans text-label text-muted">{story.name}</Heading>
			{/* A ground reaches past the column by its padding, so what's on it lines up with the text */}
			<div className={['flex flex-wrap items-center gap-2', story.ground ? `-mx-4 rounded-lg px-4 py-6 md:-mx-6 md:px-6 ${story.ground}` : 'border-t border-bleed/8 py-6', story.box].filter(Boolean).join(' ')}>
				<StoryBoundary>
					<story.render />
				</StoryBoundary>
			</div>
		</section>
	));
}

// A part of the page's introduction, headed as a story is
function Part({ name, children }: { name: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-3 pt-6">
			<h2 className="font-sans text-label text-muted">{name}</h2>
			<div className="border-t border-bleed/8 pt-4">{children}</div>
		</section>
	);
}

// What the page's playground builds, highlighted, and following it as its controls change
function Built() {
	const code = useBuilt();
	const html = useHighlight(code ?? '', { language: 'tsx' });
	return code ? (
		<Part name="Component">
			<Code code={code} html={html} copyIcon={<Icon name="square-on-square" />} copiedIcon={<Icon name="checkmark" />} />
		</Part>
	) : null;
}

// The page's import line, or how to use what it shows, as a block like the Component one below it
function Usage({ code }: { code: string }) {
	const html = useHighlight(code, { language: 'tsx' });
	return <Code code={code} html={html} copyIcon={<Icon name="square-on-square" />} copiedIcon={<Icon name="checkmark" />} />;
}

// The page's name and what it is, above the stories, so the columns beside them start level with the first
function Title({ entry }: { entry?: Entry }) {
	return entry ? (
		<header className="flex flex-col gap-2">
			<h1 className="text-title">{entry.name}</h1>
			<p className="text-pretty text-muted">{entry.description}</p>
			{(entry.exports || entry.usage) && (
				<Part name="Import">
					<Usage code={entry.exports ? `import { ${entry.exports.join(', ')} } from '@parchment/ui'` : (entry.usage ?? '')} />
				</Part>
			)}
			<Built />
		</header>
	) : (
		<header className="flex flex-col gap-2">
			<h1 className="flex items-center gap-1.5 text-title">
				<ParchmentLogo size={24} />
				loupe/ui
			</h1>
			<p className="text-muted">Each component in its states. Tab through to see the focus rings.</p>
		</header>
	);
}

// Every component's stories on one page, or every block's
function Overview({ entries }: { entries: Entry[] }) {
	return entries.map((entry) => (
		<section key={entry.id} id={entry.id} className="flex scroll-mt-25 md:scroll-mt-18 flex-col gap-6">
			<h2 className="text-title">{entry.name}</h2>
			<Stories entry={entry} heading="h3" />
		</section>
	));
}

// A screen fills the window on its own, without loupe's sidebar and bar around it
function Root() {
	const screen = screenAt(useAddress());
	useEffect(() => {
		if (screen) document.title = `${screen.name} · loupe`;
	}, [screen]);
	return screen ? <screen.render /> : <Preview />;
}

function Preview() {
	const asked = useAddress();
	const address = forward(asked) ?? asked;
	const page = pageAt(address);
	const entry = page?.entry;
	// A page that lists others: ui its components, as cards under each group, and Blocks its blocks once there are some
	const isComponents = address === 'ui';
	const listed = entry?.id === 'blocks' && blocks.length > 0 ? blocks : undefined;
	const shown = useRef(address);
	const scroller = useRef<HTMLDivElement>(null);
	const [isOpen, setOpen] = useState(() => remembered<string>('settings', 'closed') === 'open');
	const [isSearching, setSearching] = useState(false);
	const search = useCallback(() => setSearching(true), []);

	const headings = useMemo<Heading[]>(
		() =>
			isComponents
				? componentGroups.map(({ name }) => ({ id: categoryId(name), name }))
				: listed
				? listed.map(({ id, name }) => ({ id, name }))
				: entry
					? [...entry.stories.map((story, index) => ({ id: `${entry.id}-${index}`, name: story.name })), ...(hasReference(entry) ? [{ id: 'api', name: 'API reference' }] : []), ...(hasInspector(entry) ? [{ id: 'code', name: 'Code' }] : [])]
					: [],
		[entry, listed, isComponents],
	);

	// An old address, such as #/button, is swapped for where it lives now, so going back skips it
	useEffect(() => {
		if (address !== asked) window.location.replace(`#/${address}`);
	}, [address, asked]);

	useEffect(() => {
		document.title = entry ? `${entry.name} · loupe` : address === 'ui' ? 'ui · loupe' : 'loupe';
	}, [entry, address]);

	useEffect(() => {
		if (shown.current === address) return;
		shown.current = address;
		window.scrollTo(0, 0);
		scroller.current?.scrollTo(0, 0);
	}, [address]);

	const toggle = () => {
		setOpen(!isOpen);
		remember('settings', isOpen ? 'closed' : 'open');
	};

	return (
		<div className="font-sans text-body text-ink md:flex">
			<Sidebar current={address} />
			<PhoneBar current={address} onSearch={search} />
			{/* On wider screens the page is a card that scrolls inside, so the contents and the code stay beside the stories */}
			<div
				ref={scroller}
				className={[
					// Raised over the sticky columns either side, which would otherwise paint over its shadow
					'min-w-0 flex-1 bg-panel md:relative md:z-1 md:my-2 md:mr-2 md:h-[calc(100dvh-1rem)] md:overflow-y-auto md:rounded-xl md:shadow-panel',
				].join(' ')}
			>
				{/* The card's own bleed, so lines inside suit white rather than cream, while its shadow keeps the ground's */}
				<div className="flex min-h-full flex-col [--bleed:var(--panel-bleed)]">
					<Bar trail={page?.trail ?? []} headings={headings} isOpen={isOpen} onToggle={toggle} onSearch={search} />
					{/* The settings beside the page under the bar, which runs over both, as an inspector does. Clipped, not
					    hidden, so the settings past the card's edge can't scroll it sideways */}
					<div className="flex flex-1 overflow-x-clip">
						{/* On wide screens a grid: the title over the stories, with the contents beside them from the top */}
						<main className="min-w-0 flex-1 xl:grid xl:grid-cols-[13rem_minmax(0,1fr)] xl:items-start">
							<div className="px-4 pt-10 pb-10 md:px-10 xl:col-start-2">
								<div className="mx-auto max-w-[40rem]">
									<Title entry={entry} />
								</div>
							</div>
							{headings.length > 0 && <Contents key={`contents-${address}`} headings={headings} scroller={scroller} />}
							<div className="min-w-0 px-4 pb-10 md:px-10 xl:col-start-2 xl:row-start-2">
								<div className="mx-auto flex max-w-[40rem] flex-col gap-10">
									{isComponents ? (
										componentGroups.map((group) => <Category key={group.name} name={group.name} id={categoryId(group.name)} />)
									) : listed ? (
										<Overview entries={listed} />
									) : entry ? (
										<>
											<Stories entry={entry} heading="h2" />
											<Reference entry={entry} />
											<Inspector entry={entry} />
										</>
									) : (
										<p className="text-muted">Nothing at this address</p>
									)}
								</div>
							</div>
						</main>
						<Settings isOpen={isOpen} />
					</div>
				</div>
			</div>
			<Search isOpen={isSearching} onOpenChange={setSearching} />
		</div>
	);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);

// Shiki and its TSX grammar, which highlight only imports when it's first called, loaded once the page is idle, so the
// first Code block to need them doesn't wait. Safari has no requestIdleCallback, so it waits a moment instead
const whenIdle = (task: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(task) : setTimeout(task, 1000));
whenIdle(() => void highlight('', { language: 'tsx' }));
