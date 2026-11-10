import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch as AriaSwitch, composeRenderProps } from 'react-aria-components';
import { choice } from './Checkbox.js';
import { focusRing, tv } from './tv.js';
const toggle = tv({
    slots: {
        track: 'flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 ease-out motion-reduce:transition-none',
        handle: 'size-5 rounded-full bg-knob shadow-raised transition-[translate,scale,background-color] duration-200 ease-out motion-reduce:transition-none',
    },
    variants: {
        isSelected: {
            false: { track: 'bg-bleed/16' },
            true: { track: 'bg-ink', handle: 'translate-x-4 bg-paper' },
        },
        isHovered: {
            true: '',
        },
        isPressed: {
            true: { handle: 'scale-90' },
        },
    },
    compoundVariants: [
        { isSelected: false, isHovered: true, class: { track: 'bg-bleed/24' } },
        { isSelected: true, isHovered: true, class: { track: 'bg-ink/88' } },
    ],
});
/** An on and off setting that takes effect straight away, with its label as children */
export function Switch(props) {
    return (_jsx(AriaSwitch, { ...props, className: composeRenderProps(props.className, (className, state) => choice({ ...state, className })), children: composeRenderProps(props.children, (children, state) => {
            const slots = toggle(state);
            return (_jsxs(_Fragment, { children: [_jsx("span", { className: slots.track({ className: focusRing({ isFocusVisible: state.isFocusVisible }) }), children: _jsx("span", { className: slots.handle() }) }), children] }));
        }) }));
}
