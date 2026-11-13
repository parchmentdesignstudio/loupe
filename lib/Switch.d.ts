import { type SwitchProps as AriaSwitchProps } from 'react-aria-components';
export interface SwitchProps extends AriaSwitchProps {
    /** Rounded corners, as a button's, or full, a pill. Rounded by default */
    shape?: 'rounded' | 'full';
}
/** An on and off setting that takes effect straight away, with its label as children */
export declare function Switch({ shape, ...props }: SwitchProps): import("react").JSX.Element;
