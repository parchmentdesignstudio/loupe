import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb, Breadcrumbs } from '../src/index.js';
import { crumbsToHide } from '../src/Breadcrumbs.js';
import { expectAccessible } from './accessible.js';

const trail = [
	{ name: 'Parchment', href: '#/' },
	{ name: 'Work', href: '#/work' },
	{ name: 'Actions' },
	{ name: 'Brand identity', href: '#/work/identity' },
	{ name: 'Logo' },
];

const Trail = (props: { maxVisible?: number; onAction?: (key: unknown) => void }) => (
	<Breadcrumbs {...props}>
		{trail.map((crumb) => (
			<Breadcrumb key={crumb.name} id={crumb.name} href={crumb.href}>
				{crumb.name}
			</Breadcrumb>
		))}
	</Breadcrumbs>
);

describe('Breadcrumbs', () => {
	it('is a navigation landmark, with each crumb a link but the page you’re on', () => {
		render(<Trail />);
		const nav = screen.getByRole('navigation', { name: 'Breadcrumbs' });
		expect(within(nav).getAllByRole('listitem')).toHaveLength(5);
		expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Parchment', 'Work', 'Brand identity']);
		const current = within(within(nav).getByRole('list')).getByText('Logo');
		expect(current.getAttribute('aria-current')).toBe('page');
		expect(current.closest('a')).toBeNull();
	});

	it('shows a crumb with no page as text', () => {
		render(<Trail />);
		const actions = within(screen.getByRole('list')).getByText('Actions');
		expect(actions.closest('a')).toBeNull();
		expect(actions.hasAttribute('aria-current')).toBe(false);
	});

	it('folds the middle crumbs into a menu past maxVisible', async () => {
		const user = userEvent.setup();
		render(<Trail maxVisible={3} />);
		const nav = screen.getByRole('navigation');
		expect(within(nav).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Parchment', '', 'Brand identity', 'Logo']);
		await user.click(within(nav).getByRole('button', { name: 'Show hidden pages' }));
		const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
		expect(items.map((item) => item.textContent)).toEqual(['Work', 'Actions']);
		expect(items[0].getAttribute('href')).toBe('#/work');
		expect(items[1].getAttribute('aria-disabled')).toBe('true');
	});

	it('opens the menu from the keyboard', async () => {
		const user = userEvent.setup();
		const onAction = vi.fn();
		render(<Trail maxVisible={2} onAction={onAction} />);
		await user.tab();
		await user.tab();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Show hidden pages');
		await user.keyboard('{Enter}');
		const menu = screen.getByRole('menu');
		expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Work', 'Actions', 'Brand identity']);
		expect(document.activeElement?.textContent).toBe('Work');
		await user.keyboard('{ArrowDown}');
		expect(document.activeElement?.textContent).toBe('Brand identity');
	});

	it('keeps the first and as many from the end as fit', () => {
		const widths = [80, 60, 60, 60, 100];
		expect(crumbsToHide(widths, 30, 6, 1000)).toBe(0);
		// 80 + 30 + 60 + 100, with three gaps, is 288
		expect(crumbsToHide(widths, 30, 6, 288)).toBe(2);
		expect(crumbsToHide(widths, 30, 6, 287)).toBe(3);
		// Nothing more folds once only the first and last are left, so the last truncates
		expect(crumbsToHide(widths, 30, 6, 50)).toBe(3);
		// A crumb hidden with CSS takes no room: 60 + 60 + 100, with two gaps, is 232
		expect(crumbsToHide([0, 60, 60, 100], 30, 6, 232)).toBe(0);
		expect(crumbsToHide([80, 100], 30, 6, 50)).toBe(0);
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Trail maxVisible={3} />);
		await expectAccessible(container);
	});
});
