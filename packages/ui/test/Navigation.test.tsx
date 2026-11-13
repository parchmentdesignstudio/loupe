import { render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Link, Navigation } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function Components() {
	return (
		<Navigation aria-label="Components">
			<Link href="#button">Button</Link>
			<Link href="#chip">Chip</Link>
		</Navigation>
	);
}

function PageWithItsOwnButton({ onOpenChange }: { onOpenChange: (isOpen: boolean) => void }) {
	const [isOpen, setOpen] = useState(false);
	const change = (next: boolean) => {
		setOpen(next);
		onOpenChange(next);
	};
	return (
		<>
			<Button onPress={() => change(true)}>Open the menu</Button>
			<Navigation aria-label="Components" hasTrigger={false} isOpen={isOpen} onOpenChange={change}>
				<Link href="#chip">Chip</Link>
			</Navigation>
		</>
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

	it('leaves its button out for the page to open it from its own, and closes on a link', async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();
		render(<PageWithItsOwnButton onOpenChange={onOpenChange} />);
		expect(screen.queryByRole('button', { name: 'Components' })).toBeNull();
		await user.click(screen.getByRole('button', { name: 'Open the menu' }));
		const sheet = screen.getByRole('dialog', { name: 'Components' });
		await user.click(within(sheet).getByRole('link', { name: 'Chip' }));
		expect(onOpenChange).toHaveBeenLastCalledWith(false);
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Components />);
		await expectAccessible(container);
	});
});
