import { parseDate, parseTime } from '@internationalized/date';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { type ReactNode, useEffect, useId, useState } from 'react';
import { Alert, Avatar, AvatarGroup, Breadcrumb, Breadcrumbs, Button, Card, Cell, Checkbox, CheckboxGroup, Code, Column, ComboBox, DatePicker, DateRangePicker, Dialog, DialogActions, DialogClose, DialogHeading, DialogTrigger, Disclosure, DisclosureHeader, DisclosurePanel, DropZone, EmptyState, FileTrigger, GridList, GridListItem, Link, List, ListBoxItem, ListItem, Menu, MenuItem, MenuSeparator, MenuTrigger, Meter, Modal, NumberField, Pagination, ProgressBar, Quote, Radio, RadioGroup, Row, RowActions, SearchField, Select, Separator, Slider, Status, Switch, Tab, TabList, TabPanel, Table, TableBody, TableHeader, Tabs, Tag, TagGroup, TextField, TimeField, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger } from '../../src/index.js';
import { type Node, type Panel, type Values, resolve } from './catalogue.js';
import { code as frame } from '../../src/Code.js';
import { Choice, ControlGroup, SliderControl, SwitchControl, TextControl } from '../controls.js';

// Draws a tree that validate() passed, with Loupe's components and nothing else. Layout is a few fixed classes,
// written out whole so Tailwind finds them. A grid's columns follow its own width, through a container query,
// since a view can be drawn in a narrow drawer as well as across a page

type Props = Record<string, unknown>;
interface Option {
	id: string;
	name: string;
}

// The checker has passed it as YYYY-MM-DD, but a control can still type anything into one
const dateOf = (value: unknown) => {
	try {
		return typeof value === 'string' ? parseDate(value) : undefined;
	} catch {
		return undefined;
	}
};

const timeOf = (value: unknown) => {
	try {
		return typeof value === 'string' ? parseTime(value) : undefined;
	} catch {
		return undefined;
	}
};

// A number as Intl shows it: a percentage, an amount in a currency, or as it is
const formatOf = (p: Props): Intl.NumberFormatOptions | undefined =>
	p.format === 'percent' ? { style: 'percent' } : p.format === 'currency' ? { style: 'currency', currency: (p.currency as string | undefined) ?? 'GBP' } : undefined;

// Its own page, as a view has nothing to fetch the others from
function Pages({ page, count }: { page: number; count: number }) {
	const [current, setCurrent] = useState(page);
	return <Pagination page={current} count={count} onChange={setCurrent} />;
}

interface Action {
	label: string;
	action?: string;
	isDanger?: boolean;
}

