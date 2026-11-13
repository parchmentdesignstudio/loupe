import type { ReactNode } from 'react';
import { type SelectProps as AriaSelectProps } from 'react-aria-components';
import { type FieldSize, type FieldTextProps, type FieldVariant } from './Field.js';
export declare const trigger: import("tailwind-variants").TVReturnType<{
    variant: {
        raised: string;
        filled: string;
    };
    size: {
        medium: string;
        small: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "flex w-full cursor-default items-center gap-2 rounded-lg text-left text-control font-medium text-ink outline-offset-0 [-webkit-tap-highlight-color:transparent]", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight]", undefined, undefined, undefined>>;
export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'>, FieldTextProps {
    items?: Iterable<T>;
    /** ListBoxItems, or a function that makes one from each of items */
    children: ReactNode | ((item: T) => ReactNode);
    /** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
    variant?: FieldVariant;
    /** 32px tall, or 28px when small, as a button is */
    size?: FieldSize;
}
/** Picks one option from a list that opens below it */
export declare function Select<T extends object>({ label, description, errorMessage, items, children, variant, size, ...props }: SelectProps<T>): import("react").JSX.Element;
