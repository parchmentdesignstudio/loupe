import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { Button, Text, UNSTABLE_Toast as AriaToast, UNSTABLE_ToastContent as ToastContent, UNSTABLE_ToastQueue as AriaToastQueue, UNSTABLE_ToastRegion as AriaToastRegion, composeRenderProps, } from 'react-aria-components';
import { Cross } from './glyphs.js';
import { composeClassName, focusRing, tv } from './tv.js';
// As long as animate-toast-out in tokens.css
const exitDuration = 150;
/**
 * The toasts waiting to show. Make one for the app, render a ToastRegion with it, and add to it from anywhere.
 * A toast closes itself after 5 seconds, the shortest React Aria advises, or longer with a timeout. Give one with an
 * action timeout: 0, so it stays until it's closed. Three show at a time, unless maxVisibleToasts says otherwise
 */
export class ToastQueue extends AriaToastQueue {
    // React Aria takes a closed toast out at once, so it stays a moment to animate away. A view transition could
    // animate it, but the page takes no clicks while one runs, and a toast can close itself in the middle of one
    #exiting = new Set();
    #listeners = new Set();
    constructor(options) {
        super({ maxVisibleToasts: 3, ...options });
    }
    add(content, options = {}) {
        const { timeout = 5000 } = options;
        return super.add(content, { ...options, timeout: timeout > 0 ? Math.max(timeout, 5000) : undefined });
    }
    close(key) {
        if (this.#exiting.has(key))
            return;
        if (!this.visibleToasts.some((toast) => toast.key === key))
            return super.close(key);
        this.#exiting.add(key);
        this.#notify();
        setTimeout(() => {
            this.#exiting.delete(key);
            super.close(key);
        }, exitDuration);
    }
    /** Whether a toast is on its way out, which its Toast animates */
    isExiting(key) {
        return this.#exiting.has(key);
    }
    /** Calls back as a toast starts on its way out */
    subscribeToExits = (listener) => {
        this.#listeners.add(listener);
        return () => {
            this.#listeners.delete(listener);
        };
    };
    #notify() {
        for (const listener of this.#listeners)
            listener();
    }
}
// The region's queue, so each toast knows when it's on its way out
const QueueContext = createContext(null);
const noExits = () => () => { };
// Toasts coming and going move the others, so each slides from where it showed to where it now sits
function useSlide(ref) {
    const last = useRef(undefined);
    const slide = useRef(undefined);
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        const shownBy = Number.parseFloat(getComputedStyle(element).translate.split(' ')[1] ?? '') || 0;
        const top = element.getBoundingClientRect().top - shownBy;
        const before = last.current;
        last.current = top;
        if (before === undefined || Math.abs(before - top) < 0.5 || matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        slide.current?.cancel();
        slide.current = element.animate([{ translate: `0 ${before + shownBy - top}px` }, { translate: '0 0' }], { duration: 200, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' });
    });
}
// On ink, so its tints are paper
const surface = tv({
    extend: focusRing,
    base: 'flex w-[min(22rem,calc(100vw-2rem))] animate-toast-in items-start gap-3 rounded-lg bg-inverse py-3 pr-2 pl-4 text-paper shadow-overlay [--bleed:var(--inverse-bleed)] motion-reduce:animate-fade-in',
    variants: {
        isExiting: {
            true: 'pointer-events-none animate-toast-out motion-reduce:animate-fade-out',
        },
    },
});
const close = tv({
    extend: focusRing,
    base: '-my-0.5 flex shrink-0 cursor-default items-center justify-center rounded-full p-1 text-paper/70 outline-paper transition-[background-color,color] duration-150 ease-out motion-reduce:transition-none',
    variants: {
        isHovered: {
            true: 'bg-bleed/12 text-paper',
        },
        isPressed: {
            true: 'bg-bleed/16 text-paper',
        },
    },
});
/** One toast, on ink, with a button that closes it. It shows its ToastMessage, or its children */
export function Toast({ children, ...props }) {
    const { key, content } = props.toast;
    const queue = useContext(QueueContext);
    const isExiting = useSyncExternalStore(queue?.subscribeToExits ?? noExits, () => queue?.isExiting(key) ?? false, () => false);
    const ref = useRef(null);
    useSlide(ref);
    const { title, description } = content;
    return (_jsxs(AriaToast, { ...props, ref: ref, "data-exiting": isExiting || undefined, className: composeRenderProps(props.className, (className, state) => surface({ ...state, isExiting, className })), children: [_jsx(ToastContent, { className: "flex min-w-0 flex-1 flex-col gap-0.5", children: children ?? (_jsxs(_Fragment, { children: [_jsx(Text, { slot: "title", className: "text-body font-medium", children: title }), description && (_jsx(Text, { slot: "description", className: "text-label text-paper/70", children: description }))] })) }), _jsx(Button, { slot: "close", className: (state) => close(state), children: _jsx(Cross, {}) })] }));
}
const region = 'fixed bottom-[max(--spacing(4),env(safe-area-inset-bottom,0px))] left-1/2 z-60 flex -translate-x-1/2 flex-col-reverse items-center gap-2 rounded-lg outline-offset-4 outline-ink data-[focus-visible]:outline-2';
/** Where a queue's toasts show: the bottom of the screen, newest lowest, above everything. Render one for the app */
export function ToastRegion({ children = (item) => _jsx(Toast, { toast: item.toast }), ...props }) {
    return (_jsx(QueueContext.Provider, { value: props.queue instanceof ToastQueue ? props.queue : null, children: _jsx(AriaToastRegion, { ...props, className: composeClassName(props.className, region), children: children }) }));
}