const gap: Record<number, string> = { 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10' };
const justify: Record<string, string> = { start: 'justify-start', between: 'justify-between', end: 'justify-end' };
const align: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end' };
// A stat card reads at 7rem, so three sit side by side from 24rem, and four pair off first
const columns: Record<number, string> = { 2: '@xs:grid-cols-2', 3: '@sm:grid-cols-3', 4: '@xs:grid-cols-2 @2xl:grid-cols-4' };
// The narrow column at 16rem beside the rest, once the view is 42rem wide
const split = { start: '@2xl:grid-cols-[16rem_minmax(0,1fr)]', end: '@2xl:grid-cols-[minmax(0,1fr)_16rem]' } as const;
// What the full-size view can be framed at: a phone, a tablet, a laptop, or all the room there is
const devices = { phone: 'max-w-[24rem]', tablet: 'max-w-[48rem]', laptop: 'max-w-[80rem]', fill: '' } as const;
type Device = keyof typeof devices;
const headings = { page: 'text-title', section: 'text-body font-medium', group: 'text-label text-muted' } as const;
const tones = { default: '', muted: 'text-muted', danger: 'text-danger' } as const;
const sizes = { body: 'text-body', title: 'text-title', label: 'text-label' } as const;

const status = (p: Props, key?: string | number) => (
	<Status key={key} tone={p.tone as never} variant={p.variant as never}>
		{p.label as string}
	</Status>
);

// A Menu's items, or a table row's: the safe ones, then a line, then the ones that delete
const menuItems = (actions: Action[], onAction?: (message: string) => void) => {
	const safe = actions.filter((item) => !item.isDanger);
	const danger = actions.filter((item) => item.isDanger);
	const item = (entry: Action, index: number) => (
		<MenuItem key={`${entry.label}-${index}`} id={`${entry.label}-${index}`} variant={entry.isDanger ? 'danger' : undefined} onAction={() => entry.action && onAction?.(entry.action)}>
			{entry.label}
		</MenuItem>
	);
	return [...safe.map(item), ...(safe.length > 0 && danger.length > 0 ? [<MenuSeparator key="separator" />] : []), ...danger.map(item)];
};

const table = (p: Props, key?: string | number, onAction?: (message: string) => void) => {
	const cols = p.columns as { id: string; name: string; align?: 'start' | 'end'; isRowHeader?: boolean }[];
	const rows = p.rows as { id: string; cells: (string | number | Props)[]; actions?: Action[] }[];
	// The actions column is there once any row has some, and a row without any leaves its cell empty
	const hasActions = rows.some((row) => row.actions?.length);
	const header = Math.max(0, cols.findIndex((column) => column.isRowHeader));
	const nameOf = (cell: string | number | Props | undefined) => (typeof cell === 'object' ? String(cell.label) : String(cell ?? ''));
	return (
		<Table key={key} aria-label={p.label as string} density={p.density as never} variant={p.variant as never}>
			<TableHeader>
				{cols.map((column) => (
					<Column key={column.id} id={column.id} isRowHeader={column.isRowHeader} align={column.align}>{column.name}</Column>
				))}
				{hasActions && <Column id="actions" aria-label="Actions" width={52} />}
			</TableHeader>
			<TableBody renderEmptyState={() => <p className="p-4 text-body text-muted">{(p.empty as string | undefined) ?? 'Nothing here yet'}</p>}>
				{rows.map((row) => (
					<Row key={row.id} id={row.id}>
						{row.cells.map((cell, index) => (
							<Cell key={cols[index].id} align={cols[index].align} className={cols[index].align === 'end' ? 'tabular-nums' : undefined}>
								{typeof cell === 'object' ? status(cell) : cell}
							</Cell>
						))}
						{hasActions && <Cell key="actions">{row.actions?.length ? <RowActions aria-label={`Actions for ${nameOf(row.cells[header])}`}>{menuItems(row.actions, onAction)}</RowActions> : null}</Cell>}
					</Row>
				))}
			</TableBody>
		</Table>
	);
};

export interface GeneratedProps {
	ui: Node;
	/** Names the view, on the bar over it */
	title?: string;
	/** A Button's action, sent on as the next message */
	onAction?: (message: string) => void;
	/** What the view's values start at, which its controls move */
	values?: Values;
	/** Its controls, from panelOf */
	panel?: Panel[];
	/** Each time a control moves, with every value as it now is */
	onValuesChange?: (values: Values) => void;
}

/**
 * A view Claude made with render_ui, in a sandbox: its name on a bar over it, as a block of code has, the controls to
 * tweak it, which redraw it here as they move, and a footer to copy it as JSX, as it is now
 */
export function Generated({ ui, title, onAction, values: initial, panel, onValuesChange }: GeneratedProps) {
	const [values, setValues] = useState<Values>(initial ?? {});
	const change = (next: Values) => {
		setValues(next);
		onValuesChange?.(next);
	};
	const set = (name: string, value: string | number | boolean) => change({ ...values, [name]: value });
	const [isCopied, setCopied] = useState(false);
	// Loaded when it's first copied, rather than imported, as it names components from all of the preview's stories,
	// which would load them all with it. The preview has them already, so it's there straight away
	const copy = () =>
		void import('../code.js')
			.then(({ codeOf }) => navigator.clipboard.writeText(codeOf(drawn)))
			.then(() => setCopied(true));
	useEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1000);
		return () => clearTimeout(timer);
	}, [isCopied]);
	const shown = resolve(ui, values);
	const draw = (node: Node, key?: string | number): ReactNode => {
		const p = node as Props;
		const kids = () => node.children?.map((child, index) => draw(child, index));
		switch (node.type) {
			case 'Stack':
				return <div key={key} className={`flex min-w-0 flex-col ${gap[(p.gap as number) ?? 4]} ${p.width === 'narrow' ? 'w-full max-w-xl' : ''}`}>{kids()}</div>;
			case 'Split': {
				// The columns in the order they sit, so the source reads as the page does, and side says which is narrow
				const [first, second] = node.children ?? [];
				return (
					<div key={key} className={`grid min-w-0 grid-cols-1 items-start ${gap[(p.gap as number) ?? 8]} ${split[p.side === 'end' ? 'end' : 'start']}`}>
						<div className="flex min-w-0 flex-col">{first && draw(first)}</div>
						<div className="flex min-w-0 flex-col">{second && draw(second)}</div>
					</div>
				);
			}
			case 'Row':
				return <div key={key} className={`flex min-w-0 flex-wrap ${gap[(p.gap as number) ?? 2]} ${justify[(p.justify as string) ?? 'start']} ${align[(p.align as string) ?? 'center']}`}>{kids()}</div>;
			case 'Grid':
				return <div key={key} className={`grid grid-cols-1 ${columns[p.columns as number]} ${gap[(p.gap as number) ?? 4]}`}>{kids()}</div>;
			case 'Card': {
				const actions = (p.actions as Node[] | undefined) ?? [];
				// A section's heading is h3, so a card's title under it is h4
				return (
					<Card key={key} title={p.title as string | undefined} headingLevel={4} figure={p.figure as string | undefined} description={p.description as string | undefined} fill={p.fill as never} actions={actions.length ? actions.map((action, index) => draw(action, index)) : undefined}>
						{node.children?.length ? kids() : undefined}
					</Card>
				);
			}
			case 'List': {
				const items = p.items as { title: string; description?: string; icon?: IconName; end?: string | number | Props }[];
				return (
					<List key={key} variant={p.variant as never} aria-label={p.label as string | undefined}>
						{items.map((item, index) => (
							<ListItem key={index} icon={item.icon && <Icon name={item.icon} />} description={item.description} end={typeof item.end === 'object' ? status(item.end) : item.end}>
								{item.title}
							</ListItem>
						))}
					</List>
				);
			}
			case 'Heading': {
				const Level = p.level === 'page' ? 'h2' : p.level === 'section' ? 'h3' : 'h4';
				return <Level key={key} className={`text-pretty ${headings[p.level as keyof typeof headings]}`}>{p.text as string}</Level>;
			}
			case 'Text':
				return <p key={key} className={`text-pretty ${sizes[(p.size as keyof typeof sizes) ?? 'body']} ${tones[(p.tone as keyof typeof tones) ?? 'default']}`}>{p.text as string}</p>;
			case 'Separator':
				return <Separator key={key} />;
			case 'Button':
				return button(p, key);
			case 'Status':
				return status(p, key);
			case 'Alert':
				return <Alert key={key} tone={p.tone as never} variant={p.variant as never} title={p.title as string | undefined}>{p.text as string}</Alert>;
			case 'EmptyState':
				return <EmptyState key={key} title={p.title as string} actions={p.action ? button(p.action as Props) : undefined}>{p.text as string | undefined}</EmptyState>;
			case 'ProgressBar':
				return <ProgressBar key={key} label={p.label as string} value={p.value as number | undefined} isIndeterminate={p.value === undefined} valueLabel={p.valueLabel as string | undefined} />;
			case 'Meter':
				return <Meter key={key} label={p.label as string} value={p.value as number} valueLabel={p.valueLabel as string | undefined} />;
			case 'Avatar':
				return <Avatar key={key} name={p.name as string} size={p.size === undefined ? undefined : (String(p.size) as never)} shape={p.shape as never} />;
			case 'Quote':
				return <Quote key={key} cite={p.cite as string | undefined} variant={p.variant as never}>{p.text as string}</Quote>;
			case 'TextField':
				return <TextField key={key} label={p.label as string} description={p.description as string | undefined} placeholder={p.placeholder as string | undefined} defaultValue={p.value as string | undefined} isMultiline={p.isMultiline as boolean | undefined} />;
			case 'Switch':
				return <Switch key={key} defaultSelected={p.isSelected as boolean | undefined}>{p.label as string}</Switch>;
			case 'Checkbox':
				return <Checkbox key={key} defaultSelected={p.isSelected as boolean | undefined}>{p.label as string}</Checkbox>;
			case 'Select':
				return (
					<Select key={key} label={p.label as string} items={p.options as Option[]} defaultSelectedKey={p.selected as string | undefined}>
						{(option: Option) => <ListBoxItem id={option.id}>{option.name}</ListBoxItem>}
					</Select>
				);
			case 'DatePicker':
				return <DatePicker key={key} label={p.label as string} description={p.description as string | undefined} defaultValue={dateOf(p.value)} minValue={dateOf(p.minValue)} />;
			case 'DateRangePicker': {
				const [start, end] = [dateOf(p.start), dateOf(p.end)];
				return <DateRangePicker key={key} label={p.label as string} description={p.description as string | undefined} defaultValue={start && end ? { start, end } : undefined} minValue={dateOf(p.minValue)} />;
			}
			case 'NumberField':
				return <NumberField key={key} label={p.label as string} description={p.description as string | undefined} defaultValue={p.value as number | undefined} minValue={p.minValue as number | undefined} maxValue={p.maxValue as number | undefined} step={p.step as number | undefined} formatOptions={formatOf(p)} />;
			case 'Slider':
				return <Slider<number | number[]> key={key} label={p.label as string} description={p.description as string | undefined} defaultValue={p.end === undefined ? ((p.value as number | undefined) ?? (p.minValue as number | undefined) ?? 0) : [(p.value as number | undefined) ?? (p.minValue as number | undefined) ?? 0, p.end as number]} thumbLabels={p.end === undefined ? undefined : ['Minimum', 'Maximum']} minValue={p.minValue as number | undefined} maxValue={p.maxValue as number | undefined} step={p.step as number | undefined} formatOptions={formatOf(p)} />;
			case 'SearchField':
				return <SearchField key={key} aria-label={p.label as string} placeholder={p.placeholder as string | undefined} />;
			case 'ComboBox':
				return (
					<ComboBox key={key} label={p.label as string} description={p.description as string | undefined} placeholder={p.placeholder as string | undefined} defaultItems={p.options as Option[]} defaultSelectedKey={p.selected as string | undefined}>
						{(option: Option) => <ListBoxItem id={option.id}>{option.name}</ListBoxItem>}
					</ComboBox>
				);
			case 'CheckboxGroup':
				return (
					<CheckboxGroup key={key} label={p.label as string} description={p.description as string | undefined} defaultValue={p.selected as string[] | undefined}>
						{(p.options as Option[]).map((option) => (
							<Checkbox key={option.id} value={option.id}>{option.name}</Checkbox>
						))}
					</CheckboxGroup>
				);
			case 'ToggleButtonGroup': {
				const options = p.options as Option[];
				return (
					<ToggleButtonGroup key={key} aria-label={p.label as string} size={p.size as never} width={p.width as never} defaultSelectedKeys={[(p.selected as string | undefined) ?? options[0].id]}>
						{options.map((option) => (
							<ToggleButton key={option.id} id={option.id}>{option.name}</ToggleButton>
						))}
					</ToggleButtonGroup>
				);
			}
			case 'TimeField':
				return <TimeField key={key} label={p.label as string} description={p.description as string | undefined} defaultValue={timeOf(p.value)} />;
			case 'TagGroup':
				return (
					<TagGroup key={key} label={p.label as string} description={p.description as string | undefined} selectionMode={p.selectionMode as never} defaultSelectedKeys={p.selected as string[] | undefined} items={p.tags as Option[]}>
						{(tag: Option) => <Tag id={tag.id} textValue={tag.name}>{tag.name}</Tag>}
					</TagGroup>
				);
			case 'DropZone':
				return (
					<DropZone key={key} label={p.label as string} acceptedFileTypes={p.types as string[] | undefined} className="w-full">
						<FileTrigger allowsMultiple={p.isMultiple as boolean | undefined} acceptedFileTypes={p.types as string[] | undefined}>
							<Button variant="secondary" size="small">{(p.button as string | undefined) ?? (p.isMultiple ? 'Choose files' : 'Choose a file')}</Button>
						</FileTrigger>
					</DropZone>
				);
			case 'Link':
				return <Link key={key} onPress={() => typeof p.action === 'string' && onAction?.(p.action)}>{p.text as string}</Link>;
			case 'Breadcrumbs':
				return (
					<Breadcrumbs key={key}>
						{(p.trail as string[]).map((name, index, trail) => (
							<Breadcrumb key={index} href={index < trail.length - 1 ? '#' : undefined}>{name}</Breadcrumb>
						))}
					</Breadcrumbs>
				);
			case 'Pagination':
				return <Pages key={key} page={p.page as number} count={p.count as number} />;
			case 'Menu':
				return (
					<MenuTrigger key={key}>
						<Button variant={(p.variant as never) ?? 'secondary'}>{p.label as string}</Button>
						<Menu>{menuItems(p.actions as Action[], onAction)}</Menu>
					</MenuTrigger>
				);
			case 'GridList': {
				const items = p.items as { id: string; title: string; description?: string; status?: Props; action?: string }[];
				return (
					<GridList key={key} aria-label={p.label as string} layout={p.layout as never} items={items} onAction={(id) => { const action = items.find((entry) => entry.id === id)?.action; if (action) onAction?.(action); }} renderEmptyState={() => <p className="p-4 text-body text-muted">{(p.empty as string | undefined) ?? 'Nothing here yet'}</p>}>
						{(entry) => (
							<GridListItem id={entry.id} textValue={entry.title}>
								<span className="flex min-w-0 flex-1 flex-col">
									<span className="truncate font-medium">{entry.title}</span>
									{entry.description && <span className="truncate text-label text-muted">{entry.description}</span>}
								</span>
								{entry.status && status(entry.status)}
							</GridListItem>
						)}
					</GridList>
				);
			}
			case 'AvatarGroup':
				return (
					<AvatarGroup key={key} maxVisible={p.maxVisible as number | undefined} size={p.size === undefined ? undefined : (Number(p.size) as never)}>
						{(p.names as string[]).map((name, index) => (
							<Avatar key={`${name}-${index}`} name={name} />
						))}
					</AvatarGroup>
				);
			case 'Disclosure':
				return (
					<Disclosure key={key} defaultExpanded={p.isExpanded as boolean | undefined}>
						<DisclosureHeader>{p.title as string}</DisclosureHeader>
						<DisclosurePanel>
							<div className="flex flex-col gap-4">{kids()}</div>
						</DisclosurePanel>
					</Disclosure>
				);
			case 'Code':
				return <Code key={key} code={p.code as string} title={p.title as string | undefined} />;
			case 'Dialog': {
				const trigger = p.trigger as Props;
				return (
					<DialogTrigger key={key}>
						<Button variant={trigger.variant as never} size={trigger.size as never}>{trigger.label as string}</Button>
						<Modal size={p.size as never}>
							<Dialog>
								<DialogHeading>{p.heading as string}</DialogHeading>
								{node.children?.length ? <div className="mt-2 flex flex-col gap-4">{kids()}</div> : null}
								<DialogActions>
									<Button slot="close" variant="secondary">{(p.cancel as string | undefined) ?? 'Cancel'}</Button>
									<Button slot="close" variant={p.tone === 'danger' ? 'danger' : 'primary'} onPress={() => typeof p.action === 'string' && onAction?.(p.action)}>
										{p.confirm as string}
									</Button>
								</DialogActions>
							</Dialog>
						</Modal>
					</DialogTrigger>
				);
			}
			case 'RadioGroup':
				return (
					<RadioGroup key={key} label={p.label as string} defaultValue={p.selected as string | undefined}>
						{(p.options as Option[]).map((option) => (
							<Radio key={option.id} value={option.id}>{option.name}</Radio>
						))}
					</RadioGroup>
				);
			case 'Table':
				return table(p, key, onAction);
			case 'Tabs': {
				const tabs = p.tabs as { id: string; name: string; content: Node }[];
				return (
					<Tabs key={key}>
						<TabList aria-label={p.label as string}>
							{tabs.map((tab) => (
								<Tab key={tab.id} id={tab.id}>{tab.name}</Tab>
							))}
						</TabList>
						{tabs.map((tab) => (
							<TabPanel key={tab.id} id={tab.id}>{draw(tab.content)}</TabPanel>
						))}
					</Tabs>
				);
			}
			default:
				return null;
		}
	};

	const button = (p: Props, key?: string | number) => (
		<Button key={key} variant={p.variant as never} size={p.size as never} onPress={() => typeof p.action === 'string' && onAction?.(p.action)}>
			{p.label as string}
		</Button>
	);

	const controls = panel?.filter((group) => group.items.length);
	const drawn = shown && draw(shown);
	const isMoved = Object.entries(values).some(([name, value]) => initial?.[name] !== value);
	const { base, bar, title: name, swap, gone } = frame({ hasBar: true });
	const copyLabel = isCopied ? 'Copied' : 'Copy code';
	// Named by its title outright, as not every screen reader names a figure from its caption
	const titleId = useId();
	const fullTitleId = useId();
	const [isFull, setFull] = useState(false);
	const [device, setDevice] = useState<Device>('fill');
	const reset = isMoved && (
		<Button variant="ghost" size="small" onPress={() => change(initial ?? {})}>
			Reset
		</Button>
	);
	const copyButton = (
		<TooltipTrigger>
			<Button variant="ghost" size="small" aria-label={copyLabel} onPress={copy}>
				<span className={swap()}>
					<span className={isCopied ? gone() : undefined}>
						<Icon name="square-on-square" />
					</span>
					<span className={isCopied ? undefined : gone()}>
						<Icon name="checkmark" />
					</span>
				</span>
			</Button>
			<Tooltip>{copyLabel}</Tooltip>
		</TooltipTrigger>
	);
	const controlsOf = (className: string) =>
		controls?.length ? (
			<section aria-label="Controls" className={className}>
				{controls.map((group) => (
					<ControlGroup key={group.group} label={group.group}>
						{group.items.map(({ label, value: id, control }) => {
							const value = values[id];
							if (control.kind === 'slider') return <SliderControl key={id} label={label} value={value as number} onChange={(next) => set(id, next)} minValue={control.min} maxValue={control.max} steps={control.steps} scale={control.scale} unit={control.unit} />;
							if (control.kind === 'choice') return <Choice key={id} label={label} options={control.options} value={value as string} onChange={(next) => set(id, next)} />;
							if (control.kind === 'switch') return <SwitchControl key={id} label={label} value={value as boolean} onChange={(next) => set(id, next)} />;
							return <TextControl key={id} label={label} value={value as string} onChange={(next) => set(id, next)} />;
						})}
					</ControlGroup>
				))}
			</section>
		) : null;
	return (
		<figure aria-labelledby={titleId} className={base()}>
			{/* As a block of code's: its name, then Reset once something's moved, Copy as an icon, and full size at the end */}
			<figcaption className={bar()}>
				<span id={titleId} className={name()}>{title ?? 'View'}</span>
				{reset}
				{copyButton}
				<TooltipTrigger>
					<Button variant="ghost" size="small" aria-label="Full size" onPress={() => setFull(true)}>
						<Icon name="arrow-up-right-and-arrow-down-left" />
					</Button>
					<Tooltip>Full size</Tooltip>
				</TooltipTrigger>
			</figcaption>
			{/* On the code's ground, a step up from the bar, which casts the line between them as a block of code does. The
			    controls share it, under the view, parted from it by a line */}
			<div className="relative flex flex-col bg-code-ground shadow-[0_-.5px_var(--edge),0_-1px_3px_-1.5px_var(--shadow-raised-color)]">
				<div className="@container flex min-w-0 flex-col p-4">{drawn}</div>
				{controlsOf('flex flex-col border-t border-bleed/8 px-4 pt-3 pb-1')}
			</div>
			{/* The same view across the window, as wide as a page would have it, with its controls beside it where there's
			    room. Its values are the ones here, so a control moved in one has moved in both */}
			<Modal size="full" isDismissable isOpen={isFull} onOpenChange={setFull}>
				<Dialog aria-labelledby={fullTitleId} className="flex h-full flex-col p-0">
					<div className="flex items-center gap-1 border-b border-bleed/8 py-2 ps-(--dialog-padding) pe-3">
						<span id={fullTitleId} className="min-w-0 flex-1 truncate py-(--button-small-padding-y) text-body font-medium">{title ?? 'View'}</span>
						{/* Only the preview's frame, like a device's, so it never reaches the code that's copied */}
						<Choice label="Width" options={Object.keys(devices) as Device[]} value={device} onChange={setDevice} />
						{reset}
						{copyButton}
						<DialogClose className="" />
					</div>
					<div className="flex min-h-0 flex-1 flex-col overflow-auto lg:flex-row">
						<div className={`flex min-w-0 flex-1 flex-col lg:overflow-auto ${device === 'fill' ? '' : 'bg-code-ground p-4'}`}>
							<div className={`@container mx-auto flex w-full min-w-0 flex-col p-(--dialog-padding) ${devices[device]} ${device === 'fill' ? '' : 'min-h-full rounded-lg bg-(--modal-fill,var(--color-overlay)) shadow-panel'}`}>{isFull && drawn}</div>
						</div>
						{controlsOf('flex shrink-0 flex-col border-t border-bleed/8 px-(--dialog-padding) pt-3 pb-1 lg:w-80 lg:overflow-auto lg:border-t-0 lg:border-s')}
					</div>
				</Dialog>
			</Modal>
		</figure>
	);
}
