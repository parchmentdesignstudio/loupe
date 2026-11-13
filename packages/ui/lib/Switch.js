import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch as AriaSwitch, composeRenderProps } from 'react-aria-components';
import { choice } from './Checkbox.js';
import { focusRing, tv } from './tv.js';
const toggle = tv({
    slots: {
        // Its height is the handle's 16px and 2px of padding each side, so it centres on the label's first line at 20px
        track: 'relative my-[calc((1lh-1.25rem)/2)] flex w-9 shrink-0 items-center p-0.5 transition-colors duration-150 ease-out motion-reduce:transition-none',
        // It stretches by its width rather than a scale, so its corners stay round, and it moves and stretches on a spring.
        // The colour changes without one, as a colour can't overshoot
        // Each sits in the 10px the handle leaves at one end, so the handle covers whichever isn't true. Positioned, the handle
        // paints over them
        on: 'absolute inset-y-0 start-0.5 hidden w-2.5 items-center justify-center text-white on-off-labels:flex',
        off: 'absolute inset-y-0 end-0.5 hidden w-2.5 items-center justify-center on-off-labels:flex',
        handle: 'relative h-4 w-5.5 shrink-0 bg-knob shadow-handle [transition:translate_350ms_var(--ease-spring),width_350ms_var(--ease-spring),background-color_200ms_ease-out] motion-reduce:transition-none',
    },
    variants: {
        // On, it sits against the far end: the track's 32px inside less its own width, as a translate's percentage is of
        // the handle itself. So however wide it stretches, it stays against that end and reaches into the track, with
        // nothing to flip as it crosses. On, the track turns the green a success status uses, under a white handle. Off in
        // the dark, the track is a toggle group's tray, raised's fill with a fainter edge, so the handle is what stands out
        isSelected: {
            false: { track: 'bg-[light-dark(color-mix(in_oklab,var(--bleed)_16%,transparent),var(--color-raised))] [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),color-mix(in_oklab,var(--bleed)_6%,transparent))]' },
            true: { track: 'bg-green-68', handle: 'translate-x-[calc(2rem-100%)] bg-white rtl:translate-x-[calc(100%-2rem)]' },
        },
        // Anywhere on the switch or its label, not just the handle, stretches it a little, and a press a little further
        isHovered: {
            true: { handle: 'w-6' },
        },
        isPressed: {
            true: { handle: 'w-6.5' },
        },
        // Flat, as a disabled button is: no well, no lift and no green, so only where the handle sits says it's on. The handle
        // stays white in the light, and dims in the dark, where full white would look switched on
        // The well is only on false, as inset-shadow-none comes earlier in the CSS than inset-shadow-well and would lose
        isDisabled: {
            false: { track: 'inset-shadow-well' },
            true: { track: 'bg-bleed/12', on: 'text-muted', handle: 'bg-[light-dark(var(--color-white),color-mix(in_oklab,var(--color-knob)_50%,transparent))] shadow-none' },
        },
        // As a button's: rounded corners, the handle's 2px less than the track's so they sit concentric, at a checkbox's
        // radius. Or full, a pill with a round handle
        shape: {
            rounded: { track: 'rounded-lg', handle: 'rounded-md' },
            full: { track: 'rounded-full', handle: 'rounded-full' },
        },
    },
    defaultVariants: {
        shape: 'rounded',
    },
});
/** An on and off setting that takes effect straight away, with its label as children */
export function Switch({ shape, ...props }) {
    return (_jsx(AriaSwitch, { ...props, className: composeRenderProps(props.className, (className, state) => choice({ ...state, className })), children: composeRenderProps(props.children, (children, state) => {
            const slots = toggle({ ...state, shape });
            return (_jsxs(_Fragment, { children: [_jsxs("span", { className: slots.track({ className: focusRing({ isFocusVisible: state.isFocusVisible }) }), children: [_jsx("span", { "aria-hidden": true, className: slots.on(), children: _jsx("span", { className: "h-2 w-px rounded-full bg-current" }) }), _jsx("span", { "aria-hidden": true, className: slots.off(), children: _jsx("span", { className: "size-1.5 rounded-full border border-muted" }) }), _jsx("span", { className: slots.handle() })] }), children] }));
        }) }));
}
