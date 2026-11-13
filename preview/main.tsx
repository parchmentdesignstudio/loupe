import { Component, type ReactNode, StrictMode, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@parchment/icons/react';
import manifest from '../package.json?raw';
import {
	Breadcrumb,
	Breadcrumbs,
	Button,
	Link,
	Navigation,
	NavigationTree,
	NavigationTreeHeader,
	NavigationTreeItem,
	NavigationTreeItemContent,
	NavigationTreeSection,
	Sheet,
	SheetTrigger,
	Tooltip,
	TooltipTrigger,
} from '../src/index.js';
import { Contents, ContentsMenu, type Heading } from './contents.js';
import { Inspector } from './inspector.js';
import { Lockup, ParchmentLogo } from './logo.js';
import { Search, SearchButton } from './search.js';
import { Appearance, Settings, remember, remembered } from './settings.js';
import { type Crumb, forward, href, pageAt } from './routes.js';
import { screenAt } from './screens/index.js';
import { type Entry, areas, blocks, library } from './stories.js';

// All components leaves out the tokens, such as colour, which export nothing
const components = library.flatMap((group) => group.components).filter((entry) => entry.exports);

const subscribe = (onChange: () => void) => {
	window.addEventListener('hashchange', onChange);
	return () => window.removeEventListener('hashchange', onChange);
};

const useAddress = () => useSyncExternalStore(subscribe, () => window.location.hash.replace(/^#\/?/, ''));

const { version } = JSON.parse(manifest) as { version: string };

// A component page has its code beside it, and so does colour, with its roles. The other areas of loupe don't
const hasCode = (entry?: Entry) => entry != null && (entry.exports != null || entry.id === 'colour');

function Tree({ current }: { current: string }) {
	return (
		<NavigationTree aria-label="Loupe" selectedRoute={`#/${current}`}>
			<NavigationTreeSection id="loupe">
				<NavigationTreeHeader>Loupe</NavigationTreeHeader>
				<NavigationTreeItem id="all" href="#/ui" textValue="All components">
					<NavigationTreeItemContent>All components</NavigationTreeItemContent>
				</NavigationTreeItem>
				{areas.map((area) => (
					<NavigationTreeItem key={area.id} id={area.id} href={`#/${area.id}`} textValue={area.name}>
						<NavigationTreeItemContent>{area.name}</NavigationTreeItemContent>
					</NavigationTreeItem>
				))}
			</NavigationTreeSection>
			{blocks.length > 0 && (
				<NavigationTreeSection id="blocks">
					<NavigationTreeHeader>Blocks</NavigationTreeHeader>
					{blocks.map((entry) => (
						<NavigationTreeItem key={entry.id} id={entry.id} href={href(entry)} textValue={entry.name}>
							<NavigationTreeItemContent>{entry.name}</NavigationTreeItemContent>
						</NavigationTreeItem>
					))}
				</NavigationTreeSection>
			)}
			{library.map((group) => (
				<NavigationTreeSection key={group.name} id={group.name}>
					<NavigationTreeHeader>{group.name}</NavigationTreeHeader>
					{group.components.map((entry) => (
						<NavigationTreeItem key={entry.id} id={entry.id} href={href(entry)} textValue={entry.name}>
							<NavigationTreeItemContent>{entry.name}</NavigationTreeItemContent>
						</NavigationTreeItem>
					))}
				</NavigationTreeSection>
			))}
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

// The library's version, beside the logo in the sidebar and the phone bar
function Version() {
	return <span className="rounded-full bg-bleed/8 px-2 py-0.5 font-mono text-label text-muted">v{version}</span>;
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
					<Button variant="ghost" shape="circle" size="small" aria-label="Components">
						<More />
					</Button>
					<Sheet position="end" aria-label="Components">
						<div className="flex flex-col gap-6">
							<Tree current={current} />
							<div className="px-3">
								<Appearance />
							</div>
						</div>
					</Sheet>
				</SheetTrigger>
			</div>
		</header>
	);
}

// Where the page sits in the library, with its sections where there's no room for their column, and the search and settings
function Bar({ entry, trail, headings, isOpen, onToggle, onSearch }: { entry?: Entry; trail: Crumb[]; headings: Heading[]; isOpen: boolean; onToggle: () => void; onSearch: () => void }) {
	const label = isOpen ? 'Hide settings' : 'Show settings';
	return (
		// Sticks below the phone's header, which is as tall as its 28px buttons and its padding
		<div className="sticky top-11 z-10 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-bleed/8 bg-panel px-4 md:top-0 md:px-5">
			<div className="flex min-w-0 flex-1 items-center gap-2">
				{/* Below the stories here, so the code is one of the places to jump to */}
				{headings.length > 0 && <ContentsMenu headings={hasCode(entry) ? [...headings, { id: 'code', name: 'Code' }] : headings} />}
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
					<Button variant="ghost" shape="circle" size="small" aria-label={label} aria-expanded={isOpen} onPress={onToggle}>
						<Icon name={isOpen ? 'sidebar-right' : 'sidebar-right-closed'} />
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
			<div className={['flex flex-wrap items-center gap-2 border-y border-bleed/8 py-6', story.box].filter(Boolean).join(' ')}>
				<StoryBoundary>
					<story.render />
				</StoryBoundary>
			</div>
		</section>
	));
}

// The page's name and what it is, above the stories, so the columns beside them start level with the first
function Title({ entry }: { entry?: Entry }) {
	return entry ? (
		<header className="flex flex-col gap-2">
			<h1 className="text-title font-medium">{entry.name}</h1>
			<p className="text-muted">{entry.description}</p>
			{(entry.exports || entry.usage) && (
				<code className="font-mono text-label text-muted">{entry.exports ? `import { ${entry.exports.join(', ')} } from '@parchment/ui'` : entry.usage}</code>
			)}
		</header>
	) : (
		<header className="flex flex-col gap-2">
			<h1 className="flex items-center gap-1.5 text-title font-medium">
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
			<h2 className="text-title font-medium">{entry.name}</h2>
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
	// A page that lists others: ui its components, and Blocks its blocks once there are some
	const listed = address === 'ui' ? components : entry?.id === 'blocks' && blocks.length > 0 ? blocks : undefined;
	const shown = useRef(address);
	const scroller = useRef<HTMLDivElement>(null);
	const [isOpen, setOpen] = useState(() => remembered<string>('settings', 'closed') === 'open');
	const [isSearching, setSearching] = useState(false);
	const search = useCallback(() => setSearching(true), []);

	const headings = useMemo<Heading[]>(
		() => (listed ? listed.map(({ id, name }) => ({ id, name })) : entry ? entry.stories.map((story, index) => ({ id: `${entry.id}-${index}`, name: story.name })) : []),
		[entry, listed],
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
					'min-w-0 flex-1 bg-panel md:relative md:z-1 md:my-2 md:h-[calc(100dvh-1rem)] md:overflow-y-auto md:rounded-xl md:shadow-raised',
					isOpen ? '' : 'md:mr-2',
				].join(' ')}
			>
				{/* The card's own bleed, so lines inside suit white rather than cream, while its shadow keeps the ground's */}
				<div className="flex min-h-full flex-col [--bleed:var(--panel-bleed)]">
					<Bar entry={entry} trail={page?.trail ?? []} headings={headings} isOpen={isOpen} onToggle={toggle} onSearch={search} />
					{/* On wide screens a grid: the title over the stories, with the contents and the code beside them from the top.
					    A page without code keeps the code's column empty, so the stories sit in the same place on every page */}
					<main className="flex-1 xl:grid xl:grid-cols-[13rem_minmax(0,1fr)_20rem] xl:items-start">
						<div className="px-4 pt-10 pb-10 md:px-10 xl:col-start-2">
							<div className="mx-auto max-w-[40rem]">
								<Title entry={entry} />
							</div>
						</div>
						{headings.length > 0 && <Contents key={`contents-${address}`} headings={headings} scroller={scroller} />}
						<div className="min-w-0 px-4 pb-10 md:px-10 xl:col-start-2 xl:row-start-2">
							<div className="mx-auto flex max-w-[40rem] flex-col gap-10">
								{listed ? <Overview entries={listed} /> : entry ? <Stories entry={entry} heading="h2" /> : <p className="text-muted">Nothing at this address</p>}
							</div>
						</div>
						{entry && <Inspector key={`code-${entry.id}`} entry={entry} />}
					</main>
				</div>
			</div>
			{isOpen && <Settings />}
			<Search isOpen={isSearching} onOpenChange={setSearching} />
		</div>
	);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
