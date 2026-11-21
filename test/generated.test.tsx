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
		const { container } = render(<Generated ui={tweakable.ui as Node} values={tweakable.values} panel={panelOf(tweakable, schema)} onValuesChange={onValuesChange} />);
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
	});
});
