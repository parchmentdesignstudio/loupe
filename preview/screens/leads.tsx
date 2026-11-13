import { useMemo, useState, useSyncExternalStore } from 'react';
import type { Key, Selection, SortDescriptor } from 'react-aria-components';
import { Icon } from '@parchment/icons/react';
import type { IconName } from '@parchment/icons';
import {
	Avatar,
	Button,
	Cell,
	Column,
	DialogHeading,
	EmptyState,
	Keyboard,
	Link,
	Menu,
	MenuItem,
	MenuSection,
	MenuTrigger,
	Navigation,
	NavigationTree,
	NavigationTreeHeader,
	NavigationTreeItem,
	NavigationTreeItemContent,
	NavigationTreeSection,
	Pagination,
	Row,
	RowActions,
	MenuSeparator,
	SearchField,
	Sheet,
	Status,
	type StatusTone,
	SubmenuTrigger,
	Tab,
	TabList,
	TabPanel,
	Table,
	TableBody,
	TableHeader,
	Tabs,
} from '../../src/index.js';
import { CalendarGlyph } from '../../src/glyphs.js';

// Dummy leads for a CRM, to put the components under the load of a real screen: long names, empty cells, many pages

type StatusName = 'Referred' | 'Call arranged' | 'No answer' | 'Qualified' | 'Cash' | 'Pending' | 'Unresponsive' | 'Unsuccessful';

const tones: Record<StatusName, StatusTone> = {
	Referred: 'info',
	'Call arranged': 'info',
	'No answer': 'warning',
	Qualified: 'success',
	Cash: 'success',
	Pending: 'warning',
	Unresponsive: 'neutral',
	Unsuccessful: 'danger',
};

interface Lead {
	id: string;
	client: string;
	developer: string;
	site?: string;
	plot?: string;
	status: StatusName;
	call?: { date: string; isOverdue: boolean };
	attempts?: number;
	route?: string;
}

// The same leads every time, so a screenshot today matches one tomorrow
function seeded(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const developers: Record<string, string[]> = {
	'Barratt Homes': ['Oakwood Gardens', 'Mill Lane'],
	Bellway: ['Ashton Valley'],
	'Bovis Homes': ['Church Lane', 'The Paddocks'],
	'Christie Residential Developments': [],
	Persimmon: ['Riverside Quarter', 'Kingsmead'],
	'Taylor Wimpey': ['Hollins Park'],
};

const firsts = ['Ada', 'Alan', 'Barbara', 'Grace', 'Katherine', 'Ted', 'Sarina', 'Gunner', 'Florence', 'Anissa', 'Duane', 'Priya', 'Tomasz', 'Olu', 'Mei', 'Siobhan', 'Rhys', 'Imogen'];
const lasts = ['Lovelace', 'Dijkstra', 'Hopper', 'Liskov', 'Hamilton', 'Cremin', 'Will', 'Kling', 'Hegmann', 'Schaefer', 'Rutherford', 'Okafor', 'Nowak', 'Chen', 'Byrne', 'Llewellyn', 'Fairweather-Smith'];
// Some names the way a team actually types them in
const oddities = [
	'Kitchen Sink (First contact, retired and downsizing)',
	'Kitchen Sink (Call arranged) & Amy Fairweather-Smith',
	'Kitchen Sink (Qualification pending a second income)',
	'Kitchen Sink (Follow-ups: every kind of reminder)',
	'Walkthrough Self Assign',
	'Prof. Gunner Kling',
	'Florence Hegmann MD',
	'Mr & Mrs O’Sullivan-Whitaker',
];
const days = ['3 Nov', '7 Nov', '10 Nov', '14 Nov', '18 Nov', '21 Nov', '25 Nov', '2 Dec'];
const today = 12;

const leads: Lead[] = (() => {
	const random = seeded(7);
	const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];
	const statuses = Object.keys(tones) as StatusName[];
	return Array.from({ length: 190 }, (_, index) => {
		const developer = pick(Object.keys(developers));
		const sites = developers[developer];
		const status = pick(statuses);
		const day = pick(days);
		const date = Number.parseInt(day);
		return {
			id: `REF-${String(256 - index).padStart(4, '0')}`,
			client: random() < 0.12 ? pick(oddities) : `${pick(firsts)} ${pick(lasts)}`,
			developer,
			site: sites.length ? pick(sites) : undefined,
			plot: random() < 0.15 ? undefined : random() < 0.1 ? 'TBC' : random() < 0.5 ? `Plot ${1 + Math.floor(random() * 40)}` : `KS-${String(1 + Math.floor(random() * 40)).padStart(2, '0')}`,
			status,
			call: status === 'Call arranged' && random() < 0.8 ? { date: day, isOverdue: day.endsWith('Nov') && date < today } : undefined,
			attempts: status === 'No answer' || random() < 0.15 ? 1 + Math.floor(random() * 5) : undefined,
			route: status === 'Qualified' || status === 'Cash' ? 'Using us' : status === 'Pending' ? 'TBC' : undefined,
		};
	});
})();

