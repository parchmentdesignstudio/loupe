import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, EmptyState } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('EmptyState', () => {
	it('shows its title, what will be here and its first step', () => {
		render(
			<EmptyState icon={<svg data-testid="icon" />} title="No blocks yet" actions={<Button>Add a block</Button>}>
				Pieces made from the components will go here
			</EmptyState>,
		);
		expect(screen.getByText('No blocks yet')).toBeTruthy();
		expect(screen.getByText('Pieces made from the components will go here')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Add a block' })).toBeTruthy();
		expect(screen.getByTestId('icon').parentElement?.getAttribute('aria-hidden')).toBe('true');
	});

	it('leaves out the tile, description and actions it isn’t given', () => {
		const { container } = render(<EmptyState title="Nothing here" />);
		expect(container.firstElementChild?.children).toHaveLength(1);
		expect(container.querySelectorAll('p')).toHaveLength(1);
	});

	it('adds no heading of its own', () => {
		render(<EmptyState title="No blocks yet" />);
		expect(screen.queryByRole('heading')).toBeNull();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<EmptyState icon={<svg aria-hidden="true" />} title="No skills yet" actions={<Button variant="secondary">Read the plan</Button>}>
				Guidance for agents will go here
			</EmptyState>,
		);
		await expectAccessible(container);
	});
});
