import { type ReactNode } from 'react';
export interface ComposerProps {
    /** Names the field for screen readers, as it has no visible label */
    label: string;
    placeholder?: string;
    /** Names the send button */
    submitLabel?: string;
    /** The send button's icon, such as arrow-up from @parchment/icons */
    submitIcon: ReactNode;
    /** Gets the message, trimmed. The field then clears */
    onSubmit: (message: string) => void;
    isDisabled?: boolean;
    className?: string;
}
/** A message field with its send button, as in the chat. Enter sends, and an empty message can't be sent */
export declare function Composer({ label, placeholder, submitLabel, submitIcon, onSubmit, isDisabled, className }: ComposerProps): import("react").JSX.Element;