const tabs: { id: string; name: string; statuses?: StatusName[] }[] = [
	{ id: 'all', name: 'All' },
	{ id: 'new', name: 'New', statuses: ['Referred'] },
	{ id: 'call', name: 'Call arranged', statuses: ['Call arranged'] },
	{ id: 'no-answer', name: 'No answer', statuses: ['No answer'] },
	{ id: 'qualified', name: 'Qualified', statuses: ['Qualified'] },
	{ id: 'cash', name: 'Cash', statuses: ['Cash'] },
	{ id: 'pending', name: 'Pending', statuses: ['Pending'] },
	{ id: 'unresponsive', name: 'Unresponsive', statuses: ['Unresponsive'] },
	{ id: 'unsuccessful', name: 'Unsuccessful', statuses: ['Unsuccessful'] },
];

interface ColumnSpec {
	id: keyof Lead | 'actions';
	name: string;
	isRowHeader?: boolean;
	align?: 'start' | 'end';
	width?: number;
	defaultWidth?: `${number}fr`;
	minWidth?: number;
	sorts?: boolean;
}

const allColumns: ColumnSpec[] = [
	{ id: 'id', name: 'Reference', width: 120, sorts: true },
	{ id: 'client', name: 'Client', isRowHeader: true, defaultWidth: '2fr', minWidth: 200, sorts: true },
	{ id: 'developer', name: 'Developer', defaultWidth: '1fr', minWidth: 140, sorts: true },
	{ id: 'site', name: 'Site', defaultWidth: '1fr', minWidth: 130, sorts: true },
	{ id: 'plot', name: 'Plot', width: 96, sorts: true },
	{ id: 'status', name: 'Status', defaultWidth: '1.5fr', minWidth: 180, sorts: true },
	{ id: 'attempts', name: 'Attempts', align: 'end', width: 100, sorts: true },
	{ id: 'route', name: 'Route', width: 108, sorts: true },
	{ id: 'actions', name: 'Actions', width: 52, minWidth: 52 },
];
// The client names each row and the menu acts on it, so neither can be hidden
const optional = allColumns.filter((column) => column.id !== 'client' && column.id !== 'actions');

const pageSize = 25;
const none = <span className="text-muted">—</span>;

function compare(a: Lead, b: Lead, column: keyof Lead) {
	const x = a[column];
	const y = b[column];
	if (x == null) return y == null ? 0 : 1;
	if (y == null) return -1;
	if (column === 'call') return 0;
	return typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
}

function NavItem({ id, href, icon, count, isAlert, children, items }: { id: string; href?: string; icon?: IconName; count?: number; isAlert?: boolean; children: string; items?: { id: string; name: string; href?: string }[] }) {
	return (
		<NavigationTreeItem id={id} href={href} textValue={children}>
			<NavigationTreeItemContent>
				<span className="flex items-center gap-2.5">
					{icon && <Icon name={icon} className="text-muted" />}
					<span className="min-w-0 flex-1 truncate">{children}</span>
					{count != null && <span className={['tabular-nums', isAlert ? 'text-danger' : 'text-muted'].join(' ')}>{count}</span>}
				</span>
			</NavigationTreeItemContent>
			{items?.map((item) => (
				<NavigationTreeItem key={item.id} id={item.id} href={item.href ?? `#/screens/leads/${item.id}`} textValue={item.name}>
					<NavigationTreeItemContent>{item.name}</NavigationTreeItemContent>
				</NavigationTreeItem>
			))}
		</NavigationTreeItem>
	);
}

