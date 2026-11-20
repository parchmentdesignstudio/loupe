import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Dialog, OverlayTriggerStateContext, Sheet, SheetBackdrop, SheetContent, SheetOverlay } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';
export { SheetTrigger as DrawerTrigger } from 'react-aria-components';
// A drawer is React Aria's Sheet, which moves by scrolling. The backdrop’s fade and the step back of a drawer under
// another are keyframes in styles/theme.css, which it plays in time with the swipe. Overscroll padding sits outside
// the drawer’s size, hence box-content. What it holds is a column, so DialogActions can sit at its foot, with the
// dialog's padding kept between them and what's above
const drawer = tv({
    slots: {
        backdrop: 'data-[stack-index=0]:bg-(--drawer-backdrop,var(--color-scrim))',
        panel: 'z-1 box-content overflow-clip rounded-(--drawer-radius) bg-(--drawer-fill,var(--color-overlay)) [--bleed:var(--overlay-bleed)] text-ink shadow-overlay [--shadow-overlay-color:var(--drawer-shadow)] outline-0 will-change-transform transform-[perspective(1000px)] forced-colors:bg-[Canvas]',
        content: 'relative box-border flex h-full flex-col overflow-hidden p-(--dialog-padding) pb-[calc(var(--dialog-padding)_+_var(--sheet-scroll-padding-y))] outline-0 group-data-expanded/drawer:overflow-auto [&>:has(+[data-dialog-actions])]:mb-(--dialog-padding) *:data-dialog-actions:mt-auto',
    },
    variants: {
        position: {
            bottom: { panel: 'max-h-[calc(100%_-_2rem)] w-[calc(100%_-_1rem)] max-w-2xl origin-[center_-150px]' },
            top: { panel: 'max-h-[calc(100%_-_2rem)] w-[calc(100%_-_1rem)] max-w-2xl origin-[center_150px]' },
            center: { panel: 'max-h-[calc(100%_-_2rem)] w-[calc(100%_-_1rem)] max-w-2xl origin-[center_-150px]' },
            left: { panel: 'h-[calc(100%_-_1rem)] w-72 origin-[150px_center]' },
            right: { panel: 'h-[calc(100%_-_1rem)] w-72 origin-[-150px_center]' },
        },
    },
});
// A pushing drawer opens its width from 0, which moves the page beside it over. What it holds keeps its full width
// and is held to the drawer's outer edge, so it slides in with that edge rather than reflowing as it opens
const pushDrawer = tv({
    slots: {
        aside: 'flex h-full shrink-0 overflow-hidden border-bleed/8 transition-[width] duration-300 ease-[cubic-bezier(.32,.72,0,1)] motion-reduce:transition-none',
        inner: 'h-full w-(--drawer-push-width) shrink-0',
        content: 'relative box-border flex h-full flex-col overflow-auto p-(--dialog-padding) outline-0 [&>:has(+[data-dialog-actions])]:mb-(--dialog-padding) *:data-dialog-actions:mt-auto',
    },
    variants: {
        position: {
            start: { aside: 'justify-end' },
            end: { aside: 'justify-start' },
        },
        isOpen: {
            true: { aside: 'w-(--drawer-push-width)' },
            false: { aside: 'w-0' },
        },
    },
    compoundVariants: [
        { position: 'start', isOpen: true, class: { aside: 'border-e' } },
        { position: 'end', isOpen: true, class: { aside: 'border-s' } },
    ],
});
// Tailwind's breakpoints, which a pushing drawer becomes an overlay below
const breakpoints = { md: '48rem', lg: '64rem', xl: '80rem' };
const useMatches = (query) => useSyncExternalStore((onChange) => {
    const list = matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
}, () => matchMedia(query).matches, () => true);
/**
 * A panel that slides in from an edge of the screen, opened by the Button beside it in a DrawerTrigger. Over the page,
 * it swipes back out. Pushing the page aside, the Button closes it again, as does Escape
 */
