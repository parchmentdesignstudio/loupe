import type { ReactNode } from 'react';
import { type FieldErrorProps, type LabelProps, type TextProps, type ValidationResult } from 'react-aria-components';
export declare const field: import("tailwind-variants").TVReturnType<{}, {
    label: string;
    description: string;
    error: string;
}, undefined, undefined, undefined, undefined>;
/** A read-only field keeps its edge but loses its fill and lift, so it reads as set rather than waiting for input */
export declare const readOnly = "in-data-readonly:bg-transparent in-data-readonly:shadow-[0_0_0_.5px_var(--edge)]";
/** The props a field takes for the text around its control */
export interface FieldTextProps {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
}
export declare function Label(props: LabelProps): import("react").JSX.Element;
export declare function Description(props: TextProps): import("react").JSX.Element;
export declare function FieldError(props: FieldErrorProps): import("react").JSX.Element;
