import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Autocomplete, useFilter } from 'react-aria-components';
import { Breadcrumb, Breadcrumbs } from './Breadcrumbs.js';
import { Button } from './Button.js';
import { Dialog, Modal } from './Dialog.js';
import { Drawer, DrawerTrigger } from './Drawer.js';
import { Ellipsis, MagnifyingGlass } from './glyphs.js';
import { ListBox, ListBoxItem } from './ListBox.js';
import { Navigation } from './Navigation.js';
import { SearchField } from './SearchField.js';
import { Tooltip, TooltipTrigger } from './Tooltip.js';
export function DocsShell({ brand, nav, navLabel, trail, barStart, actions, phoneActions, drawerEnd, aside, toggles, isAsideOpen = false, current, scrollerRef, children }) {
    const [isOpen, setOpen] = useState(false);
    const [togglesWidth, setTogglesWidth] = useState(0);
    const togglesRef = useRef(null);
    useLayoutEffect(() => {
        const element = togglesRef.current;
        if (!element)
            return;
        const measure = () => setTogglesWidth(element.offsetWidth);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [toggles]);
    const hasToggles = toggles != null && toggles !== false;
    const [shown, setShown] = useState(current);
    if (shown !== current) {
        setShown(current);
        setOpen(false);
    }
    return (_jsxs("div", { className: "font-sans text-body text-ink md:flex", children: [_jsx("div", { className: "contents max-md:hidden", children: _jsxs(Navigation, { "aria-label": navLabel, className: "md:border-r-0", children: [_jsx("div", { className: "-mt-4 flex h-12 shrink-0 items-center gap-2.5 px-3", children: brand }), nav] }) }), _jsxs("header", { className: "sticky top-0 z-20 flex items-center justify-between gap-3 bg-ground px-4 py-2 [--bleed:var(--ground-bleed)] md:hidden", children: [_jsx("div", { className: "flex items-center gap-2.5", children: brand }), _jsxs("div", { className: "-mr-1.5 flex items-center gap-1", children: [phoneActions, _jsxs(DrawerTrigger, { isOpen: isOpen, onOpenChange: setOpen, children: [_jsx(Button, { variant: "ghost", shape: "full", size: "small", "aria-label": navLabel, children: _jsx(Ellipsis, {}) }), _jsx(Drawer, { position: "end", "aria-label": navLabel, children: _jsxs("div", { className: "flex flex-col gap-6", children: [nav, drawerEnd && _jsx("div", { className: "flex flex-col gap-6 px-3", children: drawerEnd })] }) })] })] })] }), _jsxs("div", { className: "min-w-0 flex-1 bg-panel md:relative md:z-1 md:my-2 md:mr-2 md:h-[calc(100dvh-1rem)] md:overflow-hidden md:rounded-xl md:shadow-shell", style: hasToggles ? { '--docs-toggles': `${togglesWidth}px` } : undefined, children: [_jsxs("div", { className: "flex min-h-full overflow-x-clip [--bleed:var(--panel-bleed)] md:h-full", children: [_jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsxs("div", { className: "sticky top-11 z-10 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-bleed/8 bg-panel px-4 md:top-0 md:px-5", children: [_jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2", children: [barStart, _jsx(Breadcrumbs, { children: trail.map((crumb, index) => (_jsx(Breadcrumb, { href: crumb.href, className: "first:max-md:hidden", children: crumb.name }, `${index}${crumb.name}`))) })] }), actions && _jsx("div", { className: `-mr-1.5 flex items-center gap-1 max-md:hidden ${hasToggles && !isAsideOpen ? 'md:mr-[calc(var(--docs-toggles)-2px)]' : ''}`, children: actions })] }), _jsx("main", { ref: scrollerRef, "data-docs-page": true, className: "@container/page min-w-0 flex-1 md:min-h-0 md:overflow-y-auto md:overscroll-contain", children: children })] }), aside] }), hasToggles && (_jsx("div", { ref: togglesRef, className: "absolute end-3.5 top-0 z-20 flex h-12 items-center gap-1 max-md:hidden", children: toggles }))] })] }));
}
/** A page in DocsShell: its header over what it shows, with its sections beside them from the top on wide screens */
export function DocsPage({ header, contents, isWide, children }) {
    const column = isWide ? '' : 'mx-auto max-w-[40rem]';
    return (_jsxs("div", { className: contents ? '@4xl/page:grid @4xl/page:grid-cols-[13rem_minmax(0,1fr)] @4xl/page:items-start' : undefined, children: [_jsx("div", { className: "px-4 pt-10 pb-10 @lg/page:px-10 @4xl/page:col-start-2", children: _jsx("div", { "data-drawer-follows": true, className: column, children: header }) }), contents, _jsx("div", { className: "min-w-0 px-4 pb-10 @lg/page:px-10 @4xl/page:col-start-2 @4xl/page:row-start-2", children: _jsx("div", { "data-drawer-follows": true, className: `flex flex-col gap-10 ${column}`, children: children }) })] }));
}
/** A small pill beside the brand, such as its version */
export function DocsBadge({ children }) {
    return _jsx("span", { className: "rounded-full bg-bleed/8 px-2 py-0.5 font-mono text-label text-muted", children: children });
}
/** Opens DocsSearch */
export function DocsSearchButton({ onPress, icon, tooltip }) {
    const button = (_jsx(Button, { variant: "ghost", shape: "full", size: "small", "aria-label": "Search", onPress: onPress, children: icon ?? _jsx(MagnifyingGlass, {}) }));
    if (!tooltip)
        return button;
    return (_jsxs(TooltipTrigger, { children: [button, _jsx(Tooltip, { children: tooltip })] }));
}
/** Finds a page by name: type to narrow the list, the arrow keys to move through it, and Enter to go. ⌘K opens it */
export function DocsSearch({ pages, isOpen, onOpenChange, placeholder = 'Search components' }) {
    const { contains } = useFilter({ sensitivity: 'base' });
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                onOpenChange(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onOpenChange]);
    // It opens over the page, outside DocsShell, so it sets its own type
    return (_jsx(Modal, { isOpen: isOpen, onOpenChange: onOpenChange, isDismissable: true, className: "items-start pt-[12vh]", children: _jsx(Dialog, { "aria-label": "Search", className: "flex max-h-[min(28rem,70vh)] flex-col gap-2 p-3 font-sans text-body", children: ({ close }) => (_jsxs(Autocomplete, { filter: contains, children: [_jsx(SearchField, { "aria-label": "Search", placeholder: placeholder, autoFocus: true }), _jsx(ListBox, { "aria-label": "Pages", items: pages, onAction: (key) => {
                            window.location.assign(String(key));
                            close();
                        }, renderEmptyState: () => _jsx("p", { className: "px-3 py-1.5 text-control text-muted", children: "Nothing called that" }), className: "-mx-1 -mb-1 min-h-0 flex-1", children: (page) => (_jsxs(ListBoxItem, { id: page.href, textValue: page.name, children: [page.name, _jsx("span", { className: "ms-auto text-label text-muted", children: page.group })] })) })] })) }) }));
}
