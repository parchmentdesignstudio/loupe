import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './Button.js';
import { ChevronLeft, ChevronRight, Ellipsis } from './glyphs.js';
import { Menu, MenuItem, MenuTrigger } from './Menu.js';
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);
/**
 * The pages to show a button for, with 'gap' where some are left out. The first and last always show, with `siblings`
 * either side of the current one, and the list is always the same length, so the buttons don't shift as you move through
 */
export function pageRange(page, count, siblings = 1) {
    // The first, the last, the current, its siblings and a gap each side
    const slots = siblings * 2 + 5;
    if (count <= slots)
        return range(1, count);
    const current = Math.min(Math.max(page, 1), count);
    const start = Math.max(current - siblings, 1);
    const end = Math.min(current + siblings, count);
    // A gap stands for at least two pages, as a single one may as well be shown
    if (start <= 3)
        return [...range(1, slots - 2), 'gap', count];
    if (end >= count - 2)
        return [1, 'gap', ...range(count - slots + 3, count)];
    return [1, 'gap', ...range(start, end), 'gap', count];
}
const glyph = 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] rtl:-scale-x-100';
/** Buttons to move between the pages of a long list or table, with the pages far from the current one folded behind an ellipsis, in a menu */
export function Pagination({ page, count, onChange, siblings, 'aria-label': label = 'Pages', className }) {
    if (count < 1)
        return null;
    const items = pageRange(page, count, siblings);
    return (_jsx("nav", { "aria-label": label, className: className, children: _jsxs("ul", { className: "flex items-center gap-1", children: [_jsx("li", { children: _jsx(Button, { variant: "ghost", size: "small", "aria-label": "Previous page", isDisabled: page <= 1, onPress: () => onChange(page - 1), children: _jsx(ChevronLeft, { className: glyph }) }) }), items.map((item, index) => item === 'gap' ? (_jsx("li", { children: _jsx(Folded, { pages: range(items[index - 1] + 1, items[index + 1] - 1), onChange: onChange }) }, `gap-${index}`)) : item === page ? (_jsxs("li", { "aria-current": "page", className: "min-w-7 rounded-lg bg-bleed/8 px-1.5 py-1 text-center text-control font-medium tabular-nums", children: [_jsx("span", { className: "sr-only", children: "Page " }), item] }, item)) : (_jsx("li", { children: _jsx(Button, { variant: "ghost", size: "small", "aria-label": `Page ${item}`, className: "min-w-7 tabular-nums", onPress: () => onChange(item), children: item }) }, item))), _jsx("li", { children: _jsx(Button, { variant: "ghost", size: "small", "aria-label": "Next page", isDisabled: page >= count, onPress: () => onChange(page + 1), children: _jsx(ChevronRight, { className: glyph }) }) })] }) }));
}
/** The pages a gap stands for, behind an ellipsis, in a menu to jump to any of them, as breadcrumbs fold theirs */
function Folded({ pages, onChange }) {
    return (_jsxs(MenuTrigger, { children: [_jsx(Button, { variant: "ghost", size: "small", "aria-label": `Pages ${pages[0]} to ${pages.at(-1)}`, className: "min-w-7 text-muted", children: _jsx(Ellipsis, {}) }), _jsx(Menu, { placement: "top", onAction: (key) => onChange(Number(key)), children: pages.map((number) => (_jsx(MenuItem, { id: number, textValue: `Page ${number}`, children: number }, number))) })] }));
}
