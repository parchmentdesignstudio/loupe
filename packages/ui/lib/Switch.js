import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useId } from 'react';
import { Switch as AriaSwitch, composeRenderProps } from 'react-aria-components';
import { choice } from './Checkbox.js';
import { field } from './Field.js';
import { focusRing, tv } from './tv.js';
const toggle = tv({
    slots: {
        // Its height is the handle's 12px and 2px of padding each side, so it centres on the label's first line
        track: 'relative my-[calc((1lh-1rem)/2)] flex w-7 shrink-0 items-center p-0.5 transition-colors duration-150 ease-out motion-reduce:transition-none [[data-show-focus]>&]:outline-2',
        // It stretches by its width rather than a scale, so its corners stay round, and it moves and stretches on a spring.
        // The colour changes without one, as a colour can't overshoot
        // Each sits in the 8px the handle leaves at one end, so the handle covers whichever isn't true. Positioned, the handle
        // paints over them
        on: 'absolute inset-y-0 start-0.5 hidden w-2 items-center justify-center text-white on-off-labels:flex',
        off: 'absolute inset-y-0 end-0.5 hidden w-2 items-center justify-center on-off-labels:flex',
        handle: 'relative h-3 w-4 shrink-0 bg-(--switch-handle,var(--color-knob)) shadow-handle [transition:translate_350ms_var(--ease-spring),width_350ms_var(--ease-spring),background-color_200ms_ease-out] motion-reduce:transition-none',
    },
    variants: {
        // On, it sits against the far end: the track's 24px inside less its own width, as a translate's percentage is of
        // the handle itself. So however wide it stretches, it stays against that end and reaches into the track, with
        // nothing to flip as it crosses. On, the track turns the green a success status uses, under a white handle. Off in
        // the dark, the track is a toggle group's tray, raised's fill with the dark edge, so the handle is what stands out
        isSelected: {
            false: { track: 'bg-[light-dark(color-mix(in_oklab,var(--bleed)_16%,transparent),var(--color-raised))] [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),var(--dark-edge))]' },
            true: { track: 'bg-(--switch-on-fill,var(--color-green-68))', handle: 'translate-x-[calc(1.5rem-100%)] bg-(--switch-on-handle,var(--color-white)) rtl:translate-x-[calc(100%-1.5rem)]' },
        },
        // Anywhere on the switch or its label, not just the handle, stretches it a little, and a press a little further
        isHovered: {
            true: { handle: 'w-4.5' },
        },
        isPressed: {
            true: { handle: 'w-5' },
        },
        // Flat, as a disabled button is: no well, no lift and no green, so only where the handle sits says it's on. The handle
        // stays white in the light, and dims in the dark, where full white would look switched on
        // The well is only on false, as inset-shadow-none comes earlier in the CSS than inset-shadow-well and would lose
        isDisabled: {
            false: { track: 'inset-shadow-well' },
            true: { track: 'bg-bleed/12', on: 'text-muted', handle: 'bg-[light-dark(var(--color-white),color-mix(in_oklab,var(--color-knob)_50%,transparent))] shadow-none' },
        },
        // As a button's: rounded corners, the handle's 2px less than the track's so they sit concentric. Or full, a pill
        // with a round handle
        shape: {
            rounded: { track: 'rounded-(--switch-radius)', handle: 'rounded-[calc(var(--switch-radius)-2px)]' },
            full: { track: 'rounded-full', handle: 'rounded-full' },
        },
    },
    defaultVariants: {
        shape: 'rounded',
    },
});
// Where the switch sits beside its label, and whether it's one of a group's rows
const row = tv({
    slots: {
        base: '',
        text: 'flex min-w-0 flex-col',
        description: 'text-control text-muted',
    },
    variants: {
        // At the end, the label leads and the switches line up down the far side, however long the labels, as a phone's
        // settings have them. The whole row still presses it
        placement: {
            start: '',
            end: { base: 'flex-row-reverse justify-between gap-4' },
        },
        // A line between each of a group's rows, as a divided list has
        isInGroup: {
            true: { base: 'border-t border-bleed/8 py-(--switch-group-padding-y) first:border-t-0 first:pt-0 last:pb-0' },
        },
    },
});
// Set by a SwitchGroup, so its switches sit at the end of their rows, with lines between
const InGroup = createContext(false);
/** An on and off setting that takes effect straight away, with its label as children */
export function Switch({ shape, placement, description, ...props }) {
    const isInGroup = useContext(InGroup);
    // With a description, which sits inside the label, the name points at the label's own words, so it doesn't run on
    // into the description
    const labelledBy = useId();
    const describedBy = useId();
    const layout = row({ placement: placement ?? (isInGroup ? 'end' : 'start'), isInGroup });
    return (_jsx(AriaSwitch, { ...props, "aria-labelledby": props['aria-labelledby'] ?? (description ? labelledBy : undefined), "aria-describedby": [props['aria-describedby'], description ? describedBy : undefined].filter(Boolean).join(' ') || undefined, className: composeRenderProps(props.className, (className, state) => choice({ ...state, className: layout.base({ className }) })), children: composeRenderProps(props.children, (children, state) => {
            const slots = toggle({ ...state, shape });
            return (_jsxs(_Fragment, { children: [_jsxs("span", { className: slots.track({ className: focusRing({ isFocusVisible: state.isFocusVisible }) }), children: [_jsx("span", { "aria-hidden": true, className: slots.on(), children: _jsx("span", { className: "h-1.5 w-px rounded-full bg-current" }) }), _jsx("span", { "aria-hidden": true, className: slots.off(), children: _jsx("span", { className: "size-1 rounded-full border border-muted" }) }), _jsx("span", { className: slots.handle() })] }), description ? (_jsxs("span", { className: layout.text(), children: [_jsx("span", { id: labelledBy, children: children }), _jsx("span", { id: describedBy, className: layout.description(), children: description })] })) : (children)] }));
        }) }));
}
const group = field();
/**
 * Switches under one heading, each on its own row with a line between, its label first and its switch at the end. For
 * a few settings that take effect straight away, such as which emails to get
 */
export function SwitchGroup({ label, children, className }) {
    const labelledBy = useId();
    return (_jsxs("div", { role: "group", "aria-labelledby": label ? labelledBy : undefined, className: ['flex flex-col gap-3', className].filter(Boolean).join(' '), children: [label && (_jsx("span", { id: labelledBy, className: group.label(), children: label })), _jsx("div", { className: "flex flex-col", children: _jsx(InGroup.Provider, { value: true, children: children }) })] }));
}
