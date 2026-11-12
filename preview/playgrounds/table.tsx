import { useMemo, useState } from 'react';
import { Collection, type Selection, type SortDescriptor } from 'react-aria-components';
import { Avatar, Cell, Column, EmptyState, MenuItem, MenuSeparator, Row, RowActions, Table, TableBody, TableHeader, TableLoadMore } from '../../src/index.js';
import { Choice, NumberControl, Playground, SwitchControl, longWords, pick } from '../playground.js';

const firsts = ['Ada', 'Grace', 'Alan', 'Katherine', 'Tim', 'Margaret', 'Linus', 'Barbara', 'Dennis', 'Radia', 'Ken', 'Frances', 'Donald', 'Hedy', 'Edsger', 'Joan'];
const lasts = ['Lovelace', 'Hopper', 'Turing', 'Johnson', 'Berners-Lee', 'Hamilton', 'Torvalds', 'Liskov', 'Ritchie', 'Perlman', 'Thompson', 'Allen', 'Knuth', 'Lamarr', 'Dijkstra', 'Clarke'];
const roles = ['Owner', 'Admin', 'Editor', 'Viewer'];
const plans = ['Starter', 'Team', 'Business', 'Enterprise'];
const statuses = ['Active', 'Invited', 'Suspended'];
const days = ['Today', 'Yesterday', '3 days ago', 'Last week', '2 weeks ago', 'Last month'];

// The same people every time, so Random shakes up the table and not the data under it
const people = Array.from({ length: 500 }, (_, index) => {
	const first = firsts[index % firsts.length];
	const last = lasts[(index * 7 + Math.floor(index / firsts.length)) % lasts.length];
	return {
		id: `person-${index}`,
		name: `${first} ${last}`,
		email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
		role: roles[(index * 3) % roles.length],
		plan: plans[(index * 5) % plans.length],
		status: statuses[index % 7 === 0 ? 1 : index % 11 === 0 ? 2 : 0],
		active: days[(index * 5) % days.length],
		order: index,
		mrr: ((index * 7919) % 480000) / 100 + 9,
	};
});
type Person = (typeof people)[number];

const textColumns = [
	{ id: 'email', name: 'Email' },
	{ id: 'role', name: 'Role' },
	{ id: 'plan', name: 'Plan' },
	{ id: 'status', name: 'Status' },
	{ id: 'active', name: 'Last active' },
] as const;

const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const selections = ['none', 'single', 'multiple'] as const;
const actionsOn = ['none', 'action', 'link'] as const;

