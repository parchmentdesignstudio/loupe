import { type ReactNode, useState } from 'react';
import { Alert, Avatar, Button, Cell, Checkbox, Column, EmptyState, ListBoxItem, Meter, ProgressBar, Quote, Radio, RadioGroup, Row, Select, Separator, Status, Switch, Tab, TabList, TabPanel, Table, TableBody, TableHeader, Tabs, TextField } from '../../src/index.js';
import { type Node, type Panel, type Values, resolve } from './catalogue.js';
import { Choice, ControlGroup, SliderControl, SwitchControl, TextControl } from '../controls.js';

// Draws a tree that validate() passed, with Loupe's components and nothing else. Layout is a few fixed classes,
// written out whole so Tailwind finds them. A grid's columns follow its own width, through a container query,
// since a view can be drawn in a narrow drawer as well as across a page

type Props = Record<string, unknown>;
interface Option {
	id: string;
	name: string;
}

const gap: Record<number, string> = { 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10' };
const justify: Record<string, string> = { start: 'justify-start', between: 'justify-between', end: 'justify-end' };
const align: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end' };
// A stat card reads at 7rem, so three sit side by side from 24rem, and four pair off first
const columns: Record<number, string> = { 2: '@xs:grid-cols-2', 3: '@sm:grid-cols-3', 4: '@xs:grid-cols-2 @2xl:grid-cols-4' };
const headings = { page: 'text-title', section: 'text-body font-medium', group: 'text-label text-muted' } as const;
const tones = { default: '', muted: 'text-muted', danger: 'text-danger' } as const;
const sizes = { body: 'text-body', title: 'text-title tabular-nums', label: 'text-label' } as const;

const status = (p: Props, key?: string | number) => (
	<Status key={key} tone={p.tone as never} variant={p.variant as never}>
		{p.label as string}
	</Status>
);

const table = (p: Props, key?: string | number) => {
	const cols = p.columns as { id: string; name: string; align?: 'start' | 'end'; isRowHeader?: boolean }[];
	const rows = p.rows as { id: string; cells: (string | number | Props)[] }[];
	return (
		<Table key={key} aria-label={p.label as string} density={p.density as never} variant={p.variant as never}>
			<TableHeader>
				{cols.map((column) => (
					<Column key={column.id} id={column.id} isRowHeader={column.isRowHeader} align={column.align}>{column.name}</Column>
				))}
			</TableHeader>
			<TableBody renderEmptyState={() => <p className="p-4 text-body text-muted">{(p.empty as string | undefined) ?? 'Nothing here yet'}</p>}>
				{rows.map((row) => (
					<Row key={row.id} id={row.id}>
						{row.cells.map((cell, index) => (
							<Cell key={cols[index].id} align={cols[index].align} className={cols[index].align === 'end' ? 'tabular-nums' : undefined}>
								{typeof cell === 'object' ? status(cell) : cell}
							</Cell>
						))}
					</Row>
				))}
			</TableBody>
		</Table>
	);
};

export interface GeneratedProps {
	ui: Node;
	/** A Button's action, sent on as the next message */
	onAction?: (message: string) => void;
	/** What the view's values start at, which its controls move */
	values?: Values;
	/** Its controls, from panelOf */
	panel?: Panel[];
	/** Each time a control moves, with every value as it now is */
	onValuesChange?: (values: Values) => void;
}

/** A view Claude made with render_ui, and the controls to tweak it, which redraw it here as they move */
export function Generated({ ui, onAction, values: initial, panel, onValuesChange }: GeneratedProps) {
	const [values, setValues] = useState<Values>(initial ?? {});
	const set = (name: string, value: string | number | boolean) => {
		const next = { ...values, [name]: value };
		setValues(next);
		onValuesChange?.(next);
	};
	const shown = resolve(ui, values);
	const draw = (node: Node, key?: string | number): ReactNode => {
		const p = node as Props;
		const kids = () => node.children?.map((child, index) => draw(child, index));
		switch (node.type) {
			case 'Stack':
				return <div key={key} className={`flex min-w-0 flex-col ${gap[(p.gap as number) ?? 4]}`}>{kids()}</div>;
			case 'Row':
				return <div key={key} className={`flex min-w-0 flex-wrap ${gap[(p.gap as number) ?? 2]} ${justify[(p.justify as string) ?? 'start']} ${align[(p.align as string) ?? 'center']}`}>{kids()}</div>;
			case 'Grid':
				return <div key={key} className={`grid grid-cols-1 ${columns[p.columns as number]} ${gap[(p.gap as number) ?? 4]}`}>{kids()}</div>;
			case 'Card':
				return <div key={key} className="flex min-w-0 flex-col gap-2 rounded-xl bg-panel p-4 shadow-panel">{kids()}</div>;
			case 'Heading': {
				const Tag = p.level === 'page' ? 'h2' : p.level === 'section' ? 'h3' : 'h4';
				return <Tag key={key} className={`text-pretty ${headings[p.level as keyof typeof headings]}`}>{p.text as string}</Tag>;
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
			case 'RadioGroup':
				return (
					<RadioGroup key={key} label={p.label as string} defaultValue={p.selected as string | undefined}>
						{(p.options as Option[]).map((option) => (
							<Radio key={option.id} value={option.id}>{option.name}</Radio>
						))}
					</RadioGroup>
				);
			case 'Table':
				return table(p, key);
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
	return (
		<div className="@container flex min-w-0 flex-col gap-4">
			{shown && draw(shown)}
			{controls?.length ? (
				// The playground's own rows, in a well under the view, so it reads as the view's controls, not part of it
				<section aria-label="Controls" className="flex flex-col rounded-lg bg-bleed/4 px-3 pt-2 pb-1">
					{controls.map((group) => (
						<ControlGroup key={group.group} label={group.group}>
							{group.items.map(({ label, value: name, control }) => {
								const value = values[name];
								if (control.kind === 'slider') return <SliderControl key={name} label={label} value={value as number} onChange={(next) => set(name, next)} minValue={control.min} maxValue={control.max} steps={control.steps} scale={control.scale} unit={control.unit} />;
								if (control.kind === 'choice') return <Choice key={name} label={label} options={control.options} value={value as string} onChange={(next) => set(name, next)} />;
								if (control.kind === 'switch') return <SwitchControl key={name} label={label} value={value as boolean} onChange={(next) => set(name, next)} />;
								return <TextControl key={name} label={label} value={value as string} onChange={(next) => set(name, next)} />;
							})}
						</ControlGroup>
					))}
				</section>
			) : null}
		</div>
	);
}
