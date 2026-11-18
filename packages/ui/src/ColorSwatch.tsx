import { ColorSwatch as AriaColorSwatch, type ColorSwatchProps as AriaColorSwatchProps, composeRenderProps } from 'react-aria-components';
import { type SwatchProps, swatch, swatchBackground } from './Swatch.js';

export interface ColorSwatchProps extends AriaColorSwatchProps {
	/** As Swatch's, large unless set */
	size?: SwatchProps['size'];
}

export { checkerboard } from './Swatch.js';

/** Swatch's look, at its large size */
export const colorSwatch = swatch;

/** A colour on its own, named for screen readers, such as dark cyan. Swatch shows any CSS colour or token instead */
export function ColorSwatch({ size, ...props }: ColorSwatchProps) {
	return (
		<AriaColorSwatch
			{...props}
			className={composeRenderProps(props.className, (className) => swatch({ size, className }))}
			style={composeRenderProps(props.style, (style, { color }) => ({ backgroundImage: swatchBackground(color.toString('css')), ...style }))}
		/>
	);
}
