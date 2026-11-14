import { useState } from 'react';
import { type FieldSize, type FieldVariant, TextField } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, longWords, pick } from '../playground.js';

const lengths = ['none', 'short', 'long'] as const;
const values = ['empty', 'short', 'long'] as const;
const widths = { narrow: 'w-40', medium: 'w-64', wide: 'w-full max-w-sm' } as const;
type Length = (typeof lengths)[number];
type Value = (typeof values)[number];
type Width = keyof typeof widths;

const labels = { none: undefined, short: 'Your name', long: longWords };
const descriptions = { none: undefined, short: 'As you’d like Steve to say it', long: `${longWords}, and then a second sentence to push it onto another line` };
const placeholders = { none: undefined, short: 'Sam Smith', long: longWords };
const errors = { short: 'Enter your name', long: `${longWords}, as an error message` };
const contents = {
	empty: '',
	short: 'Sam Smith',
	long: 'Samantha Josephine Smithington-Fairweather of the Upper Wolds, who’d rather not be shortened, and has the paperwork to prove it',
};

// The field remounts when Value changes, so it starts from the chosen text but still takes typing
export function TextFieldPlayground() {
	const [label, setLabel] = useState<Length>('short');
	const [description, setDescription] = useState<Length>('none');
	const [placeholder, setPlaceholder] = useState<Length>('short');
	const [value, setValue] = useState<Value>('empty');
	const [width, setWidth] = useState<Width>('medium');
	const [multiline, setMultiline] = useState(false);
	const [rows, setRows] = useState(4);
	const [isInvalid, setInvalid] = useState(false);
	const [error, setError] = useState<'short' | 'long'>('short');
	const [isRequired, setRequired] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [variant, setVariant] = useState<FieldVariant>('raised');
	const [size, setSize] = useState<FieldSize>('medium');
	const shuffle = () => {
		setLabel(pick(lengths));
		setDescription(pick(lengths));
		setPlaceholder(pick(lengths));
		setValue(pick(values));
		setWidth(pick(Object.keys(widths) as Width[]));
		setMultiline(Math.random() < 0.3);
		setRows(pick([2, 4, 6]));
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
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={['raised', 'filled'] as const} value={variant} onChange={setVariant} />
						<Choice label="Size" options={['medium', 'small'] as const} value={size} onChange={setSize} />
						<SwitchControl label="Multiline" value={multiline} onChange={setMultiline} />
						{multiline && <NumberControl label="Rows" value={rows} onChange={setRows} minValue={1} maxValue={12} />}
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Value" options={values} value={value} onChange={setValue} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						{isInvalid && <Choice label="Error" options={['short', 'long'] as const} value={error} onChange={setError} />}
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<TextField
				key={`${value}-${multiline}`}
				label={labels[label]}
				aria-label={label === 'none' ? 'Your name' : undefined}
				description={descriptions[description]}
				placeholder={placeholders[placeholder]}
				defaultValue={contents[value]}
				multiline={multiline}
				rows={rows}
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
