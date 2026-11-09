import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NavigationTree, NavigationTreeHeader, NavigationTreeItem, NavigationTreeItemContent, NavigationTreeSection } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function Services() {
	return (
		<NavigationTree aria-label="Services" selectedRoute="#website">
			<NavigationTreeItem id="all" href="#all" textValue="All services">
				<NavigationTreeItemContent>All services</NavigationTreeItemContent>
			</NavigationTreeItem>
			<NavigationTreeSection id="studio">
				<NavigationTreeHeader>Studio</NavigationTreeHeader>
				<NavigationTreeItem id="identity" href="#identity" textValue="Brand identity">
					<NavigationTreeItemContent>Brand identity</NavigationTreeItemContent>
				</NavigationTreeItem>
				<NavigationTreeItem id="website" href="#website" textValue="Website">
					<NavigationTreeItemContent>Website</NavigationTreeItemContent>
				</NavigationTreeItem>
			</NavigationTreeSection>
		</NavigationTree>
	);
}

describe('NavigationTree', () => {
	it('marks the item matching selectedRoute as the current page', () => {
		render(<Services />);
		const current = screen.getByRole('link', { name: 'Website' });
		expect(current.getAttribute('aria-current')).toBe('page');
		expect(current.className).toContain('font-medium');
		expect(screen.getByRole('link', { name: 'Brand identity' }).hasAttribute('aria-current')).toBe(false);
	});

	it('is one Tab stop, starting at the current page, with arrow keys between items', async () => {
		const user = userEvent.setup();
		render(
			<>
				<Services />
				<button type="button">After</button>
			</>,
		);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Website' }));
		await user.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Brand identity' }));
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
	});

	it('shows the focus ring on the link for keyboard focus', async () => {
		const user = userEvent.setup();
		render(<Services />);
		await user.tab();
		const link = screen.getByRole('link', { name: 'Website' });
		expect(link.className).toContain('outline-2');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Services />);
		await expectAccessible(container);
	});
});
