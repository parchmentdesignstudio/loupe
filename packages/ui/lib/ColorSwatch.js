import { jsx as _jsx } from "react/jsx-runtime";
import { ColorSwatch as AriaColorSwatch, composeRenderProps } from 'react-aria-components';
import { swatch, swatchStyle } from './Swatch.js';
export { checkerboard } from './Swatch.js';
/** Swatch's look, at its large size */
export const colorSwatch = swatch;
/** A colour on its own, named for screen readers, such as dark cyan. Swatch shows any CSS colour or token instead */
export function ColorSwatch({ size, ...props }) {
    return (_jsx(AriaColorSwatch, { ...props, className: composeRenderProps(props.className, (className) => swatch({ size, className })), style: composeRenderProps(props.style, (style, { color }) => ({ ...swatchStyle(color.toString('css')), ...style })) }));
}
