import type { ReactNode } from 'react';
import { Dialog as AriaDialog, type DialogProps, Heading, type HeadingProps, Modal as AriaModal, ModalOverlay, type ModalOverlayProps, composeRenderProps } from 'react-aria-components';
import { Button } from './Button.js';
import { Cross } from './glyphs.js';
import { tv } from './tv.js';

export { DialogTrigger } from 'react-aria-components';

const dialog = tv({ base: 'relative max-h-[inherit] overflow-auto p-6 outline-0 [[data-placement]>&]:p-4' });
const heading = tv({ base: 'pr-10 text-title font-medium text-balance text-ink' });

/** What a Modal or Popover holds. Give it a DialogHeading, or an aria-label */
export function Dialog(props: DialogProps) {
	return <AriaDialog {...props} className={dialog({ className: props.className })} />;
}

export function DialogHeading(props: HeadingProps) {
	return <Heading slot="title" {...props} className={heading({ className: props.className })} />;
}

/** The dialog's actions, in a footer flush to its edges. A Button with slot="close" closes it */
export function DialogActions({ children }: { children: ReactNode }) {
	// The negative margins undo the dialog's 24px padding
	return <div className="-mx-6 mt-6 -mb-6 flex flex-wrap justify-end gap-2 bg-ground px-6 py-4">{children}</div>;
}

/** A close button for a dialog's corner */
export function DialogClose({ label = 'Close' }: { label?: string }) {
	return (
		<Button slot="close" variant="quiet" shape="circle" size="small" aria-label={label} className="absolute top-5 right-5">
			<Cross />
		</Button>
	);
}

const modal = tv({
	slots: {
		overlay: 'fixed inset-0 z-50 flex min-h-full items-center justify-center bg-ground/88 p-4',
		panel: 'max-h-full w-full overflow-hidden rounded-3xl bg-overlay [--bleed:var(--overlay-bleed)] text-ink shadow-overlay',
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
