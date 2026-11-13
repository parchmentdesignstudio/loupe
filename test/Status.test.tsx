import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, Status } from '../src/index.js';
import { pageRange } from '../src/Pagination.js';
import { expectAccessible } from './accessible.js';

describe('Status', () => {
	it('reads as its label and detail, with the dot left out', async () => {
		const { container } = render(
			<Status tone="info" detail="25 Sept">
				Call arranged
			</Status>,
		);
		expect(container.textContent).toBe('Call arranged·25 Sept');
		expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(2);
		await expectAccessible(container);
	});

	it('shows no separator without a detail', () => {
		const { container } = render(<Status tone="success">Qualified</Status>);
		expect(container.textContent).toBe('Qualified');
	});
});

describe('pageRange', () => {
	it('shows every page when they fit', () => {
		expect(pageRange(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('folds the far pages into gaps, keeping the same length', () => {
		expect(pageRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'gap', 20]);
		expect(pageRange(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
		expect(pageRange(20, 20)).toEqual([1, 'gap', 16, 17, 18, 19, 20]);
		for (let page = 1; page <= 20; page++) expect(pageRange(page, 20)).toHaveLength(7);
	});

	it('never folds a single page into a gap', () => {
		expect(pageRange(4, 20)).toEqual([1, 2, 3, 4, 5, 'gap', 20]);
		expect(pageRange(17, 20)).toEqual([1, 'gap', 16, 17, 18, 19, 20]);
	});
});

describe('Pagination', () => {
	it('marks the current page, and moves on a press', async () => {
		const onChange = vi.fn();
		const { container } = render(<Pagination page={1} count={8} onChange={onChange} />);
		const nav = screen.getByRole('navigation', { name: 'Pages' });
		expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Page 1');
		expect(within(nav).queryByRole('button', { name: 'Page 1' })).toBeNull();
		expect(within(nav).getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(true);
		await userEvent.click(within(nav).getByRole('button', { name: 'Next page' }));
		expect(onChange).toHaveBeenLastCalledWith(2);
		await userEvent.click(within(nav).getByRole('button', { name: 'Page 8' }));
		expect(onChange).toHaveBeenLastCalledWith(8);
		await expectAccessible(container);
	});
});
