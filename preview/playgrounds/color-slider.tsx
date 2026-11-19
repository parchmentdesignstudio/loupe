import { useState } from 'react';
import { type ColorChannel, type ColorSpace, parseColor } from 'react-aria-components';
import { ColorSlider, ColorSwatch } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';
import { ColourControl, channels, randomColour, spaces, spaceLabels } from './colour.js';

const lengths = {
	horizontal: { short: 'w-32', medium: 'w-64', long: 'w-full max-w-lg' },
	vertical: { short: 'h-32', medium: 'h-56', long: 'h-80' },
} as const;
type Length = keyof (typeof lengths)['horizontal'];
type Orientation = keyof typeof lengths;
const orientations = Object.keys(lengths) as Orientation[];
const lengthNames = ['short', 'medium', 'long'] as const satisfies readonly Length[];

const channelsWithAlpha = (space: ColorSpace): readonly ColorChannel[] => [...channels[space], 'alpha'];

// An empty label leaves the slider to name itself after its channel
export function ColorSliderPlayground() {
	const [space, setSpace] = useRemembered<ColorSpace>('space', 'hsb', spaces);
	const [channel, setChannel] = useRemembered<ColorChannel>('channel', channels[space][0], channelsWithAlpha(space));
	const [color, setColor] = useState(() => parseColor('#c76024').toFormat(space));
	const [orientation, setOrientation] = useRemembered('orientation', 'horizontal', orientations);
	const [length, setLength] = useRemembered('length', 'medium', lengthNames);
	const [label, setLabel] = useRemembered('label', '');
	const [hasSwatch, setSwatch] = useRemembered('hasSwatch', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const setColourSpace = (next: ColorSpace) => {
		setSpace(next);
		if (!channelsWithAlpha(next).includes(channel)) setChannel(channels[next][0]);
		setColor((current) => current.toFormat(next));
	};
	const shuffle = () => {
		const nextSpace = pick(spaces);
		setColourSpace(nextSpace);
		setChannel(pick(channelsWithAlpha(nextSpace)));
		setColor(randomColour().toFormat(nextSpace));
		setOrientation(Math.random() < 0.25 ? 'vertical' : 'horizontal');
		setLength(pick(lengthNames));
		setLabel(pick(['', '', 'Tint', 'Opacity', longWords]));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="Length" options={lengthNames} value={length} onChange={setLength} />
					<SwitchControl label="Swatch alongside" value={hasSwatch} onChange={setSwatch} />
				</>
			}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Orientation" options={orientations} value={orientation} onChange={setOrientation} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Colour space" options={spaces} labels={spaceLabels} value={space} onChange={setColourSpace} />
						<Choice label="Channel" options={channelsWithAlpha(space)} value={channel} onChange={setChannel} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<ColourControl value={color} onChange={(next) => setColor(next.toFormat(space))} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<div className={orientation === 'horizontal' ? 'flex w-full items-end justify-center gap-3' : 'flex items-end gap-3'}>
				<ColorSlider
					colorSpace={space}
					channel={channel}
					orientation={orientation}
					label={label || undefined}
					value={color}
					onChange={setColor}
					isDisabled={isDisabled}
					className={lengths[orientation][length]}
					data-show-focus={isFocused || undefined}
				/>
				{hasSwatch && <ColorSwatch color={color} />}
			</div>
		</Playground>
	);
}