export function TablePlayground() {
	const [count, setCount] = useState(8);
	const [columnCount, setColumnCount] = useState(3);
	const [selectionMode, setSelectionMode] = useState<(typeof selections)[number]>('multiple');
	const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
	const [rowsDo, setRowsDo] = useState<(typeof actionsOn)[number]>('none');
	const [isSortable, setSortable] = useState(true);
	const [hasNumbers, setNumbers] = useState(true);
	const [hasMenu, setMenu] = useState(true);
	const [isLong, setLong] = useState(false);
	const [isFixed, setFixed] = useState(false);
	const [selected, setSelected] = useState<Selection>(new Set(['person-1']));
	const [sort, setSort] = useState<SortDescriptor>({ column: 'name', direction: 'ascending' });
	const [last, setLast] = useState('');

	const columns = textColumns.slice(0, Math.max(0, columnCount - 1));
	const rows = useMemo(() => {
		const list = people.slice(0, count).map((person) => (isLong && person.order % 3 === 0 ? { ...person, name: `${person.name}, ${longWords.toLowerCase()}` } : person));
		if (!isSortable) return list;
		const key = sort.column as keyof Person;
		const sorted = list.toSorted((a, b) => (typeof a[key] === 'number' ? (a[key] as number) - (b[key] as number) : String(a[key]).localeCompare(String(b[key]))));
		return sort.direction === 'descending' ? sorted.toReversed() : sorted;
	}, [count, isLong, isSortable, sort]);

	const shuffle = () => {
		setCount(pick([0, 3, 8, 8, 24, 200]));
		setColumnCount(2 + Math.floor(Math.random() * 5));
		setSelectionMode(pick(selections));
		setDensity(pick(['comfortable', 'compact'] as const));
		setRowsDo(pick(actionsOn));
		setSortable(Math.random() < 0.7);
		setNumbers(Math.random() < 0.6);
		setMenu(Math.random() < 0.5);
		setLong(Math.random() < 0.3);
		setFixed(Math.random() < 0.4);
	};

	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<NumberControl label="Rows" value={count} onChange={setCount} minValue={0} maxValue={500} />
					<NumberControl label="Columns" value={columnCount} onChange={setColumnCount} minValue={1} maxValue={textColumns.length + 1} />
					<Choice label="Selection" options={selections} value={selectionMode} onChange={setSelectionMode} />
					<Choice label="Density" options={['comfortable', 'compact'] as const} value={density} onChange={setDensity} />
					<Choice label="Pressing a row" options={actionsOn} value={rowsDo} onChange={setRowsDo} />
					<SwitchControl label="Sortable" value={isSortable} onChange={setSortable} />
					<SwitchControl label="Amount column" value={hasNumbers} onChange={setNumbers} />
					<SwitchControl label="Row menu" value={hasMenu} onChange={setMenu} />
					<SwitchControl label="Long names" value={isLong} onChange={setLong} />
					<SwitchControl label="Fixed height" value={isFixed} onChange={setFixed} />
				</>
			}
		>
			<div className="flex w-full flex-col gap-2">
				<Table
					aria-label="Members"
					density={density}
					selectionMode={selectionMode}
					selectedKeys={selected}
					onSelectionChange={setSelected}
					sortDescriptor={isSortable ? sort : undefined}
					onSortChange={setSort}
					onRowAction={rowsDo === 'action' ? (key) => setLast(`Opened ${people.find((person) => person.id === key)?.name}`) : undefined}
					className={['w-full', isFixed && 'max-h-80'].filter(Boolean).join(' ')}
				>
					<TableHeader>
						<Column id="name" isRowHeader allowsSorting={isSortable} defaultWidth="2fr" minWidth={128}>
							Name
						</Column>
						{columns.map((column) => (
							<Column key={column.id} id={column.id} allowsSorting={isSortable} minWidth={column.id === 'email' ? 128 : 88}>
								{column.name}
							</Column>
						))}
						{hasNumbers && (
							<Column id="mrr" align="end" allowsSorting={isSortable} minWidth={96}>
								Monthly
							</Column>
						)}
						{hasMenu && (
							<Column id="actions" width={52} minWidth={52}>
								<span className="sr-only">Actions</span>
							</Column>
						)}
					</TableHeader>
					<TableBody items={rows} dependencies={[columnCount, hasNumbers, hasMenu, rowsDo]} renderEmptyState={() => <EmptyState title="No members yet">Invite someone and they’ll show up here</EmptyState>}>
						{(person) => (
							<Row href={rowsDo === 'link' ? `#/ui/table?person=${person.id}` : undefined}>
								<Cell>
									<span className="min-w-0 truncate font-medium">{person.name}</span>
								</Cell>
								{columns.map((column) => (
									<Cell key={column.id} className={column.id === 'email' ? 'text-muted' : undefined}>
										{person[column.id]}
									</Cell>
								))}
								{hasNumbers && <Cell>{money.format(person.mrr)}</Cell>}
								{hasMenu && (
									<Cell>
										<RowActions aria-label={`Actions for ${person.name}`} onAction={(key) => setLast(`${key} ${person.name}`)}>
											<MenuItem id="Edit">Edit</MenuItem>
											<MenuItem id="Resend invite">Resend invite</MenuItem>
											<MenuSeparator />
											<MenuItem id="Remove" variant="danger">
												Remove
											</MenuItem>
										</RowActions>
									</Cell>
								)}
							</Row>
						)}
					</TableBody>
				</Table>
				<p aria-live="polite" className="min-h-4 text-label text-muted">
					{last}
				</p>
			</div>
		</Playground>
	);
}

// The stories below the playground

const team = people.slice(0, 6).map((person, index) => ({ ...person, role: index === 0 ? 'Owner' : person.role }));
/** A members table: an avatar, name over email, and a menu on each row */
export function MembersTable() {
	const [sort, setSort] = useState<SortDescriptor>({ column: 'name', direction: 'ascending' });
	const rows = team.toSorted((a, b) => String(a[sort.column as keyof Person]).localeCompare(String(b[sort.column as keyof Person])) * (sort.direction === 'ascending' ? 1 : -1));
	return (
		<Table aria-label="Members" selectionMode="multiple" sortDescriptor={sort} onSortChange={setSort} className="w-full">
			<TableHeader>
				<Column id="name" isRowHeader allowsSorting defaultWidth="2fr" minWidth={200}>
					Name
				</Column>
				<Column id="role" allowsSorting minWidth={96}>
					Role
				</Column>
				<Column id="active" allowsSorting minWidth={112}>
					Last active
				</Column>
				<Column id="actions" width={52} minWidth={52}>
					<span className="sr-only">Actions</span>
				</Column>
			</TableHeader>
			<TableBody items={rows}>
				{(person) => (
					<Row textValue={person.name}>
						<Cell>
							<Avatar name={person.name} aria-hidden="true" className="shrink-0" />
							<span className="flex min-w-0 flex-col">
								<span className="truncate font-medium">{person.name}</span>
								<span className="truncate text-label text-muted">{person.email}</span>
							</span>
						</Cell>
						<Cell>{person.role}</Cell>
						<Cell className="text-muted">{person.active}</Cell>
						<Cell>
							<RowActions aria-label={`Actions for ${person.name}`}>
								<MenuItem>Change role</MenuItem>
								<MenuItem>Resend invite</MenuItem>
								<MenuSeparator />
								<MenuItem variant="danger">Remove from team</MenuItem>
							</RowActions>
						</Cell>
					</Row>
				)}
			</TableBody>
		</Table>
	);
}