// The toolbar's buttons keep only their icons on phones, as the CRM's do, so the toolbar fits one row
const phone = '(max-width: 767px)';
const usePhone = () =>
	useSyncExternalStore(
		(onChange) => {
			const query = matchMedia(phone);
			query.addEventListener('change', onChange);
			return () => query.removeEventListener('change', onChange);
		},
		() => matchMedia(phone).matches,
	);

function Sidebar({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }) {
	// Its button on phones is the toolbar's, so the menu doesn't take a row of its own. The card beside it has its own
	// edge, so the column's line would double it
	return (
		<Navigation aria-label="Menu" hasTrigger={false} isOpen={isOpen} onOpenChange={onOpenChange} className="bg-ground md:w-64 md:border-r-0">
			<div className="-mt-2 flex items-center justify-between px-1">
				<Link href="#/screens" aria-label="Back to loupe’s screens" className="flex size-8 items-center justify-center rounded-lg text-ink no-underline hover:bg-bleed/4">
					<Icon name="house" />
				</Link>
				<Button variant="ghost" shape="square" size="small" aria-label="Hide the menu">
					<Icon name="sidebar-left" />
				</Button>
			</div>
			<div className="flex gap-2">
				<Button variant="secondary" start={<Icon name="plus" />} className="flex-1 justify-start">
					New lead
				</Button>
				<Button variant="outline" aria-label="Search" start={<Icon name="magnifyingglass" />}>
					<Keyboard>⌘K</Keyboard>
				</Button>
			</div>
			{/* Enough to try counts, a section and pages under a page, not the whole app's menu */}
			<NavigationTree aria-label="Menu" selectedRoute="#/screens/leads/qualification" defaultExpandedKeys={['leads']}>
				<NavigationTreeSection id="you">
					<NavItem id="tasks" href="#/screens/leads/tasks" icon="checkmark-square" count={17}>
						Tasks
					</NavItem>
					<NavItem id="inbox" href="#/screens/leads/inbox" icon="envelope" count={13} isAlert>
						Inbox
					</NavItem>
				</NavigationTreeSection>
				<NavigationTreeSection id="work">
					<NavigationTreeHeader>Work</NavigationTreeHeader>
					<NavItem
						id="leads"
						icon="person"
						items={[
							{ id: 'qualification', name: 'Qualification' },
							{ id: 'progression', name: 'Progression' },
							{ id: 'calls', name: 'Calls' },
						]}
					>
						Leads
					</NavItem>
					<NavItem id="partners" href="#/screens/leads/partners" icon="building">
						Partners
					</NavItem>
				</NavigationTreeSection>
			</NavigationTree>
			<div className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-bleed/4">
				<Avatar name="Steve" size={24} status="online" />
				<span className="flex-1 truncate text-control font-medium">Steve</span>
			</div>
		</Navigation>
	);
}

const periods = ['All time', 'Today', 'Last 7 days', 'Last 30 days', 'This year'];

