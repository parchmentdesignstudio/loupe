import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, setOnOffLabels } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Checkbox', () => {
	it('ticks with a click on its label, and with Space', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Checkbox onChange={onChange}>A new website</Checkbox>);
		const box = screen.getByRole('checkbox', { name: 'A new website' });
		await user.click(screen.getByText('A new website'));
		expect((box as HTMLInputElement).checked).toBe(true);
		expect(onChange).toHaveBeenLastCalledWith(true);
		await user.keyboard(' ');
		expect(onChange).toHaveBeenLastCalledWith(false);
	});

	it('sends a group’s ticked values together', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<CheckboxGroup label="What do you need?" defaultValue={['website']} onChange={onChange}>
				<Checkbox value="identity">Brand identity</Checkbox>
				<Checkbox value="website">Website</Checkbox>
			</CheckboxGroup>,
		);
		expect(screen.getByRole('group', { name: 'What do you need?' })).toBeTruthy();
		await user.click(screen.getByRole('checkbox', { name: 'Brand identity' }));
		expect(onChange).toHaveBeenLastCalledWith(['website', 'identity']);
	});

	it('says when it’s mixed', () => {
		render(<Checkbox isIndeterminate>All services</Checkbox>);
		expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
	});
});

describe('RadioGroup', () => {
	it('moves the choice with the arrow keys', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<RadioGroup label="Budget" defaultValue="small" onChange={onChange}>
				<Radio value="small">Under £5k</Radio>
				<Radio value="mid">£5–15k</Radio>
			</RadioGroup>,
		);
		await user.tab();
		await user.keyboard('{ArrowDown}');
		expect(onChange).toHaveBeenLastCalledWith('mid');
		expect((screen.getByRole('radio', { name: '£5–15k' }) as HTMLInputElement).checked).toBe(true);
	});
});

describe('Switch', () => {
	it('turns on and off', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Switch onChange={onChange}>Newsletter</Switch>);
		await user.click(screen.getByRole('switch', { name: 'Newsletter' }));
		await user.click(screen.getByRole('switch', { name: 'Newsletter' }));
		expect(onChange.mock.calls).toEqual([[true], [false]]);
	});

	it('is rounded unless its shape is full', () => {
		render(
			<>
				<Switch>Rounded</Switch>
				<Switch shape="full">Full</Switch>
			</>,
		);
		const track = (name: string) => screen.getByRole('switch', { name }).closest('label')?.querySelector('.w-9');
		expect(track('Rounded')?.className).toContain('rounded-lg');
		expect(track('Full')?.className).toContain('rounded-full');
	});

	it('marks on/off labels on the root, and keeps them out of its name', () => {
		setOnOffLabels(true);
		expect(document.documentElement.hasAttribute('data-on-off-labels')).toBe(true);
		render(<Switch defaultSelected>Autosave</Switch>);
		expect(screen.getByRole('switch', { name: 'Autosave' })).toBeTruthy();
		setOnOffLabels(false);
		expect(document.documentElement.hasAttribute('data-on-off-labels')).toBe(false);
	});
});

describe('Choices', () => {
	it('go flat and muted when disabled, rather than faded', () => {
		render(
			<>
				<Checkbox isDisabled>Brand identity</Checkbox>
				<Switch isDisabled defaultSelected>
					Autosave
				</Switch>
			</>,
		);
		for (const name of ['Brand identity', 'Autosave']) {
			const label = screen.getByText(name).closest('label')!;
			expect(label.className).toContain('text-muted');
			expect(label.className).not.toContain('opacity-40');
		}
		const track = screen.getByText('Autosave').closest('label')!.querySelector('.w-9')!;
		expect(track.className).toContain('bg-bleed/12');
		expect(track.className).not.toContain('inset-shadow-well');
		expect(track.className).not.toContain('bg-green-68');
	});

	it('have nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<CheckboxGroup label="What do you need?" description="Tick any that apply">
					<Checkbox value="identity">Brand identity</Checkbox>
					<Checkbox value="website" isDisabled>
						Website
					</Checkbox>
				</CheckboxGroup>
				<RadioGroup label="Budget" orientation="horizontal" isInvalid errorMessage="Choose a budget">
					<Radio value="small">Under £5k</Radio>
					<Radio value="mid">£5–15k</Radio>
				</RadioGroup>
				<Switch defaultSelected>Newsletter</Switch>
			</>,
		);
		await expectAccessible(container);
	});
});
