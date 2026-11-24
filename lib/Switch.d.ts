import { type ReactNode } from 'react';
import { type SwitchProps as AriaSwitchProps } from 'react-aria-components';
export interface SwitchProps extends AriaSwitchProps {
    /** Rounded corners, as a button's, or full, a pill. Rounded by default */
    shape?: 'rounded' | 'full';
    /** Before its label, or at the end of the row, after it. Start by default, and end in a SwitchGroup */
    placement?: 'start' | 'end';
    /** A line under the label, such as what the setting does */
    description?: ReactNode;
}
/** An on and off setting that takes effect straight away, with its label as children */
export declare function Switch({ shape, placement, description, ...props }: SwitchProps): import("react").JSX.Element;
export interface SwitchGroupProps {
    /** What the switches are about, such as Email. It names the group for screen readers too */
    label?: ReactNode;
    /** Its Switches */
    children?: ReactNode;
    className?: string;
}
/**
 * Switches under one heading, each on its own row with a line between, its label first and its switch at the end. For
 * a few settings that take effect straight away, such as which emails to get
 */
export declare function SwitchGroup({ label, children, className }: SwitchGroupProps): import("react").JSX.Element;
