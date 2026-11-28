import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocsSearch } from '../src/docs.js';

describe('DocsSearch', () => {
	it('lists commands before the pages, and runs one rather than going anywhere', async () => {
		const onAction = vi.fn();
		const onOpenChange = vi.fn();
		render(<DocsSearch isOpen onOpenChange={onOpenChange} pages={[{ href: '#/button', name: 'Button', group: 'Actions' }]} commands={[{ id: 'compose', name: 'Compose this page', group: '⌥G', onAction }]} />);
		const options = screen.getAllByRole('option');
		expect(options.map((option) => option.textContent)).toEqual(['Compose this page⌥G', 'ButtonActions']);
		await userEvent.click(options[0]);
		expect(onAction).toHaveBeenCalledOnce();
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
