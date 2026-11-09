import { type NavigationTreeHeaderProps, type NavigationTreeItemContentProps, type NavigationTreeItemProps, type NavigationTreeProps, type NavigationTreeSectionProps } from 'react-aria-components';
/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export declare function NavigationTree<T extends object>(props: NavigationTreeProps<T>): import("react").JSX.Element;
export declare function NavigationTreeSection<T extends object>(props: NavigationTreeSectionProps<T>): import("react").JSX.Element;
export declare function NavigationTreeHeader({ children, ...props }: NavigationTreeHeaderProps): import("react").JSX.Element;
export declare function NavigationTreeItem<T extends object>(props: NavigationTreeItemProps<T>): import("react").JSX.Element;
export declare const navigationTreeLink: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isCurrent: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "block rounded-lg px-3 py-1.5 text-body text-ink", {
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
/** An item’s text, inside the link React Aria gives each item */
export declare function NavigationTreeItemContent({ children }: NavigationTreeItemContentProps): import("react").JSX.Element;
