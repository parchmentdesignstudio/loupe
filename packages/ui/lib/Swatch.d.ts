import type { HTMLAttributes } from 'react';
export declare const swatch: import("tailwind-variants").TVReturnType<{
    size: {
        small: string;
        medium: string;
        large: string;
    };
}, undefined, "inline-block shrink-0 bg-center align-middle inset-ring inset-ring-bleed/12 forced-colors:inset-ring-[CanvasText]", undefined, undefined, undefined>;
/** A checkerboard for a see-through colour to go over, as a background image */
export declare const checkerboard = "repeating-conic-gradient(color-mix(in oklab, var(--color-ink) 12%, var(--color-paper)) 0 25%, var(--color-paper) 0 50%)";
/** A colour laid over the checkerboard, which shows through where it's see-through */
export declare const swatchBackground: (color: string) => string;
export interface SwatchProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    /** Any CSS colour, including a token, as var(--color-primary), or light-dark() */
    color: string;
    /** Small sits in a line of text, medium in a list, and large on its own */
    size?: 'small' | 'medium' | 'large';
    /** What a screen reader hears, such as Marigold. Without it the swatch is hidden from them, as beside its name */
    label?: string;
}
/** A colour shown as a square, from any CSS colour or token. ColorSwatch is the one for a colour React Aria picks */
export declare function Swatch({ color, size, label, className, style, ...props }: SwatchProps): import("react").JSX.Element;
