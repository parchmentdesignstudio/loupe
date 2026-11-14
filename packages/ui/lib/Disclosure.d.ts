import { type ReactNode } from 'react';
import { type DisclosureGroupProps as AriaDisclosureGroupProps, type DisclosurePanelProps as AriaDisclosurePanelProps, type DisclosureProps as AriaDisclosureProps } from 'react-aria-components';
type Size = 'medium' | 'small';
export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
    /** Medium for questions and answers, divided by lines. Small for navigation, or a title over its description */
    size?: Size;
}
/** Disclosures that open one at a time, unless allowsMultipleExpanded */
export declare function DisclosureGroup({ size, ...props }: DisclosureGroupProps): import("react").JSX.Element;
export interface DisclosureProps extends AriaDisclosureProps {
    /** Medium, with room around it, or small, with little space built in. In a group, it takes the group's */
    size?: Size;
}
/** A DisclosureHeader that shows or hides the DisclosurePanel under it */
export declare function Disclosure({ size, ...props }: DisclosureProps): import("react").JSX.Element;
export interface DisclosureHeaderProps {
    children: ReactNode;
    /** The heading's level, 3 unless set */
    level?: number;
    /** Classes for the header's button, such as padding to line it up with what's beside it */
    className?: string;
}
/** A heading whose button opens and closes its disclosure, with a chevron that turns as it does */
export declare function DisclosureHeader({ children, level, className }: DisclosureHeaderProps): import("react").JSX.Element;
export interface DisclosurePanelProps extends Omit<AriaDisclosurePanelProps, 'children'> {
    children: ReactNode;
}
/** What a disclosure shows when it's open. A closed panel stays in the page, hidden until found */
export declare function DisclosurePanel({ children, ...props }: DisclosurePanelProps): import("react").JSX.Element;
export {};
