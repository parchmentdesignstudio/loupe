import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { Button as AriaButton, Link as AriaLink, NavigationTree as AriaNavigationTree, NavigationTreeHeader as AriaNavigationTreeHeader, NavigationTreeItem as AriaNavigationTreeItem, NavigationTreeItemContent as AriaNavigationTreeItemContent, NavigationTreeSection as AriaNavigationTreeSection, } from 'react-aria-components';
import { TriangleDown } from './glyphs.js';
import { header } from './Header.js';
import { composeClassName, focusRing, tv } from './tv.js';
const TreeContext = createContext(null);
/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export function NavigationTree({ hasTitles = false, ...props }) {
    const [pressed, setPressed] = useState(null);
    const selectedRoute = pressed && pressed.from === props.selectedRoute ? pressed.href : props.selectedRoute;
    const press = (event) => {
        const href = event.target.getAttribute('href');
        const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.getAttribute('target') === '_blank';
        if (href && props.selectedRoute !== undefined && !opensElsewhere)
            setPressed({ href, from: props.selectedRoute });
    };
    return (_jsx(TreeContext.Provider, { value: { press, hasTitles }, children: _jsx(AriaNavigationTree, { ...props, selectedRoute: selectedRoute, className: composeClassName(props.className, 'flex flex-col gap-0.5 outline-0') }) }));
}
const section = tv({
    base: 'flex flex-col gap-0.5 not-first:mt-5',
});
export function NavigationTreeSection(props) {
    return _jsx(AriaNavigationTreeSection, { ...props, className: section({ className: props.className }) });
}
export function NavigationTreeHeader({ children, ...props }) {
    return (_jsx(AriaNavigationTreeHeader, { ...props, children: _jsx("span", { className: header({ className: 'block pt-0' }), children: children }) }));
}
export function NavigationTreeItem(props) {
    return _jsx(AriaNavigationTreeItem, { ...props, className: composeClassName(props.className, 'outline-0') });
}
// The link fills its row, so the row's states are the link's: hovered, the current page and the focus ring
export const navigationTreeLink = tv({
    extend: focusRing,
    base: 'flex cursor-default items-center gap-2 rounded-(--navigation-tree-item-radius) px-(--navigation-tree-item-padding-x) py-(--navigation-tree-item-padding-y) text-control font-(--navigation-tree-item-font-weight) text-(color:--navigation-tree-item-text,var(--color-ink)) in-data-[show-focus]:outline-2',
    variants: {
        isHovered: {
            true: 'bg-bleed/4',
        },
        isPressed: {
            true: 'bg-bleed/8',
        },
        isCurrent: {
            true: 'text-(color:--navigation-tree-item-current-text,var(--color-accent))',
        },
        isDisabled: {
            true: 'text-muted',
        },
    },
});
// Where each depth's text and fill start, in px. Each depth steps in 12px, and its line runs down under the first letter
// of the parent, with the fill starting 6px after it so the line stays clear of it
const textAt = (depth) => 12 * Math.max(depth, 1);
const fillAt = (depth) => (depth < 2 ? 0 : textAt(depth) - 6);
// Where the cap height and the baseline fall in a row, from Elza's ascent and descent in ems and the row's 4px padding.
// A line takes the text's size, so these hold at any text size
const baseline = 'calc(4px + (1lh - 1.231em) / 2 + 1em)';
const capTop = `calc(${baseline} - 0.716em)`;
/** The item beside this one under the same parent, after it or before it, skipping the content node React Aria keeps among them */
function sibling(collection, key, way) {
    let next = key == null ? null : collection.getItem(key)?.[way];
    while (next != null) {
        const node = collection.getItem(next);
        if (node?.type === 'item')
            return node;
        next = node?.[way];
    }
    return null;
}
const rail = 'pointer-events-none absolute text-control';
// The triangle is drawn at 12px rather than its 16px, so it sits quietly by the text. It points along the line while
// closed, and turns down to open
const triangle = 'size-3 shrink-0 fill-current transition-transform duration-150 ease-out motion-reduce:transition-none';
/**
 * The line down each open folder, from the cap height of its first item to the baseline of its last, so it spans the
 * text rather than the rows, and the current page marked on it in the accent. A folder's line carries on past the items
 * of a folder inside it. Nothing at the top depth, apart from the accent
 */
