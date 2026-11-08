import { type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
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
export interface TextFieldProps extends AriaTextFieldProps, FieldTextProps {
    placeholder?: string;
    /** Several lines, in a text area that grows taller by dragging */
    multiline?: boolean;
    /** How many lines a multiline field shows to begin with */
    rows?: number;
}
/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export declare function TextField({ label, description, errorMessage, placeholder, multiline, rows, ...props }: TextFieldProps): import("react").JSX.Element;