export function Drawer({ mode = 'overlay', pushFrom = 'md', ...props }) {
    const isWide = useMatches(`(min-width: ${breakpoints[pushFrom]})`);
    if (mode === 'push' && isWide)
        return _jsx(PushDrawer, { ...props });
    return _jsx(OverlayDrawer, { ...props, position: mode === 'push' ? (props.position === 'start' || props.position === 'left' ? 'start' : 'end') : props.position });
}
function OverlayDrawer({ children, 'aria-label': label, ...props }) {
    const slots = drawer();
    return (_jsxs(SheetOverlay, { ...props, className: composeClassName(props.className, 'group/drawer z-50'), children: [_jsx(SheetBackdrop, { className: slots.backdrop(), swipeAnimation: "drawer-backdrop", swipeAnimationRange: props.snapPoints ? { start: props.snapPoints.length - 1 } : undefined }), _jsx(Sheet, { overscrollPadding: true, stackAnimation: "drawer-scale-back", className: ({ position }) => drawer({ position }).panel(), children: _jsx(SheetContent, { "aria-label": label, className: slots.content(), children: children }) })] }));
}
function PushDrawer({ children, 'aria-label': label, isOpen: givenOpen, defaultOpen = false, onOpenChange, position = 'end', className }) {
    // In a DrawerTrigger, it shares the trigger's open state, so its Button toggles it and is marked expanded. Otherwise
    // it's open as isOpen says, or as it was last left
    const trigger = useContext(OverlayTriggerStateContext);
    const [ownOpen, setOwnOpen] = useState(defaultOpen);
    const isOwn = givenOpen != null || trigger == null;
    const isOpen = isOwn ? (givenOpen ?? ownOpen) : trigger.isOpen;
    const setOpen = (next) => {
        if (isOwn) {
            setOwnOpen(next);
            onOpenChange?.(next);
        }
        else
            trigger.setOpen(next);
    };
    const side = position === 'start' || position === 'left' ? 'start' : 'end';
    const slots = pushDrawer({ position: side, isOpen });
    // What it holds stays until it has slid shut, then goes, so the dialog in it takes focus afresh each time it opens.
    // With reduced motion there's no slide to wait for
    const aside = useRef(null);
    const [isMounted, setMounted] = useState(isOpen);
    if (isOpen && !isMounted)
        setMounted(true);
    const opener = useRef(null);
    useLayoutEffect(() => {
        const element = aside.current;
        if (!element)
            return;
        if (isOpen) {
            opener.current = document.activeElement;
            return;
        }
        // Focus goes back to what opened it, before inert would drop it on the page
        if (element.contains(document.activeElement) && opener.current instanceof HTMLElement)
            opener.current.focus();
        const { transitionProperty, transitionDuration } = getComputedStyle(element);
        if (transitionProperty === 'none' || !transitionDuration || transitionDuration === '0s')
            setMounted(false);
    }, [isOpen]);
    // Escape closes it from anywhere inside. It's listened for on the aside, as the dialog takes no key handlers
    const close = useRef(() => setOpen(false));
    useLayoutEffect(() => {
        close.current = () => setOpen(false);
    });
    useLayoutEffect(() => {
        const element = aside.current;
        if (!element)
            return;
        const onKeyDown = (event) => {
            if (event.key !== 'Escape')
                return;
            event.stopPropagation();
            close.current();
        };
        element.addEventListener('keydown', onKeyDown);
        return () => element.removeEventListener('keydown', onKeyDown);
    }, []);
    return (_jsx("aside", { ref: aside, inert: !isOpen, "aria-label": label, onTransitionEnd: (event) => event.target === event.currentTarget && !isOpen && setMounted(false), className: slots.aside({ className: typeof className === 'string' ? className : undefined }), children: _jsx("div", { className: slots.inner(), children: isMounted && (_jsx(OverlayTriggerStateContext.Provider, { value: { isOpen, setOpen, open: () => setOpen(true), close: () => setOpen(false), toggle: () => setOpen(!isOpen), point: null, setPoint: () => { } }, children: _jsx(Dialog, { "aria-label": label, className: slots.content(), children: children }) })) }) }));
}