function Toolbar({ onMenu, search, onSearch, filters, onFilters, period, onPeriod, shown, onShown, density, onDensity }: {
	onMenu: () => void;
	search: string;
	onSearch: (value: string) => void;
	filters: Selection;
	onFilters: (keys: Selection) => void;
	period: string;
	onPeriod: (period: string) => void;
	shown: Set<Key>;
	onShown: (keys: Set<Key>) => void;
	density: 'compact' | 'comfortable';
	onDensity: (density: 'compact' | 'comfortable') => void;
}) {
	const filterCount = filters === 'all' ? Object.keys(developers).length : filters.size;
	const isPhone = usePhone();
	const [isSearching, setSearching] = useState(false);
	// On phones each button is its icon alone, named for screen readers, as a square
	const compact = (label: string) => (isPhone ? { shape: 'square' as const, 'aria-label': label } : {});
	const searchField = (
		<SearchField
			aria-label="Search leads"
			placeholder="Search name, reference, developer, site…"
			value={search}
			onChange={onSearch}
			autoFocus={isPhone}
			className={isPhone ? 'w-full' : 'w-full max-w-80 min-w-48 flex-1'}
		/>
	);
	return (
		<header className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-bleed/8 px-4 py-2">
			{isPhone && (
				<Button variant="ghost" shape="square" aria-label="Menu" onPress={onMenu} className="-ms-2">
					<Icon name="line-2-horizontal" variant="line" />
				</Button>
			)}
			<h1 className="me-2 flex items-center gap-2 text-control font-medium">
				<Icon name="person" className="text-muted" />
				Leads
			</h1>
			{!isPhone && searchField}
			{/* On phones the buttons sit at the end of the bar, after the title */}
			<div className="contents max-md:ms-auto max-md:flex max-md:items-center max-md:gap-2">
			{isPhone && (
				<Button variant="outline" shape="square" aria-label="Search" aria-expanded={isSearching} onPress={() => setSearching(!isSearching)}>
					<Icon name="magnifyingglass" />
				</Button>
			)}
			<MenuTrigger>
				<Button variant="outline" start={isPhone ? undefined : <Icon name="list-bullet-rectangle-portrait" />} {...compact(filterCount ? `Filters, ${filterCount} on` : 'Filters')}>
					{isPhone ? (
						<Icon name="list-bullet-rectangle-portrait" />
					) : (
						<>
							Filters
							{filterCount > 0 && <span className="ms-1 tabular-nums text-muted">{filterCount}</span>}
						</>
					)}
				</Button>
				<Menu>
					<SubmenuTrigger>
						<MenuItem>Developer</MenuItem>
						<Menu selectionMode="multiple" selectedKeys={filters} onSelectionChange={onFilters}>
							{Object.keys(developers).map((name) => (
								<MenuItem key={name} id={name}>
									{name}
								</MenuItem>
							))}
						</Menu>
					</SubmenuTrigger>
					<MenuSeparator />
					<MenuItem isDisabled={filterCount === 0} onAction={() => onFilters(new Set())}>
						Clear filters
					</MenuItem>
				</Menu>
			</MenuTrigger>
			{!isPhone && <MenuTrigger>
				<Button variant="outline" start={<CalendarGlyph />}>
					{period}
				</Button>
				<Menu selectionMode="single" selectedKeys={[period]} onSelectionChange={(keys) => keys !== 'all' && keys.size && onPeriod(String([...keys][0]))}>
					{periods.map((name) => (
						<MenuItem key={name} id={name}>
							{name}
						</MenuItem>
					))}
				</Menu>
			</MenuTrigger>}
			<div className="flex items-center gap-2 md:ms-auto">
				<MenuTrigger>
					<Button variant="outline" start={isPhone ? undefined : <Icon name="square-grid-3x3" />} {...compact('Display')}>
						{isPhone ? (
							<Icon name="square-grid-3x3" />
						) : (
							<>
								Display
								<span className="ms-1 tabular-nums text-muted">{shown.size}</span>
							</>
						)}
					</Button>
					<Menu placement="bottom end">
						<MenuSection selectionMode="multiple" selectedKeys={shown} onSelectionChange={(keys) => keys !== 'all' && onShown(keys)}>
							{optional.map((column) => (
								<MenuItem key={column.id} id={column.id}>
									{column.name}
								</MenuItem>
							))}
						</MenuSection>
						<MenuSeparator />
						<MenuSection selectionMode="single" selectedKeys={[density]} onSelectionChange={(keys) => keys !== 'all' && keys.size && onDensity([...keys][0] as 'compact' | 'comfortable')}>
							<MenuItem id="comfortable">Comfortable rows</MenuItem>
							<MenuItem id="compact">Compact rows</MenuItem>
						</MenuSection>
					</Menu>
				</MenuTrigger>
				<Button variant="primary" end={isPhone ? undefined : <Icon name="plus" />} {...compact('New lead')}>
					{isPhone ? <Icon name="plus" /> : 'New lead'}
				</Button>
			</div>
			</div>
			{isPhone && isSearching && searchField}
		</header>
	);
}

