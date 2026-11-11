import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Button', () => {
	it('presses with a click, Enter and Space', async () => {
		const user = userEvent.setup();
		const onPress = vi.fn();
		render(<Button onPress={onPress}>Schedule call</Button>);
		await user.click(screen.getByRole('button', { name: 'Schedule call' }));
		await user.keyboard('{Enter}');
		await user.keyboard(' ');
		expect(onPress).toHaveBeenCalledTimes(3);
	});

	it('shows its focus ring for keyboard focus only', async () => {
		const user = userEvent.setup();
		render(<Button>Schedule call</Button>);
		const button = screen.getByRole('button');
		await user.click(button);
		expect(button.className).toContain('outline-0');
		await user.tab();
		await user.tab({ shift: true });
		expect(button.hasAttribute('data-focus-visible')).toBe(true);
		expect(button.className).toContain('outline-2');
	});

	it('takes no presses when disabled', async () => {
		const user = userEvent.setup();
		const onPress = vi.fn();
		render(
			<Button onPress={onPress} isDisabled>
				Schedule call
			</Button>,
		);
		await user.click(screen.getByRole('button'));
		expect(onPress).not.toHaveBeenCalled();
		expect(screen.getByRole('button').className).toContain('opacity-40');
	});

	it('merges a className over its own classes, as a string or a function of its state', () => {
		render(
			<>
				<Button className="px-6">Wide</Button>
				<Button className={({ isDisabled }) => (isDisabled ? 'px-8' : 'px-6')} isDisabled>
					Wider
				</Button>
			</>,
		);
		const [wide, wider] = screen.getAllByRole('button');
		expect(wide.className).toContain('px-6');
		expect(wide.className).not.toContain('px-4');
		expect(wider.className).toContain('px-8');
	});

	it('keeps a circle round at either size', () => {
		render(
			<>
				<Button shape="circle" aria-label="Send">
					<svg aria-hidden="true" />
				</Button>
				<Button shape="circle" size="small" aria-label="Close">
					<svg aria-hidden="true" />
				</Button>
			</>,
		);
		const [medium, small] = screen.getAllByRole('button').map((button) => button.className.split(' '));
		expect(medium).toContain('rounded-full');
		expect(small).toContain('rounded-full');
		expect(medium).toEqual(expect.arrayContaining(['px-2', 'py-1.5']));
		expect(medium).not.toContain('px-3');
		expect(small).toEqual(expect.arrayContaining(['px-1.5', 'py-1']));
		expect(small).not.toContain('px-2.5');
	});

	it('fills solid with the accent and void with ink', () => {
		render(
			<>
				<Button>Schedule call</Button>
				<Button variant="void">Book a visit</Button>
			</>,
		);
		const [accent, ink] = screen.getAllByRole('button').map((button) => button.className.split(' '));
		expect(accent).toEqual(expect.arrayContaining(['bg-accent', 'text-paper']));
		expect(ink).toEqual(expect.arrayContaining(['bg-ink', 'text-paper']));
		expect(ink).not.toContain('bg-accent');
	});

	it('keeps text-body and text-ink apart when merging', () => {
		render(<Button className="text-body">Schedule call</Button>);
		expect(screen.getByRole('button').className).toContain('text-body');
		expect(screen.getByRole('button').className).toContain('text-paper');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<Button>Schedule call</Button>
				<Button variant="plain" shape="circle" aria-label="Email Steve">
					<svg aria-hidden="true" />
				</Button>
			</>,
		);
		await expectAccessible(container);
	});
});
