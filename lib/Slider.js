import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { Slider as AriaSlider, SliderFill, SliderOutput, SliderThumb, SliderTrack, composeRenderProps } from 'react-aria-components';
import { Description, Label } from './Field.js';
import { focusRing, tv } from './tv.js';
// The track is the area that takes a press, as tall as the thumb, with the rail drawn thin through its middle
const slider = tv({
    slots: {
        base: 'flex flex-col gap-1.5',
        header: 'flex items-baseline justify-between gap-3',
        output: 'ms-auto text-control text-muted tabular-nums',
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
            true: { base: 'opacity-50' },
        },
    },
});
// React Aria sets the thumb's left and a translate of -50% both ways, so top-1/2 is all it takes to centre it on the rail
const thumb = tv({
    extend: focusRing,
    base: 'size-5 rounded-full bg-knob shadow-raised',
    variants: {
        orientation: {
            horizontal: 'top-1/2',
            vertical: 'left-1/2',
        },
    },
});
/** A number between two limits, dragged or moved with the arrow keys. An array of values makes a range, with a thumb for each */
export function Slider({ label, description, thumbLabels, ...props }) {
    const descriptionId = useId();
    return (_jsx(AriaSlider, { ...props, className: composeRenderProps(props.className, (className, { orientation, isDisabled }) => slider({ orientation, isDisabled }).base({ className })), children: ({ state, orientation, isDisabled }) => {
            const slots = slider({ orientation, isDisabled });
            return (_jsxs(_Fragment, { children: [_jsxs("div", { className: slots.header(), children: [label && _jsx(Label, { children: label }), _jsx(SliderOutput, { className: slots.output(), children: state.values.map((_, index) => state.getThumbValueLabel(index)).join(' – ') })] }), _jsxs(SliderTrack, { className: slots.track(), children: [_jsx("div", { className: slots.rail(), children: _jsx(SliderFill, { className: slots.fill() }) }), state.values.map((_, index) => (_jsx(SliderThumb, { index: index, "aria-label": thumbLabels?.[index], "aria-describedby": description ? descriptionId : undefined, className: (thumbState) => thumb({ ...thumbState, orientation }) }, index)))] }), description && _jsx(Description, { id: descriptionId, children: description })] }));
        } }));
}
