import type { HTMLAttributes, ReactNode } from 'react';
export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export declare const status: import("tailwind-variants").TVReturnType<{
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
        dot: {
            base: string;
        };
        badge: {
            base: string;
            dot: string;
        };
    };
}, {
    base: string;
    dot: string;
    label: string;
    detail: string;
}, undefined, undefined, undefined, undefined>;
export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
    /** The status’s colour. It only backs up the label, so the label has to say it all */
    tone?: StatusTone;
    variant?: 'dot' | 'badge';
    /** Quieter text after the label, such as when a call is booked for. Give an overdue part text-danger */
    detail?: ReactNode;
    children: ReactNode;
}
/** Where something is up to, such as a lead that’s qualified or an invoice that’s overdue, as a coloured dot and a label */
export declare function Status({ tone, variant, detail, className, children, ...props }: StatusProps): import("react").JSX.Element;
