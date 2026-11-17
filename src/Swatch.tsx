import type { HTMLAttributes } from 'react';
import { tv } from './tv.js';

// The hairline keeps a pale colour's edge on paper. The checkerboard's squares shrink with the swatch, so a small one
// still shows a few
export const swatch = tv({
	base: 'inline-block shrink-0 bg-center align-middle inset-ring inset-ring-bleed/12 forced-colors:inset-ring-[CanvasText]',
	variants: {
		size: {
			small: 'size-3 rounded-(--swatch-small-radius) bg-size-[100%_100%,4px_4px]',
			medium: 'size-5 rounded-(--swatch-medium-radius) bg-size-[100%_100%,6px_6px]',
			large: 'size-8 rounded-(--swatch-radius) bg-size-[100%_100%,8px_8px]',
		},
	},
	defaultVariants: { size: 'large' },
});

/** A checkerboard for a see-through colour to go over, as a background image */
export const checkerboard = 'repeating-conic-gradient(color-mix(in oklab, var(--color-ink) 12%, var(--color-paper)) 0 25%, var(--color-paper) 0 50%)';

/** A colour laid over the checkerboard, which shows through where it's see-through */
export const swatchBackground = (color: string) => `linear-gradient(${color}, ${color}), ${checkerboard}`;

export interface SwatchProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
	/** Any CSS colour, including a token, as var(--color-primary), or light-dark() */
	color: string;
	/** Small sits in a line of text, medium in a list, and large on its own */
	size?: 'small' | 'medium' | 'large';
	/** What a screen reader hears, such as Marigold. Without it the swatch is hidden from them, as beside its name */
	label?: string;
}

/** A colour shown as a square, from any CSS colour or token. ColorSwatch is the one for a colour React Aria picks */
export function Swatch({ color, size, label, className, style, ...props }: SwatchProps) {
	return <span {...props} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })} className={swatch({ size, className })} style={{ backgroundImage: swatchBackground(color), ...style }} />;
}
