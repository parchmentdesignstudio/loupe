import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ToggleButton, ToggleButtonGroup } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const views = (
	<ToggleButtonGroup aria-label="View" defaultSelectedKeys={['week']}>
		<ToggleButton id="day">Day</ToggleButton>
		<ToggleButton id="week">Week</ToggleButton>
		<ToggleButton id="month">Month</ToggleButton>
	</ToggleButtonGroup>
);

describe('ToggleButtonGroup', () => {
	it('chooses one, and one always stays chosen', async () => {
		const user = userEvent.setup();
		render(views);
		const day = screen.getByRole('radio', { name: 'Day' });
		await user.click(day);
		expect(day.getAttribute('aria-checked')).toBe('true');
		expect(screen.getByRole('radio', { name: 'Week' }).getAttribute('aria-checked')).toBe('false');
		await user.click(day);
		expect(day.getAttribute('aria-checked')).toBe('true');
	});

	it('is one Tab stop, with arrow keys between its buttons', async () => {
		const user = userEvent.setup();
		render(
			<>
				{views}
				<button type="button">After</button>
			</>,
		);
		const radios = screen.getAllByRole('radio');
		await user.tab();
		const first = document.activeElement;
		expect(radios).toContain(first);
		await user.keyboard('{ArrowRight}');
		expect(radios).toContain(document.activeElement);
		expect(document.activeElement).not.toBe(first);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
	});

	it('takes several at once, and lets them all go', async () => {
		const user = userEvent.setup();
		render(
			<ToggleButtonGroup aria-label="Show" selectionMode="multiple" defaultSelectedKeys={['grid']}>
				<ToggleButton id="grid">Grid</ToggleButton>
				<ToggleButton id="rulers">Rulers</ToggleButton>
			</ToggleButtonGroup>,
		);
		const grid = screen.getByRole('button', { name: 'Grid' });
		const rulers = screen.getByRole('button', { name: 'Rulers' });
		await user.click(rulers);
		expect(grid.getAttribute('aria-pressed')).toBe('true');
		expect(rulers.getAttribute('aria-pressed')).toBe('true');
		await user.click(grid);
		await user.click(rulers);
		expect(grid.getAttribute('aria-pressed')).toBe('false');
		expect(rulers.getAttribute('aria-pressed')).toBe('false');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(views);
		await expectAccessible(container);
	});
});
