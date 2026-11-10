import { type SliderProps as AriaSliderProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export interface SliderProps<T extends number | number[]> extends Omit<AriaSliderProps<T>, 'children'>, Omit<FieldTextProps, 'errorMessage'> {
    /** A name for each thumb of a range, such as Minimum and Maximum */
    thumbLabels?: string[];
}
/** A number between two limits, dragged or moved with the arrow keys. An array of values makes a range, with a thumb for each */
export declare function Slider<T extends number | number[]>({ label, description, thumbLabels, ...props }: SliderProps<T>): import("react").JSX.Element;
