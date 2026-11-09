import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Button } from './Button.js';
import { Sheet, SheetTrigger } from './Sheet.js';
import { tv } from './tv.js';
const navigation = tv({
    base: 'flex flex-col gap-6 max-md:hidden md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:overflow-y-auto md:border-r md:border-ink/8 md:px-3 md:py-6',
});
/** A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones */
export function Navigation({ className, children, ...props }) {
    const [isOpen, setOpen] = useState(false);
    // Choosing a link in the sheet closes it, to show its page. It listens on the nav rather than each
    // link, and the links already take the keyboard, so it isn't an onClick
    const closeOnLink = useCallback((nav) => {
        if (!nav)
            return;
        const close = (event) => {
            if (event.target.closest('a[href]'))
                setOpen(false);
        };
        nav.addEventListener('click', close);
        return () => nav.removeEventListener('click', close);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("nav", { ...props, className: navigation({ className }), children: children }), _jsx("div", { className: "px-4 pt-4 md:hidden", children: _jsxs(SheetTrigger, { isOpen: isOpen, onOpenChange: setOpen, children: [_jsx(Button, { variant: "plain", children: props['aria-label'] }), _jsx(Sheet, { position: "start", "aria-label": props['aria-label'], children: _jsx("nav", { ...props, ref: closeOnLink, className: "flex flex-col gap-6", children: children }) })] }) })] }));
}
