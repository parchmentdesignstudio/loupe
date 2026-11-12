import { type Color, type ColorChannel, type ColorSpace, parseColor } from 'react-aria-components';
import { ColorField, ColorSwatchPicker, ColorSwatchPickerItem } from '../../src/index.js';
import { ControlRow, pick } from '../playground.js';

// Shared by the colour playgrounds: the colours that stress a control most, a random one, and a row to set one

/** Very light, very dark, saturated and see-through, the colours most likely to lose a thumb or a ring */
export const extremes = ['#ffffff', '#fffdf8', '#fff3a0', '#ff2d00', '#00e05a', '#1a3cff', '#c76024', '#3a0a5c', '#0c2920', '#000000', '#c7602480', '#0000'];

export const spaces = ['rgb', 'hsl', 'hsb'] as const satisfies readonly ColorSpace[];

/** Each space's channels, without alpha */
export const channels = {
	rgb: ['red', 'green', 'blue'],
	hsl: ['hue', 'saturation', 'lightness'],
	hsb: ['hue', 'saturation', 'brightness'],
} as const satisfies Record<ColorSpace, readonly ColorChannel[]>;

/** Now and then an extreme, otherwise any hue at a lightness and saturation that could be anything */
export function randomColour(): Color {
	if (Math.random() < 0.3) return parseColor(pick(extremes)).toFormat('rgba');
	const hue = Math.floor(Math.random() * 360);
	const saturation = Math.floor(Math.random() * 101);
	const lightness = Math.floor(Math.random() * 101);
	return parseColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
}

/** The extremes to tap, and a hex field for anything else */
export function ColourControl({ label = 'Colour', value, onChange }: { label?: string; value: Color; onChange: (color: Color) => void }) {
	return (
		<ControlRow label={label}>
			<div className="flex flex-wrap items-center justify-end gap-3">
				<ColorSwatchPicker aria-label={label} value={value} onChange={onChange} className="gap-1.5">
					{extremes.map((color) => (
						<ColorSwatchPickerItem key={color} color={color} className="size-6" />
					))}
				</ColorSwatchPicker>
				<ColorField aria-label={`${label}, as hex`} value={value} onChange={(color) => color && onChange(color)} className="w-28" />
			</div>
		</ControlRow>
	);
}
