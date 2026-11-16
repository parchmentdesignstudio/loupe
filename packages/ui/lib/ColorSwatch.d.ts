import { type ColorSwatchProps } from 'react-aria-components';
export type { ColorSwatchProps };
export { checkerboard } from './Swatch.js';
/** Swatch's look, at its large size */
export declare const colorSwatch: import("tailwind-variants").TVReturnType<{
    size: {
        small: string;
        medium: string;
        large: string;
    };
}, undefined, "inline-block shrink-0 bg-center align-middle inset-ring inset-ring-bleed/12 forced-colors:inset-ring-[CanvasText]", undefined, undefined, undefined>;
/** A colour on its own, named for screen readers, such as dark cyan. Swatch shows any CSS colour or token instead */
export declare function ColorSwatch(props: ColorSwatchProps): import("react").JSX.Element;
