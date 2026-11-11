import type { ReactNode } from 'react';
export declare const emptyState: import("tailwind-variants").TVReturnType<{}, {
    base: string;
    icon: string;
    text: string;
    title: string;
    description: string;
    actions: string;
}, undefined, undefined, undefined, undefined>;
export interface EmptyStateProps {
    /** An icon for what will be here, shown on a tile above the title */
    icon?: ReactNode;
    /** What's missing, as in “No blocks yet” */
    title: ReactNode;
    /** What will be here, or how to add the first one */
    children?: ReactNode;
    /** Buttons or links for the first step */
    actions?: ReactNode;
    className?: string;
}
/** Where there's nothing to show yet: what will be here, and the first step to fill it. The title isn't a heading, so it fits in a list or under a page's own */
export declare function EmptyState({ icon, title, children, actions, className }: EmptyStateProps): import("react").JSX.Element;
