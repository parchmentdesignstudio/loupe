import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const setup = () => {
	const onSubmit = vi.fn();
	const user = userEvent.setup();
	render(<Composer label="Your message" placeholder="Tell me what you’re working on" submitIcon={<svg aria-hidden="true" />} onSubmit={onSubmit} />);
	return { onSubmit, user, field: screen.getByRole('textbox', { name: 'Your message' }) as HTMLInputElement, send: screen.getByRole('button', { name: 'Send' }) };
};

describe('Composer', () => {
	it('sends with Enter, trimmed, and clears', async () => {
		const { onSubmit, user, field } = setup();
		await user.type(field, '  A new website {Enter}');
		expect(onSubmit).toHaveBeenCalledWith('A new website');
		expect(field.value).toBe('');
	});

	it('sends with its button', async () => {
		const { onSubmit, user, field, send } = setup();
		await user.type(field, 'Rework my site');
		await user.click(send);
		expect(onSubmit).toHaveBeenCalledWith('Rework my site');
	});

	it('won’t send an empty message', async () => {
		const { onSubmit, user, field, send } = setup();
		expect(send.hasAttribute('disabled')).toBe(true);
		await user.type(field, '   {Enter}');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Composer label="Your message" submitIcon={<svg aria-hidden="true" />} onSubmit={() => {}} />);
		await expectAccessible(container);
	});
});
