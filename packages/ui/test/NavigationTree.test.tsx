import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavigationTree, NavigationTreeHeader, NavigationTreeItem, NavigationTreeItemContent, NavigationTreeSection } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function Services({ route = '#website' }: { route?: string }) {
	return (
		<NavigationTree aria-label="Services" selectedRoute={route}>
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

	it('shows a pressed link as the current page straight away, then follows selectedRoute', async () => {
		const user = userEvent.setup();
		const { rerender } = render(<Services />);
		const identity = screen.getByRole('link', { name: 'Brand identity' });
		await user.click(identity);
		// Before the app moves selectedRoute, so the pressed link doesn't drop back to its hover fill
		expect(identity.getAttribute('aria-current')).toBe('page');
		expect(screen.getByRole('link', { name: 'Website' }).hasAttribute('aria-current')).toBe(false);
		rerender(<Services route="#all" />);
		expect(screen.getByRole('link', { name: 'All services' }).getAttribute('aria-current')).toBe('page');
		expect(identity.hasAttribute('aria-current')).toBe(false);
	});

	it('leaves the current page alone for a link opened elsewhere, with a modifier key', async () => {
		const user = userEvent.setup();
		render(<Services />);
		await user.keyboard('{Meta>}');
		await user.click(screen.getByRole('link', { name: 'Brand identity' }));
		await user.keyboard('{/Meta}');
		expect(screen.getByRole('link', { name: 'Website' }).getAttribute('aria-current')).toBe('page');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Services />);
		await expectAccessible(container);
	});

	it('gives an item with pages under it a button that opens and closes them', async () => {
		const user = userEvent.setup();
		const warn = vi.spyOn(console, 'warn');
		render(
			<NavigationTree aria-label="Work">
				<NavigationTreeItem id="leads" textValue="Leads">
					<NavigationTreeItemContent>Leads</NavigationTreeItemContent>
					<NavigationTreeItem id="calls" href="#calls" textValue="Calls">
						<NavigationTreeItemContent>Calls</NavigationTreeItemContent>
					</NavigationTreeItem>
				</NavigationTreeItem>
			</NavigationTree>,
		);
		expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('expand button'));
		expect(screen.queryByRole('link', { name: 'Calls' })).toBeNull();
		await user.click(screen.getByRole('button', { name: /expand/i }));
		expect(screen.getByRole('link', { name: 'Calls' })).toBeTruthy();
		warn.mockRestore();
	});
});

