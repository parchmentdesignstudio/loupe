import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Meter as AriaMeter, ProgressBar as AriaProgressBar, composeRenderProps, } from 'react-aria-components';
import { Label } from './Field.js';
import { tv } from './tv.js';
// The rail and fill are a slider's, so a bar of progress and a slider read as kin. With a label, the value sits
// opposite it above the track; without one it follows the track on the same line, so a bar fits in a row
export const progressBar = tv({
    slots: {
        base: 'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5',
        label: 'min-w-0 truncate',
        value: 'text-control whitespace-nowrap text-muted tabular-nums',
        track: 'relative h-1 overflow-hidden rounded-full bg-bleed/12',
        fill: 'h-full rounded-full bg-ink transition-[width] duration-150 ease-out motion-reduce:transition-none',
    },
    variants: {
        hasLabel: {
            true: { track: 'col-span-full' },
            false: { value: 'text-label' },
        },
        // The fill slides across and out, flipped for a right-to-left language. Without motion it stays put, full width
        // and faint, and breathes rather than slides
        isIndeterminate: {
            true: {
                track: 'rtl:-scale-x-100',
                fill: 'w-2/5 animate-indeterminate motion-reduce:w-full motion-reduce:animate-pulse motion-reduce:bg-ink/32',
            },
        },
    },
});
function Bar({ label, percentage, valueText, isIndeterminate = false }) {
    const slots = progressBar({ hasLabel: label != null, isIndeterminate });
    const value = valueText && _jsx("span", { className: slots.value(), children: valueText });
    return (_jsxs(_Fragment, { children: [label != null && _jsx(Label, { className: slots.label(), children: label }), label != null && value, _jsx("div", { className: slots.track(), children: _jsx("div", { className: slots.fill(), style: isIndeterminate ? undefined : { width: `${percentage}%` } }) }), label == null && value] }));
}
/**
 * How far along something is, such as an upload, as a percentage or a valueLabel of your own, such as “3 of 8 files”.
 * When there’s no telling how long it’ll take, isIndeterminate slides a fill across instead
 */
export function ProgressBar({ label, ...props }) {
    return (_jsx(AriaProgressBar, { ...props, className: composeRenderProps(props.className, (className, { isIndeterminate }) => progressBar({ hasLabel: label != null, isIndeterminate }).base({ className })), children: ({ percentage, valueText, isIndeterminate }) => _jsx(Bar, { label: label, percentage: percentage, valueText: valueText, isIndeterminate: isIndeterminate }) }));
}
/** A quantity within known limits, such as storage used, drawn as a progress bar is. For progress, use a ProgressBar */
export function Meter({ label, ...props }) {
    return (_jsx(AriaMeter, { ...props, className: composeRenderProps(props.className, (className) => progressBar({ hasLabel: label != null }).base({ className })), children: ({ percentage, valueText }) => _jsx(Bar, { label: label, percentage: percentage, valueText: valueText }) }));
}
// Drawn on a 16 unit box, so a stroke of 2 is 2px at the medium size and scales with the large
export const progressCircle = tv({
    slots: {
        base: 'inline-flex shrink-0',
        svg: 'size-full -rotate-90 fill-none stroke-current stroke-2',
        track: 'opacity-16',
        fill: 'transition-[stroke-dashoffset] duration-150 ease-out motion-reduce:transition-none',
    },
    variants: {
        size: {
            medium: { base: 'size-4' },
            large: { base: 'size-8', svg: 'stroke-[1.5]' },
        },
        // A quarter of the ring spins. Without motion it spins slower, as a still one would look stuck
        isIndeterminate: {
            true: { svg: 'animate-spin motion-reduce:[animation-duration:3s]' },
        },
    },
    defaultVariants: {
        size: 'medium',
    },
});
// A radius of 6.5 leaves the stroke inside the 16 unit box. The dash is in a circumference of 100, through pathLength
const radius = 6.5;
/**
 * A spinner, or a ring that fills, for progress in the space of an icon. It takes its colour from the text around it.
 * Give it an aria-label, as it has no label to show
 */
export function ProgressCircle({ size, ...props }) {
    return (_jsx(AriaProgressBar, { ...props, className: composeRenderProps(props.className, (className, { isIndeterminate }) => progressCircle({ size, isIndeterminate }).base({ className })), children: ({ percentage = 0, isIndeterminate }) => {
            const slots = progressCircle({ size, isIndeterminate });
            return (_jsxs("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: slots.svg(), children: [_jsx("circle", { cx: "8", cy: "8", r: radius, className: slots.track() }), (isIndeterminate || percentage > 0) && (_jsx("circle", { cx: "8", cy: "8", r: radius, pathLength: 100, strokeDasharray: "100", strokeDashoffset: isIndeterminate ? 75 : 100 - percentage, strokeLinecap: "round", className: slots.fill() }))] }));
        } }));
}
