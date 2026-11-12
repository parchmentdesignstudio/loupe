import { type CellProps as AriaCellProps, type ColumnProps as AriaColumnProps, type RowProps, type TableBodyProps, type TableHeaderProps, type TableLoadMoreItemProps, type TableProps as AriaTableProps } from 'react-aria-components';
import { type MenuProps } from './Menu.js';
export type { RowProps, TableBodyProps, TableHeaderProps, TableLoadMoreItemProps };
type Align = 'start' | 'end';
type Density = 'compact' | 'comfortable';
export declare const table: import("tailwind-variants").TVReturnType<{}, {
    container: string;
    grid: string;
}, undefined, undefined, undefined, undefined>;
export declare const tableColumn: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isSorted: {
        true: string;
    };
}, undefined, "sticky top-0 z-1 cursor-default border-b border-bleed/8 bg-raised px-3 py-2 text-start text-label font-medium text-muted transition-[color] duration-150 ease-out select-none first:pl-4 last:pr-4 in-data-[density=compact]:py-1.5 motion-reduce:transition-none", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{}, undefined, "-outline-offset-2", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight]", undefined, undefined, undefined>>>;
export declare const tableRow: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isSelected: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "group/row cursor-default text-control text-ink transition-[background-color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none", undefined, undefined, undefined>;
export declare const tableCell: import("tailwind-variants").TVReturnType<{}, undefined, string[], {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{}, undefined, "-outline-offset-2", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight]", undefined, undefined, undefined>>>;
export interface TableProps extends Omit<AriaTableProps, 'className'> {
    /** Compact rows are 32px, as tall as a control, for dense data. Comfortable rows are 40px */
    density?: Density;
    /** Classes for the box around the table. Give it a height, as in max-h-96, and the rows scroll under a header that stays put */
    className?: string;
}
/**
 * Rows of records under sortable columns, such as customers, invoices or members, on a raised box. Set isRowHeader on
 * the column that names each row, and give the table an aria-label
 */
export declare function Table({ density, className, ...props }: TableProps): import("react").JSX.Element;
/** The header row, holding a Column for each column. With several rows to choose, it starts with a checkbox that chooses them all */
export declare function TableHeader<T extends object>({ columns, children, ...props }: TableHeaderProps<T>): import("react").JSX.Element;
export interface ColumnProps extends AriaColumnProps {
    /** End aligns the column’s header and cells to the right, with tabular figures, for numbers such as amounts. Cells follow their column unless they set their own */
    align?: Align;
}
/** A column’s header. allowsSorting makes it a button that sorts the table, shown by an arrow beside the name. A width, defaultWidth or minWidth is in pixels or a fraction of what’s left, as in 2fr */
export declare function Column({ align, ...props }: ColumnProps): import("react").JSX.Element;
/** The rows, as Row children or from items. renderEmptyState shows in their place when there are none, a string or an EmptyState */
export declare function TableBody<T extends object>({ renderEmptyState, ...props }: TableBodyProps<T>): import("react").JSX.Element;
/** A row of cells. An href makes it a link and onAction an action; with several to choose, it starts with a checkbox */
export declare function Row<T extends object>({ columns, children, ...props }: RowProps<T>): import("react").JSX.Element;
export interface CellProps extends AriaCellProps {
    /** Overrides the column’s alignment for this cell */
    align?: Align;
}
/** A cell in a Row. Text in it truncates with an ellipsis, and it lines up with its column */
export declare function Cell({ align, ...props }: CellProps): import("react").JSX.Element;
export interface RowActionsProps<T> extends Omit<MenuProps<T>, 'aria-label'> {
    /** Names the button for screen readers, as in “Actions for Ada Lovelace” */
    'aria-label': string;
}
/**
 * A menu button for the last cell of a row, holding MenuItems. Pressing it opens the menu without choosing the row.
 * It's 28px, pulled into the row's 20px line, so it doesn't make the row taller; give its column a width of 52
 */
export declare function RowActions<T extends object>({ 'aria-label': label, placement, ...props }: RowActionsProps<T>): import("react").JSX.Element;
/** The last thing in a TableBody when there's more to load: onLoadMore runs as it scrolls into view, and isLoading shows a row saying so */
export declare function TableLoadMore({ children, className, ...props }: TableLoadMoreItemProps): import("react").JSX.Element;
