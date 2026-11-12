import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, isValidElement, useLayoutEffect, useRef, useState } from 'react';
import { Breadcrumb as AriaBreadcrumb, Breadcrumbs as AriaBreadcrumbs, Link as AriaLink, composeRenderProps } from 'react-aria-components';
import { Button, button } from './Button.js';
import { Ellipsis } from './glyphs.js';
import { Menu, MenuItem, MenuTrigger } from './Menu.js';
import { focusRing, tv } from './tv.js';
export const breadcrumbs = tv({
    base: 'relative flex min-w-0 flex-1 text-control leading-none font-medium text-muted',
});
export const breadcrumb = tv({
    base: 'flex items-center gap-1.5',
    variants: {
        // The page you're on gives way first, so it's the one that truncates when there's no room
        isCurrent: {
            true: 'min-w-0 text-ink',
            false: 'shrink-0',
        },
    },
});
const crumbLink = tv({
    extend: focusRing,
    base: 'min-w-0 truncate rounded-sm transition-colors duration-150 ease-out motion-reduce:transition-none',
    variants: {
        isHovered: {
            true: 'text-ink',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
});
// Smaller than the 16px chevron in glyphs, so it sits between words without competing with them
const Separator = () => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 8 8", className: "size-2 shrink-0 fill-none stroke-current stroke-1 opacity-48", children: _jsx("path", { d: "M2.75 1.5 5.25 4 2.75 6.5", strokeLinecap: "round", strokeLinejoin: "round" }) }));
/** One step in a trail of Breadcrumbs. The last is the page you’re on, so it’s text rather than a link */
export function Breadcrumb({ href, children, ...props }) {
    return (_jsx(AriaBreadcrumb, { ...props, className: composeRenderProps(props.className, (className, { isCurrent }) => breadcrumb({ isCurrent, className })), children: ({ isCurrent }) => (_jsxs(_Fragment, { children: [isCurrent ? (_jsx("span", { "aria-current": "page", className: "min-w-0 truncate", children: children })) : href ? (_jsx(AriaLink, { href: href, className: (state) => crumbLink(state), children: children })) : (_jsx("span", { className: "truncate", children: children })), !isCurrent && _jsx(Separator, {})] })) }));
}
/**
 * The crumbs to hide, as how many after the first, so the trail fits the room it has. It keeps the first and as many
 * from the end as fit, with the ellipsis between them, and always keeps the last. Each width includes its separator
 */
export function crumbsToHide(widths, ellipsis, gap, room, maxVisible = Infinity) {
    const count = widths.length;
    if (count <= 2)
        return 0;
    const limit = Math.max(2, maxVisible);
    // A crumb hidden with CSS, such as the first on phones, takes no room and no gap
    const length = (shown) => {
        const present = shown.filter((width) => width > 0);
        return present.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, present.length - 1);
    };
    // Half a pixel of slack, as widths round differently from one measure to the next
    const fits = (shown) => length(shown) <= room + 0.5;
    if (count <= limit && fits(widths))
        return 0;
    for (let hidden = Math.max(1, count - limit); hidden < count - 2; hidden++) {
        if (fits([widths[0], ellipsis, ...widths.slice(hidden + 1)]))
            return hidden;
    }
    return count - 2;
}
/**
 * Where a page sits in a site, as a trail of links up to it. It fills the width it’s given, and when the trail won’t fit,
 * the crumbs in the middle fold into an ellipsis that opens a menu of them
 */
export function Breadcrumbs({ children, maxVisible, className, 'aria-label': label = 'Breadcrumbs', ...props }) {
    const crumbs = Children.toArray(children).filter((child) => isValidElement(child));
    const navRef = useRef(null);
    const trailRef = useRef(null);
    const ellipsisRef = useRef(null);
    const [measured, setMeasured] = useState(0);
    // Measures a hidden copy of the whole trail rather than what's shown, so folding never changes what's measured and
    // can't loop. It runs after every render, before paint, and settles at once as React skips an unchanged state
    useLayoutEffect(() => {
        const nav = navRef.current;
        const trail = trailRef.current;
        const ellipsis = ellipsisRef.current;
        if (!nav || !trail || !ellipsis)
            return;
        const measure = () => {
            const widths = [...trail.children].map((child) => child.getBoundingClientRect().width);
            const gap = parseFloat(getComputedStyle(trail).columnGap) || 0;
            setMeasured(crumbsToHide(widths, ellipsis.getBoundingClientRect().width, gap, nav.getBoundingClientRect().width));
        };
        measure();
        if (typeof ResizeObserver === 'undefined')
            return;
        const observer = new ResizeObserver(measure);
        observer.observe(nav);
        observer.observe(trail);
        return () => observer.disconnect();
    });
    const hidden = Math.max(measured, maxVisible == null ? 0 : crumbsToHide(crumbs.map(() => 0), 0, 0, 0, maxVisible));
    const shown = hidden > 0 ? [crumbs[0], _jsx(Folded, { crumbs: crumbs.slice(1, hidden + 1), isDisabled: props.isDisabled, onAction: props.onAction }, "folded"), ...crumbs.slice(hidden + 1)] : crumbs;
    return (_jsxs("nav", { ref: navRef, "aria-label": label, className: breadcrumbs({ className }), children: [_jsx(AriaBreadcrumbs, { ...props, className: "flex min-w-0 items-center gap-1.5", render: (list) => _jsx("ol", { ...list, "aria-label": undefined }), children: shown }), _jsxs("div", { "aria-hidden": "true", inert: true, className: "pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden", children: [_jsx("div", { ref: trailRef, className: "flex w-max items-center gap-1.5", children: crumbs.map((crumb, index) => {
                            const isCurrent = index === crumbs.length - 1;
                            return (_jsxs("span", { className: breadcrumb({ isCurrent, className: typeof crumb.props.className === 'string' ? crumb.props.className : undefined }), children: [_jsx("span", { className: "whitespace-nowrap", children: crumb.props.children }), !isCurrent && _jsx(Separator, {})] }, crumb.key));
                        }) }), _jsxs("span", { ref: ellipsisRef, className: "flex w-max items-center gap-1.5", children: [_jsx("span", { className: button({ variant: 'ghost', shape: 'square', size: 'small', className: ellipsisButton }), children: _jsx(Ellipsis, {}) }), _jsx(Separator, {})] })] })] }));
}
// Pulled in on each side so it takes about the room of a word, and stays on the line's height
const ellipsisButton = '-mx-1 -my-1 text-muted';
/** The crumbs that don't fit, behind an ellipsis, in a menu in the order they'd have been in the trail */
function Folded({ crumbs, isDisabled, onAction }) {
    return (_jsxs(AriaBreadcrumb, { className: breadcrumb({ isCurrent: false }), children: [_jsxs(MenuTrigger, { children: [_jsx(Button, { variant: "ghost", shape: "square", size: "small", "aria-label": "Show hidden pages", isDisabled: isDisabled, className: ellipsisButton, children: _jsx(Ellipsis, {}) }), _jsx(Menu, { placement: "bottom start", onAction: onAction, children: crumbs.map((crumb) => {
                            const { id, href, children, textValue } = crumb.props;
                            return (_jsx(MenuItem, { id: id ?? crumb.key ?? undefined, href: href, textValue: textValue, isDisabled: href == null, className: href == null ? 'text-muted opacity-100' : undefined, children: children }, crumb.key));
                        }) })] }), _jsx(Separator, {})] }));
}
