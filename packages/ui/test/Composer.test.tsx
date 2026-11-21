import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const setup = () => {
	const onSubmit = vi.fn();
	const user = userEvent.setup();
	render(<Composer aria-label="Your message" placeholder="Tell me what you’re working on" submitIcon={<svg aria-hidden="true" />} onSubmit={onSubmit} />);
	return { onSubmit, user, field: screen.getByRole('textbox', { name: 'Your message' }) as HTMLTextAreaElement, send: screen.getByRole('button', { name: 'Send' }) };
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

	it('starts a new line with Shift-Enter', async () => {
		const { onSubmit, user, field } = setup();
		await user.type(field, 'Line one{Shift>}{Enter}{/Shift}Line two{Enter}');
		expect(onSubmit).toHaveBeenCalledWith('Line one\nLine two');
	});

	it('leaves a controlled value for its owner to clear', async () => {
		const onSubmit = vi.fn();
		const onChange = vi.fn();
		const user = userEvent.setup();
		render(<Composer aria-label="Your message" submitIcon={<svg aria-hidden="true" />} value="A draft" onChange={onChange} onSubmit={onSubmit} />);
		const field = screen.getByRole('textbox', { name: 'Your message' }) as HTMLTextAreaElement;
		await user.type(field, '!');
		expect(onChange).toHaveBeenCalledWith('A draft!');
		await user.type(field, '{Enter}');
		expect(onSubmit).toHaveBeenCalledWith('A draft');
		expect(field.value).toBe('A draft');
	});

	it('won’t send an empty message, and points to the field instead', async () => {
		const { onSubmit, user, field, send } = setup();
		expect(send.hasAttribute('disabled')).toBe(false);
		await user.click(send);
		expect(onSubmit).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(field);
		await user.type(field, '   {Enter}');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<Composer aria-label="Your message" submitIcon={<svg aria-hidden="true" />} onSubmit={() => {}} />);
		await expectAccessible(container);
	});
});

describe('Composer’s extras', () => {
	it('shows context above the text, describes itself, keeps to its length and says Send on a phone', async () => {
		render(<Composer aria-label="Your message" description="Enter sends" maxLength={5} context={<span>Leek soup</span>} submitIcon={<svg aria-hidden="true" />} onSubmit={() => {}} />);
		const field = screen.getByRole('textbox', { name: 'Your message' }) as HTMLTextAreaElement;
		expect(screen.getByText('Leek soup')).toBeTruthy();
		expect(field).toHaveProperty('maxLength', 5);
		expect(field.getAttribute('enterkeyhint')).toBe('send');
		const described = field.getAttribute('aria-describedby') ?? '';
		expect(document.getElementById(described)?.textContent).toBe('Enter sends');
	});
});
