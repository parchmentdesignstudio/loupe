import { type ColorFieldProps as AriaColorFieldProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export interface ColorFieldProps extends AriaColorFieldProps, FieldTextProps {
    placeholder?: string;
}
/** A colour typed as hex, such as #fbf6ef, or one channel of it as a number when given a channel */
export declare function ColorField({ label, description, errorMessage, placeholder, ...props }: ColorFieldProps): import("react").JSX.Element;