const invoiceList = [
	{ id: 'INV-0142', customer: 'Northwind Traders', issued: '12 Nov 2026', amount: 4820, status: 'Overdue' },
	{ id: 'INV-0141', customer: 'Fabrikam', issued: '8 Nov 2026', amount: 1250, status: 'Due' },
	{ id: 'INV-0140', customer: 'Contoso', issued: '1 Nov 2026', amount: 18400.5, status: 'Paid' },
	{ id: 'INV-0139', customer: 'Tailspin Toys', issued: '28 Oct 2026', amount: 96, status: 'Paid' },
	{ id: 'INV-0138', customer: 'Wide World Importers', issued: '21 Oct 2026', amount: 2310.75, status: 'Paid' },
	{ id: 'INV-0137', customer: 'Adventure Works Cycles and Outdoor Equipment', issued: '14 Oct 2026', amount: 740, status: 'Draft' },
] as const;

const statusTone = {
	Paid: 'text-ink',
	Due: 'text-muted',
	Overdue: 'text-danger',
	Draft: 'text-muted',
} as const;

/** An invoices table: numbers aligned by their digits, a status, and rows that open the invoice */
export function InvoicesTable() {
	const [sort, setSort] = useState<SortDescriptor>({ column: 'issued', direction: 'descending' });
	const [opened, setOpened] = useState('');
	const rows = sort.column === 'amount' ? invoiceList.toSorted((a, b) => (a.amount - b.amount) * (sort.direction === 'ascending' ? 1 : -1)) : sort.direction === 'descending' ? invoiceList : invoiceList.toReversed();
	return (
		<div className="flex w-full flex-col gap-2">
			<Table aria-label="Invoices" density="compact" sortDescriptor={sort} onSortChange={setSort} onRowAction={(key) => setOpened(`Opened ${key}`)} className="w-full">
				<TableHeader>
					<Column id="number" isRowHeader width={104} minWidth={104}>
						Invoice
					</Column>
					<Column id="customer" defaultWidth="2fr" minWidth={160}>
						Customer
					</Column>
					<Column id="issued" allowsSorting minWidth={112}>
						Issued
					</Column>
					<Column id="status" minWidth={96}>
						Status
					</Column>
					<Column id="amount" align="end" allowsSorting minWidth={112}>
						Amount
					</Column>
				</TableHeader>
				<TableBody items={rows}>
					{(invoice) => (
						<Row id={invoice.id}>
							<Cell className="font-mono text-label">{invoice.id}</Cell>
							<Cell>{invoice.customer}</Cell>
							<Cell className="text-muted">{invoice.issued}</Cell>
							<Cell className={statusTone[invoice.status]}>
								<span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
								{invoice.status}
							</Cell>
							<Cell>{money.format(invoice.amount)}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
			<p aria-live="polite" className="min-h-4 text-label text-muted">
				{opened}
			</p>
		</div>
	);
}

/** Nothing to show yet, with the library's EmptyState in place of the rows */
export function EmptyTable() {
	return (
		<Table aria-label="Projects" className="w-full">
			<TableHeader>
				<Column isRowHeader defaultWidth="2fr">
					Project
				</Column>
				<Column>Client</Column>
				<Column align="end">Budget</Column>
			</TableHeader>
			<TableBody renderEmptyState={() => <EmptyState title="No projects yet">Projects you start, or are added to, show up here</EmptyState>}>{[]}</TableBody>
		</Table>
	);
}

/** A fixed height, so the header stays put, and more rows load as the last one scrolls into view */
export function LoadingMoreTable() {
	const [count, setCount] = useState(20);
	const [isLoading, setLoading] = useState(false);
	const loadMore = () => {
		if (isLoading || count >= 120) return;
		setLoading(true);
		setTimeout(() => {
			setCount((value) => value + 20);
			setLoading(false);
		}, 900);
	};
	return (
		<Table aria-label="Customers" density="compact" className="max-h-80 w-full">
			<TableHeader>
				<Column isRowHeader defaultWidth="2fr" minWidth={160}>
					Customer
				</Column>
				<Column minWidth={96}>Plan</Column>
				<Column align="end" minWidth={104}>
					Monthly
				</Column>
			</TableHeader>
			<TableBody dependencies={[isLoading]}>
				<Collection items={people.slice(0, count)}>
					{(person) => (
						<Row>
							<Cell>{person.name}</Cell>
							<Cell className="text-muted">{person.plan}</Cell>
							<Cell>{money.format(person.mrr)}</Cell>
						</Row>
					)}
				</Collection>
				<TableLoadMore isLoading={isLoading} onLoadMore={loadMore} />
			</TableBody>
		</Table>
	);
}
