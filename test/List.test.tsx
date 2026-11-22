import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { List, ListItem, Status } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('List', () => {
	it('lists its items, with a line under one and a value at the end of another', () => {
		render(
			<List aria-label="Account">
				<ListItem description="Since March 2024">Team plan</ListItem>
				<ListItem end="£144.00">Next invoice</ListItem>
			</List>,
		);
		const items = within(screen.getByRole('list', { name: 'Account' })).getAllByRole('listitem');
		expect(items).toHaveLength(2);
		expect(within(items[0]).getByText('Since March 2024')).toBeTruthy();
		expect(within(items[1]).getByText('£144.00').className).toContain('tabular-nums');
	});

	it('draws a line between divided items, and none in a plain list', () => {
		const { rerender } = render(
			<List>
				<ListItem>One</ListItem>
				<ListItem>Two</ListItem>
			</List>,
		);
		expect(screen.getAllByRole('listitem')[1].className).toContain('border-t');
		rerender(
			<List variant="plain">
				<ListItem>One</ListItem>
				<ListItem>Two</ListItem>
			</List>,
		);
		expect(screen.getAllByRole('listitem')[1].className).not.toContain('border-t');
	});

	it('hides its icons from a screen reader, as the words say it', () => {
		render(
			<List variant="plain">
				<ListItem icon={<svg data-testid="tick" />}>Unlimited projects</ListItem>
			</List>,
		);
		expect(screen.getByTestId('tick').parentElement?.getAttribute('aria-hidden')).toBe('true');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<List aria-label="Invoices">
				<ListItem description="Due 1 December" end={<Status tone="warning">Due soon</Status>}>
					INV-204
				</ListItem>
				<ListItem end="£318.50">INV-205</ListItem>
			</List>,
		);
		await expectAccessible(container);
	});
});
