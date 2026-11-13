import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { SortDescriptor } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';
import { Cell, Column, EmptyState, MenuItem, Row, RowActions, Table, TableBody, TableHeader, type TableProps } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const invoices = [
	{ id: 'inv-1', customer: 'Acme', amount: '£1,200.00' },
	{ id: 'inv-2', customer: 'Globex', amount: '£85.50' },
	{ id: 'inv-3', customer: 'Initech', amount: '£430.00' },
];

function Invoices({ onAction, ...props }: Partial<TableProps> & { onAction?: (key: string) => void }) {
	return (
		<Table aria-label="Invoices" {...props}>
			<TableHeader>
				<Column id="customer" isRowHeader allowsSorting>
					Customer
				</Column>
				<Column id="amount" align="end" allowsSorting>
					Amount
				</Column>
				<Column id="actions">
					<span className="sr-only">Actions</span>
				</Column>
			</TableHeader>
			<TableBody items={invoices}>
				{(invoice) => (
					<Row>
						<Cell>{invoice.customer}</Cell>
						<Cell>{invoice.amount}</Cell>
						<Cell>
							<RowActions aria-label={`Actions for ${invoice.customer}`} onAction={(key) => onAction?.(`${key} ${invoice.id}`)}>
								<MenuItem id="download">Download</MenuItem>
								<MenuItem id="void" variant="danger">
									Void
								</MenuItem>
							</RowActions>
						</Cell>
					</Row>
				)}
			</TableBody>
		</Table>
	);
}

function Sorted({ onSortChange }: { onSortChange: (descriptor: SortDescriptor) => void }) {
	const [sort, setSort] = useState<SortDescriptor>({ column: 'customer', direction: 'ascending' });
	return (
		<Invoices
			sortDescriptor={sort}
			onSortChange={(descriptor) => {
				setSort(descriptor);
				onSortChange(descriptor);
			}}
		/>
	);
}

describe('Table', () => {
	it('shows its headers and cells, with numbers aligned to the end', () => {
		render(<Invoices />);
		const grid = screen.getByRole('grid', { name: 'Invoices' });
		expect(within(grid).getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Customer', 'Amount', 'Actions']);
		expect(within(grid).getByRole('rowheader', { name: 'Acme' })).toBeTruthy();
		const amount = within(grid).getByText('£85.50');
		expect(amount.closest('div')?.className).toContain('tabular-nums');
		expect(amount.closest('div')?.className).toContain('justify-end');
	});

	it('sorts by a column, marking which and which way', async () => {
		const user = userEvent.setup();
		const onSortChange = vi.fn();
		render(<Sorted onSortChange={onSortChange} />);
		const [customer, amount] = screen.getAllByRole('columnheader');
		expect(customer.getAttribute('aria-sort')).toBe('ascending');
		expect(customer.querySelector('svg')?.getAttribute('class')).toContain('rotate-180');
		await user.click(amount);
		expect(onSortChange).toHaveBeenCalledWith({ column: 'amount', direction: 'ascending' });
		expect(amount.getAttribute('aria-sort')).toBe('ascending');
		expect(customer.getAttribute('aria-sort')).toBe('none');
		await user.click(amount);
		expect(onSortChange).toHaveBeenLastCalledWith({ column: 'amount', direction: 'descending' });
		expect(amount.querySelector('svg')?.getAttribute('class')).not.toContain('rotate-180');
	});

	it('chooses rows with their checkboxes, or all at once from the header', async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(<Invoices selectionMode="multiple" onSelectionChange={onSelectionChange} />);
		const [, acme, globex] = screen.getAllByRole('row');
		await user.click(within(acme).getByRole('checkbox'));
		expect(acme.getAttribute('aria-selected')).toBe('true');
		expect(globex.getAttribute('aria-selected')).toBe('false');
		const all = screen.getByRole('checkbox', { name: 'Select All' }) as HTMLInputElement;
		expect(all.indeterminate).toBe(true);
		await user.click(all);
		expect(onSelectionChange).toHaveBeenLastCalledWith('all');
		for (const row of screen.getAllByRole('row').slice(1)) expect(row.getAttribute('aria-selected')).toBe('true');
	});

	it('chooses one row at a time without checkboxes', async () => {
		const user = userEvent.setup();
		render(<Invoices selectionMode="single" />);
		expect(screen.queryByRole('checkbox')).toBeNull();
		const [, acme, globex] = screen.getAllByRole('row');
		await user.click(within(acme).getByText('Acme'));
		await user.click(within(globex).getByText('Globex'));
		expect(acme.getAttribute('aria-selected')).toBe('false');
		expect(globex.getAttribute('aria-selected')).toBe('true');
	});

	it('acts on a row, and its menu doesn’t choose it', async () => {
		const user = userEvent.setup();
		const onRowAction = vi.fn();
		const onAction = vi.fn();
		render(<Invoices selectionMode="multiple" onRowAction={onRowAction} onAction={onAction} />);
		const [, acme] = screen.getAllByRole('row');
		await user.click(within(acme).getByText('Acme'));
		expect(onRowAction).toHaveBeenCalledWith('inv-1');
		await user.click(within(acme).getByRole('button', { name: 'Actions for Acme' }));
		expect(acme.getAttribute('aria-selected')).toBe('false');
		await user.click(screen.getByRole('menuitem', { name: 'Download' }));
		expect(onAction).toHaveBeenCalledWith('download inv-1');
		expect(onRowAction).toHaveBeenCalledTimes(1);
		expect(acme.getAttribute('aria-selected')).toBe('false');
	});

	it('says when it’s empty', () => {
		render(
			<Table aria-label="Members" selectionMode="multiple">
				<TableHeader>
					<Column isRowHeader>Name</Column>
				</TableHeader>
				<TableBody renderEmptyState={() => <EmptyState title="No members yet">Invite someone to get started</EmptyState>}>{[]}</TableBody>
			</Table>,
		);
		expect(screen.getByText('No members yet')).toBeTruthy();
		expect((screen.getByRole('checkbox', { name: 'Select All' }) as HTMLInputElement).checked).toBe(false);
	});

	it('sets its density on the box, for the rows to follow', () => {
		const { container } = render(<Invoices density="compact" />);
		expect(container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('compact');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Invoices selectionMode="multiple" sortDescriptor={{ column: 'customer', direction: 'ascending' }} />);
		await expectAccessible(container);
	});

	it('drops its box when flush, keeping the header opaque in what it sits on', () => {
		const { container, rerender } = render(<Invoices />);
		const box = () => container.firstElementChild!.className;
		expect(box()).toContain('shadow-raised');
		rerender(<Invoices variant="flush" />);
		expect(box()).not.toContain('shadow-raised');
		expect(box()).not.toContain('rounded-lg');
		expect(box()).toContain('--table-fill:var(--color-panel)');
	});
});
