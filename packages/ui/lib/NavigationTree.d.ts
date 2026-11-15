import { type ReactNode } from 'react';
import { type NavigationTreeHeaderProps, type NavigationTreeItemContentProps as AriaNavigationTreeItemContentProps, type NavigationTreeItemProps, type NavigationTreeProps as AriaNavigationTreeProps, type NavigationTreeSectionProps } from 'react-aria-components';
export type { NavigationTreeHeaderProps, NavigationTreeItemProps, NavigationTreeSectionProps };
export interface NavigationTreeProps<T extends object> extends AriaNavigationTreeProps<T> {
    /** The top-level items are small titles that fold what's under them, and what's under them starts at the edge */
    hasTitles?: boolean;
}
/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export declare function NavigationTree<T extends object>({ hasTitles, ...props }: NavigationTreeProps<T>): import("react").JSX.Element;
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
}, undefined, "flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-control font-medium text-ink", {
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
/**
 * An item’s text, with the link React Aria gives each item laid over its row, so the text can sit beside the triangle that
 * opens it. The triangle is a button of its own, over the link rather than in it, so a screen reader can open and close it.
 * Each depth steps in 12px, under a line down its folder. In a tree with titles, the top level are titles, and a title that
 * isn't a link folds when it's pressed
 */
export interface NavigationTreeItemContentProps extends AriaNavigationTreeItemContentProps {
    /** An icon before the text, in its colour, such as one for each title */
    icon?: ReactNode;
}
export declare function NavigationTreeItemContent({ children, icon }: NavigationTreeItemContentProps): import("react").JSX.Element;
