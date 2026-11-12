import { useState } from 'react';
import { Slider } from '../../src/index.js';
import { Choice, Playground, SwitchControl, longWords, pick } from '../playground.js';

const lengths = ['none', 'short', 'long'] as const;
const thumbs = ['one', 'range'] as const;
const widths = { narrow: 'w-32', medium: 'w-64', wide: 'w-full max-w-md' } as const;
type Length = (typeof lengths)[number];
type Thumbs = (typeof thumbs)[number];
type Width = keyof typeof widths;

// Each format comes with limits, a step and a starting value or range that suit it. A unit must be one Intl knows, or
// it throws
const formats = {
	number: { label: 'Columns', description: 'Across the grid', min: 1, max: 24, step: 1, one: 12, range: [4, 16], options: {} },
	percent: { label: 'Padding', description: 'Of the shorter side', min: 0, max: 0.4, step: 0.01, one: 0.12, range: [0.05, 0.25], options: { style: 'percent' } },
	currency: { label: 'Budget', description: 'Before VAT', min: 0, max: 30000, step: 500, one: 15000, range: [5000, 15000], options: { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 } },
	unit: { label: 'Rotation', description: 'Either way from upright', min: -180, max: 180, step: 1, one: 0, range: [-45, 45], options: { style: 'unit', unit: 'degree' } },
} satisfies Record<string, { label: string; description: string; min: number; max: number; step: number; one: number; range: number[]; options: Intl.NumberFormatOptions }>;
type Format = keyof typeof formats;

// The slider remounts when its thumbs or format change, so it starts from values that fit the new limits
export function SliderPlayground() {
	const [format, setFormat] = useState<Format>('percent');
	const [count, setCount] = useState<Thumbs>('one');
	const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
	const [label, setLabel] = useState<Length>('short');
	const [description, setDescription] = useState<Length>('none');
	const [width, setWidth] = useState<Width>('medium');
	const [isDisabled, setDisabled] = useState(false);
	const preset = formats[format];
	const isVertical = orientation === 'vertical';
	const shuffle = () => {
		setFormat(pick(Object.keys(formats) as Format[]));
		setCount(pick(thumbs));
		setOrientation(Math.random() < 0.2 ? 'vertical' : 'horizontal');
		setLabel(pick(lengths));
		setDescription(pick(lengths));
		setWidth(pick(Object.keys(widths) as Width[]));
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<Choice label="Format" options={Object.keys(formats) as Format[]} value={format} onChange={setFormat} />
					<Choice label="Thumbs" options={thumbs} value={count} onChange={setCount} />
					<Choice label="Orientation" options={['horizontal', 'vertical'] as const} value={orientation} onChange={setOrientation} />
					<Choice label="Label" options={lengths} value={label} onChange={setLabel} />
					<Choice label="Description" options={lengths} value={description} onChange={setDescription} />
					<Choice label={isVertical ? 'Width, when horizontal' : 'Width'} options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} isDisabled={isVertical} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
				</>
			}
		>
			<Slider<number | number[]>
				key={`${format}-${count}`}
				label={label === 'none' ? undefined : label === 'long' ? longWords : preset.label}
				aria-label={label === 'none' ? preset.label : undefined}
				description={description === 'none' ? undefined : description === 'long' ? `${longWords}, and then a second sentence to push it onto another line` : preset.description}
				defaultValue={count === 'one' ? preset.one : preset.range}
				minValue={preset.min}
				maxValue={preset.max}
				step={preset.step}
				formatOptions={preset.options}
				thumbLabels={count === 'range' ? ['Minimum', 'Maximum'] : undefined}
				orientation={orientation}
				isDisabled={isDisabled}
				className={isVertical ? 'h-48' : widths[width]}
			/>
		</Playground>
	);
}
