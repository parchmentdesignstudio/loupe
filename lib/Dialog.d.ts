import type { ReactNode } from 'react';
import { type DialogProps, type HeadingProps, type ModalOverlayProps } from 'react-aria-components';
export { DialogTrigger } from 'react-aria-components';
export type { DialogProps };
/** What a Modal or Popover holds. Give it a DialogHeading, or an aria-label */
export declare function Dialog(props: DialogProps): import("react").JSX.Element;
export declare function DialogHeading(props: HeadingProps): import("react").JSX.Element;
/** The dialog's actions, in a footer flush to its edges. A Button with slot="close" closes it */
export interface DialogActionsProps {
    children: ReactNode;
}
export declare function DialogActions({ children }: DialogActionsProps): import("react").JSX.Element;
export interface DialogCloseProps {
    /** Names the button for screen readers */
    'aria-label'?: string;
}
/** A close button for a dialog's corner */
export declare function DialogClose({ 'aria-label': label }: DialogCloseProps): import("react").JSX.Element;
export interface ModalProps extends ModalOverlayProps {
    size?: 'small' | 'medium' | 'large';
}
/** A dialog over the page, which it dims. isDismissable lets a click outside close it */
export declare function Modal({ size, ...props }: ModalProps): import("react").JSX.Element;