function StatusCell({ lead }: { lead: Lead }) {
	const parts = [lead.attempts != null && lead.status === 'Call arranged' ? `${lead.attempts} ${lead.attempts === 1 ? 'call' : 'calls'}` : null].filter(Boolean);
	const detail = lead.call ? (
		<>
			{parts.length > 0 && <>{parts.join(' · ')} · </>}
			<span className={lead.call.isOverdue ? 'text-danger' : undefined}>{lead.call.date}</span>
		</>
	) : undefined;
	return (
		<Status tone={tones[lead.status]} detail={detail}>
			{lead.status}
		</Status>
	);
}

function LeadSheet({ lead, onClose }: { lead?: Lead; onClose: () => void }) {
	return (
		<Sheet isOpen={lead != null} onOpenChange={(isOpen) => !isOpen && onClose()} position="right">
			{lead && (
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="font-mono text-label text-muted">{lead.id}</p>
						<DialogHeading>{lead.client}</DialogHeading>
						<StatusCell lead={lead} />
					</div>
					<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-control">
						{(
							[
								['Developer', lead.developer],
								['Site', lead.site],
								['Plot', lead.plot],
								['Attempts', lead.attempts],
								['Route', lead.route],
							] as const
						).map(([term, value]) => (
							<div key={term} className="contents">
								<dt className="text-muted">{term}</dt>
								<dd className="min-w-0 truncate">{value ?? none}</dd>
							</div>
						))}
					</dl>
					<div className="flex gap-2">
						<Button variant="primary">Log a call</Button>
						<Button variant="secondary" onPress={onClose}>
							Close
						</Button>
					</div>
				</div>
			)}
		</Sheet>
	);
}

