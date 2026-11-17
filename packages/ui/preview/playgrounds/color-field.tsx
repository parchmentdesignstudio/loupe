import { useState } from 'react';
import { type Color, type ColorChannel, type ColorSpace, parseColor } from 'react-aria-components';
import { ColorField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';
import { ColourControl, channels, randomColour, spaces, spaceLabels } from './colour.js';

const widths = { narrow: 'w-28', medium: 'w-56', wide: 'w-full max-w-md' } as const;
type Width = keyof typeof widths;
const modes = ['any', 'channel'] as const;
const variants = ['raised', 'filled'] as const;
const sizes = ['medium', 'small'] as const;

// Given a channel, the field types that one channel as a number rather than any colour, shown as hex with its opacity
export function ColorFieldPlayground() {
	const [last, setLast] = useState<Color>(() => parseColor('#0c2920'));
	const [isEmpty, setEmpty] = useRemembered('isEmpty', false);
	const [mode, setMode] = useRemembered('mode', 'any', modes);
	const [hasOpacity, setOpacity] = useRemembered('hasOpacity', true);
	const [variant, setVariant] = useRemembered('variant', 'raised', variants);
	const [size, setSize] = useRemembered('size', 'medium', sizes);
	const [space, setSpace] = useRemembered<ColorSpace>('space', 'rgb', spaces);
	const [channel, setChannel] = useRemembered<ColorChannel>('channel', channels[space][0], channels[space]);
	const [label, setLabel] = useRemembered('label', 'Theme colour');
	const [description, setDescription] = useRemembered('description', 'Browsers tint their toolbar with it');
	const [placeholder, setPlaceholder] = useRemembered('placeholder', 'oklch(0% 0 0)');
	const [errorMessage, setErrorMessage] = useRemembered('errorMessage', 'Use a colour, such as #0c2920 or oklch(0.27 0.04 168)');
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [isInvalid, setInvalid] = useRemembered('isInvalid', false);
	const [isRequired, setRequired] = useRemembered('isRequired', false);
	const [isReadOnly, setReadOnly] = useRemembered('isReadOnly', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const isChannel = mode === 'channel';
	const color = isEmpty ? null : last;
	const update = (next: Color | null) => {
		setEmpty(!next);
		if (next) setLast(next);
	};
	const setColourSpace = (next: ColorSpace) => {
		setSpace(next);
		setChannel(channels[next][0]);
	};
	const shuffle = () => {
		update(Math.random() < 0.15 ? null : randomColour());
		setMode(Math.random() < 0.3 ? 'channel' : 'any');
		setOpacity(Math.random() < 0.7);
		setVariant(pick(variants));
		setSize(pick(sizes));
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
						<Choice label="Type" options={modes} value={mode} onChange={setMode} />
						{!isChannel && <SwitchControl label="Opacity" value={hasOpacity} onChange={setOpacity} />}
						{!isChannel && <Choice label="Variant" options={variants} value={variant} onChange={setVariant} />}
						{!isChannel && <Choice label="Size" options={sizes} value={size} onChange={setSize} />}
						{isChannel && <Choice label="Colour space" options={spaces} labels={spaceLabels} value={space} onChange={setColourSpace} />}
						{isChannel && <Choice label="Channel" options={channels[space]} value={channel} onChange={setChannel} />}
					</ControlGroup>
					<ControlGroup label="State">
						<ColourControl value={last} onChange={update} />
						<SwitchControl label="Empty" value={isEmpty} onChange={setEmpty} />
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
				hasOpacity={hasOpacity}
				variant={variant}
				size={size}
				isInvalid={isInvalid}
				isRequired={isRequired}
				isReadOnly={isReadOnly}
				isDisabled={isDisabled}
				className={widths[width]}
			/>
		</Playground>
	);
}
