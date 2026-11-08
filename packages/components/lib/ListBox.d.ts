import { type ListBoxItemProps, type ListBoxProps, type SectionProps } from 'react-aria-components';
export declare function ListBox<T extends object>({ children, ...props }: ListBoxProps<T>): import("react").JSX.Element;
export declare const item: import("tailwind-variants").TVReturnType<{
    isDisabled: {
        true: string;
    };
    isFocused: {
        true: string;
    };
    isPressed: {
        true: string;
    };
}, undefined, "group flex items-center gap-3 rounded-md py-2 pl-3 pr-2 text-sm text-ink outline-0 cursor-default select-none forced-color-adjust-none", undefined, undefined, undefined>;
export declare function ListBoxItem(props: ListBoxItemProps): import("react").JSX.Element;
export interface ListBoxSectionProps<T> extends SectionProps<T> {
    title?: string;
    items?: Iterable<T>;
}
export declare function ListBoxHeader({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
export declare function Section<T extends object>({ title, items, children, ...props }: ListBoxSectionProps<T>): import("react").JSX.Element;
