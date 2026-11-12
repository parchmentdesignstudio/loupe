import { type ReactNode } from 'react';
import { type BreadcrumbProps as AriaBreadcrumbProps, type BreadcrumbsProps as AriaBreadcrumbsProps } from 'react-aria-components';
export declare const breadcrumbs: import("tailwind-variants").TVReturnType<{}, undefined, "relative flex min-w-0 flex-1 text-control leading-none font-medium text-muted", undefined, undefined, undefined>;
export declare const breadcrumb: import("tailwind-variants").TVReturnType<{
    isCurrent: {
        true: string;
        false: string;
    };
}, undefined, "flex items-center gap-1.5", undefined, undefined, undefined>;
export interface BreadcrumbProps extends Omit<AriaBreadcrumbProps, 'children'> {
    /** Where the crumb goes. Leave it out for a step with no page of its own, such as a group, and it shows as text */
    href?: string;
    children: ReactNode;
    /** The crumb’s name as plain text, for the menu of hidden crumbs to type to, when its children aren’t text */
    textValue?: string;
}
/** One step in a trail of Breadcrumbs. The last is the page you’re on, so it’s text rather than a link */
export declare function Breadcrumb({ href, children, ...props }: BreadcrumbProps): import("react").JSX.Element;
/**
 * The crumbs to hide, as how many after the first, so the trail fits the room it has. It keeps the first and as many
 * from the end as fit, with the ellipsis between them, and always keeps the last. Each width includes its separator
 */
export declare function crumbsToHide(widths: number[], ellipsis: number, gap: number, room: number, maxVisible?: number): number;
export interface BreadcrumbsProps extends Omit<AriaBreadcrumbsProps<object>, 'children' | 'items' | 'className' | 'style' | 'render'> {
    /** Breadcrumb elements, from the top of the site down to the page you’re on */
    children: ReactNode;
    /** The most crumbs to show, counting the first and last, before the middle ones fold into the ellipsis. Width folds them too */
    maxVisible?: number;
    /** Names the navigation landmark. Breadcrumbs, unless a page has more than one trail */
    'aria-label'?: string;
    className?: string;
}
/**
 * Where a page sits in a site, as a trail of links up to it. It fills the width it’s given, and when the trail won’t fit,
 * the crumbs in the middle fold into an ellipsis that opens a menu of them
 */
export declare function Breadcrumbs({ children, maxVisible, className, 'aria-label': label, ...props }: BreadcrumbsProps): import("react").JSX.Element;
