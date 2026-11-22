import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import details from 'virtual:details';
import { blocksOf, gaps, inputSchemaOf, panelOf, validate, type Node } from '../preview/genui/catalogue.js';
import { Generated } from '../preview/genui/render.js';

const schema = inputSchemaOf(blocksOf(details));

const invoices: Node = {
	type: 'Stack',
	gap: 8,
	children: [
		{ type: 'Row', justify: 'between', children: [{ type: 'Heading', level: 'page', text: 'Overdue invoices' }, { type: 'Button', label: 'Send reminders', variant: 'primary', action: 'Send reminders for every overdue invoice' }] },
		{
			type: 'Table',
			label: 'Overdue invoices',
			columns: [
				{ id: 'client', name: 'Client', isRowHeader: true },
				{ id: 'status', name: 'Status' },
				{ id: 'amount', name: 'Amount', align: 'end' },
			],
			rows: [
				{ id: 'inv-1', cells: ['Harlow & Finch', { type: 'Status', label: 'Overdue', tone: 'danger' }, '£2,400.00'] },
				{ id: 'inv-2', cells: ['Marsh Lane Bakery', { type: 'Status', label: 'Due today', tone: 'warning' }, '£318.50'] },
			],
		},
	],
};

// A project page with a block of each kind a whole UI is made of
const project: Node = {
	type: 'Stack',
	gap: 8,
	children: [
		{ type: 'Breadcrumbs', trail: ['Projects', 'Harlow & Finch', 'Rebrand'] },
		{ type: 'Row', justify: 'between', children: [{ type: 'Heading', level: 'page', text: 'Rebrand' }, { type: 'AvatarGroup', names: ['Sam Smith', 'Alex Lee', 'Priya Shah'], size: 24 }, { type: 'Menu', label: 'More', variant: 'ghost', actions: [{ label: 'Archive project', action: 'Archive the project' }, { label: 'Leave', isDanger: true }] }] },
		{ type: 'Row', justify: 'between', children: [{ type: 'SearchField', label: 'Search files', placeholder: 'Search by name' }, { type: 'ToggleButtonGroup', label: 'View', options: [{ id: 'list', name: 'List' }, { id: 'board', name: 'Board' }], selected: 'board' }] },
		{ type: 'TagGroup', label: 'Filters', selectionMode: 'multiple', tags: [{ id: 'mine', name: 'Mine' }, { id: 'recent', name: 'Recent' }], selected: ['recent'] },
		{ type: 'GridList', label: 'Files', items: [{ id: 'guide', title: 'Brand guidelines', description: 'Changed 2 hours ago', status: { type: 'Status', label: 'In review', tone: 'info', variant: 'dot' }, action: 'Open Brand guidelines' }, { id: 'logo', title: 'Logo', description: 'Changed yesterday' }] },
		{ type: 'Pagination', page: 1, count: 6 },
		{ type: 'DropZone', label: 'Drop files to add them', isMultiple: true },
		{
			type: 'Disclosure',
			title: 'Settings',
			isExpanded: true,
			children: [
				{ type: 'NumberField', label: 'Seats', value: 4, minValue: 1, maxValue: 20 },
				{ type: 'NumberField', label: 'Budget', value: 12000, format: 'currency', currency: 'GBP' },
				{ type: 'Slider', label: 'Discount', value: 0.1, minValue: 0, maxValue: 0.5, step: 0.05, format: 'percent' },
				{ type: 'ComboBox', label: 'Owner', options: [{ id: 'sam', name: 'Sam Smith' }, { id: 'alex', name: 'Alex Lee' }], selected: 'sam' },
				{ type: 'CheckboxGroup', label: 'Email me about', options: [{ id: 'comments', name: 'Comments' }, { id: 'uploads', name: 'Uploads' }], selected: ['comments'] },
				{ type: 'TimeField', label: 'Daily summary at', value: '09:00' },
				{ type: 'Link', text: 'See every setting', action: 'Show every setting' },
			],
		},
		{ type: 'Code', title: 'Terminal', code: 'npm install @parchment/ui' },
		{ type: 'Dialog', trigger: { type: 'Button', label: 'Delete project', variant: 'danger' }, heading: 'Delete this project?', confirm: 'Delete for good', tone: 'danger', action: 'Delete the project', children: [{ type: 'Text', text: 'Its 2 files go too.', tone: 'muted' }] },
	],
};

