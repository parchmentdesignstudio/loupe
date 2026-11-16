import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert, Button } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Alert', () => {
	it('reads as its title and text, with the icon left out and nothing announced', async () => {
		const { container } = render(
			<Alert tone="warning" title="Your card expires on 31 December">
				Update it before then, or the studio plan stops renewing
			</Alert>,
		);
		expect(container.textContent).toBe('Your card expires on 31 DecemberUpdate it before then, or the studio plan stops renewing');
		expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
		expect(screen.queryByRole('alert')).toBeNull();
		expect(screen.queryByRole('status')).toBeNull();
		await expectAccessible(container);
	});

	it('takes a role for when it appears after something happens', () => {
		render(
			<Alert tone="danger" role="alert">
				The invoice couldn’t be sent
			</Alert>,
		);
		expect(screen.getByRole('alert').textContent).toBe('The invoice couldn’t be sent');
	});

	it('dismisses with its button, named for screen readers', async () => {
		const onDismiss = vi.fn();
		const { container } = render(
			<Alert variant="notice" tone="info" onDismiss={onDismiss} actions={<Button variant="secondary" size="small">Review</Button>}>
				Two leads haven’t been contacted this week
			</Alert>,
		);
		await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
		expect(onDismiss).toHaveBeenCalledOnce();
		expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
		await expectAccessible(container);
	});

	it('swaps the tone’s icon, or leaves it out', () => {
		const { container, rerender } = render(<Alert icon={null}>Saved</Alert>);
		expect(container.querySelector('svg')).toBeNull();
		rerender(<Alert icon={<svg data-testid="own" />}>Saved</Alert>);
		expect(screen.getByTestId('own')).toBeTruthy();
	});
});
