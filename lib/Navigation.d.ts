import { type HTMLAttributes } from 'react';
export interface NavigationProps extends HTMLAttributes<HTMLElement> {
    /** Names the navigation, and labels the button that opens it on phones */
    'aria-label': string;
}
/** A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones */
export declare function Navigation({ className, children, ...props }: NavigationProps): import("react").JSX.Element;
