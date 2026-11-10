import { jsx as _jsx } from "react/jsx-runtime";
import { ColorThumb as AriaColorThumb, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';
// Filled with the colour under it, so a white edge and a black ring keep it in sight on any colour, in either mode.
// Keyboard focus grows it, as an outline would vanish against some colours
export const colorThumb = tv({
    base: 'size-5 rounded-full border-2 border-white shadow-[0_0_0_1px_oklch(0_0_0/24%),0_1px_3px_oklch(0_0_0/32%)] transition-[scale] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        isFocusVisible: {
            true: 'scale-125',
        },
    },
});
/** The handle of a ColorArea or ColorSlider, which places it */
export function ColorThumb(props) {
    return _jsx(AriaColorThumb, { ...props, className: composeRenderProps(props.className, (className, state) => colorThumb({ ...state, className })) });
}