/** A CRM's list of leads, built from loupe alone, to see how the components hold up on a working screen */
export function LeadsScreen() {
	const [tab, setTab] = useState<Key>('all');
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState<Selection>(new Set());
	const [period, setPeriod] = useState('All time');
	const [shown, setShown] = useState<Set<Key>>(() => new Set(optional.map((column) => column.id)));
	const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
	const [sort, setSort] = useState<SortDescriptor>({ column: 'id', direction: 'descending' });
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Selection>(new Set());
	const [opened, setOpened] = useState<Lead>();
	const [isMenuOpen, setMenuOpen] = useState(false);

	const columns = allColumns.filter((column) => column.id === 'client' || column.id === 'actions' || shown.has(column.id));

	const matching = useMemo(() => {
		const query = search.trim().toLowerCase();
		return leads.filter(
			(lead) =>
				(filters === 'all' || filters.size === 0 || filters.has(lead.developer)) &&
				(!query || [lead.id, lead.client, lead.developer, lead.site].some((value) => value?.toLowerCase().includes(query))),
		);
	}, [search, filters]);

	const counts = useMemo(() => Object.fromEntries(tabs.map((each) => [each.id, each.statuses ? matching.filter((lead) => each.statuses!.includes(lead.status)).length : matching.length])), [matching]);

	const rows = useMemo(() => {
		const statuses = tabs.find((each) => each.id === tab)?.statuses;
		const list = statuses ? matching.filter((lead) => statuses.includes(lead.status)) : matching;
		const sign = sort.direction === 'ascending' ? 1 : -1;
		return list.toSorted((a, b) => compare(a, b, sort.column as keyof Lead) * sign);
	}, [matching, tab, sort]);

	const pages = Math.max(1, Math.ceil(rows.length / pageSize));
	const current = Math.min(page, pages);
	const visible = rows.slice((current - 1) * pageSize, current * pageSize);
	const selectedCount = selected === 'all' ? rows.length : selected.size;
	// Anything that changes the list starts it from the first page, with nothing chosen
	const reset = () => {
		setPage(1);
		setSelected(new Set());
	};

	const content = (
		<>
			<div className="flex min-h-0 flex-1 flex-col">
				<Table
					aria-label={`Leads, ${tabs.find((each) => each.id === tab)?.name}`}
					variant="flush"
					density={density}
					selectionMode="multiple"
					selectedKeys={selected}
					onSelectionChange={setSelected}
					sortDescriptor={sort}
					onSortChange={(next) => {
						setSort(next);
						setPage(1);
					}}
					onRowAction={(key) => setOpened(leads.find((lead) => lead.id === key))}
					className="max-h-full"
				>
					<TableHeader columns={columns}>
						{(column) => (
							<Column id={column.id} isRowHeader={column.isRowHeader} align={column.align} width={column.width} defaultWidth={column.defaultWidth} minWidth={column.minWidth} allowsSorting={column.sorts}>
								{column.id === 'actions' ? <span className="sr-only">{column.name}</span> : column.name}
							</Column>
						)}
					</TableHeader>
					<TableBody
						items={visible}
						dependencies={[columns]}
						renderEmptyState={() => (
							<EmptyState icon={<Icon name="magnifyingglass" />} title="No leads match">
								Try another search, or clear the filters
							</EmptyState>
						)}
					>
						{(lead) => (
							<Row id={lead.id} columns={columns} textValue={lead.client} dependencies={[columns]}>
								{(column) => (
									<Cell>
										{column.id === 'id' ? (
											<span className="font-mono text-label text-muted">{lead.id}</span>
										) : column.id === 'client' ? (
											<span className="truncate font-medium">{lead.client}</span>
										) : column.id === 'status' ? (
											<StatusCell lead={lead} />
										) : column.id === 'actions' ? (
											<RowActions aria-label={`Actions for ${lead.client}`}>
												<MenuItem onAction={() => setOpened(lead)}>Open</MenuItem>
												<MenuItem>Log a call</MenuItem>
												<MenuItem>Change status</MenuItem>
												<MenuSeparator />
												<MenuItem variant="danger">Delete</MenuItem>
											</RowActions>
										) : (
											<span className="truncate">{lead[column.id as keyof Lead] != null ? String(lead[column.id as keyof Lead]) : none}</span>
										)}
									</Cell>
								)}
							</Row>
						)}
					</TableBody>
				</Table>
			</div>
			<footer className="flex h-14 shrink-0 items-center justify-between gap-4 border-t border-bleed/8 px-4">
				{selectedCount > 0 ? (
					<div className="flex items-center gap-2">
						<span className="text-control font-medium tabular-nums">{selectedCount} chosen</span>
						<Button variant="secondary" size="small">
							Change status
						</Button>
						<Button variant="secondary" size="small">
							Assign
						</Button>
						<Button variant="ghost" size="small" onPress={() => setSelected(new Set())}>
							Clear
						</Button>
					</div>
				) : (
					<p className="text-control text-muted tabular-nums">
						{rows.length === 0 ? 'No leads' : `Showing ${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, rows.length)} of ${rows.length}`}
					</p>
				)}
				<Pagination page={current} count={pages} onChange={setPage} aria-label="Pages of leads" />
			</footer>
		</>
	);

	return (
		<div className="font-sans text-body text-ink md:flex md:h-dvh">
			<Sidebar isOpen={isMenuOpen} onOpenChange={setMenuOpen} />
			<div className="flex min-w-0 flex-1 flex-col bg-panel max-md:min-h-dvh md:relative md:z-1 md:my-2 md:mr-2 md:overflow-hidden md:rounded-xl md:shadow-raised [--bleed:var(--panel-bleed)]">
				<Toolbar
					onMenu={() => setMenuOpen(true)}
					search={search}
					onSearch={(value) => (setSearch(value), reset())}
					filters={filters}
					onFilters={(keys) => (setFilters(keys), reset())}
					period={period}
					onPeriod={setPeriod}
					shown={shown}
					onShown={setShown}
					density={density}
					onDensity={setDensity}
				/>
				<Tabs selectedKey={tab} onSelectionChange={(key) => (setTab(key), reset())} className="min-h-0 flex-1 gap-0">
					<TabList aria-label="Status" items={tabs} className="mx-0 border-b border-bleed/8 bg-none px-4 pt-2 pb-[3px]">
						{(each) => (
							<Tab id={each.id}>
								{each.name}
								<span className="tabular-nums text-muted">{counts[each.id]}</span>
							</Tab>
						)}
					</TabList>
					{tabs.map((each) => (
						<TabPanel key={each.id} id={each.id} className="flex min-h-0 flex-1 flex-col">
							{content}
						</TabPanel>
					))}
				</Tabs>
			</div>
			<LeadSheet lead={opened} onClose={() => setOpened(undefined)} />
		</div>
	);
}
