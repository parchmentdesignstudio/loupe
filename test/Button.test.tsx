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
		const { className } = screen.getByRole('button');
		expect(className).toContain('text-muted');
		expect(className).toContain('shadow-none');
		expect(className).not.toContain('opacity-40');
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

	it('puts an icon at the start or end, and pads that side less', () => {
		render(
			<>
				<Button start={<svg data-testid="plus" aria-hidden="true" />}>New project</Button>
				<Button size="small" end={<svg data-testid="arrow" aria-hidden="true" />}>
					Continue
				</Button>
			</>,
		);
		const [start, end] = screen.getAllByRole('button');
		expect(start.firstElementChild).toBe(screen.getByTestId('plus'));
		expect(start.textContent).toBe('New project');
		expect(start.className.split(' ')).toContain('ps-2.5');
		expect(end.lastElementChild).toBe(screen.getByTestId('arrow'));
		expect(end.className.split(' ')).toContain('pe-2');
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

	it('fills primary with yellow and secondary with sage', () => {
		render(
			<>
				<Button>Schedule call</Button>
				<Button variant="secondary">Book a visit</Button>
			</>,
		);
		const [primary, secondary] = screen.getAllByRole('button').map((button) => button.className.split(' '));
		expect(primary).toEqual(expect.arrayContaining(['[--fill:oklch(0.865_0.159_87.4)]', 'text-pine-26']));
		expect(secondary).toEqual(expect.arrayContaining(['[--fill:oklch(0.807_0.019_175.2)]', 'text-pine-26']));
		expect(secondary).not.toContain('[--fill:oklch(0.865_0.159_87.4)]');
	});

	it('keeps text-body and text-ink apart when merging', () => {
		render(<Button className="text-body">Schedule call</Button>);
		expect(screen.getByRole('button').className).toContain('text-body');
		expect(screen.getByRole('button').className).toContain('text-pine-26');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<Button>Schedule call</Button>
				<Button variant="tertiary" shape="circle" aria-label="Email Steve">
					<svg aria-hidden="true" />
				</Button>
			</>,
		);
		await expectAccessible(container);
	});
});
