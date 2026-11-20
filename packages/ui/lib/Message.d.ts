import type { ReactNode } from 'react';
export declare const message: import("tailwind-variants").TVReturnType<{
    from: {
        user: string;
        assistant: string;
    };
}, undefined, "motion-reduce:transition-none", undefined, undefined, undefined>;
export declare const messageList: import("tailwind-variants").TVReturnType<{}, undefined, "flex flex-col gap-(--message-list-gap)", undefined, undefined, undefined>;
export interface MessageProps {
    /** Who it's from. A person's message sits in a bubble at the end of the row, a reply is plain text across it */
    from: 'user' | 'assistant';
    children: ReactNode;
    className?: string;
}
/** One message in a conversation, from a person or the reply to them */
export declare function Message({ from, children, className }: MessageProps): import("react").JSX.Element;
export interface MessageListProps {
    /** Names the conversation for a screen reader */
    'aria-label'?: string;
    children: ReactNode;
    className?: string;
}
/**
 * The messages, oldest first. It's a log, so a screen reader reads out each one as it arrives, without moving to it
 */
export declare function MessageList({ children, className, ...props }: MessageListProps): import("react").JSX.Element;
