import { type ColorSwatchProps as AriaColorSwatchProps } from 'react-aria-components';
import { type SwatchProps } from './Swatch.js';
export interface ColorSwatchProps extends AriaColorSwatchProps {
    /** As Swatch's, large unless set */
    size?: SwatchProps['size'];
}
export { checkerboard } from './Swatch.js';
/** Swatch's look, at its large size */
export declare const colorSwatch: import("tailwind-variants").TVReturnType<{
    size: {
        small: string;
        field: string;
        medium: string;
        large: string;
    };
}, undefined, string[], undefined, undefined, undefined>;
/** A colour on its own, named for screen readers, such as dark cyan. Swatch shows any CSS colour or token instead */
export declare function ColorSwatch({ size, ...props }: ColorSwatchProps): import("react").JSX.Element;
