import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker, ColorSwatchPickerItem } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const palette = ['#fbf6ef', '#f8de7e', '#f6a57f', '#1f2f31'];

describe('ColorSwatch', () => {
	it('names its colour, and says when it’s transparent', () => {
		render(
			<>
				<ColorSwatch color="#1f2f31" />
				<ColorSwatch color="#0000" />
			</>,
		);
		const [ink, clear] = screen.getAllByRole('img');
		expect(ink.getAttribute('aria-label')).toBeTruthy();
		expect(clear.getAttribute('aria-label')).toBe('transparent');
	});
});

describe('ColorSwatchPicker', () => {
	it('picks a colour with the arrow keys and Enter', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ColorSwatchPicker aria-label="Fill" defaultValue="#fbf6ef" onChange={onChange}>
				{palette.map((color) => (
					<ColorSwatchPickerItem key={color} color={color} />
				))}
			</ColorSwatchPicker>,
		);
		const options = screen.getAllByRole('option');
		expect(options[0].getAttribute('aria-selected')).toBe('true');
		await user.tab();
		await user.keyboard('{ArrowRight}{Enter}');
		expect(onChange.mock.lastCall?.[0].toString('hex')).toBe('#F8DE7E');
		expect(options[1].getAttribute('aria-selected')).toBe('true');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<ColorSwatchPicker aria-label="Fill" defaultValue="#1f2f31">
				{[...palette, '#0000'].map((color) => (
					<ColorSwatchPickerItem key={color} color={color} />
				))}
			</ColorSwatchPicker>,
		);
		await expectAccessible(container);
	});
});

describe('ColorField', () => {
	it('takes a hex typed into it', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" defaultValue="#fbf6ef" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		await user.clear(field);
		await user.type(field, 'f6a57f{Enter}');
		expect(onChange.mock.lastCall?.[0].toString('hex')).toBe('#F6A57F');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<ColorField label="Background" description="As hex" defaultValue="#fbf6ef" />);
		await expectAccessible(container);
	});
});

describe('ColorSlider', () => {
	it('is named for its channel, and moves with the arrow keys', async () => {
		const user = userEvent.setup();
		render(<ColorSlider colorSpace="hsb" channel="hue" defaultValue="hsb(40, 50%, 97%)" />);
		const slider = screen.getByRole('slider', { name: 'Hue' });
		expect(screen.getByText('40°')).toBeTruthy();
		await user.tab();
		expect(document.activeElement).toBe(slider);
		await user.keyboard('{ArrowRight}');
		expect(screen.getByText('41°')).toBeTruthy();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<ColorSlider colorSpace="hsb" channel="hue" defaultValue="hsb(40, 50%, 97%)" />
				<ColorSlider label="Opacity" channel="alpha" defaultValue="rgba(31, 47, 49, 0.6)" />
			</>,
		);
		await expectAccessible(container);
	});
});

describe('ColorArea', () => {
	it('moves across and up with the arrow keys', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" defaultValue="hsb(40, 50%, 50%)" onChange={onChange} />);
		await user.tab();
		await user.keyboard('{ArrowRight}');
		expect(onChange.mock.lastCall?.[0].getChannelValue('saturation')).toBe(51);
		await user.keyboard('{ArrowUp}');
		expect(onChange.mock.lastCall?.[0].getChannelValue('brightness')).toBe(51);
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<ColorArea aria-label="Colour" colorSpace="hsb" xChannel="saturation" yChannel="brightness" defaultValue="hsb(40, 50%, 50%)" />);
		await expectAccessible(container);
	});
});

describe('ColorPicker', () => {
	it('shows its colour in a button named by its label, which opens the picker', async () => {
		const user = userEvent.setup();
		render(<ColorPicker label="Theme" defaultValue="#0f3d30" />);
		const button = screen.getByRole('button', { name: 'Theme #0F3D30' });
		await user.click(button);
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBeTruthy();
		expect(screen.getByRole('slider', { name: 'Hue' })).toBeTruthy();
		const hex = screen.getByRole('textbox', { name: 'Hex' });
		await user.clear(hex);
		await user.type(hex, '1f2f31{Enter}');
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.getByRole('button', { name: 'Theme #1F2F31' })).toBeTruthy();
	});

	it('is named by aria-label without a label', () => {
		render(<ColorPicker aria-label="Fill" defaultValue="#fbf6ef" />);
		expect(screen.getByRole('button', { name: 'Fill' })).toBeTruthy();
	});

	it('has nothing for axe to flag, closed or open', async () => {
		const user = userEvent.setup();
		const { container } = render(<ColorPicker label="Background" defaultValue="#f1efe6" />);
		await expectAccessible(container);
		await user.click(screen.getByRole('button'));
		await expectAccessible(screen.getByRole('dialog'));
	});
});
