import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';
import { ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker, ColorSwatchPickerItem } from '../src/index.js';
import { expectAccessible } from './accessible.js';

// Held as a Color, as a picker holds it, so what comes back is the nearest sRGB
function Controlled() {
	const [color, setColor] = useState<Color | null>(() => parseColor('#fbf6ef'));
	return <ColorField label="Background" value={color} onChange={setColor} />;
}

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

	it('takes any colour pasted over it, and shows it as oklch', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" defaultValue="#fbf6ef" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		await user.tripleClick(field);
		await user.paste('rgb(255 0 0)');
		expect(onChange.mock.lastCall?.[0].toString('hexa')).toBe('#FF0000FF');
		expect(onChange.mock.lastCall?.[1]).toBe('oklch(62.8% 0.2577 29.23)');
		expect((field as HTMLInputElement).value).toBe('oklch(62.8% 0.2577 29.23)');
	});

	it('keeps a colour outside sRGB exactly, though its Color is the nearest', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" defaultValue="#fbf6ef" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		await user.tripleClick(field);
		await user.paste('oklch(0.7 0.3 145)');
		expect(onChange.mock.lastCall?.[1]).toBe('oklch(70% 0.3 145)');
		expect((field as HTMLInputElement).value).toBe('oklch(70% 0.3 145)');
		expect(onChange.mock.lastCall?.[0].toString('hex')).toMatch(/^#[0-9A-F]{6}$/);
	});

	it('keeps the exact colour while its Color comes back as the nearest sRGB, as in a picker', async () => {
		const user = userEvent.setup();
		render(<Controlled />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		await user.tripleClick(field);
		await user.paste('color(display-p3 0 1 0)');
		expect((field as HTMLInputElement).value).toMatch(/^oklch\(84\.\d+% 0\.3\d+ 14\d/);
	});

	it('takes another format typed in on Enter, and goes back on what isn’t a colour', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" format="hex" defaultValue="#fbf6ef" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		await user.clear(field);
		await user.type(field, 'rgb(31 47 49){Enter}');
		expect(onChange.mock.lastCall?.[0].toString('hex')).toBe('#1F2F31');
		await user.clear(field);
		await user.type(field, 'blurple');
		await user.tab();
		expect(onChange).toHaveBeenCalledTimes(1);
		expect((field as HTMLInputElement).value).toBe('#1F2F31');
	});

	it('keeps its opacity for a colour without alpha, and takes one with it', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" defaultValue="rgba(251, 246, 239, 0.5)" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		const opacity = screen.getByRole('textbox', { name: 'Opacity' });
		expect((opacity as HTMLInputElement).value).toBe('50%');
		await user.tripleClick(field);
		await user.paste('#1f2f31');
		expect(onChange.mock.lastCall?.[0].getChannelValue('alpha')).toBe(0.5);
		await user.tripleClick(field);
		await user.paste('#1f2f3133');
		expect((opacity as HTMLInputElement).value).toBe('20%');
	});

	it('changes only the opacity from its own field', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" defaultValue="#1f2f31" onChange={onChange} />);
		const opacity = screen.getByRole('textbox', { name: 'Opacity' });
		await user.clear(opacity);
		await user.type(opacity, '40{Enter}');
		expect(onChange.mock.lastCall?.[0].toString('hexa')).toBe('#1F2F3166');
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
