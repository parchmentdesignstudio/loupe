import { ColorSwatch as AriaColorSwatch, type ColorSwatchProps, composeRenderProps } from 'react-aria-components';
import { swatch, swatchBackground } from './Swatch.js';

export type { ColorSwatchProps };
export { checkerboard } from './Swatch.js';

/** Swatch's look, at its large size */
export const colorSwatch = swatch;

/** A colour on its own, named for screen readers, such as dark cyan. Swatch shows any CSS colour or token instead */
export function ColorSwatch(props: ColorSwatchProps) {
	return (
		<AriaColorSwatch
			{...props}
			className={composeRenderProps(props.className, (className) => swatch({ className }))}
			style={composeRenderProps(props.style, (style, { color }) => ({ backgroundImage: swatchBackground(color.toString('css')), ...style }))}
		/>
	);
}
