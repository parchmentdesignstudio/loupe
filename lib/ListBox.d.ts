import { type ListBoxItemProps, type ListBoxProps, type ListBoxSectionProps } from 'react-aria-components';
export type { ListBoxSectionProps };
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
}, undefined, "group flex cursor-default items-center gap-3 rounded-sm px-3 py-1.5 text-control text-ink outline-0 select-none forced-color-adjust-none", undefined, undefined, undefined>;
/** An option with its text as children. It's ticked when selected */
export declare function ListBoxItem(props: ListBoxItemProps): import("react").JSX.Element;
export declare const section: import("tailwind-variants").TVReturnType<{}, undefined, "not-first:mt-1.5 not-first:border-t not-first:border-bleed/8 not-first:pt-1.5", undefined, undefined, undefined>;
/** Options grouped under a Header, which goes first inside it */
export declare function ListBoxSection<T extends object>(props: ListBoxSectionProps<T>): import("react").JSX.Element;
