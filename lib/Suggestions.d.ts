import { type ReactNode } from 'react';
import { type PressEvent } from 'react-aria-components';
export declare const suggestions: import("tailwind-variants").TVReturnType<{
    variant: {
        starter: string;
        'follow-up': string;
    };
}, undefined, "flex flex-col *:[animation-fill-mode:backwards] *:motion-safe:animate-fade-in *:nth-2:[animation-delay:40ms] *:nth-3:[animation-delay:80ms] *:nth-4:[animation-delay:120ms] *:nth-5:[animation-delay:160ms]", undefined, undefined, undefined>;
type Variant = 'starter' | 'follow-up';
export interface SuggestionsProps {
    /** Names the group for a screen reader, such as Suggested questions */
    'aria-label': string;
    /** Starter rows are raised, for what to ask first. Follow-ups are plain, for after a reply */
    variant?: Variant;
    children: ReactNode;
    className?: string;
}
/** Questions to ask, each a Suggestion to press: what to start with, or what to follow a reply with */
export declare function Suggestions({ variant, children, className, ...props }: SuggestionsProps): import("react").JSX.Element;
export interface SuggestionProps {
    /** The question. When it changes, a ray crosses it */
    children: string;
    onPress?: (event: PressEvent) => void;
    isDisabled?: boolean;
    className?: string;
}
/** A question in Suggestions, which asks it when pressed */
export declare function Suggestion({ children, onPress, isDisabled, className }: SuggestionProps): import("react").JSX.Element;
export {};
