import type { ReactNode } from 'react';
import { type ListBoxItemProps, type ListBoxProps, type SectionProps } from 'react-aria-components';
/** A list of options, as in a select or combo box */
export declare function ListBox<T extends object>(props: ListBoxProps<T>): import("react").JSX.Element;
export declare const option: import("tailwind-variants").TVReturnType<{
    isFocused: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "group flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-body text-ink outline-0 select-none forced-color-adjust-none", undefined, undefined, undefined>;
/** An option with its text as children. It's ticked when selected */
export declare function ListBoxItem(props: ListBoxItemProps): import("react").JSX.Element;
/** A heading within a list or menu */
export declare function SectionHeader({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export interface ListBoxSectionProps<T> extends SectionProps<T> {
    title?: string;
}
/** Options grouped under a heading */
export declare function ListBoxSection<T extends object>({ title, items, children, ...props }: ListBoxSectionProps<T>): import("react").JSX.Element;
