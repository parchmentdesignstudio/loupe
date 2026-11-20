import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Dialog, OverlayTriggerStateContext, Sheet, SheetBackdrop, SheetContent, SheetOverlay } from 'react-aria-components';
import { Overlay } from 'react-aria';
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
// A pushing drawer takes room in the page's row, at its start or end. What it holds keeps its full width, so it never
// rewraps itself. With reflow continuous, its width opens from 0, which moves the page over as it goes, and what it
// holds is pinned to its outer edge, so it slides in with that edge. With reflow once, its room is taken all at once and
// the panel slides over the page on its own, so the page rewraps a single time: the room is taken once the panel has
// slid in, under it, and given back as it starts to slide out. The panel's box is clipped, so as it slides it never
// sticks out past the page
const ease = 'duration-300 ease-[cubic-bezier(.32,.72,0,1)] motion-reduce:transition-none';
const pushDrawer = tv({
    slots: {
        aside: 'relative h-full shrink-0',
        panel: 'h-full w-(--drawer-push-width) overflow-hidden',
        sheet: 'h-full border-bleed/8 bg-(--drawer-push-fill,var(--color-ground)) [--bleed:var(--ground-bleed)]',
        content: 'relative box-border flex h-full flex-col overflow-auto p-(--dialog-padding) outline-0 [&>:has(+[data-dialog-actions])]:mb-(--dialog-padding) *:data-dialog-actions:mt-auto',
    },
    variants: {
        reflow: {
            continuous: { aside: `flex overflow-hidden transition-[width] ${ease}`, panel: 'shrink-0' },
            once: { aside: 'transition-[width] duration-0 motion-reduce:delay-0', panel: 'pointer-events-none absolute inset-y-0', sheet: `pointer-events-auto transition-[translate] ${ease}` },
        },
        position: {
            start: { sheet: 'border-e' },
            end: { sheet: 'border-s' },
        },
        isOpen: {
            true: { aside: 'w-(--drawer-push-width)' },
            false: { aside: 'w-0' },
        },
    },
    compoundVariants: [
        { reflow: 'continuous', position: 'start', class: { aside: 'justify-end' } },
        { reflow: 'continuous', position: 'end', class: { aside: 'justify-start' } },
        { reflow: 'once', position: 'start', class: { panel: 'start-0' } },
        { reflow: 'once', position: 'end', class: { panel: 'end-0' } },
        { reflow: 'once', isOpen: true, class: { aside: 'delay-300' } },
        { reflow: 'once', position: 'start', isOpen: false, class: { sheet: '-translate-x-full rtl:translate-x-full' } },
        { reflow: 'once', position: 'end', isOpen: false, class: { sheet: 'translate-x-full rtl:-translate-x-full' } },
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
export function Drawer({ mode = 'overlay', pushFrom = 'md', reflow, ...props }) {
    const isWide = useMatches(`(min-width: ${breakpoints[pushFrom]})`);
    if (mode === 'push' && isWide)
        return _jsx(PushDrawer, { ...props, reflow: reflow });
    return _jsx(OverlayDrawer, { ...props, position: mode === 'push' ? (props.position === 'start' || props.position === 'left' ? 'start' : 'end') : props.position });
}
function OverlayDrawer({ children, 'aria-label': label, ...props }) {
    const slots = drawer();
    return (_jsxs(SheetOverlay, { ...props, className: composeClassName(props.className, 'group/drawer z-50'), children: [_jsx(SheetBackdrop, { className: slots.backdrop(), swipeAnimation: "drawer-backdrop", swipeAnimationRange: props.snapPoints ? { start: props.snapPoints.length - 1 } : undefined }), _jsx(Sheet, { overscrollPadding: true, stackAnimation: "drawer-scale-back", className: ({ position }) => drawer({ position }).panel(), children: _jsx(SheetContent, { "aria-label": label, className: slots.content(), children: children }) })] }));
}
function PushDrawer({ children, 'aria-label': label, isOpen: givenOpen, defaultOpen = false, onOpenChange, position = 'end', reflow = 'once', className }) {
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
    const slots = pushDrawer({ position: side, isOpen, reflow });
    // What it holds stays until it has slid shut, then goes, so the dialog in it takes focus afresh each time it opens.
    // What slides is the aside, or with reflow once the panel. With reduced motion there's no slide to wait for
    const aside = useRef(null);
    const sheet = useRef(null);
    const [container, setContainer] = useState(null);
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
        const slider = reflow === 'once' ? sheet.current : element;
        if (!slider)
            return setMounted(false);
        const { transitionProperty, transitionDuration } = getComputedStyle(slider);
        if (transitionProperty === 'none' || !transitionDuration || transitionDuration === '0s')
            setMounted(false);
    }, [isOpen, reflow]);
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
    return (_jsx("aside", { ref: aside, inert: !isOpen, "aria-label": label, onTransitionEnd: (event) => event.target === (reflow === 'once' ? sheet.current : event.currentTarget) && !isOpen && setMounted(false), className: slots.aside({ className: typeof className === 'string' ? className : undefined }), children: _jsx("div", { className: slots.panel(), children: _jsx("div", { ref: (element) => {
                    sheet.current = element;
                    setContainer(element);
                }, className: slots.sheet(), children: isMounted && container && (_jsx(Overlay, { portalContainer: container, disableFocusManagement: true, children: _jsx(OverlayTriggerStateContext.Provider, { value: { isOpen, setOpen, open: () => setOpen(true), close: () => setOpen(false), toggle: () => setOpen(!isOpen), point: null, setPoint: () => { } }, children: _jsx(Dialog, { "aria-label": label, className: slots.content(), children: children }) }) })) }) }) }));
}
