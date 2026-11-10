import type { ReactNode } from 'react';
import { type TooltipProps as AriaTooltipProps } from 'react-aria-components';
export { TooltipTrigger } from 'react-aria-components';
export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
    /** Points at the control it labels */
    showArrow?: boolean;
    children: ReactNode;
}
/** A short label for a control, shown on hover and keyboard focus. It sits in a TooltipTrigger with the control */
export declare function Tooltip({ showArrow, children, ...props }: TooltipProps): import("react").JSX.Element;
