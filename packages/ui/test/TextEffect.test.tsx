import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextEffect } from '../src/index.js';

const reduce = (isReduced: boolean) =>
	vi.spyOn(window, 'matchMedia').mockImplementation((media) => ({ matches: isReduced && String(media).includes('reduce'), media: String(media), onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }));

afterEach(() => vi.restoreAllMocks());

describe('TextEffect', () => {
	it('shows its text, once, with nothing over it', () => {
		reduce(false);
		const { container } = render(<TextEffect variant="ray">Thinking</TextEffect>);
		expect(screen.getByText('Thinking')).toBeTruthy();
		expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(0);
	});

	it('wipes the old text for the new, then leaves only the new', async () => {
		reduce(false);
		const { container, rerender } = render(<TextEffect variant="ray">Thinking</TextEffect>);
		rerender(<TextEffect variant="ray">Found three recipes</TextEffect>);
		// The old text stays while the ray crosses, hidden from a screen reader, which reads the new
		expect(container.textContent).toContain('Thinking');
		expect(screen.getAllByText('Thinking').every((element) => element.closest('[aria-hidden]'))).toBe(true);
		await waitFor(() => expect(container.textContent).toBe('Found three recipes'));
	});

	it('just changes with reduced motion', () => {
		reduce(true);
		const { container, rerender } = render(<TextEffect variant="ray">Thinking</TextEffect>);
		rerender(<TextEffect variant="ray">Found three recipes</TextEffect>);
		expect(container.textContent).toBe('Found three recipes');
	});

	it('crosses again and again while it loops', async () => {
		reduce(false);
		const { container } = render(
			<TextEffect variant="ray" loop>
				Thinking
			</TextEffect>,
		);
		expect(container.querySelector('[aria-hidden]')).toBeTruthy();
		await waitFor(() => expect(container.querySelector('[aria-hidden]')).toBeNull());
		await waitFor(() => expect(container.querySelector('[aria-hidden]')).toBeTruthy());
	});
});
