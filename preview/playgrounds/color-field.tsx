import { useState } from 'react';
import { type Color, type ColorChannel, type ColorSpace, parseColor } from 'react-aria-components';
import { ColorField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';
import { ColourControl, channels, randomColour, spaces } from './colour.js';

const widths = { narrow: 'w-28', medium: 'w-56', wide: 'w-full max-w-md' } as const;
type Width = keyof typeof widths;

// Given a channel, the field types that one channel as a number rather than the whole colour as hex
export function ColorFieldPlayground() {
	const [color, setColor] = useState<Color | null>(() => parseColor('#0c2920'));
	const [last, setLast] = useState<Color>(() => parseColor('#0c2920'));
	const [mode, setMode] = useState<'hex' | 'channel'>('hex');
	const [space, setSpace] = useState<ColorSpace>('rgb');
	const [channel, setChannel] = useState<ColorChannel>('red');
	const [label, setLabel] = useState('Theme colour');
	const [description, setDescription] = useState('Browsers tint their toolbar with it');
	const [placeholder, setPlaceholder] = useState('#000000');
	const [errorMessage, setErrorMessage] = useState('Use a hex colour, such as #0c2920');
	const [width, setWidth] = useState<Width>('medium');
	const [isInvalid, setInvalid] = useState(false);
	const [isRequired, setRequired] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const isChannel = mode === 'channel';
	const update = (next: Color | null) => {
		setColor(next);
		if (next) setLast(next);
	};
	const setColourSpace = (next: ColorSpace) => {
		setSpace(next);
		setChannel(channels[next][0]);
	};
	const shuffle = () => {
		update(Math.random() < 0.15 ? null : randomColour());
		setMode(Math.random() < 0.3 ? 'channel' : 'hex');
		const nextSpace = pick(spaces);
		setSpace(nextSpace);
		setChannel(pick(channels[nextSpace]));
		setLabel(pick(['Theme colour', 'Hex', 'Background', longWords, '']));
		setDescription(pick(['Browsers tint their toolbar with it', '', longWords]));
		setWidth(pick(Object.keys(widths) as Width[]));
		setInvalid(Math.random() < 0.2);
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<TextControl label="Description" value={description} onChange={setDescription} />
						<TextControl label="Placeholder" value={placeholder} onChange={setPlaceholder} />
						<TextControl label="Error message" value={errorMessage} onChange={setErrorMessage} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Type" options={['hex', 'channel'] as const} value={mode} onChange={setMode} />
						{isChannel && <Choice label="Colour space" options={spaces} value={space} onChange={setColourSpace} />}
						{isChannel && <Choice label="Channel" options={channels[space]} value={channel} onChange={setChannel} />}
					</ControlGroup>
					<ControlGroup label="State">
						<ColourControl value={last} onChange={update} />
						<SwitchControl label="Empty" value={!color} onChange={(isEmpty) => update(isEmpty ? null : last)} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<ColorField
				label={label || undefined}
				aria-label={label ? undefined : 'Colour'}
				description={description || undefined}
				placeholder={placeholder || undefined}
				errorMessage={errorMessage}
				value={color}
				onChange={update}
				colorSpace={isChannel ? space : undefined}
				channel={isChannel ? channel : undefined}
				isInvalid={isInvalid}
				isRequired={isRequired}
				isReadOnly={isReadOnly}
				isDisabled={isDisabled}
				className={widths[width]}
			/>
		</Playground>
	);
}
