import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tag, TagGroup } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const sizes = ['16', '32', '180'];

describe('TagGroup', () => {
	it('chooses tags', async () => {
		const user = userEvent.setup();
		render(
			<TagGroup label="Sizes" selectionMode="multiple" defaultSelectedKeys={['32']}>
				{sizes.map((size) => (
					<Tag key={size} id={size}>
						{size}
					</Tag>
				))}
			</TagGroup>,
		);
		const [sixteen, thirtyTwo] = screen.getAllByRole('row');
		expect(thirtyTwo.getAttribute('aria-selected')).toBe('true');
		await user.click(sixteen);
		expect(sixteen.getAttribute('aria-selected')).toBe('true');
		expect(thirtyTwo.getAttribute('aria-selected')).toBe('true');
	});

	it('removes a tag with its button, or with Backspace', async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();
		render(
			<TagGroup label="Typefaces" onRemove={onRemove}>
				<Tag id="fraunces">Fraunces</Tag>
				<Tag id="literata">Literata</Tag>
			</TagGroup>,
		);
		const [fraunces, literata] = screen.getAllByRole('row');
		await user.click(within(fraunces).getByRole('button'));
		expect(onRemove).toHaveBeenLastCalledWith(new Set(['fraunces']));
		await user.click(literata);
		await user.keyboard('{Backspace}');
		expect(onRemove).toHaveBeenLastCalledWith(new Set(['literata']));
	});

	it('is named by its label, and described by its description and error', () => {
		render(
			<TagGroup label="Sizes" description="Each makes a file" errorMessage="Choose a size">
				<Tag id="16">16</Tag>
			</TagGroup>,
		);
		const grid = screen.getByRole('grid', { name: 'Sizes' });
		const describedBy = (grid.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent);
		expect(describedBy).toEqual(['Each makes a file', 'Choose a size']);
	});

	it('says when it’s empty', () => {
		render(<TagGroup label="Typefaces" items={[]} renderEmptyState={() => 'None left to compare'}>{() => <Tag>Never</Tag>}</TagGroup>);
		expect(screen.getByText('None left to compare')).toBeTruthy();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<TagGroup label="Sizes" description="Each makes a file" selectionMode="multiple" onRemove={() => {}}>
				{sizes.map((size) => (
					<Tag key={size} id={size}>
						{size}
					</Tag>
				))}
			</TagGroup>,
		);
		await expectAccessible(container);
	});
});
