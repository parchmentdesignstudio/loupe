import { ColorSwatch as AriaColorSwatch, type ColorSwatchProps, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';

export type { ColorSwatchProps };

// The hairline keeps a pale colour's edge on paper
export const colorSwatch = tv({
	base: 'size-8 shrink-0 rounded-lg inset-ring inset-ring-bleed/12 forced-colors:inset-ring-[CanvasText]',
});

/** A checkerboard for a see-through colour to go over, as a background image in 8px squares */
export const checkerboard = 'repeating-conic-gradient(color-mix(in oklab, var(--color-ink) 12%, var(--color-paper)) 0 25%, var(--color-paper) 0 50%)';

// React Aria paints only the colour, so it goes over the checkerboard, which shows through where it's see-through
/** A colour on its own, named for screen readers, such as dark cyan */
export function ColorSwatch(props: ColorSwatchProps) {
	return (
		<AriaColorSwatch
			{...props}
			className={composeRenderProps(props.className, (className) => colorSwatch({ className }))}
			style={composeRenderProps(props.style, (style, { color }) => ({
				backgroundImage: `linear-gradient(${color.toString('css')}, ${color.toString('css')}), ${checkerboard}`,
				backgroundSize: '100% 100%, 8px 8px',
				backgroundPosition: 'center',
				...style,
			}))}
		/>
	);
}
