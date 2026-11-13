import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ColorSlider as AriaColorSlider, SliderOutput, SliderTrack, composeRenderProps, useLocale } from 'react-aria-components';
import { checkerboard } from './ColorSwatch.js';
import { ColorThumb } from './ColorThumb.js';
import { Label } from './Field.js';
import { tv } from './tv.js';
// React Aria paints the track with the channel's range of colour, over the checkerboard for alpha
const colorSlider = tv({
    slots: {
        base: 'flex flex-col gap-1.5',
        header: 'flex items-baseline justify-between gap-3',
        output: 'ms-auto text-control text-muted tabular-nums',
        well: 'rounded-lg bg-center',
        track: 'relative size-full rounded-[inherit] inset-ring inset-ring-bleed/12',
        thumb: '',
    },
    variants: {
        orientation: {
            horizontal: { well: 'h-6 w-full', thumb: 'top-1/2' },
            vertical: { base: 'items-center', well: 'w-6 flex-1', thumb: 'left-1/2' },
        },
        isDisabled: {
            true: { well: 'grayscale' },
        },
    },
});
// React Aria shows a hue to two places, such as 19.16°, so the value is rounded to its channel's step first
function format(color, channel, locale) {
    const { step } = color.getChannelRange(channel);
    return color.withChannelValue(channel, Math.round(color.getChannelValue(channel) / step) * step).formatChannelValue(channel, locale);
}
/** One channel of a colour along a track, such as its hue or alpha, with the value over it */
export function ColorSlider({ label, ...props }) {
    const { locale } = useLocale();
    return (_jsx(AriaColorSlider, { ...props, className: composeRenderProps(props.className, (className, { orientation, isDisabled }) => colorSlider({ orientation, isDisabled }).base({ className })), children: ({ orientation, isDisabled, state }) => {
            const slots = colorSlider({ orientation, isDisabled });
            return (_jsxs(_Fragment, { children: [_jsxs("div", { className: slots.header(), children: [_jsx(Label, { children: label }), _jsx(SliderOutput, { className: slots.output(), children: format(state.value, props.channel, locale) })] }), _jsx("div", { className: slots.well(), style: { backgroundImage: checkerboard, backgroundSize: '8px 8px' }, children: _jsx(SliderTrack, { className: slots.track(), children: _jsx(ColorThumb, { className: slots.thumb() }) }) })] }));
        } }));
}
