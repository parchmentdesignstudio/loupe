import { type ReactNode } from 'react';
export declare const list: import("tailwind-variants").TVReturnType<{
    variant: {
        divided: string;
        plain: string;
    };
}, undefined, "flex min-w-0 flex-col", undefined, undefined, undefined>;
export declare const listItem: import("tailwind-variants").TVReturnType<{
    variant: {
        divided: {
            base: string;
        };
        plain: {};
    };
}, {
    base: string;
    icon: string;
    body: string;
    title: string;
    description: string;
    end: string;
}, undefined, undefined, undefined, undefined>;
type Variant = 'divided' | 'plain';
export interface ListProps {
    /** divided (the default) has a hairline between rows; plain has none, for short points */
    variant?: Variant;
    /** Names the list for a screen reader, where nothing on the page does */
    'aria-label'?: string;
    /** ListItems */
    children: ReactNode;
    className?: string;
}
/**
 * Things to read, one under another, such as what a plan includes or an account's details. Nothing in it is picked or
 * pressed: items to open or act on are a GridList, and records with fields to compare are a Table
 */
export declare function List({ variant, children, className, ...props }: ListProps): import("react").JSX.Element;
export interface ListItemProps {
    /** An icon before it, such as a tick for what a plan includes */
    icon?: ReactNode;
    /** A line under it */
    description?: ReactNode;
    /** A value at the end, such as an amount or a Status */
    end?: ReactNode;
    /** What it says */
    children: ReactNode;
    className?: string;
}
/** One row of a List: what it says, a line under it, and an icon before or a value after */
export declare function ListItem({ icon, description, end, children, className }: ListItemProps): import("react").JSX.Element;
export {};
