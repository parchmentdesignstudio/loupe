import type { ReactNode } from 'react';
import { type DialogProps, type HeadingProps, type ModalOverlayProps } from 'react-aria-components';
export { DialogTrigger } from 'react-aria-components';
export declare function Dialog(props: DialogProps): import("react").JSX.Element;
export declare function DialogHeading(props: HeadingProps): import("react").JSX.Element;
export declare function DialogFooter({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function DialogClose(): import("react").JSX.Element;
export interface ModalProps extends ModalOverlayProps {
    size?: 'small' | 'medium' | 'large';
}
export declare function Modal({ size, ...props }: ModalProps): import("react").JSX.Element;
