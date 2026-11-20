import type { ReactNode } from 'react';
import { Dialog as AriaDialog, type DialogProps, Heading, type HeadingProps, Modal as AriaModal, ModalOverlay, type ModalOverlayProps, composeRenderProps } from 'react-aria-components';
import { Button } from './Button.js';
import { Cross } from './glyphs.js';
import { tv } from './tv.js';

export { DialogTrigger } from 'react-aria-components';
export type { DialogProps };

// In a popover the padding is --dialog-popover-padding, 16px, not 24px. DialogActions reads it to sit flush to the edges either way
const dialog = tv({ base: 'relative max-h-[inherit] overflow-auto rounded-[inherit] p-(--dialog-padding) outline-0 [[data-placement]>&]:[--dialog-padding:var(--dialog-popover-padding)]' });
const heading = tv({ base: 'pr-10 text-title text-balance text-ink' });

/** What a Modal or Popover holds. Give it a DialogHeading, or an aria-label */
export function Dialog(props: DialogProps) {
	return <AriaDialog {...props} className={dialog({ className: props.className })} />;
}

export function DialogHeading(props: HeadingProps) {
	return <Heading slot="title" {...props} className={heading({ className: props.className })} />;
}

/** The dialog's actions, in a footer flush to its edges. A Button with slot="close" closes it */
export interface DialogActionsProps {
	children: ReactNode;
}

export function DialogActions({ children }: DialogActionsProps) {
	// The negative margins undo the padding of the dialog or drawer it's in
	return <div data-dialog-actions className="-mx-(--dialog-padding) mt-(--dialog-padding) -mb-(--dialog-padding) flex flex-wrap justify-end gap-2 bg-(--dialog-actions-fill,var(--color-panel)) shadow-[inset_0_.5px_var(--color-scrim)] px-(--dialog-padding) py-4">{children}</div>;
}

export interface DialogCloseProps {
	/** Names the button for screen readers */
	'aria-label'?: string;
}

/** A close button for a dialog's corner */
export function DialogClose({ 'aria-label': label = 'Close' }: DialogCloseProps) {
	return (
		<Button slot="close" variant="ghost" shape="full" size="small" aria-label={label} className="absolute top-5 right-5">
			<Cross />
		</Button>
	);
}

const modal = tv({
	slots: {
		overlay: 'fixed inset-0 z-50 flex min-h-full items-center justify-center bg-(--modal-backdrop,color-mix(in_oklab,var(--color-ground)_88%,transparent)) p-4',
		panel: 'max-h-full w-full overflow-hidden rounded-(--modal-radius) bg-(--modal-fill,var(--color-overlay)) [--bleed:var(--overlay-bleed)] text-ink shadow-overlay [--shadow-overlay-color:var(--modal-shadow)]',
	},
	variants: {
		size: {
			small: { panel: 'max-w-sm' },
			medium: { panel: 'max-w-md' },
			large: { panel: 'max-w-2xl' },
		},
		isEntering: {
			true: { overlay: 'animate-fade-in', panel: 'animate-enter motion-reduce:animate-fade-in' },
		},
		isExiting: {
			true: { overlay: 'animate-fade-out', panel: 'animate-exit motion-reduce:animate-fade-out' },
		},
	},
	defaultVariants: {
		size: 'medium',
	},
});

export interface ModalProps extends ModalOverlayProps {
	size?: 'small' | 'medium' | 'large';
}

/** A dialog over the page, which it dims. isDismissable lets a click outside close it */
export function Modal({ size, ...props }: ModalProps) {
	return (
		<ModalOverlay {...props} className={composeRenderProps(props.className, (className, state) => modal({ ...state, size }).overlay({ className }))}>
			<AriaModal {...props} className={(state) => modal({ ...state, size }).panel()} />
		</ModalOverlay>
	);
}
