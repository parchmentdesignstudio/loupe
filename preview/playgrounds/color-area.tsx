import { useState } from 'react';
import { type ColorChannel, type ColorSpace, parseColor } from 'react-aria-components';
import { ColorArea, ColorSlider } from '../../src/index.js';
import { Choice, ControlGroup, ControlRow, Playground, SwitchControl, pick } from '../playground.js';
import { ColourControl, channels, randomColour, spaces } from './colour.js';

const sizes = { small: 'w-32', medium: 'w-56', large: 'w-80' } as const;
type Size = keyof typeof sizes;

// The colour is kept in the area's own space, so a grey or black keeps its hue rather than snapping to red
export function ColorAreaPlayground() {
	const [space, setSpace] = useState<ColorSpace>('hsb');
	const [x, setXChannel] = useState<ColorChannel>('saturation');
	const [y, setYChannel] = useState<ColorChannel>('brightness');
	const [color, setColor] = useState(() => parseColor('#c76024').toFormat('hsb'));
	const [size, setSize] = useState<Size>('medium');
	const [hasSlider, setSlider] = useState(true);
	const [isDisabled, setDisabled] = useState(false);
	const others = channels[space].filter((channel) => channel !== x && channel !== y);
	const setChannels = (nextSpace: ColorSpace, nextX: ColorChannel, nextY: ColorChannel) => {
		setSpace(nextSpace);
		setXChannel(nextX);
		setYChannel(nextY);
		setColor((current) => current.toFormat(nextSpace));
	};
	// Picking the channel the other axis has swaps them, so the two never match
	const setAxis = (axis: 'x' | 'y', channel: ColorChannel) => {
		if (axis === 'x') setChannels(space, channel, channel === y ? x : y);
		else setChannels(space, channel === x ? y : x, channel);
	};
	const shuffle = () => {
		const nextSpace = pick(spaces);
		const [nextX, nextY] = channels[nextSpace].toSorted(() => Math.random() - 0.5);
		setChannels(nextSpace, nextX, nextY);
		setColor(randomColour().toFormat(nextSpace));
		setSize(pick(Object.keys(sizes) as Size[]));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="Size" options={Object.keys(sizes) as Size[]} value={size} onChange={setSize} />
					<SwitchControl label="Slider for the third channel" value={hasSlider} onChange={setSlider} />
				</>
			}
			controls={
				<>
					<ControlGroup label="Behaviour">
						<Choice label="Colour space" options={spaces} value={space} onChange={(next) => setChannels(next, channels[next][1], channels[next][2])} />
						<Choice label="Across" options={channels[space]} value={x} onChange={(channel) => setAxis('x', channel)} />
						<Choice label="Up" options={channels[space]} value={y} onChange={(channel) => setAxis('y', channel)} />
					</ControlGroup>
					<ControlGroup label="State">
						<ColourControl value={color} onChange={(next) => setColor(next.toFormat(space))} />
						<ControlRow label="Value">
							<span className="text-control text-ink tabular-nums">{color.toString('css')}</span>
						</ControlRow>
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<div className={['flex flex-col gap-3', sizes[size]].join(' ')}>
				<ColorArea aria-label="Colour" colorSpace={space} xChannel={x} yChannel={y} value={color} onChange={setColor} isDisabled={isDisabled} />
				{hasSlider && others[0] && <ColorSlider colorSpace={space} channel={others[0]} value={color} onChange={setColor} isDisabled={isDisabled} />}
			</div>
		</Playground>
	);
}
