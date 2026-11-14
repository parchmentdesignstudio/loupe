import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const project = (orientation?: 'horizontal' | 'vertical') => (
	<Tabs orientation={orientation} defaultSelectedKey="type">
		<TabList aria-label="Project">
			<Tab id="brief">Brief</Tab>
			<Tab id="type">Type</Tab>
			<Tab id="colour">Colour</Tab>
		</TabList>
		<TabPanel id="brief">A studio site for Parchment</TabPanel>
		<TabPanel id="type">Elza Round, with Auger Mono for labels</TabPanel>
		<TabPanel id="colour">Ink on a cream ground</TabPanel>
	</Tabs>
);

describe('Tabs', () => {
	it('shows the chosen tab’s panel', async () => {
		const user = userEvent.setup();
		render(project());
		expect(screen.getByRole('tabpanel').textContent).toBe('Elza Round, with Auger Mono for labels');
		await user.click(screen.getByRole('tab', { name: 'Colour' }));
		expect(screen.getByRole('tab', { name: 'Colour' }).getAttribute('aria-selected')).toBe('true');
		expect(screen.getByRole('tabpanel').textContent).toBe('Ink on a cream ground');
	});

	it('moves between tabs with the arrow keys, along a row or down a column', async () => {
		const user = userEvent.setup();
		const { unmount } = render(project());
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Type' }));
		await user.keyboard('{ArrowRight}');
		expect(screen.getByRole('tab', { name: 'Colour' }).getAttribute('aria-selected')).toBe('true');
		unmount();

		render(project('vertical'));
		expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
		await user.tab();
		await user.keyboard('{ArrowUp}');
		expect(screen.getByRole('tab', { name: 'Brief' }).getAttribute('aria-selected')).toBe('true');
	});

	it('makes links of tabs with an href', async () => {
		const user = userEvent.setup();
		const navigate = vi.fn();
		render(
			<RouterProvider navigate={navigate}>
				<Tabs selectedKey="work">
					<TabList aria-label="Studio">
						<Tab id="work" href="/work">
							Work
						</Tab>
						<Tab id="about" href="/about">
							About
						</Tab>
					</TabList>
					<TabPanel id="work">Recent projects</TabPanel>
				</Tabs>
			</RouterProvider>,
		);
		const about = screen.getByRole('tab', { name: 'About' });
		expect(about.tagName).toBe('A');
		expect(about.getAttribute('href')).toBe('/about');
		await user.click(about);
		expect(navigate.mock.lastCall?.[0]).toBe('/about');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(project());
		await expectAccessible(container);
	});
});
