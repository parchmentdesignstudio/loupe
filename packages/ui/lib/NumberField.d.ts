import type { ReactNode } from 'react';
import { type NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components';
import { type FieldTextProps, type Size, type FieldVariant } from './Field.js';
export declare const numberField: import("tailwind-variants").TVReturnType<{
    variant: {
        raised: {
            group: string;
        };
        filled: {
            group: string;
        };
    };
    size: {
        medium: {
            input: string;
            start: string;
        };
        small: {
            input: string;
            start: string;
            stepper: string;
        };
    };
    isFocusWithin: {
        false: {
            group: string;
        };
        true: {
            group: string;
        };
    };
    isInvalid: {
        true: {
            group: string;
        };
    };
    isDisabled: {
        true: {
            group: string;
            input: string;
        };
    };
}, {
    group: string[];
    input: string;
    start: string;
    stepper: string;
}, undefined, undefined, undefined, undefined>;
export interface NumberFieldProps extends AriaNumberFieldProps, FieldTextProps {
    placeholder?: string;
    /** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
    variant?: FieldVariant;
    /** 32px tall, or 28px when small, as a button is */
    size?: Size;
    /** An icon before the number, as a button has, to say what a field with no label counts */
    start?: ReactNode;
}
/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export declare function NumberField({ label, description, errorMessage, placeholder, variant, size, start, ...props }: NumberFieldProps): import("react").JSX.Element;
