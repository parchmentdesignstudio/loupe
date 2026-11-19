import { useState } from 'react';
import { parseColor } from 'react-aria-components';
import { ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatchPicker, ColorSwatchPickerItem } from '../../src/index.js';
import { Choice, ControlGroup, Playground, ShowFocus, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';
import { ColourControl, extremes, randomColour } from './colour.js';

const insides = ['standard', 'opacity', 'channels', 'swatches'] as const;
type Contents = (typeof insides)[number];
const widths = { narrow: 'w-28', medium: 'w-48', wide: 'w-80' } as const;
type Width = keyof typeof widths;

// What the popover can hold in place of the standard area, hue and hex. The parts inside take the picker's colour
function Inside({ contents }: { contents: Contents }) {
	switch (contents) {
		case 'opacity':
			return (
				<>
					<ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
					<ColorSlider colorSpace="hsb" channel="hue" />
					<ColorSlider label="Opacity" channel="alpha" />
					<ColorField label="Hex" />
				</>
			);
		case 'channels':
			return (
				<div className="grid grid-cols-3 gap-2">
					<ColorField label="Red" colorSpace="rgb" channel="red" />
					<ColorField label="Green" colorSpace="rgb" channel="green" />
					<ColorField label="Blue" colorSpace="rgb" channel="blue" />
				</div>
			);
		case 'swatches':
			return (
				<>
					<ColorSwatchPicker aria-label="Swatches">
						{extremes.map((color) => (
							<ColorSwatchPickerItem key={color} color={color} />
						))}
					</ColorSwatchPicker>
					<ColorField label="Hex" />
				</>
			);
		default:
			return undefined;
	}
}

export function ColorPickerPlayground() {
	const [color, setColor] = useState(() => parseColor('#0c2920'));
	const [label, setLabel] = useRemembered('label', 'Theme');
	const [hasLabel, setHasLabel] = useRemembered('hasLabel', true);
	const [contents, setContents] = useRemembered('contents', 'standard', insides);
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [isPaired, setPaired] = useRemembered('isPaired', false);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const shuffle = () => {
		setColor(randomColour());
		setLabel(pick(['Theme', 'Background', 'Accent', longWords]));
		setHasLabel(Math.random() < 0.85);
		setContents(pick(insides));
		setWidth(pick(Object.keys(widths) as Width[]));
	};
	const picker = (
		<ShowFocus when={isFocused}>
			<ColorPicker label={hasLabel ? label : undefined} aria-label={hasLabel ? undefined : label} value={color} onChange={setColor} className={widths[width]}>
				{contents === 'standard' ? undefined : <Inside contents={contents} />}
			</ColorPicker>
		</ShowFocus>
	);
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />
					<SwitchControl label="Beside another" value={isPaired} onChange={setPaired} />
				</>
			}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label={hasLabel ? 'Label' : 'Label, read out'} value={label} onChange={setLabel} />
						<SwitchControl label="Label shown" value={hasLabel} onChange={setHasLabel} />
						<Choice label="Inside" options={insides} value={contents} onChange={setContents} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<ColourControl value={color} onChange={setColor} />
					</ControlGroup>
				</>
			}
		>
			{isPaired ? (
				<div className="flex flex-wrap items-start gap-2.5">
					{picker}
					<ColorPicker label={hasLabel ? 'Background' : undefined} aria-label="Background" defaultValue="#fffdf8" className={widths[width]} />
				</div>
			) : (
				picker
			)}
		</Playground>
	);
}
