import { type TooltipProps as RACTooltipProps } from 'react-aria-components';
export { TooltipTrigger } from 'react-aria-components';
export interface TooltipProps extends Omit<RACTooltipProps, 'children'> {
    children: React.ReactNode;
}
export declare function Tooltip({ children, ...props }: TooltipProps): import("react").JSX.Element;
