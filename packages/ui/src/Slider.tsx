import { useId } from 'react';
import { Slider as AriaSlider, SliderFill, type SliderProps as AriaSliderProps, SliderOutput, SliderThumb, SliderTrack, composeRenderProps } from 'react-aria-components';
import { Description, type FieldTextProps, Label } from './Field.js';
import { focusRing, tv } from './tv.js';

// The track is the area that takes a press, as tall as the thumb, with the rail drawn thin through its middle
const slider = tv({
	slots: {
		base: 'flex flex-col gap-1.5',
		header: 'flex flex-wrap items-baseline justify-between gap-x-3',
		output: 'ms-auto text-control whitespace-nowrap text-muted tabular-nums',
		track: 'relative',
		rail: 'absolute rounded-full bg-bleed/12',
		fill: 'rounded-full bg-ink',
	},
	variants: {
		orientation: {
			horizontal: { track: 'h-5 w-full', rail: 'inset-x-0 top-1/2 h-1 -translate-y-1/2' },
			vertical: { base: 'items-center', track: 'w-5 flex-1', rail: 'inset-y-0 left-1/2 w-1 -translate-x-1/2' },
		},
		isDisabled: {
			// The well is only on false, as inset-shadow-none comes earlier in the CSS than inset-shadow-well and would lose
			false: { rail: 'inset-shadow-well' },
			true: { fill: 'bg-muted' },
		},
	},
});

// React Aria sets the thumb's left and a translate of -50% both ways, so top-1/2 is all it takes to centre it on the rail
const thumb = tv({
	extend: focusRing,
	base: 'size-5 rounded-full bg-knob shadow-handle',
	variants: {
		isDisabled: {
			true: 'bg-bleed/24 shadow-none',
		},
		orientation: {
			horizontal: 'top-1/2',
			vertical: 'left-1/2',
		},
	},
});

export interface SliderProps<T extends number | number[]> extends Omit<AriaSliderProps<T>, 'children'>, Omit<FieldTextProps, 'errorMessage'> {
	/** A name for each thumb of a range, such as Minimum and Maximum */
	thumbLabels?: string[];
}

/** A number between two limits, dragged or moved with the arrow keys. An array of values makes a range, with a thumb for each */
export function Slider<T extends number | number[]>({ label, description, thumbLabels, ...props }: SliderProps<T>) {
	const descriptionId = useId();
	return (
		<AriaSlider {...props} className={composeRenderProps(props.className, (className, { orientation, isDisabled }) => slider({ orientation, isDisabled }).base({ className }))}>
			{({ state, orientation, isDisabled }) => {
				const slots = slider({ orientation, isDisabled });
				return (
					<>
						<div className={slots.header()}>
							{label && <Label>{label}</Label>}
							<SliderOutput className={slots.output()}>{state.values.map((_, index) => state.getThumbValueLabel(index)).join(' – ')}</SliderOutput>
						</div>
						<SliderTrack className={slots.track()}>
							<div className={slots.rail()}>
								<SliderFill className={slots.fill()} />
							</div>
							{state.values.map((_, index) => (
								<SliderThumb
									key={index}
									index={index}
									aria-label={thumbLabels?.[index]}
									aria-describedby={description ? descriptionId : undefined}
									className={(thumbState) => thumb({ ...thumbState, orientation })}
								/>
							))}
						</SliderTrack>
						{description && <Description id={descriptionId}>{description}</Description>}
					</>
				);
			}}
		</AriaSlider>
	);
}
