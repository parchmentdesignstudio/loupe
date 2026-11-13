import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('TextField', () => {
	it('is raised and 32px by default, or filled and small', () => {
		render(
			<>
				<TextField label="Name" />
				<TextField label="Width" variant="filled" size="small" />
				<TextField label="Height" variant="filled" isDisabled />
			</>,
		);
		const raised = screen.getByRole('textbox', { name: 'Name' }).className;
		expect(raised).toContain('bg-raised');
		expect(raised).toContain('py-1.5');
		const filled = screen.getByRole('textbox', { name: 'Width' }).className;
		expect(filled).toContain('bg-bleed/8');
		expect(filled).toContain('shadow-none');
		expect(filled).toContain('py-1');
		expect(filled).not.toContain('bg-raised');
		// Filled is already grey, so disabled goes lighter
		expect(screen.getByRole('textbox', { name: 'Height' }).className).toContain('bg-bleed/4');
	});

	it('labels its input and describes it', () => {
		render(<TextField label="Your name" description="As you’d like Steve to say it" />);
		const input = screen.getByLabelText('Your name');
		const described = document.getElementById(input.getAttribute('aria-describedby') ?? '');
		expect(described?.textContent).toBe('As you’d like Steve to say it');
	});

	it('marks a required label, out of screen readers’ way', () => {
		const { container } = render(<TextField label="Email" isRequired />);
		expect(container.querySelector('label')?.className).toContain('in-data-required:after:content-');
	});

	it('takes typing', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<TextField label="Your name" onChange={onChange} />);
		await user.type(screen.getByLabelText('Your name'), 'Sam');
		expect(onChange).toHaveBeenLastCalledWith('Sam');
	});

	it('shows its error when invalid, and says so to screen readers', () => {
		render(<TextField label="Email" isInvalid errorMessage="Enter an email address" />);
		const input = screen.getByLabelText('Email');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		const described = (input.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent);
		expect(described).toContain('Enter an email address');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<TextField label="Your name" description="As you’d like Steve to say it" />
				<TextField label="Email" isInvalid errorMessage="Enter an email address" />
			</>,
		);
		await expectAccessible(container);
	});
});
