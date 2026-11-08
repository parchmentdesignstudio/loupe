import type { ReactNode } from 'react';
import { type DialogProps, type HeadingProps, type ModalOverlayProps } from 'react-aria-components';
export { DialogTrigger } from 'react-aria-components';
/** What a Modal or Popover holds. Give it a DialogHeading, or an aria-label */
export declare function Dialog(props: DialogProps): import("react").JSX.Element;
export declare function DialogHeading(props: HeadingProps): import("react").JSX.Element;
/** The dialog's actions, at its foot. A Button with slot="close" closes it */
export declare function DialogActions({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
/** A close button for a dialog's corner */
export declare function DialogClose({ label }: {
    label?: string;
}): import("react").JSX.Element;
export interface ModalProps extends ModalOverlayProps {
    size?: 'small' | 'medium' | 'large';
}
/** A dialog over the page, which it dims. isDismissable lets a click outside close it */
export declare function Modal({ size, ...props }: ModalProps): import("react").JSX.Element;
