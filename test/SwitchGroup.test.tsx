import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Switch, SwitchGroup } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('SwitchGroup', () => {
	it('names its group, and puts each switch after its label with a line between', () => {
		render(
			<SwitchGroup label="Email">
				<Switch defaultSelected>Mentions and replies</Switch>
				<Switch>Product news and tips</Switch>
			</SwitchGroup>,
		);
		expect(screen.getByRole('group', { name: 'Email' })).toBeTruthy();
		const row = screen.getByRole('switch', { name: 'Product news and tips' }).closest('label');
		expect(row?.className).toContain('flex-row-reverse');
		expect(row?.className).toContain('border-t');
	});

	it('describes a switch by the line under its label', () => {
		render(<Switch description="When someone tags you">Mentions</Switch>);
		expect(screen.getByRole('switch', { name: 'Mentions', description: 'When someone tags you' })).toBeTruthy();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<SwitchGroup label="Email">
				<Switch description="When someone tags you">Mentions and replies</Switch>
				<Switch>Product news and tips</Switch>
			</SwitchGroup>,
		);
		await expectAccessible(container);
	});
});
