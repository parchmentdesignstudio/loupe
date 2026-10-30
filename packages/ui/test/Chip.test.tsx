import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Chip, ChipGroup } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Chip', () => {
	it('presses, by pointer and keyboard', async () => {
		const user = userEvent.setup();
		const onPress = vi.fn();
		render(<Chip onPress={onPress}>A new website</Chip>);
		await user.click(screen.getByRole('button', { name: 'A new website' }));
		await user.keyboard('{Enter}');
		expect(onPress).toHaveBeenCalledTimes(2);
	});

	it('groups under a name', () => {
		render(
			<ChipGroup aria-label="Or start with">
				<Chip>A new website</Chip>
			</ChipGroup>,
		);
		expect(screen.getByRole('group', { name: 'Or start with' })).toBeTruthy();
	});

	it('has nothing for axe to flag, in a group', async () => {
		const { container } = render(
			<ChipGroup aria-label="Or start with">
				<Chip>A new website</Chip>
				<Chip>Rework my site</Chip>
			</ChipGroup>,
		);
		await expectAccessible(container);
	});
});
