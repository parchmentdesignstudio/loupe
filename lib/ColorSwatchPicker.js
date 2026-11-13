import { jsx as _jsx } from "react/jsx-runtime";
import { ColorSwatchPicker as AriaColorSwatchPicker, ColorSwatchPickerItem as AriaColorSwatchPickerItem, composeRenderProps, } from 'react-aria-components';
import { ColorSwatch } from './ColorSwatch.js';
import { composeClassName, focusRing, tv } from './tv.js';
/** A colour picked from a few set ones, each a ColorSwatchPickerItem. Give it an aria-label, or aria-labelledby */
export function ColorSwatchPicker(props) {
    return _jsx(AriaColorSwatchPicker, { ...props, className: composeClassName(props.className, 'flex flex-wrap gap-2 outline-0') });
}
// The chosen swatch has a ring drawn over its colour, a paper gap inside an ink line, so keyboard focus rings it further out
const item = tv({
    extend: focusRing,
    base: 'relative size-8 shrink-0 cursor-default rounded-lg outline-offset-4 transition-[scale] duration-150 ease-out after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-paper after:opacity-0 after:outline-2 after:outline-ink after:transition-opacity after:duration-150 motion-reduce:transition-none motion-reduce:after:transition-none forced-colors:after:outline-[Highlight]',
    variants: {
        isSelected: {
            true: 'after:opacity-100',
        },
        isPressed: {
            true: 'scale-95',
        },
        isDisabled: {
            true: 'grayscale',
        },
    },
});
/** One colour in a ColorSwatchPicker, given by color, such as #fbf6ef */
export function ColorSwatchPickerItem(props) {
    return (_jsx(AriaColorSwatchPickerItem, { ...props, className: composeRenderProps(props.className, (className, state) => item({ ...state, className })), children: _jsx(ColorSwatch, { className: "size-full rounded-[inherit]" }) }));
}
