import type { ReactNode } from 'react';
import { type FieldErrorProps, type LabelProps, type TextProps, type ValidationResult } from 'react-aria-components';
export declare const field: import("tailwind-variants").TVReturnType<{}, {
    label: string;
    description: string;
    error: string;
}, undefined, undefined, undefined, undefined>;
/** A read-only field keeps its edge but loses its fill and lift, so it reads as set rather than waiting for input */
export declare const readOnly = "in-data-readonly:bg-transparent in-data-readonly:shadow-[0_0_0_.5px_var(--edge)]";
/** How a field's box looks. Raised is white with a lift, for a form. Filled is flat and grey, as a design tool's
 * inspector has it, for dense panels of settings. Its grey is the layer's own tint, so it suits the ground, a panel or
 * a raised card without saying which */
export type FieldVariant = 'raised' | 'filled';
/** 32px tall, or 28px when small, as a button is */
export type FieldSize = 'medium' | 'small';
/** The props a field takes for the text around its control */
export interface FieldTextProps {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
}
export declare function Label(props: LabelProps): import("react").JSX.Element;
export declare function Description(props: TextProps): import("react").JSX.Element;
export declare function FieldError(props: FieldErrorProps): import("react").JSX.Element;