function Rails({ state, id, depth, isCurrent }) {
    const { collection } = state;
    const lines = [];
    // Climbing from the item, it's at the end of each folder above while it and each folder between are the last in theirs
    let node = id;
    let isAtEnd = true;
    for (let level = depth; level >= 2 && node != null; level--) {
        isAtEnd &&= !sibling(collection, node, 'nextKey');
        const isFirst = level === depth && !sibling(collection, node, 'prevKey');
        // Rows are 2px apart, so a line reaches up over the gap to meet the one above
        lines.push({ at: textAt(level - 1), top: isFirst ? capTop : '-2px', bottom: isAtEnd ? baseline : '100%' });
        node = collection.getItem(node)?.parentKey;
    }
    const own = lines[0];
    const top = own?.top === capTop ? capTop : '2px';
    const bottom = own?.bottom === baseline ? baseline : '100% - 2px';
    return (_jsxs(_Fragment, { children: [lines.map((line) => (_jsx("span", { "aria-hidden": "true", className: `${rail} w-px bg-bleed/16`, style: { insetInlineStart: line.at, top: line.top, height: `calc(${line.bottom} - ${line.top})` } }, line.at))), isCurrent && (_jsx("span", { "aria-hidden": "true", className: `${rail} w-0.5 rounded-full bg-accent`, style: { insetInlineStart: own ? own.at - 0.5 : 0, top, height: `calc(${bottom} - ${top})` } }))] }));
}
export function NavigationTreeItemContent({ children, icon }) {
    const tree = useContext(TreeContext);
    return (_jsx(AriaNavigationTreeItemContent, { children: (values) => {
            const text = typeof children === 'function' ? children(values) : children;
            const isTitle = !!tree?.hasTitles && values.level === 1;
            const depth = tree?.hasTitles ? values.level - 1 : values.level;
            const isFirst = !sibling(values.state.collection, values.id, 'prevKey');
            // Pages inside a folder are muted, so the folders and the current page stand out
            const isPage = depth > 1 && !values.hasChildItems;
            return (_jsxs("div", { className: ['group/row relative flex items-center', isTitle && !isFirst && 'mt-5'].filter(Boolean).join(' '), children: [_jsx(AriaLink, { onPress: tree?.press, className: (state) => navigationTreeLink({ ...state, className: 'absolute inset-y-0 end-0' }), style: { insetInlineStart: fillAt(depth) }, children: _jsx("span", { className: "sr-only", children: text }) }), !isTitle && _jsx(Rails, { state: values.state, id: values.id, depth: depth, isCurrent: values.isCurrent }), _jsxs("span", { "aria-hidden": "true", className: [
                            'pointer-events-none relative flex min-w-0 items-center gap-1 py-1 group-has-[[data-disabled]]/row:text-muted',
                            isTitle
                                ? 'font-mono text-label text-muted group-has-[[aria-current=page]]/row:text-ink'
                                : isPage
                                    ? 'text-control text-muted group-hover/row:text-ink group-has-[[aria-current=page]]/row:font-medium group-has-[[aria-current=page]]/row:text-ink'
                                    : 'text-control font-medium text-ink',
                        ].join(' '), style: { paddingInlineStart: textAt(depth) }, children: [icon && _jsx("span", { className: "flex shrink-0 [&>svg]:size-3", children: icon }), _jsx("span", { className: "min-w-0 truncate", children: text })] }), values.hasChildItems && (_jsx(AriaButton, { slot: "chevron", className: (state) => 
                        // The triangle sits right by the text, in its colour, with the space to press it reaching past it
                        focusRing({ ...state, className: ['relative flex size-4 shrink-0 cursor-default items-center justify-center rounded-sm outline-offset-1 after:absolute after:-inset-1', isTitle ? 'text-muted' : 'text-ink'].join(' ') }), children: _jsx(TriangleDown, { className: values.isExpanded ? triangle : `${triangle} -rotate-90 rtl:rotate-90` }) }))] }));
        } }));
}
