import { type TextFieldProps as AriaTextFieldProps, type ValidationResult } from 'react-aria-components';
export declare const input: import("tailwind-variants").TVReturnType<{
    isFocused: {
        false: string;
        true: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "min-h-11 w-full rounded-2xl bg-paper px-4 py-2.5 text-base text-ink shadow-raised outline-offset-0 outline-ink placeholder:text-muted forced-colors:outline-[Highlight]", undefined, undefined, undefined>;
export interface TextFieldProps extends AriaTextFieldProps {
    label?: string;
    description?: string;
    errorMessage?: string | ((validation: ValidationResult) => string);
    placeholder?: string;
}
/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export declare function TextField({ label, description, errorMessage, placeholder, ...props }: TextFieldProps): import("react").JSX.Element;
