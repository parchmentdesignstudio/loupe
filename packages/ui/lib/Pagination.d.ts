/**
 * The pages to show a button for, with 'gap' where some are left out. The first and last always show, with `siblings`
 * either side of the current one, and the list is always the same length, so the buttons don't shift as you move through
 */
export declare function pageRange(page: number, count: number, siblings?: number): (number | 'gap')[];
export interface PaginationProps {
    /** The current page, from 1 */
    page: number;
    /** How many pages there are */
    count: number;
    onChange: (page: number) => void;
    /** How many pages show either side of the current one, 1 by default */
    siblings?: number;
    /** Names the navigation, “Pages” by default */
    'aria-label'?: string;
    className?: string;
}
/** Buttons to move between the pages of a long list or table, with the pages far from the current one folded behind an ellipsis, in a menu */
export declare function Pagination({ page, count, onChange, siblings, 'aria-label': label, className }: PaginationProps): import("react").JSX.Element | null;
