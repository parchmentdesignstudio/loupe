import type { ReactNode } from 'react';
import { type CheckboxGroupProps as RACCheckboxGroupProps, type CheckboxProps, type ValidationResult } from 'react-aria-components';
export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, 'children'> {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
    children?: ReactNode;
}
export declare function CheckboxGroup({ label, description, errorMessage, children, ...props }: CheckboxGroupProps): import("react").JSX.Element;
export declare function Checkbox(props: CheckboxProps): import("react").JSX.Element;
