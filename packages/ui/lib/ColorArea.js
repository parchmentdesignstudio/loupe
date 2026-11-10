import { jsx as _jsx } from "react/jsx-runtime";
import { ColorArea as AriaColorArea, composeRenderProps } from 'react-aria-components';
import { ColorThumb } from './ColorThumb.js';
import { tv } from './tv.js';
const colorArea = tv({
    base: 'aspect-square w-full shrink-0 rounded-lg inset-ring inset-ring-bleed/12',
    variants: {
        isDisabled: {
            true: 'opacity-50',
        },
    },
});
/** Two channels of a colour at once, such as saturation across and brightness up, picked by dragging its thumb or with the arrow keys */
export function ColorArea(props) {
    return (_jsx(AriaColorArea, { ...props, className: composeRenderProps(props.className, (className, state) => colorArea({ ...state, className })), children: _jsx(ColorThumb, {}) }));
}
