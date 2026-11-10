import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('SearchField', () => {
	it('clears from its button, keeping focus in the field', async () => {
		const user = userEvent.setup();
		const onClear = vi.fn();
		render(<SearchField label="Typeface" onClear={onClear} />);
		const field = screen.getByRole('searchbox', { name: 'Typeface' }) as HTMLInputElement;
		await user.type(field, 'Fraunces');
		expect(field.value).toBe('Fraunces');
		await user.click(screen.getByRole('button', { name: /clear/i }));
		expect(field.value).toBe('');
		expect(onClear).toHaveBeenCalledOnce();
		expect(document.activeElement).toBe(field);
	});

	it('clears with Escape', async () => {
		const user = userEvent.setup();
		render(<SearchField label="Typeface" />);
		const field = screen.getByRole('searchbox', { name: 'Typeface' }) as HTMLInputElement;
		await user.type(field, 'Literata');
		await user.keyboard('{Escape}');
		expect(field.value).toBe('');
	});

	it('hides its clear button while empty', async () => {
		const user = userEvent.setup();
		render(<SearchField label="Typeface" />);
		const clear = screen.getByRole('button', { name: /clear/i, hidden: true });
		expect(clear.className).toContain('invisible');
		await user.type(screen.getByRole('searchbox'), 'N');
		expect(clear.className).not.toContain('invisible');
	});

	it('sends what’s typed with Enter', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<SearchField label="Typeface" onSubmit={onSubmit} />);
		await user.type(screen.getByRole('searchbox'), 'Newsreader{Enter}');
		expect(onSubmit).toHaveBeenCalledWith('Newsreader');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<SearchField label="Typeface" description="By name or foundry" defaultValue="Fraunces" />);
		await expectAccessible(container);
	});
});
