import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from 'react';
import { Cell as AriaCell, Collection, Column as AriaColumn, ResizableTableContainer, Row as AriaRow, Table as AriaTable, TableBody as AriaTableBody, TableHeader as AriaTableHeader, TableLoadMoreItem as AriaTableLoadMoreItem, TableStateContext, composeRenderProps, useTableOptions, } from 'react-aria-components';
import { Button } from './Button.js';
import { Checkbox } from './Checkbox.js';
import { ChevronDown, Ellipsis } from './glyphs.js';
import { truncateText } from './ListBox.js';
import { Menu, MenuTrigger } from './Menu.js';
import { focusRing, tv } from './tv.js';
// The scroll box is React Aria's ResizableTableContainer, which works out each column's width from the space there is,
// so cells truncate rather than push the table wider, until every column is at its minimum and the box scrolls sideways.
// Density is a data attribute here, read by the cells with in-data-[density], so it needs no context
// --table-fill is the header's fill, opaque so rows scroll under it: the box's own when raised, and what it sits on when
// flush, which is a panel unless it's set otherwise
export const table = tv({
    slots: {
        container: 'relative isolate scroll-pt-8 overflow-auto text-ink data-[density=compact]:scroll-pt-7',
        grid: 'border-separate border-spacing-0 outline-0',
    },
    variants: {
        // Raised is a box of its own, on a page with other things around it. Flush has no box, for a table that is the page,
        // filling its content edge to edge with the rows' lines running the full width
        variant: {
            raised: { container: 'rounded-lg bg-raised shadow-panel [--bleed:var(--raised-bleed)] [--table-fill:var(--color-raised)]' },
            flush: { container: '[--table-fill:var(--color-panel)]' },
        },
    },
    defaultVariants: { variant: 'raised' },
});
// A cell's ring sits inside it, clear of the cells and rows around it and of the box's clipped edge
const inset = tv({ extend: focusRing, base: '-outline-offset-2' });
export const tableColumn = tv({
    extend: inset,
    // Opaque and sticky, so rows scroll under the header when the box has a height
    base: 'sticky top-0 z-1 cursor-default border-b border-bleed/8 bg-(--table-fill) px-3 py-2 text-start text-label font-medium text-muted transition-[color] duration-150 ease-out select-none first:pl-4 last:pr-4 in-data-[density=compact]:py-1.5 motion-reduce:transition-none',
    variants: {
        isHovered: {
            true: 'text-ink',
        },
        isSorted: {
            true: 'text-ink',
        },
    },
});
// Chrome draws a row's outline over the rows beside it, and the box clips its ends, so the row's ring is drawn by its
// cells instead, as below. Forced colours drop shadows, so there the outline stays
export const tableRow = tv({
    base: 'group/row cursor-default text-control text-ink transition-[background-color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none',
    variants: {
        isHovered: {
            true: 'bg-bleed/4',
        },
        isSelected: {
            true: 'bg-bleed/8',
        },
        isPressed: {
            true: 'bg-bleed/12',
        },
        isDisabled: {
            true: 'text-muted',
        },
        isFocusVisible: {
            false: 'outline-0',
            true: 'outline-0 forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]',
        },
    },
});
// Hairlines between rows, as a top border on every row but the first, which the header's line already sits above.
// 40px comfortable and 32px compact, from the 20px line
export const tableCell = tv({
    extend: inset,
    base: [
        'overflow-hidden border-t border-bleed/8 px-3 py-2.5 align-middle first:pl-4 last:pr-4 in-[tr:first-child]:border-t-0 in-data-[density=compact]:py-1.5',
        // The focused row's ring, 2px of ink inside its edges, as the inset ring on a GridList row
        'group-data-[focus-visible]/row:shadow-[inset_0_2px_var(--color-ink),inset_0_-2px_var(--color-ink)]',
        'group-data-[focus-visible]/row:first:rounded-s-sm group-data-[focus-visible]/row:first:shadow-[inset_0_2px_var(--color-ink),inset_0_-2px_var(--color-ink),inset_2px_0_var(--color-ink)]',
        'group-data-[focus-visible]/row:last:rounded-e-sm group-data-[focus-visible]/row:last:shadow-[inset_0_2px_var(--color-ink),inset_0_-2px_var(--color-ink),inset_-2px_0_var(--color-ink)]',
        'group-data-[focus-visible]/row:only:shadow-[inset_0_0_0_2px_var(--color-ink)]',
    ],
});
const cellContent = tv({
    base: 'flex min-w-0 items-center gap-2',
    variants: {
        align: {
            start: '',
            // Numbers line up by their digits, and the column's widest sets the edge
            end: 'justify-end text-end tabular-nums',
        },
    },
});
/**
 * Rows of records under sortable columns, such as customers, invoices or members, on a raised box. Set isRowHeader on
 * the column that names each row, and give the table an aria-label
 */
