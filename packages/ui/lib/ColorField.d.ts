import { type ColorFieldProps as AriaColorFieldProps } from 'react-aria-components';
import { type FieldTextProps, type FieldVariant, type Size } from './Field.js';
export interface ColorFieldProps extends AriaColorFieldProps, FieldTextProps {
    placeholder?: string;
    /** Shows the opacity beside the colour, as a percentage to type or step with the arrow keys. On by default. A field
     * given a channel types only that channel, so it has none */
    hasOpacity?: boolean;
    /** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
    variant?: FieldVariant;
    /** 32px tall, or 28px when small, as a button is */
    size?: Size;
}
/**
 * A colour, which takes any CSS colour pasted or typed into it, such as oklch(), rgb(), a name or hex, and shows it as
 * hex once it's committed, on Enter, on leaving the field or straight away when pasted. Its opacity sits beside it, so a
 * pasted colour with an alpha sets it, and one without keeps it. Given a channel, it types that one channel as a number
 */
export declare function ColorField(props: ColorFieldProps): import("react").JSX.Element;
