import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('TextField', () => {
	it('labels its input and describes it', () => {
		render(<TextField label="Your name" description="As you’d like Steve to say it" />);
		const input = screen.getByLabelText('Your name');
		const described = document.getElementById(input.getAttribute('aria-describedby') ?? '');
		expect(described?.textContent).toBe('As you’d like Steve to say it');
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
