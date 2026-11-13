import { useState } from 'react';
import { type FieldSize, type FieldVariant, NumberField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick } from '../playground.js';

const lengths = ['none', 'short', 'long'] as const;
const values = ['empty', 'typical', 'huge'] as const;
const widths = { narrow: 'w-32', medium: 'w-56', wide: 'w-full max-w-sm' } as const;
type Length = (typeof lengths)[number];
type Value = (typeof values)[number];
type Width = keyof typeof widths;

// Each format comes with limits and a step that suit it. A unit must be one Intl knows, or it throws
const formats = {
	number: { label: 'Width', description: 'In pixels, from 320 to 3840', min: 320, max: 3840, step: 10, typical: 1440, options: { useGrouping: false } },
	percent: { label: 'Opacity', description: 'From none to fully opaque', min: 0, max: 1, step: 0.05, typical: 0.8, options: { style: 'percent' } },
	currency: { label: 'Budget', description: 'Before VAT', min: 0, max: 100000, step: 50, typical: 1250, options: { style: 'currency', currency: 'GBP' } },
	unit: { label: 'Bleed', description: 'Added to each edge', min: 0, max: 20, step: 0.5, typical: 3, options: { style: 'unit', unit: 'millimeter' } },
} satisfies Record<string, { label: string; description: string; min: number; max: number; step: number; typical: number; options: Intl.NumberFormatOptions }>;
type Format = keyof typeof formats;

const placeholders = { none: undefined, short: 'Auto', long: longWords };
const errors = { short: 'Out of range', long: `${longWords}, as an error message` };

export function NumberFieldPlayground() {
	const [format, setFormat] = useState<Format>('number');
	const [content, setContent] = useState<Value>('typical');
	const [value, setValue] = useState(formats.number.typical);
	const [label, setLabel] = useState<Length>('short');
	const [description, setDescription] = useState<Length>('short');
	const [placeholder, setPlaceholder] = useState<Length>('short');
	const [width, setWidth] = useState<Width>('medium');
	const [hasLimits, setLimits] = useState(true);
	const [isWheelDisabled, setWheelDisabled] = useState(false);
	const [isInvalid, setInvalid] = useState(false);
	const [error, setError] = useState<'short' | 'long'>('short');
	const [isRequired, setRequired] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [variant, setVariant] = useState<FieldVariant>('raised');
	const [size, setSize] = useState<FieldSize>('medium');
	const preset = formats[format];
	// NaN is how a controlled number field shows empty
	const fill = (next: Value, from: Format = format) => {
		setContent(next);
		setValue(next === 'empty' ? Number.NaN : next === 'huge' ? 9876543210.5 : formats[from].typical);
	};
	const changeFormat = (next: Format) => {
		setFormat(next);
		fill(content, next);
	};
	const shuffle = () => {
		const nextFormat = pick(Object.keys(formats) as Format[]);
		setFormat(nextFormat);
		fill(pick(values), nextFormat);
		setLabel(pick(lengths));
		setDescription(pick(lengths));
		setPlaceholder(pick(lengths));
		setWidth(pick(Object.keys(widths) as Width[]));
		setLimits(Math.random() < 0.7);
		setInvalid(Math.random() < 0.3);
		setError(pick(['short', 'long'] as const));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Label" options={lengths} value={label} onChange={setLabel} />
						<Choice label="Description" options={lengths} value={description} onChange={setDescription} />
						<Choice label="Placeholder" options={lengths} value={placeholder} onChange={setPlaceholder} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Format" options={Object.keys(formats) as Format[]} value={format} onChange={changeFormat} />
						<SwitchControl label="Limits" value={hasLimits} onChange={setLimits} />
						<SwitchControl label="Wheel disabled" value={isWheelDisabled} onChange={setWheelDisabled} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={['raised', 'filled'] as const} value={variant} onChange={setVariant} />
						<Choice label="Size" options={['medium', 'small'] as const} value={size} onChange={setSize} />
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Value" options={values} value={content} onChange={(next) => fill(next)} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						{isInvalid && <Choice label="Error" options={['short', 'long'] as const} value={error} onChange={setError} />}
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<NumberField
				label={label === 'none' ? undefined : label === 'long' ? longWords : preset.label}
				aria-label={label === 'none' ? preset.label : undefined}
				description={description === 'none' ? undefined : description === 'long' ? `${longWords}, and then a second sentence to push it onto another line` : preset.description}
				placeholder={placeholders[placeholder]}
				value={value}
				onChange={setValue}
				minValue={hasLimits ? preset.min : undefined}
				maxValue={hasLimits ? preset.max : undefined}
				step={preset.step}
				formatOptions={preset.options}
				isWheelDisabled={isWheelDisabled}
				isInvalid={isInvalid}
				errorMessage={errors[error]}
				isRequired={isRequired}
				isReadOnly={isReadOnly}
				isDisabled={isDisabled}
				variant={variant}
				size={size}
				className={widths[width]}
			/>
		</Playground>
	);
}
