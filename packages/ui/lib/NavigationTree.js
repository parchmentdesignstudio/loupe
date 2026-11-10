import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { Link as AriaLink, NavigationTree as AriaNavigationTree, NavigationTreeHeader as AriaNavigationTreeHeader, NavigationTreeItem as AriaNavigationTreeItem, NavigationTreeItemContent as AriaNavigationTreeItemContent, NavigationTreeSection as AriaNavigationTreeSection, } from 'react-aria-components';
import { header } from './Header.js';
import { composeClassName, focusRing, tv } from './tv.js';
// The app only moves selectedRoute once the page has changed, so a pressed link would drop back to its hover fill in
// between and flicker. Each link reports its press here, and shows as current until selectedRoute moves on
const PressContext = createContext(null);
/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export function NavigationTree(props) {
    const [pressed, setPressed] = useState(null);
    const selectedRoute = pressed && pressed.from === props.selectedRoute ? pressed.href : props.selectedRoute;
    const press = (event) => {
        const href = event.target.getAttribute('href');
        const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.getAttribute('target') === '_blank';
        if (href && props.selectedRoute !== undefined && !opensElsewhere)
            setPressed({ href, from: props.selectedRoute });
    };
    return (_jsx(PressContext.Provider, { value: press, children: _jsx(AriaNavigationTree, { ...props, selectedRoute: selectedRoute, className: composeClassName(props.className, 'flex flex-col gap-0.5 outline-0') }) }));
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
    base: 'block rounded-lg px-3 py-1.5 text-control font-medium text-ink',
    variants: {
        isHovered: {
            true: 'bg-bleed/4',
        },
        isPressed: {
            true: 'bg-bleed/8',
        },
        isCurrent: {
            true: 'bg-bleed/8',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
});
/** An item’s text, inside the link React Aria gives each item */
export function NavigationTreeItemContent({ children }) {
    const press = useContext(PressContext);
    return (_jsx(AriaNavigationTreeItemContent, { children: (values) => (_jsx(AriaLink, { onPress: press ?? undefined, className: (state) => navigationTreeLink(state), children: typeof children === 'function' ? children(values) : children })) }));
}
