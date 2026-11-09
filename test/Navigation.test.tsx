import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Link, Navigation } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function Components() {
	return (
		<Navigation aria-label="Components">
			<Link href="#button">Button</Link>
			<Link href="#chip">Chip</Link>
		</Navigation>
	);
}

describe('Navigation', () => {
	it('is a navigation landmark, named by its label', () => {
		render(<Components />);
		const navigation = screen.getByRole('navigation', { name: 'Components' });
		expect(within(navigation).getByRole('link', { name: 'Chip' })).toBeTruthy();
	});

	it('opens the same links in a sheet from its button, for phones', async () => {
		const user = userEvent.setup();
		render(<Components />);
		await user.click(screen.getByRole('button', { name: 'Components' }));
		const sheet = screen.getByRole('dialog', { name: 'Components' });
		expect(within(sheet).getByRole('link', { name: 'Chip' })).toBeTruthy();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Components />);
		await expectAccessible(container);
	});
});
