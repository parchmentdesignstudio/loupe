import type { ReactNode } from 'react';
import { type SelectProps as AriaSelectProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export declare const trigger: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "flex min-h-11 w-full cursor-default items-center gap-2 rounded-2xl bg-paper py-2.5 pr-3 pl-4 text-left text-base text-ink shadow-raised outline-offset-0 [-webkit-tap-highlight-color:transparent]", {
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
}
/** Picks one option from a list that opens below it */
export declare function Select<T extends object>({ label, description, errorMessage, items, children, ...props }: SelectProps<T>): import("react").JSX.Element;
