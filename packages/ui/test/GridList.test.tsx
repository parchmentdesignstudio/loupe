import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button, GridList, GridListHeader, GridListItem, GridListSection } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const projects = (
	<GridList aria-label="Projects" selectionMode="single">
		<GridListItem id="parchment" textValue="Parchment">
			Parchment
			<Button variant="ghost" size="small">
				Open
			</Button>
		</GridListItem>
		<GridListItem id="loupe">Loupe</GridListItem>
		<GridListItem id="favicon">Favicon</GridListItem>
	</GridList>
);

describe('GridList', () => {
	it('chooses an item with the pointer, and with the keyboard', async () => {
		const user = userEvent.setup();
		render(projects);
		const [parchment, loupe] = screen.getAllByRole('row');
		await user.click(loupe);
		expect(loupe.getAttribute('aria-selected')).toBe('true');
		await user.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(parchment);
		await user.keyboard(' ');
		expect(parchment.getAttribute('aria-selected')).toBe('true');
		expect(loupe.getAttribute('aria-selected')).toBe('false');
	});

	it('holds buttons of its own, reached with the arrow keys', async () => {
		const user = userEvent.setup();
		render(projects);
		await user.tab();
		await user.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open' }));
	});

	it('shows a checkbox in each item when several can be chosen', async () => {
		const user = userEvent.setup();
		render(
			<GridList aria-label="Artwork" selectionMode="multiple" defaultSelectedKeys={['favicon']}>
				<GridListItem id="favicon">favicon.svg</GridListItem>
				<GridListItem id="og">og-image.png</GridListItem>
			</GridList>,
		);
		const [favicon, og] = screen.getAllByRole('row');
		expect((within(favicon).getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
		await user.click(within(og).getByRole('checkbox'));
		expect(og.getAttribute('aria-selected')).toBe('true');
		expect(favicon.getAttribute('aria-selected')).toBe('true');
	});

	it('lays tiles out in a grid, under headings', () => {
		render(
			<GridList aria-label="Outputs" layout="grid" selectionMode="single">
				<GridListSection id="browser">
					<GridListHeader>Browser</GridListHeader>
					<GridListItem id="favicon-16">Favicon 16</GridListItem>
					<GridListItem id="favicon-32">Favicon 32</GridListItem>
				</GridListSection>
				<GridListSection id="home">
					<GridListHeader>Home screen</GridListHeader>
					<GridListItem id="apple">Apple touch icon</GridListItem>
				</GridListSection>
			</GridList>,
		);
		const grid = screen.getByRole('grid', { name: 'Outputs' });
		expect(grid.getAttribute('data-layout')).toBe('grid');
		expect(within(grid).getAllByRole('rowgroup')).toHaveLength(2);
		expect(within(grid).getByText('Home screen')).toBeTruthy();
	});

	it('says when it’s empty', () => {
		render(<GridList aria-label="Projects" items={[]} renderEmptyState={() => 'No projects yet'}>{() => <GridListItem>Never</GridListItem>}</GridList>);
		expect(screen.getByText('No projects yet')).toBeTruthy();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				{projects}
				<GridList aria-label="Outputs" layout="grid" selectionMode="multiple">
					<GridListSection id="browser">
						<GridListHeader>Browser</GridListHeader>
						<GridListItem id="favicon-16">Favicon 16</GridListItem>
						<GridListItem id="favicon-32">Favicon 32</GridListItem>
					</GridListSection>
				</GridList>
			</>,
		);
		await expectAccessible(container);
	});
});
