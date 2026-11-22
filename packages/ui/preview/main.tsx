import { Component, type ReactNode, StrictMode, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@parchment/icons/react';
// Loupe's one version, which every package is released at (pnpm bump)
import manifest from '../../../package.json?raw';
import {
	Button,
	Code,
	Link,
	NavigationTree,
	NavigationTreeItem,
	NavigationTreeItemContent,
	Tooltip,
	TooltipTrigger,
} from '../src/index.js';
import { DocsBadge, DocsPage, DocsSearch, DocsSearchButton, DocsShell } from '../src/docs.js';
import { Contents, ContentsMenu, type Heading } from './contents.js';
import { Inspector, hasInspector } from './inspector.js';
import { Reference, hasReference } from './reference.js';
import { Lockup, ParchmentLogo } from './logo.js';
import { pages as searchPages } from './search.js';
import { ChatDrawer } from './assistant.js';
import { useConversation } from './blocks/chat.js';
import { SettingsDrawer, SettingsPanels, remember, remembered } from './settings.js';
import { forward, href, pageAt } from './routes.js';
import { screenAt } from './screens/index.js';
import { Evals } from './genui/evals/gallery.js';
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

// Loupe's name and version, beside the logo in the sidebar and the phone bar. Before 1.0 it's an alpha: usable, as React
// Aria stands behind it, but not yet at the quality to rely on, which 1.0 will mark
const isAlpha = version.startsWith('0.');

function Brand() {
	return (
		<>
			<Link href="#/" className="flex items-center no-underline">
				<Lockup word="loupe" height={16} />
			</Link>
			<DocsBadge>
				v{version}
				{isAlpha && ' alpha'}
			</DocsBadge>
		</>
	);
}

const searchIcon = <Icon name="magnifyingglass" />;

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

// Claude, while the preview runs locally, as the key stays on the server
const hasClaude = import.meta.env.DEV;

/** Opens or closes the chat with Claude, marked expanded while it's open */
function ChatButton({ isOpen, onToggle, tooltip }: { isOpen: boolean; onToggle: () => void; tooltip?: boolean }) {
	const label = isOpen ? 'Hide chat' : 'Ask Loupe';
	const button = (
		<Button variant="ghost" shape="full" size="small" aria-label={label} aria-expanded={isOpen} onPress={onToggle}>
			<Icon name="bubble-left" />
		</Button>
	);
	if (!tooltip) return button;
	return (
		<TooltipTrigger>
			{button}
			<Tooltip>{label}</Tooltip>
		</TooltipTrigger>
	);
}

// Search, Claude, and the settings beside the page, at the bar's end
function Actions({ isOpen, onToggle, isChatting, onChat, onSearch }: { isOpen: boolean; onToggle: () => void; isChatting: boolean; onChat: () => void; onSearch: () => void }) {
	const label = isOpen ? 'Hide settings' : 'Show settings';
	return (
		<>
			<DocsSearchButton onPress={onSearch} icon={searchIcon} tooltip="Search ⌘K" />
			{hasClaude && <ChatButton isOpen={isChatting} onToggle={onChat} tooltip />}
			<TooltipTrigger>
				<Button variant="ghost" shape="full" size="small" aria-label={label} aria-expanded={isOpen} onPress={onToggle}>
					{({ isPressed }) => <SidebarIcon isOpen={isOpen} isPressed={isPressed} />}
				</Button>
				<Tooltip>{label}</Tooltip>
			</TooltipTrigger>
		</>
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
	const address = useAddress();
	const screen = screenAt(address);
	useEffect(() => {
		if (screen) document.title = `${screen.name} · loupe`;
	}, [screen]);
	if (address === 'evals') return <Evals />;
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
	const [isChatting, setChatting] = useState(() => hasClaude && !isOpen && remembered<string>('chat', 'closed') === 'open');
	const conversation = useConversation('claude');
	const [isSearching, setSearching] = useState(false);
	const search = () => setSearching(true);

	const headings: Heading[] = isComponents
				? componentGroups.map(({ name }) => ({ id: categoryId(name), name }))
				: listed
				? listed.map(({ id, name }) => ({ id, name }))
				: entry
					? [...entry.stories.map((story, index) => ({ id: `${entry.id}-${index}`, name: story.name })), ...(hasReference(entry) ? [{ id: 'api', name: 'API reference' }] : []), ...(hasInspector(entry) ? [{ id: 'code', name: 'Code' }] : [])]
					: [];

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

	// One drawer beside the page at a time, so the page keeps the room to be read: opening one closes the other
	const openSettings = (next: boolean) => {
		setOpen(next);
		remember('settings', next ? 'open' : 'closed');
		if (next) openChat(false);
	};
	const toggle = () => openSettings(!isOpen);
	const openChat = (next: boolean) => {
		setChatting(next);
		remember('chat', next ? 'open' : 'closed');
		if (next && isOpen) {
			setOpen(false);
			remember('settings', 'closed');
		}
	};

	return (
		<>
			<DocsShell
				brand={<Brand />}
				nav={<Tree current={address} />}
				navLabel="Components"
				trail={[{ name: 'loupe', href: '#/' }, ...(page?.trail ?? [])]}
				barStart={headings.length > 0 && <ContentsMenu headings={headings} />}
				actions={<Actions isOpen={isOpen} onToggle={toggle} isChatting={isChatting} onChat={() => openChat(!isChatting)} onSearch={search} />}
				phoneActions={
					<>
						<DocsSearchButton onPress={search} icon={searchIcon} />
						{hasClaude && <ChatButton isOpen={isChatting} onToggle={() => openChat(!isChatting)} />}
					</>
				}
				drawerEnd={<SettingsPanels />}
				aside={
					<>
						<SettingsDrawer isOpen={isOpen} onOpenChange={openSettings} />
						{hasClaude && <ChatDrawer isOpen={isChatting} onOpenChange={openChat} conversation={conversation} />}
					</>
				}
				current={address}
				scrollerRef={scroller}
			>
				<DocsPage header={<Title entry={entry} />} contents={headings.length > 0 && <Contents key={`contents-${address}`} headings={headings} scroller={scroller} />}>
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
				</DocsPage>
			</DocsShell>
			<DocsSearch pages={searchPages} isOpen={isSearching} onOpenChange={setSearching} />
		</>
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
