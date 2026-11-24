import type { ReactNode } from 'react';
export declare const card: import("tailwind-variants").TVReturnType<{
    hasFigure: {
        true: {
            header: string;
        };
    };
    fill: {
        raised: {
            base: string;
        };
        quiet: {
            base: string;
        };
    };
}, {
    base: string;
    header: string;
    lead: string;
    title: string;
    figure: string;
    description: string;
    body: string;
    actions: string;
}, undefined, undefined, undefined, undefined>;
type Level = 2 | 3 | 4 | 5 | 6;
export interface CardProps {
    /** What it is, as in “Team” or “Revenue”. A heading, at headingLevel */
    title?: ReactNode;
    /** The heading's level, 3 unless the page needs another */
    headingLevel?: Level;
    /** A figure that leads, such as £18,430, grouped with the title as its value */
    figure?: ReactNode;
    /** A line under the title, or with a figure, under that, such as Up 12% on last week */
    description?: ReactNode;
    /** What it holds, such as a figure, a List or a form */
    children?: ReactNode;
    /** Buttons, at the foot, sharing its width */
    actions?: ReactNode;
    /** raised (the default) stands off the page; quiet is for cards inside something raised */
    fill?: 'raised' | 'quiet';
    className?: string;
}
/**
 * A panel that groups one thing among others like it, such as a plan, a stat or a project. Its buttons sit at the foot,
 * so a row of cards lines them up. A section on its own isn't a card, and a Table never goes in one
 */
export declare function Card({ title, headingLevel, figure, description, children, actions, fill, className }: CardProps): import("react").JSX.Element;
export {};
