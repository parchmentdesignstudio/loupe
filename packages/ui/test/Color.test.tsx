import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { type Color, Form, parseColor } from 'react-aria-components';
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

	it('takes Swatch’s sizes, large unless set', () => {
		render(
			<>
				<ColorSwatch color="#1f2f31" />
				<ColorSwatch color="#1f2f31" size="field" />
			</>,
		);
		const [large, field] = screen.getAllByRole('img').map((swatch) => swatch.className.split(' '));
		expect(large).toContain('size-8');
		expect(field).toContain('size-4');
	});

	it('gives its colour to the lighter line inside its edge, as Swatch does', () => {
		render(<ColorSwatch color="#1f2f31" />);
		expect(screen.getByRole('img').style.getPropertyValue('--swatch-color')).toBe('rgba(31, 47, 49, 1)');
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

	it('makes a colour typed without an alpha opaque when the text is the only place its opacity shows', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" format="hex" hasOpacity={false} defaultValue="#ff000080" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' }) as HTMLInputElement;
		expect(field.value).toBe('#FF000080');
		await user.clear(field);
		await user.type(field, '#00ff00{Enter}');
		expect(onChange.mock.lastCall?.[0].toString('hexa')).toBe('#00FF00FF');
		expect(field.value).toBe('#00FF00');
	});

	it('keeps the exact colour given back as a Color, however its oklch rounds', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		function Picker() {
			const [color, setColor] = useState<Color | null>(() => parseColor('#f00'));
			return (
				<ColorField
					label="Background"
					value={color}
					onChange={(next, oklch) => {
						setColor(next);
						onChange(oklch);
					}}
				/>
			);
		}
		render(<Picker />);
		const field = screen.getByRole('textbox', { name: 'Background' }) as HTMLInputElement;
		await user.tripleClick(field);
		await user.paste('color(display-p3 0 0.25 0.7)');
		const exact = onChange.mock.lastCall?.[0];
		expect(field.value).toBe(exact);
		await user.click(screen.getByRole('textbox', { name: 'Opacity' }));
		await user.keyboard('{ArrowDown}');
		expect(onChange.mock.lastCall?.[0]).toBe(exact.replace(')', ' / 0.99)'));
	});

	it('runs validate on its colour, and shows what it says once a paste is committed', async () => {
		const user = userEvent.setup();
		const validate = vi.fn((color: Color | null) => (color?.toString('hex') === '#FF0000' ? 'Not that one' : null));
		render(<ColorField label="Background" defaultValue="#fbf6ef" validate={validate} />);
		const field = screen.getByRole('textbox', { name: 'Background' });
		await user.tripleClick(field);
		await user.paste('#ff0000');
		await user.tab();
		expect(field.getAttribute('aria-invalid')).toBe('true');
		expect(screen.getByText('Not that one')).toBeTruthy();
	});

	it('leaves a read-only field as it is when a colour is pasted into it', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorField label="Background" isReadOnly defaultValue="#0000ff" onChange={onChange} />);
		const field = screen.getByRole('textbox', { name: 'Background' }) as HTMLInputElement;
		const shown = field.value;
		await user.tripleClick(field);
		await user.paste('#ff0000');
		expect(onChange).not.toHaveBeenCalled();
		expect(field.value).toBe(shown);
	});

	it('submits its colour with its opacity once, and nothing while it’s disabled', () => {
		render(
			<form aria-label="Theme">
				<ColorField label="Background" name="bg" defaultValue="rgba(251, 246, 239, 0.5)" />
				<ColorField label="Text" name="ink" isDisabled defaultValue="#1f2f31" />
			</form>,
		);
		const data = new FormData(screen.getByRole('form') as HTMLFormElement);
		expect(data.getAll('bg')).toEqual(['oklch(97.51% 0.0107 76.6 / 0.5)']);
		expect(data.has('ink')).toBe(false);
	});

	it('goes back to the colour it started with when its form is reset', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<form aria-label="Theme">
				<ColorField label="Background" name="bg" defaultValue="#fbf6ef" onChange={onChange} />
				<button type="reset">Reset</button>
			</form>,
		);
		const form = screen.getByRole('form') as HTMLFormElement;
		const field = screen.getByRole('textbox', { name: 'Background' }) as HTMLInputElement;
		const shown = field.value;
		await user.tripleClick(field);
		await user.paste('#ff0000');
		await user.clear(screen.getByRole('textbox', { name: 'Opacity' }));
		await user.type(screen.getByRole('textbox', { name: 'Opacity' }), '40{Enter}');
		expect(new FormData(form).get('bg')).toBe('oklch(62.8% 0.2577 29.23 / 0.4)');
		onChange.mockClear();
		await user.click(screen.getByRole('button', { name: 'Reset' }));
		expect(new FormData(form).get('bg')).toBe(shown);
		expect(field.value).toBe(shown);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.lastCall?.[1]).toBe(shown);
	});

	it('belongs to the form it names from outside it, and shows that form’s error for its name', () => {
		render(
			<>
				<form id="theme" aria-label="Theme" />
				<ColorField label="Background" name="bg" form="theme" isRequired />
				<Form validationErrors={{ ink: 'Server says no' }}>
					<ColorField label="Text" name="ink" defaultValue="#1f2f31" />
				</Form>
			</>,
		);
		const form = screen.getByRole('form', { name: 'Theme' }) as HTMLFormElement;
		expect((screen.getByRole('textbox', { name: 'Background' }) as HTMLInputElement).form).toBe(form);
		expect(form.checkValidity()).toBe(false);
		expect(screen.getByRole('textbox', { name: 'Text' }).getAttribute('aria-invalid')).toBe('true');
		expect(screen.getByText('Server says no')).toBeTruthy();
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
		expect((hex as HTMLInputElement).value).toBe('#0F3D30');
		expect(screen.queryByRole('textbox', { name: 'Opacity' })).toBeNull();
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
