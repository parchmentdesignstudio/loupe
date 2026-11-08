import type { ReactNode } from 'react';
import { type SwitchProps as RACSwitchProps } from 'react-aria-components';
export interface SwitchProps extends Omit<RACSwitchProps, 'children'> {
    children?: ReactNode;
}
export declare function Switch({ children, ...props }: SwitchProps): import("react").JSX.Element;
