import type { HTMLAttributes, ReactNode } from 'react';
import type { StatusTone } from './Status.js';
export type AlertTone = StatusTone;
export declare const alert: import("tailwind-variants").TVReturnType<{
    tone: {
        neutral: {
            base: string;
        };
        info: {
            base: string;
        };
        success: {
            base: string;
        };
        warning: {
            base: string;
        };
        danger: {
            base: string;
        };
    };
    variant: {
        alert: {
            base: string;
        };
        notice: {
            description: string;
        };
    };
    hasDismiss: {
        true: string;
    };
}, {
    base: string;
    icon: string;
    content: string;
    title: string;
    description: string;
    actions: string;
    dismiss: string;
}, undefined, undefined, undefined, undefined>;
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** The alert’s colour and icon. They only back up the words, so the title or text has to say it’s a warning */
    tone?: AlertTone;
    /** An alert, tinted to draw the eye, or a notice, a quieter line in the flow */
    variant?: 'alert' | 'notice';
    /** A line in medium above the text. It isn’t a heading, so it sits in a form or a card under their own */
    title?: ReactNode;
    /** In place of the tone’s icon, or null for none */
    icon?: ReactNode;
    /** Buttons or links under the text, such as small secondary buttons */
    actions?: ReactNode;
    /** Shows a button that closes it, and calls back when it’s pressed. Take the alert away then, and move focus on */
    onDismiss?: () => void;
    /** The dismiss button’s name, read out in place of “Dismiss” */
    dismissLabel?: string;
    children?: ReactNode;
}
/**
 * Something to know about a page or a part of it: a tinted alert to draw the eye, or a quieter notice. It's on the page
 * when it loads, so it isn't announced. One that appears after something happens, such as a failed save, wants
 * role="alert" if it can't wait, or role="status" if it can, on an element that's already there before its text
 * changes, or a toast
 */
export declare function Alert({ tone, variant, title, icon, actions, onDismiss, dismissLabel, className, children, ...props }: AlertProps): import("react").JSX.Element;
