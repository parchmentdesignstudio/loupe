import { type ReactNode } from 'react';
import { type ColorPickerProps as AriaColorPickerProps } from 'react-aria-components';
export interface ColorPickerProps extends Omit<AriaColorPickerProps, 'children'> {
    label?: ReactNode;
    /** Names it when there's no label */
    'aria-label'?: string;
    /** What the popover holds, in place of the colour area, hue slider and hex field */
    children?: ReactNode;
    className?: string;
}
/** A colour, shown as a swatch and its hex in a field-like button that opens a colour area, a hue slider and a hex field */
export declare function ColorPicker({ label, 'aria-label': ariaLabel, children, className, ...props }: ColorPickerProps): import("react").JSX.Element;
