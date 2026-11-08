import { jsx as _jsx } from "react/jsx-runtime";
import { Icon } from '@parchment/icons/react';
import { Button as RACButton, Dialog as RACDialog, Heading, ModalOverlay, Modal as RACModal, composeRenderProps, } from 'react-aria-components';
import { cn, tv } from 'tailwind-variants';
export { DialogTrigger } from 'react-aria-components';
export function Dialog(props) {
    return _jsx(RACDialog, { ...props, className: cn('relative max-h-[inherit] overflow-auto p-6 outline-0 [[data-placement]>&]:p-4', props.className) });
}
export function DialogHeading(props) {
    return _jsx(Heading, { slot: "title", ...props, className: cn('pr-8 text-lg font-semibold text-ink text-balance', props.className) });
}
export function DialogFooter({ children }) {
    return _jsx("div", { className: "mt-6 flex flex-wrap justify-end gap-2", children: children });
}
// A close button for the corner of a dialog.
export function DialogClose() {
    return (_jsx(RACButton, { slot: "close", "aria-label": "Close", className: "absolute top-4 right-4 flex size-8 items-center justify-center rounded-md text-muted outline-0 data-[hovered]:bg-surface data-[hovered]:text-ink data-[focus-visible]:outline-2 data-[focus-visible]:outline-accent", children: _jsx(Icon, { name: "xmark", className: "size-4" }) }));
}
const overlay = tv({
    base: 'fixed inset-0 z-50 flex min-h-full items-center justify-center bg-backdrop p-4 text-center',
    variants: {
        isEntering: { true: 'animate-pc-fade-in' },
        isExiting: { true: 'animate-pc-fade-out' },
    },
});
const modal = tv({
    base: 'w-full max-w-md max-h-full overflow-hidden rounded-xl border border-line bg-raised text-left align-middle text-ink shadow-2xl shadow-ink/20 bg-clip-padding',
    variants: {
        size: {
            small: 'max-w-sm',
            medium: 'max-w-md',
            large: 'max-w-2xl',
        },
        isEntering: { true: 'animate-pc-in motion-reduce:animate-pc-fade-in' },
        isExiting: { true: 'animate-pc-out motion-reduce:animate-pc-fade-out' },
    },
    defaultVariants: { size: 'medium' },
});
export function Modal({ size, ...props }) {
    return (_jsx(ModalOverlay, { ...props, className: composeRenderProps(props.className, (className, renderProps) => overlay({ ...renderProps, className })), children: _jsx(RACModal, { ...props, className: (renderProps) => modal({ ...renderProps, size }) }) }));
}
