import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sheet as AriaSheet, SheetBackdrop, SheetContent, SheetOverlay } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';
export { SheetTrigger } from 'react-aria-components';
// React Aria moves a sheet by scrolling. The backdrop’s fade and the step back of a sheet under another
// are keyframes in tokens.css, which it plays in time with the swipe. Overscroll padding sits outside
// the sheet’s size, hence box-content
const sheet = tv({
    slots: {
        backdrop: 'data-[stack-index=0]:bg-scrim',
        panel: 'z-1 box-content overflow-clip rounded-3xl bg-overlay [--bleed:var(--overlay-bleed)] text-ink shadow-overlay outline-0 will-change-transform transform-[perspective(1000px)] forced-colors:bg-[Canvas]',
        content: 'relative box-border h-full overflow-hidden p-6 pb-[calc(--spacing(6)_+_var(--sheet-scroll-padding-y))] outline-0 group-data-expanded/sheet:overflow-auto',
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
/** A panel that slides in from an edge of the screen and swipes back out, opened by the Button beside it in a SheetTrigger */
export function Sheet({ children, 'aria-label': label, ...props }) {
    const slots = sheet();
    return (_jsxs(SheetOverlay, { ...props, className: composeClassName(props.className, 'group/sheet z-50'), children: [_jsx(SheetBackdrop, { className: slots.backdrop(), swipeAnimation: "sheet-backdrop", swipeAnimationRange: props.snapPoints ? { start: props.snapPoints.length - 1 } : undefined }), _jsx(AriaSheet, { overscrollPadding: true, stackAnimation: "sheet-scale-back", className: ({ position }) => sheet({ position }).panel(), children: _jsx(SheetContent, { "aria-label": label, className: slots.content(), children: children }) })] }));
}
