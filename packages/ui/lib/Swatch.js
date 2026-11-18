import { jsx as _jsx } from "react/jsx-runtime";
import { tv } from './tv.js';
// The hairline keeps a pale colour's edge on paper. The checkerboard's squares shrink with the swatch, so a small one
// still shows a few
export const swatch = tv({
    base: [
        'inline-block shrink-0 bg-center align-middle inset-ring inset-ring-bleed/12 forced-colors:inset-ring-[CanvasText]',
        // Inside the hairline, a line a shade lighter, as a filled button has: a fifth of the way to white, or a third in the
        // dark. An outline drawn inward, so it follows whatever corners the swatch has. Its colour comes from
        // --swatch-color, so without one, as in an empty frame, there's no line
        'outline -outline-offset-2 outline-[color:var(--swatch-inner,transparent)] [--swatch-inner:light-dark(color-mix(in_oklab,var(--swatch-color),white_20%),color-mix(in_oklab,var(--swatch-color),white_32%))]',
    ],
    variants: {
        size: {
            small: 'size-3 rounded-(--swatch-small-radius) bg-size-[100%_100%,4px_4px]',
            field: 'size-4 rounded-(--swatch-field-radius) bg-size-[100%_100%,4px_4px]',
            medium: 'size-5 rounded-(--swatch-medium-radius) bg-size-[100%_100%,6px_6px]',
            large: 'size-8 rounded-(--swatch-radius) bg-size-[100%_100%,8px_8px]',
        },
    },
    defaultVariants: { size: 'large' },
});
/** A checkerboard for a see-through colour to go over, as a background image */
export const checkerboard = 'repeating-conic-gradient(color-mix(in oklab, var(--color-ink) 12%, var(--color-paper)) 0 25%, var(--color-paper) 0 50%)';
/** A colour laid over the checkerboard, which shows through where it's see-through, and given to the inner line */
export const swatchStyle = (color) => ({ backgroundImage: `linear-gradient(${color}, ${color}), ${checkerboard}`, '--swatch-color': color });
/** A colour shown as a square, from any CSS colour or token. ColorSwatch is the one for a colour React Aria picks */
export function Swatch({ color, size, label, className, style, ...props }) {
    return _jsx("span", { ...props, ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }), className: swatch({ size, className }), style: { ...(color ? swatchStyle(color) : undefined), ...style } });
}
