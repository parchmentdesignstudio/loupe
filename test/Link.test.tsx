import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Link } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Link', () => {
	it('marks the page you’re on with aria-current', () => {
		render(
			<>
				<Link href="#identity">Brand identity</Link>
				<Link href="#website" aria-current="page">
					Website
				</Link>
			</>,
		);
		const current = screen.getByRole('link', { name: 'Website' });
		expect(current.hasAttribute('data-current')).toBe(true);
		expect(current.className).toContain('font-medium');
		expect(current.className).toContain('no-underline');
		expect(screen.getByRole('link', { name: 'Brand identity' }).className).not.toContain('no-underline');
	});

	it('shows its focus ring for keyboard focus only', async () => {
		const user = userEvent.setup();
		render(<Link href="#website">Website</Link>);
		const link = screen.getByRole('link');
		await user.click(link);
		expect(link.className).toContain('outline-0');
		await user.tab();
		await user.tab({ shift: true });
		expect(link.hasAttribute('data-focus-visible')).toBe(true);
		expect(link.className).toContain('outline-2');
	});

	it('takes no presses when disabled', async () => {
		const user = userEvent.setup();
		const onPress = vi.fn();
		render(
			<Link href="#website" onPress={onPress} isDisabled>
				Website
			</Link>,
		);
		const link = screen.getByRole('link');
		await user.click(link);
		expect(onPress).not.toHaveBeenCalled();
		expect(link.getAttribute('aria-disabled')).toBe('true');
		expect(link.className).toContain('opacity-40');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<p>
				Anyone with the <Link href="#share">link</Link> can view this project.
			</p>,
		);
		await expectAccessible(container);
	});
});
