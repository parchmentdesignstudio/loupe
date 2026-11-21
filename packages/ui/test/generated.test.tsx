import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import details from 'virtual:details';
import { blocksOf, inputSchemaOf, validate, type Node } from '../preview/genui/catalogue.js';
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
