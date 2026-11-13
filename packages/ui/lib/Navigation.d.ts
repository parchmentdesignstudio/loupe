import { type HTMLAttributes } from 'react';
export interface NavigationProps extends HTMLAttributes<HTMLElement> {
    /** Names the navigation, and labels the button that opens it on phones */
    'aria-label': string;
    /**
     * Whether it shows its own button on phones, in a row above the page. Set it false to put a button of the page's own
     * somewhere tidier, such as its top bar, and open the sheet with isOpen and onOpenChange
     */
    hasTrigger?: boolean;
    /** Whether the sheet is open on phones, to open it from a button of the page's own */
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
/** A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones */
export declare function Navigation({ className, children, hasTrigger, isOpen: givenOpen, onOpenChange, ...props }: NavigationProps): import("react").JSX.Element;
