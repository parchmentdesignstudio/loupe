import { type Color } from 'react-aria-components';
/** A colour in oklch: lightness from 0 to 1, chroma from 0, and hue in degrees */
export interface Oklch {
    l: number;
    c: number;
    h: number;
}
export interface ParsedColor {
    /** In sRGB, with its alpha, or 1 when none was given. A colour outside sRGB is brought in, so it's the nearest */
    color: Color;
    /** The colour exactly, as given, so nothing outside sRGB is lost */
    oklch: Oklch;
    /** Its alpha, from 0 to 1 */
    alpha: number;
    /** Whether the text gave an alpha, so a field can keep the opacity it had when it didn't */
    hasAlpha: boolean;
    /** Whether it fits in sRGB, so color is exact too */
    isInSrgb: boolean;
}
/**
 * Any CSS colour as a React Aria Color, which only parses hex, rgb(), hsl() and hsb() itself. Takes hex with or without
 * its #, a name such as rebeccapurple, transparent, rgb(), hsl(), hwb(), lab(), lch(), oklab(), oklch() and color() in
 * srgb, srgb-linear, display-p3 or xyz, in modern or comma syntax. A colour outside sRGB loses chroma until it fits,
 * keeping its lightness and hue, so a vivid P3 or oklch colour stays as close as sRGB allows, while oklch keeps it exactly.
 * Null when it isn't a colour
 */
export declare function parseAnyColor(text: string): ParsedColor | null;
/** An oklch colour as CSS, such as oklch(65.3% 0.1934 40.25 / 0.6), precise enough to come back as the same colour.
 * Alpha is left out when it's 1 */
export declare function formatOklch({ l, c, h }: Oklch, alpha?: number): string;
