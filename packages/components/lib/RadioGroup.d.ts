import type { ReactNode } from 'react';
import { type RadioGroupProps as RACRadioGroupProps, type RadioProps, type ValidationResult } from 'react-aria-components';
export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
    children?: ReactNode;
}
export declare function RadioGroup({ label, description, errorMessage, children, ...props }: RadioGroupProps): import("react").JSX.Element;
export declare function Radio(props: RadioProps): import("react").JSX.Element;
