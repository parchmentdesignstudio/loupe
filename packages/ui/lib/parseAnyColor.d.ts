import { type Color } from 'react-aria-components';
export interface ParsedColor {
    /** In sRGB, with its alpha, or 1 when none was given */
    color: Color;
    /** Whether the text gave an alpha, so a field can keep the opacity it had when it didn't */
    hasAlpha: boolean;
}
/**
 * Any CSS colour as a React Aria Color, which only parses hex, rgb(), hsl() and hsb() itself. Takes hex with or without
 * its #, a name such as rebeccapurple, transparent, rgb(), hsl(), hwb(), lab(), lch(), oklab(), oklch() and color() in
 * srgb, srgb-linear, display-p3 or xyz, in modern or comma syntax. A colour outside sRGB loses chroma until it fits,
 * keeping its lightness and hue, so a vivid P3 or oklch colour stays as close as sRGB allows. Null when it isn't a colour
 */
export declare function parseAnyColor(text: string): ParsedColor | null;
