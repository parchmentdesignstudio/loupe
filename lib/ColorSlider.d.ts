import type { ReactNode } from 'react';
import { type ColorSliderProps as AriaColorSliderProps } from 'react-aria-components';
export interface ColorSliderProps extends Omit<AriaColorSliderProps, 'children'> {
    /** Shown over the track. Without one, it's the channel's name, such as Hue */
    label?: ReactNode;
}
/** One channel of a colour along a track, such as its hue or alpha, with the value over it */
export declare function ColorSlider({ label, ...props }: ColorSliderProps): import("react").JSX.Element;