describe('Generated views', () => {
	it('takes its closed sets from the source', () => {
		const button = (schema.$defs as Record<string, { properties: Record<string, { enum?: unknown[] }> }>).button;
		expect(button.properties.variant.enum).toEqual(details.components.Button.props?.find((prop) => prop.name === 'variant')?.options);
	});

	it('passes a tree that keeps to the catalogue', () => {
		expect(validate({ ui: invoices, summary: 'Two overdue invoices' }, schema)).toEqual([]);
		// A Grid's columns is a count, which the id checks for a Table's columns must step past
		expect(validate({ summary: 'Stats', ui: { type: 'Grid', columns: 3, children: [{ type: 'Card', children: [{ type: 'Text', text: '£4,182.50', size: 'title' }] }] } }, schema)).toEqual([]);
	});

	it('says what breaks the catalogue, so Claude can draw it again', () => {
		const errors = validate(
			{
				summary: 'A broken view',
				ui: {
					type: 'Stack',
					children: [
						{ type: 'Button', label: 'Save', variant: 'fancy' },
						{ type: 'Text', text: 'Hi', className: 'text-red-500' },
						{ type: 'Marquee' },
						{ type: 'Card', children: [{ type: 'Table', label: 'T', columns: [{ id: 'a', name: 'A' }], rows: [{ id: 'r', cells: ['1', '2'] }] }] },
					],
				},
			},
			schema,
		);
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringContaining('input.ui.children[0].variant: "fancy" isn\'t one of'),
				expect.stringContaining('takes no className'),
				expect.stringContaining('"Marquee" is not a block'),
			]),
		);
		const rules = validate({ summary: 'Rules', ui: { type: 'Stack', children: [{ type: 'Button', label: 'A', variant: 'primary' }, { type: 'Button', label: 'B', variant: 'primary' }, { type: 'Card', children: [{ type: 'Table', label: 'T', columns: [{ id: 'a', name: 'A' }], rows: [{ id: 'r', cells: ['1', '2'] }] }] }] } }, schema);
		expect(rules).toEqual(expect.arrayContaining([expect.stringContaining('2 primary buttons'), expect.stringContaining('never goes in a Card'), expect.stringContaining('exactly one column with isRowHeader'), expect.stringContaining('2 cells for 1 columns')]));
	});

	it('takes dates as YYYY-MM-DD, in order', () => {
		const stay = (props: Record<string, unknown>) => validate({ summary: 'A stay', ui: { type: 'DateRangePicker', label: 'Your stay', ...props } }, schema);
		expect(stay({ start: '2026-12-04', end: '2026-12-07', minValue: '2026-11-22' })).toEqual([]);
		expect(stay({ start: '4 December', end: '2026-12-07' })).toEqual([expect.stringContaining('"4 December" should be')]);
		expect(stay({ start: '2026-12-07', end: '2026-12-04' })).toEqual([expect.stringContaining('is after end')]);
		expect(stay({ start: '2026-12-04' })).toEqual([expect.stringContaining('both start and end')]);
		expect(validate({ summary: 'Due', ui: { type: 'DatePicker', label: 'Due date', value: '2026-11-01', minValue: '2026-11-22' } }, schema)).toEqual([expect.stringContaining('before its minValue')]);
	});

	it('draws a date picker and a range with the dates they start with', () => {
		render(<Generated ui={{ type: 'Stack', children: [{ type: 'DatePicker', label: 'Due date', value: '2026-12-01' }, { type: 'DateRangePicker', label: 'Your stay', start: '2026-12-04', end: '2026-12-07' }] }} />);
		const due = screen.getByRole('group', { name: 'Due date' });
		expect(within(due).getByRole('spinbutton', { name: /day/i }).getAttribute('aria-valuenow')).toBe('1');
		const stay = screen.getByRole('group', { name: 'Your stay' });
		expect(within(stay).getAllByRole('spinbutton', { name: /day/i }).map((day) => day.getAttribute('aria-valuenow'))).toEqual(['4', '7']);
	});

	it('takes every block a whole page needs', () => {
		expect(validate({ summary: 'A project page', ui: project }, schema)).toEqual([]);
	});

	it('says where picks, numbers and pages don’t add up', () => {
		const errors = validate(
			{
				summary: 'Broken picks',
				ui: {
					type: 'Stack',
					children: [
						{ type: 'CheckboxGroup', label: 'Emails', options: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], selected: ['c'] },
						{ type: 'NumberField', label: 'Seats', value: 12, minValue: 1, maxValue: 10 },
						{ type: 'Slider', label: 'Budget', value: 80, end: 20 },
						{ type: 'NumberField', label: 'Price', currency: 'GBP' },
						{ type: 'Pagination', page: 9, count: 4 },
						{ type: 'Menu', label: 'More', variant: 'primary', actions: [{ label: 'Edit' }, { label: 'Delete', isDanger: true }] },
					],
				},
			},
			schema,
		);
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringContaining('"c" isn\'t one of the options'),
				expect.stringContaining('12 is outside 1 to 10'),
				expect.stringContaining('value 80 is after end 20'),
				expect.stringContaining('currency goes only with format currency'),
				expect.stringContaining('page 9 is past its count of 4'),
				expect.stringContaining('never primary'),
			]),
		);
		expect(validate({ summary: 'Opening time', ui: { type: 'TimeField', label: 'Opens', value: '9am' } }, schema)).toEqual(['input.ui.value: "9am" should be HH:MM on a 24 hour clock']);
	});

	it('draws a whole page, and sends on what a menu, a list and a dialog do', async () => {
		const onAction = vi.fn();
		const user = userEvent.setup();
		render(<Generated ui={project} onAction={onAction} />);
		expect(screen.getByRole('navigation', { name: 'Breadcrumbs' })).toBeTruthy();
		expect(screen.getByRole('searchbox', { name: 'Search files' })).toBeTruthy();
		expect(screen.getByRole('radio', { name: 'Board' }).getAttribute('aria-checked')).toBe('true');
		expect(screen.getByRole('checkbox', { name: 'Comments' })).toHaveProperty('checked', true);
		expect(screen.getByRole('textbox', { name: 'Seats' })).toHaveProperty('value', '4');
		expect(screen.getByText('npm install @parchment/ui')).toBeTruthy();
		await user.click(screen.getByRole('row', { name: /Brand guidelines/ }));
		expect(onAction).toHaveBeenLastCalledWith('Open Brand guidelines');
		await user.click(screen.getByRole('button', { name: 'More' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Archive project' }));
		expect(onAction).toHaveBeenLastCalledWith('Archive the project');
		await user.click(screen.getByRole('button', { name: 'Delete project' }));
		const dialog = await screen.findByRole('dialog', { name: 'Delete this project?' });
		await user.click(within(dialog).getByRole('button', { name: 'Delete for good' }));
		expect(onAction).toHaveBeenLastCalledWith('Delete the project');
	});

	it('gives a row its own menu of actions, named by the row', async () => {
		const onAction = vi.fn();
		const user = userEvent.setup();
		const team: Node = {
			type: 'Table',
			label: 'Members',
			columns: [{ id: 'name', name: 'Name', isRowHeader: true }, { id: 'role', name: 'Role' }],
			rows: [
				{ id: 'ada', cells: ['Ada Lovelace', 'Admin'], actions: [{ label: 'Change role', action: 'Change Ada’s role' }, { label: 'Remove', action: 'Remove Ada', isDanger: true }] },
				{ id: 'alan', cells: ['Alan Turing', 'Member'] },
			],
		};
		expect(validate({ summary: 'Members', ui: team }, schema)).toEqual([]);
		render(<Generated ui={team} onAction={onAction} />);
		expect(screen.queryByRole('button', { name: 'Actions for Alan Turing' })).toBeNull();
		await user.click(screen.getByRole('button', { name: 'Actions for Ada Lovelace' }));
		await user.click(await screen.findByRole('menuitem', { name: 'Remove' }));
		expect(onAction).toHaveBeenLastCalledWith('Remove Ada');
	});

	it('keeps a line between two things, and says what a block does take', () => {
		const errors = validate({ summary: 'Danger zone', ui: { type: 'Stack', children: [{ type: 'Separator' }, { type: 'Heading', level: 'section', text: 'Danger zone' }] } }, schema);
		expect(errors).toEqual([expect.stringContaining('never first in its group')]);
		const option = validate({ summary: 'Role', ui: { type: 'RadioGroup', label: 'Role', options: [{ id: 'a', name: 'Admin' }, { id: 'm', name: 'Member', type: 'Radio' }] } }, schema);
		expect(option).toEqual(['input.ui.options[1]: takes no type, only id, name']);
	});

	it('draws with Loupe, and sends a button’s action on', async () => {
		const onAction = vi.fn();
		render(<Generated ui={invoices} onAction={onAction} />);
		expect(screen.getByRole('heading', { name: 'Overdue invoices' })).toBeTruthy();
		const table = screen.getByRole('grid', { name: 'Overdue invoices' });
		expect(within(table).getByRole('rowheader', { name: 'Harlow & Finch' })).toBeTruthy();
		expect(within(table).getByText('£2,400.00').closest('[role="gridcell"]')?.className).toContain('tabular-nums');
		await userEvent.setup().click(screen.getByRole('button', { name: 'Send reminders' }));
		expect(onAction).toHaveBeenCalledWith('Send reminders for every overdue invoice');
	});
});

// A reset screen to tweak: its section gap, the Alert's variant, and whether the Alert shows at all
const tweakable = {
	summary: 'A password reset screen to tweak',
	values: { sectionGap: 8, alertVariant: 'notice', showHint: true },
	controls: [
		{ group: 'Spacing', items: [{ label: 'Between sections', value: 'sectionGap' }] },
		{ group: 'Content', items: [{ label: 'Hint style', value: 'alertVariant' }, { label: 'Expiry hint', value: 'showHint' }] },
	],
	ui: {
		type: 'Stack',
		gap: { $value: 'sectionGap' },
		children: [
			{ type: 'Heading', level: 'page', text: 'Check your email' },
			{ type: 'Alert', tone: 'info', variant: { $value: 'alertVariant' }, text: 'The link expires in 30 minutes', when: 'showHint' },
			{ type: 'Button', label: 'Back to sign in', variant: 'primary' },
		],
	},
};

// A Choice watches its own width to fold into a select, which jsdom has nothing to measure for
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

describe('Generated views with controls', () => {
	it('makes each control from the props that read its value', () => {
		expect(validate(tweakable, schema)).toEqual([]);
		const [spacing, content] = panelOf(tweakable, schema);
		expect(spacing.items[0].control).toEqual({ kind: 'slider', steps: [...gaps], min: 1, max: 10, scale: 4, unit: 'px' });
		expect(content.items[0].control).toEqual({ kind: 'choice', options: details.components.Alert.props?.find((prop) => prop.name === 'variant')?.options });
		expect(content.items[1].control).toEqual({ kind: 'switch' });
	});

	it('says where values and controls don’t match up', () => {
		const errors = validate(
			{
				...tweakable,
				values: { sectionGap: 5, alertVariant: 'notice', unused: 'x' },
				controls: [{ group: 'Spacing', items: [{ label: 'Lost', value: 'nowhere' }] }],
				ui: { type: 'Stack', gap: { $value: 'sectionGap' }, children: [{ type: 'Alert', tone: 'info', variant: { $value: 'alertVariant' }, text: 'Hi', when: 'showHint' }, { type: 'Text', text: 'x', tone: { $value: 'alertVariant' } }] },
			},
			schema,
		);
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringContaining('values.sectionGap: 5 doesn\'t suit what reads it, which takes 1, 2, 3, 4, 6, 8, 10'),
				expect.stringContaining('reads "showHint", which isn\'t in values'),
				expect.stringContaining('reads "alertVariant", which other props read as something else'),
				expect.stringContaining('values.unused: nothing reads it'),
				expect.stringContaining('"nowhere" isn\'t a value any prop reads'),
			]),
		);
	});

	it('redraws as its controls move, and says where they are', async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		const { container } = render(<Generated ui={tweakable.ui as Node} title="Password reset" values={tweakable.values} panel={panelOf(tweakable, schema)} onValuesChange={onValuesChange} />);
		// In its sandbox, named on the bar over it, with Copy code beside the name, and Reset only once something's moved
		expect(screen.getByRole('figure', { name: 'Password reset' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull();
		expect(container.querySelector('.gap-8')).toBeTruthy();
		const slider = screen.getByRole('slider', { name: 'Between sections in pixels' });
		expect(slider.getAttribute('aria-valuetext')).toBe('32');
		await user.click(slider);
		await user.keyboard('{ArrowRight}');
		// The next of Loupe's gaps after 32px is 40px, step 10
		expect(container.querySelector('.gap-10')).toBeTruthy();
		expect(onValuesChange).toHaveBeenLastCalledWith({ sectionGap: 10, alertVariant: 'notice', showHint: true });
		expect(screen.getByText('The link expires in 30 minutes')).toBeTruthy();
		await user.click(screen.getByRole('switch', { name: 'Expiry hint' }));
		expect(screen.queryByText('The link expires in 30 minutes')).toBeNull();
		await user.click(screen.getByRole('button', { name: 'Reset' }));
		expect(container.querySelector('.gap-8')).toBeTruthy();
		expect(screen.getByText('The link expires in 30 minutes')).toBeTruthy();
	});

	it('opens full size with the same values, and closes back to the chat', async () => {
		const user = userEvent.setup();
		render(<Generated ui={tweakable.ui as Node} title="Password reset" values={tweakable.values} panel={panelOf(tweakable, schema)} />);
		await user.click(screen.getByRole('switch', { name: 'Expiry hint' }));
		await user.click(screen.getByRole('button', { name: 'Full size' }));
		const full = await screen.findByRole('dialog', { name: 'Password reset' });
		// The hint stays hidden there too, and its controls come with it
		expect(within(full).getByRole('heading', { name: 'Check your email' })).toBeTruthy();
		expect(within(full).queryByText('The link expires in 30 minutes')).toBeNull();
		await user.click(within(full).getByRole('switch', { name: 'Expiry hint' }));
		expect(within(full).getByText('The link expires in 30 minutes')).toBeTruthy();
		await user.click(within(full).getByRole('button', { name: 'Close' }));
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.getByRole('switch', { name: 'Expiry hint' })).toHaveProperty('checked', true);
	});

	it('lays out a narrow column beside a wide one, holding just the two', () => {
		const split = { type: 'Split', side: 'start', children: [{ type: 'Heading', level: 'group', text: 'Filters' }, { type: 'Stack', width: 'narrow', children: [{ type: 'TextField', label: 'Name' }] }] };
		expect(validate({ summary: 'Filters and a form', ui: split as Node }, schema)).toEqual([]);
		expect(validate({ summary: 'Three', ui: { ...split, children: [...split.children, { type: 'Text', text: 'A third' }] } as Node }, schema)).toEqual([expect.stringContaining('exactly two blocks')]);
		const { container } = render(<Generated ui={split as Node} />);
		expect(container.querySelector('[class*="@2xl:grid-cols-[16rem_minmax(0,1fr)]"]')).toBeTruthy();
		expect(container.querySelector('.max-w-xl')).toBeTruthy();
	});

	it('keeps a Split’s columns in the order they sit, with the narrow one at the end for a summary', () => {
		const checkout = { type: 'Split', side: 'end', children: [{ type: 'Heading', level: 'section', text: 'Delivery' }, { type: 'Heading', level: 'section', text: 'Order summary' }] };
		const { container } = render(<Generated ui={checkout as Node} />);
		const grid = container.querySelector('[class*="@2xl:grid-cols-[minmax(0,1fr)_16rem]"]');
		expect([...(grid?.children ?? [])].map((column) => column.textContent)).toEqual(['Delivery', 'Order summary']);
		expect(container.querySelector('[class*="order-last"]')).toBeNull();
	});

	it('frames the full-size view at a width, which the code it copies leaves out', async () => {
		const user = userEvent.setup();
		render(<Generated ui={tweakable.ui as Node} title="Password reset" values={tweakable.values} />);
		await user.click(screen.getByRole('button', { name: 'Full size' }));
		const full = await screen.findByRole('dialog', { name: 'Password reset' });
		const view = within(full).getByRole('heading', { name: 'Check your email' }).closest('.\\@container');
		expect(view?.className).not.toContain('max-w-[24rem]');
		await user.click(within(full).getByRole('radio', { name: 'Phone' }));
		expect(view?.className).toContain('max-w-[24rem]');
	});
});
