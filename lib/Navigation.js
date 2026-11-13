import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './Button.js';
import { Sheet, SheetTrigger } from './Sheet.js';
import { tv } from './tv.js';
const navigation = tv({
    base: 'flex flex-col gap-6 max-md:hidden md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:overflow-y-auto md:border-r md:border-bleed/8 md:px-3 md:py-6',
});
/** A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones */
export function Navigation({ className, children, hasTrigger = true, isOpen: givenOpen, onOpenChange, ...props }) {
    const [ownOpen, setOwnOpen] = useState(false);
    const isOpen = givenOpen ?? ownOpen;
    const setOpen = (next) => {
        setOwnOpen(next);
        onOpenChange?.(next);
    };
    // The listener below is added once, so it reads the latest setOpen, and with it the page's onOpenChange, from here
    const latest = useRef(setOpen);
    useLayoutEffect(() => {
        latest.current = setOpen;
    });
    // Choosing a link in the sheet closes it, to show its page. It listens on the nav rather than each
    // link, and the links already take the keyboard, so it isn't an onClick
    const closeOnLink = useCallback((nav) => {
        if (!nav)
            return;
        const close = (event) => {
            if (event.target.closest('a[href]'))
                latest.current(false);
        };
        nav.addEventListener('click', close);
        return () => nav.removeEventListener('click', close);
    }, []);
    const content = (_jsx("nav", { ...props, ref: closeOnLink, className: "flex flex-col gap-6", children: children }));
    const sheet = (_jsx(Sheet, { position: "start", "aria-label": props['aria-label'], children: content }));
    return (_jsxs(_Fragment, { children: [_jsx("nav", { ...props, className: navigation({ className }), children: children }), hasTrigger ? (_jsx("div", { className: "px-4 pt-4 md:hidden", children: _jsxs(SheetTrigger, { isOpen: isOpen, onOpenChange: setOpen, children: [_jsx(Button, { variant: "secondary", children: props['aria-label'] }), sheet] }) })) : (_jsx(Sheet, { isOpen: isOpen, onOpenChange: setOpen, position: "start", "aria-label": props['aria-label'], children: content }))] }));
}
