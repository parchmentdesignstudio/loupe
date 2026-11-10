import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { GridList as AriaGridList, GridListHeader as AriaGridListHeader, GridListItem as AriaGridListItem, GridListSection as AriaGridListSection, composeRenderProps, } from 'react-aria-components';
import { Checkbox } from './Checkbox.js';
import { focusRing, tv } from './tv.js';
// The list hands its layout to its items, sections and headers
const LayoutContext = createContext('stack');
export const gridList = tv({
    base: 'outline-0',
    variants: {
        layout: {
            stack: 'flex flex-col gap-0.5',
            grid: 'grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3',
        },
    },
});
export const gridListItem = tv({
    extend: focusRing,
    base: 'group/item relative cursor-default rounded-lg text-ink transition-[background-color,border-color,box-shadow] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none',
    variants: {
        layout: {
            // The ring sits inside a row, clear of the rows next to it
            stack: 'flex items-center gap-3 px-3 py-1.5 text-control -outline-offset-2',
            grid: 'flex flex-col gap-2 border border-bleed/8 p-2 text-control',
        },
        isHovered: {
            true: '',
        },
        isSelected: {
            true: '',
        },
        isPressed: {
            true: '',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
    compoundVariants: [
        { layout: 'stack', isHovered: true, class: 'bg-bleed/4' },
        { layout: 'stack', isSelected: true, class: 'bg-bleed/8' },
        { layout: 'stack', isPressed: true, class: 'bg-bleed/12' },
        { layout: 'grid', isHovered: true, class: 'border-bleed/24' },
        // Two pixels of ink, from the border and a ring over it, so nothing moves
        { layout: 'grid', isSelected: true, class: 'border-ink shadow-[0_0_0_1px_var(--color-ink)]' },
    ],
});
const empty = tv({
    base: 'col-span-full py-2 text-label text-muted',
    variants: {
        layout: {
            stack: 'px-3',
            grid: '',
        },
    },
});
/** Items to choose or act on, as rows or tiles, which can hold buttons of their own. Give it an aria-label */
export function GridList({ layout = 'stack', renderEmptyState, ...props }) {
    return (_jsx(LayoutContext.Provider, { value: layout, children: _jsx(AriaGridList, { ...props, layout: layout, renderEmptyState: renderEmptyState && ((state) => _jsx("div", { className: empty({ layout }), children: renderEmptyState(state) })), className: composeRenderProps(props.className, (className) => gridList({ layout, className })) }) }));
}
const selection = tv({
    base: 'py-0',
    variants: {
        layout: {
            stack: '',
            // Over the tile's corner, where it's out of the way of a caption
            grid: 'absolute top-3 right-3 z-1',
        },
    },
});
/** An item in a GridList. With several to choose, it shows a checkbox. Its content can follow its state, as in group-data-[selected]/item:border-ink */
export function GridListItem(props) {
    const layout = useContext(LayoutContext);
    const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
    return (_jsx(AriaGridListItem, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, state) => gridListItem({ ...state, layout, className })), children: composeRenderProps(props.children, (children, { selectionMode, selectionBehavior }) => (_jsxs(_Fragment, { children: [selectionMode === 'multiple' && selectionBehavior === 'toggle' && _jsx(Checkbox, { slot: "selection", className: selection({ layout }) }), children] }))) }));
}
const section = tv({
    variants: {
        layout: {
            stack: 'flex flex-col gap-0.5 not-first:mt-3',
            // Spans the list and takes its columns, so tiles line up from one section to the next
            grid: 'col-span-full grid grid-cols-subgrid gap-3 not-first:mt-3',
        },
    },
});
/** Items grouped under a GridListHeader, which goes first inside it */
export function GridListSection(props) {
    const layout = useContext(LayoutContext);
    return _jsx(AriaGridListSection, { ...props, className: section({ layout, className: props.className }) });
}
const header = tv({
    base: 'font-mono text-label text-muted',
    variants: {
        layout: {
            stack: 'px-3 pt-2 pb-1',
            grid: 'col-span-full',
        },
    },
});
/** A section's heading, first inside a GridListSection */
export function GridListHeader(props) {
    const layout = useContext(LayoutContext);
    return _jsx(AriaGridListHeader, { ...props, className: header({ layout, className: props.className }) });
}
