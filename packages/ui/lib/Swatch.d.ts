import type { CSSProperties, HTMLAttributes } from 'react';
export declare const swatch: import("tailwind-variants").TVReturnType<{
    size: {
        small: string;
        field: string;
        medium: string;
        large: string;
    };
}, undefined, string[], undefined, undefined, undefined>;
/** A checkerboard for a see-through colour to go over, as a background image */
export declare const checkerboard = "repeating-conic-gradient(color-mix(in oklab, var(--color-ink) 12%, var(--color-paper)) 0 25%, var(--color-paper) 0 50%)";
/** A colour laid over the checkerboard, which shows through where it's see-through, and given to the inner line */
export declare const swatchStyle: (color: string) => CSSProperties;
export interface SwatchProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    /** Any CSS colour, including a token, as var(--color-primary), or light-dark(). Without one it's an empty frame, as a field's is before there's a colour */
    color?: string;
    /** Small sits in a line of text, field before a field's value, medium in a list, and large on its own */
    size?: 'small' | 'field' | 'medium' | 'large';
    /** What a screen reader hears, such as Marigold. Without it the swatch is hidden from them, as beside its name */
    label?: string;
}
/** A colour shown as a square, from any CSS colour or token. ColorSwatch is the one for a colour React Aria picks */
export declare function Swatch({ color, size, label, className, style, ...props }: SwatchProps): import("react").JSX.Element;