export function Table({ density = 'comfortable', variant, className, ...props }) {
    const { container, grid } = table({ variant });
    return (_jsx(ResizableTableContainer, { "data-density": density, className: container({ className }), children: _jsx(AriaTable, { ...props, className: ({ isFocusVisible }) => inset({ isFocusVisible, className: grid() }) }) }));
}
// An unticked box is raised, like the table under it, so its edge mixes from the table's own bleed to stand apart
const selectionBox = 'py-0 [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),var(--dark-edge))]';
// With no rows, React Aria counts them all as chosen and ticks the box, so an empty table shows it clear instead
function SelectAll() {
    const isEmpty = useContext(TableStateContext)?.collection.size === 0;
    return _jsx(Checkbox, { slot: "selection", className: selectionBox, ...(isEmpty && { isSelected: false }) });
}
/** The header row, holding a Column for each column. With several rows to choose, it starts with a checkbox that chooses them all */
export function TableHeader({ columns, children, ...props }) {
    const { selectionBehavior, selectionMode } = useTableOptions();
    return (_jsxs(AriaTableHeader, { ...props, children: [selectionBehavior === 'toggle' && selectionMode === 'multiple' && (_jsx(AriaColumn, { width: 36, minWidth: 36, className: (state) => tableColumn({ ...state, className: 'z-2 pr-0' }), children: _jsx(SelectAll, {}) })), _jsx(Collection, { items: columns, dependencies: props.dependencies, children: children })] }));
}
/** A column’s header. allowsSorting makes it a button that sorts the table, shown by an arrow beside the name. A width, defaultWidth or minWidth is in pixels or a fraction of what’s left, as in 2fr */
export function Column({ align = 'start', ...props }) {
    // React Aria keeps a column's props on its node in the collection, which is where its cells read align from. It
    // isn't an attribute React Aria passes on to the th
    const withAlign = { ...props, align };
    return (_jsx(AriaColumn, { ...withAlign, className: composeRenderProps(props.className, (className, state) => tableColumn({ ...state, isSorted: state.sortDirection != null, className })), children: composeRenderProps(props.children, (children, { allowsSorting, sortDirection, isHovered }) => (_jsxs("span", { className: ['flex min-w-0 items-center gap-1', align === 'end' && 'flex-row-reverse'].filter(Boolean).join(' '), children: [_jsx("span", { className: "min-w-0 truncate", children: children }), allowsSorting && (_jsx(ChevronDown, { className: [
                        'size-4 shrink-0 fill-none stroke-current stroke-[1.5] transition-[rotate,opacity] duration-150 ease-out motion-reduce:transition-none',
                        sortDirection === 'ascending' && 'rotate-180',
                        sortDirection == null && (isHovered ? 'opacity-40' : 'opacity-0'),
                    ]
                        .filter(Boolean)
                        .join(' ') }))] }))) }));
}
/** The rows, as Row children or from items. renderEmptyState shows in their place when there are none, a string or an EmptyState */
export function TableBody({ renderEmptyState, ...props }) {
    return (_jsx(AriaTableBody, { ...props, renderEmptyState: renderEmptyState &&
            ((state) => {
                const empty = renderEmptyState(state);
                return typeof empty === 'string' ? _jsx("div", { className: "px-4 py-3 text-center text-control text-muted", children: empty }) : empty;
            }) }));
}
/** A row of cells. An href makes it a link and onAction an action; with several to choose, it starts with a checkbox */
export function Row({ columns, children, ...props }) {
    const { selectionBehavior, selectionMode } = useTableOptions();
    return (_jsxs(AriaRow, { ...props, className: composeRenderProps(props.className, (className, state) => tableRow({ ...state, className })), children: [selectionBehavior === 'toggle' && selectionMode === 'multiple' && (_jsx(AriaCell, { className: (state) => tableCell({ ...state, className: 'overflow-visible pr-0' }), children: _jsx(Checkbox, { slot: "selection", className: selectionBox }) })), _jsx(Collection, { items: columns, dependencies: props.dependencies, children: children })] }));
}
// Reads the column's alignment as the cell renders, where the table's state is to hand
function CellContent({ align, columnIndex, children }) {
    const state = useContext(TableStateContext);
    const column = columnIndex == null ? undefined : state?.collection.columns[columnIndex];
    return _jsx("div", { className: cellContent({ align: align ?? column?.props?.align ?? 'start' }), children: truncateText(children) });
}
/** A cell in a Row. Text in it truncates with an ellipsis, and it lines up with its column */
export function Cell({ align, ...props }) {
    return (_jsx(AriaCell, { ...props, className: composeRenderProps(props.className, (className, state) => tableCell({ ...state, className })), children: composeRenderProps(props.children, (children, { columnIndex }) => (_jsx(CellContent, { align: align, columnIndex: columnIndex, children: children }))) }));
}
/**
 * A menu button for the last cell of a row, holding MenuItems. Pressing it opens the menu without choosing the row.
 * It's 28px, pulled into the row's 20px line, so it doesn't make the row taller; give its column a width of 52
 */
export function RowActions({ 'aria-label': label, placement = 'bottom end', ...props }) {
    return (_jsxs(MenuTrigger, { children: [_jsx(Button, { variant: "ghost", size: "small", "aria-label": label, className: "-my-1 text-muted data-[hovered]:text-ink aria-expanded:text-ink", children: _jsx(Ellipsis, {}) }), _jsx(Menu, { placement: placement, ...props })] }));
}
/** The last thing in a TableBody when there's more to load: onLoadMore runs as it scrolls into view, and isLoading shows a row saying so */
export function TableLoadMore({ children = 'Loading more…', className, ...props }) {
    return (_jsx(AriaTableLoadMoreItem, { ...props, className: ['text-label text-muted [&>td]:border-t [&>td]:border-bleed/8 [&>td]:px-4 [&>td]:py-2.5 [&>td]:text-center', className].filter(Boolean).join(' '), children: children }));
}
