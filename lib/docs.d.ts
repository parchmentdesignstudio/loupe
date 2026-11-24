import { type ReactNode, type Ref } from 'react';
export interface DocsCrumb {
    name: string;
    /** Where it goes. A group, which has no page, has none */
    href?: string;
}
export interface DocsShellProps {
    /** The system's logo and name, with its version, at the top of the sidebar and the phone bar */
    brand: ReactNode;
    /** The pages, as a NavigationTree, in the sidebar and the phone's drawer */
    nav: ReactNode;
    /** Names the pages for a screen reader */
    navLabel: string;
    /** Where the page sits, from the system's home down. On phones the first is left out, as the bar above shows it */
    trail: DocsCrumb[];
    /** Before the breadcrumbs, such as a menu of the page's sections */
    barStart?: ReactNode;
    /** At the bar's end, on wider screens, such as search */
    actions?: ReactNode;
    /** At the phone bar's end, before the button that opens the pages */
    phoneActions?: ReactNode;
    /** Under the pages in the phone's drawer */
    drawerEnd?: ReactNode;
    /** Beside the page, the card's full height, such as settings. Its own bar, 48px tall, sits level with the page's */
    aside?: ReactNode;
    /**
     * At the card's top end on wider screens, such as the buttons that open what's in aside. They stay put as one opens,
     * over the end of the page's bar or of the aside's, which leaves them room by reading --docs-toggles, their width
     */
    toggles?: ReactNode;
    /** Whether what's in aside is open, so the page's bar stops leaving room for the toggles, as they're over the aside */
    isAsideOpen?: boolean;
    /** The page's address. When it changes, the phone's drawer closes to show it */
    current?: string;
    /** The panel that scrolls, for anything that follows its scroll */
    scrollerRef?: Ref<HTMLElement>;
    children: ReactNode;
}
export declare function DocsShell({ brand, nav, navLabel, trail, barStart, actions, phoneActions, drawerEnd, aside, toggles, isAsideOpen, current, scrollerRef, children }: DocsShellProps): import("react").JSX.Element;
export interface DocsPageProps {
    /** The page's name and what it is */
    header: ReactNode;
    /** Its sections, beside it on wide screens */
    contents?: ReactNode;
    /** As wide as the panel, for what needs the room, such as a canvas. Otherwise a column that suits reading */
    isWide?: boolean;
    children: ReactNode;
}
/** A page in DocsShell: its header over what it shows, with its sections beside them from the top on wide screens */
export declare function DocsPage({ header, contents, isWide, children }: DocsPageProps): import("react").JSX.Element;
/** A small pill beside the brand, such as its version */
export declare function DocsBadge({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export interface DocsSearchButtonProps {
    onPress: () => void;
    /** In place of the magnifying glass */
    icon?: ReactNode;
    /** A tooltip, such as Search ⌘K. Left out on phones */
    tooltip?: string;
}
/** Opens DocsSearch */
export declare function DocsSearchButton({ onPress, icon, tooltip }: DocsSearchButtonProps): import("react").JSX.Element;
export interface DocsSearchPage {
    /** Where it is, which is also its key */
    href: string;
    name: string;
    /** What it's in, shown at the row's end */
    group: string;
}
export interface DocsSearchProps {
    pages: DocsSearchPage[];
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    placeholder?: string;
}
/** Finds a page by name: type to narrow the list, the arrow keys to move through it, and Enter to go. ⌘K opens it */
export declare function DocsSearch({ pages, isOpen, onOpenChange, placeholder }: DocsSearchProps): import("react").JSX.Element;
