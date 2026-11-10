import { type GridListHeaderProps, type GridListItemProps, type GridListProps as AriaGridListProps, type GridListSectionProps } from 'react-aria-components';
export type { GridListHeaderProps, GridListItemProps, GridListSectionProps };
type Layout = 'stack' | 'grid';
export declare const gridList: import("tailwind-variants").TVReturnType<{
    layout: {
        stack: string;
        grid: string;
    };
}, undefined, "outline-0", undefined, undefined, undefined>;
export declare const gridListItem: import("tailwind-variants").TVReturnType<{
    layout: {
        stack: string;
        grid: string;
    };
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
}, undefined, "group/item relative cursor-default rounded-lg text-ink transition-[background-color,border-color,box-shadow] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none", {
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
export interface GridListProps<T> extends AriaGridListProps<T> {
    /** Stack lays the items out as rows, and grid as tiles that wrap. Give the list a className to set its own columns */
    layout?: Layout;
}
/** Items to choose or act on, as rows or tiles, which can hold buttons of their own. Give it an aria-label */
export declare function GridList<T extends object>({ layout, renderEmptyState, ...props }: GridListProps<T>): import("react").JSX.Element;
/** An item in a GridList. With several to choose, it shows a checkbox. Its content can follow its state, as in group-data-[selected]/item:border-ink */
export declare function GridListItem<T extends object>(props: GridListItemProps<T>): import("react").JSX.Element;
/** Items grouped under a GridListHeader, which goes first inside it */
export declare function GridListSection<T extends object>(props: GridListSectionProps<T>): import("react").JSX.Element;
/** A section's heading, first inside a GridListSection */
export declare function GridListHeader(props: GridListHeaderProps): import("react").JSX.Element;
