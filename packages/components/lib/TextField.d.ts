import type { ReactNode } from 'react';
import { type TextFieldProps as RACTextFieldProps, type ValidationResult } from 'react-aria-components';
export interface TextFieldProps extends RACTextFieldProps {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
    placeholder?: string;
    /** Grows to a multi-line text area. */
    multiline?: boolean;
    rows?: number;
}
export declare function TextField({ label, description, errorMessage, placeholder, multiline, rows, ...props }: TextFieldProps): import("react").JSX.Element;
