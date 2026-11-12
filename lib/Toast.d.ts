import { type ReactElement, type ReactNode } from 'react';
import { type QueuedToast, type ToastOptions, UNSTABLE_ToastQueue as AriaToastQueue, type ToastProps as AriaToastProps, type ToastRegionProps as AriaToastRegionProps } from 'react-aria-components';
/** What a toast says: a title, and a line under it if it needs one */
export interface ToastMessage {
    title: ReactNode;
    description?: ReactNode;
    /** A button beside the message, such as Undo, which closes the toast once pressed */
    action?: {
        label: ReactNode;
        onAction: () => void;
    };
}
type ToastQueueOptions = NonNullable<ConstructorParameters<typeof AriaToastQueue>[0]>;
/**
 * The toasts waiting to show. Make one for the app, render a ToastRegion with it, and add to it from anywhere.
 * A toast closes itself after 5 seconds, the shortest React Aria advises, or longer with a timeout. Give one with an
 * action timeout: 0, so it stays until it's closed. Three show at a time, unless maxVisibleToasts says otherwise
 */
export declare class ToastQueue<T = ToastMessage> extends AriaToastQueue<T> {
    #private;
    constructor(options?: ToastQueueOptions);
    add(content: T, options?: ToastOptions): string;
    close(key: string): void;
    /** Whether a toast is on its way out, which its Toast animates */
    isExiting(key: string): boolean;
    /** Calls back as a toast starts on its way out */
    subscribeToExits: (listener: () => void) => () => void;
}
export interface ToastProps<T> extends Omit<AriaToastProps<T>, 'children'> {
    /** What the toast says, in place of its ToastMessage's title and description */
    children?: ReactNode;
}
/** One toast, on ink, with a button that closes it. It shows its ToastMessage, or its children */
export declare function Toast<T>({ children, ...props }: ToastProps<T>): import("react").JSX.Element;
export interface ToastRegionProps<T> extends Omit<AriaToastRegionProps<T>, 'children'> {
    /** Makes each toast from its queued toast. Without it, each shows its ToastMessage */
    children?: (renderProps: {
        toast: QueuedToast<T>;
    }) => ReactElement;
}
/** Where a queue's toasts show: the bottom of the screen, newest lowest, above everything. Render one for the app */
export declare function ToastRegion<T>({ children, ...props }: ToastRegionProps<T>): import("react").JSX.Element;
export {};
