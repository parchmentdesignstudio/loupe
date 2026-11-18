import { type Ref } from 'react';
import { type ColorFieldProps as AriaColorFieldProps, type Color, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { type FieldTextProps, type FieldVariant, type Size } from './Field.js';
export interface ColorFieldProps extends Omit<AriaColorFieldProps, 'onChange' | 'className' | 'style' | 'render'>, FieldTextProps {
    /** Called with the colour in sRGB, for React Aria's other colour components, and exactly as oklch CSS, such as
     * oklch(65.3% 0.1934 40.25 / 0.6), which keeps a colour outside sRGB that the Color can't */
    onChange?: (color: Color | null, oklch: string | null) => void;
    /** Shown as oklch, the default, which holds any colour exactly, or as hex */
    format?: 'oklch' | 'hex';
    placeholder?: string;
    /** Shows the opacity beside the colour, as a percentage to type or step with the arrow keys. On by default. Without
     * it, the text shows the opacity, so a colour typed without one is opaque. A field given a channel types only that
     * channel, so it has none */
    hasOpacity?: boolean;
    /** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
    variant?: FieldVariant;
    /** 32px tall, or 28px when small, as a button is */
    size?: Size;
    className?: AriaTextFieldProps['className'];
    style?: AriaTextFieldProps['style'];
    render?: AriaTextFieldProps['render'];
    ref?: Ref<HTMLDivElement>;
}
/**
 * A colour, which takes any CSS colour pasted or typed into it, such as oklch(), rgb(), a name or hex, and shows it as
 * oklch once it's committed, on Enter, on leaving the field or straight away when pasted. It keeps a colour outside sRGB
 * exactly, though React Aria's Color, and so a picker's area and slider, hold the nearest sRGB. A swatch of it sits
 * before the text, as a picker's does, and its opacity after, so a pasted colour with an alpha sets it, and one without
 * keeps it. Given a channel, it types that one channel as a number
 */
export declare function ColorField(props: ColorFieldProps): import("react").JSX.Element;
