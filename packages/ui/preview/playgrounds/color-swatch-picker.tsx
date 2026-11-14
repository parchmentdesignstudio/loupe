import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { Button, ColorSwatchPicker, ColorSwatchPickerItem } from '../../src/index.js';
import { Choice, ControlGroup, ControlRow, NumberControl, Playground, SwitchControl, pick } from '../playground.js';
import { extremes, randomColour } from './colour.js';

const palettes = {
	parchment: ['#fffdf8', '#f5ebe6', '#ceeea7', '#c76024', '#566861', '#0c2920'],
	fills: ['#0000', '#ffffff', '#f4f5f1', '#dfe2da', '#fbf6ef', '#1f2f31'],
	extremes,
} as const;
type Palette = keyof typeof palettes | 'random';
const paletteNames: readonly Palette[] = [...(Object.keys(palettes) as Palette[]), 'random'];

const sizes = { small: 'size-6', medium: undefined, large: 'size-12' } as const;
type Size = keyof typeof sizes;
const widths = { narrow: 'max-w-40', medium: 'max-w-sm', wide: 'max-w-none' } as const;
type Width = keyof typeof widths;

const randomSet = (count: number) => Array.from({ length: count }, () => randomColour().toString('hexa'));

// A palette repeats to fill the count, so many swatches can be tried with any of them. Each colour is its swatch's key,
// so a repeat is nudged lighter or darker until it's one of a kind
function coloursFor(palette: Palette, count: number, random: string[]) {
	const source = palette === 'random' ? random : palettes[palette];
	const seen = new Set<string>();
	return Array.from({ length: count }, (_, index) => {
		const base = parseColor(source[index % source.length]).toFormat('hsl');
		const lightness = base.getChannelValue('lightness');
		let colour = base;
		for (let step = 1; seen.has(colour.toString('hexa')); step++) {
			const offset = Math.ceil(step / 2) * 4 * (step % 2 ? 1 : -1);
			colour = base.withChannelValue('lightness', Math.min(100, Math.max(0, lightness + offset)));
		}
		seen.add(colour.toString('hexa'));
		return colour.toString('hexa');
	});
}

export function ColorSwatchPickerPlayground() {
	const [palette, setPalette] = useState<Palette>('parchment');
	const [count, setCount] = useState(6);
	const [random, setRandom] = useState(() => randomSet(40));
	const [size, setSize] = useState<Size>('medium');
	const [width, setWidth] = useState<Width>('wide');
	const [layout, setLayout] = useState<'grid' | 'stack'>('grid');
	const [value, setValue] = useState<Color | null>(() => parseColor('#c76024'));
	const [disableSome, setDisableSome] = useState(false);
	// Nothing chosen needs the picker uncontrolled, as its value can’t be null, so it’s remounted to clear it
	const [round, setRound] = useState(0);
	const colours = coloursFor(palette, count, random);
	const restart = (selected: Color | null) => {
		setValue(selected);
		setRound((current) => current + 1);
	};
	const shuffle = () => {
		const nextRandom = randomSet(40);
		const nextPalette = pick(paletteNames);
		const nextCount = pick([1, 3, 6, 12, 24, 40]);
		setRandom(nextRandom);
		setPalette(nextPalette);
		setCount(nextCount);
		setSize(pick(Object.keys(sizes) as Size[]));
		setWidth(pick(Object.keys(widths) as Width[]));
		const options = coloursFor(nextPalette, nextCount, nextRandom);
		restart(Math.random() < 0.2 ? null : parseColor(pick(options)));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Room" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice
							label="Palette"
							options={paletteNames}
							value={palette}
							onChange={(next) => {
								setPalette(next);
								restart(value);
							}}
						/>
						<NumberControl label="Swatches" value={count} onChange={setCount} minValue={0} maxValue={60} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Swatch size" options={Object.keys(sizes) as Size[]} value={size} onChange={setSize} />
						<Choice label="Layout" options={['grid', 'stack'] as const} value={layout} onChange={setLayout} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Every third disabled" value={disableSome} onChange={setDisableSome} />
						<ControlRow label="Chosen">
							<div className="flex items-center gap-2">
								<span className="text-control text-ink tabular-nums">{value ? value.toString('hexa') : 'Nothing'}</span>
								<Button variant="ghost" size="small" onPress={() => restart(null)} isDisabled={!value}>
									Clear
								</Button>
							</div>
						</ControlRow>
					</ControlGroup>
				</>
			}
		>
			{count === 0 ? (
				<p className="text-control text-muted">No swatches</p>
			) : (
				<ColorSwatchPicker
					key={round}
					aria-label="Colour"
					layout={layout}
					defaultValue={value ?? undefined}
					onChange={setValue}
					className={[widths[width], layout === 'stack' && 'flex-col'].filter(Boolean).join(' ')}
				>
					{colours.map((color, index) => (
						<ColorSwatchPickerItem key={index} color={color} className={sizes[size]} isDisabled={disableSome && index % 3 === 2} />
					))}
				</ColorSwatchPicker>
			)}
		</Playground>
	);
}
