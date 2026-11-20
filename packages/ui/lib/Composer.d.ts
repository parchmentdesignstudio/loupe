import { type ReactNode } from 'react';
export interface ComposerProps {
    /** Names the field for screen readers, as it has no visible label */
    'aria-label': string;
    placeholder?: string;
    /** Names the send button */
    submitLabel?: string;
    /** The send button's icon, such as arrow-up from @parchment/icons */
    submitIcon: ReactNode;
    /** Gets the message, trimmed. The field then clears, unless its value is controlled, when that's up to you */
    onSubmit: (message: string) => void;
    /** The message, to control it, such as a draft kept elsewhere */
    value?: string;
    /** The message it starts with */
    defaultValue?: string;
    onChange?: (message: string) => void;
    /** What the message is about, such as Chips for a page or a file it's attached to, in a row above the text */
    context?: ReactNode;
    /** A hint for screen readers, read out with the field's name, such as how to send */
    description?: string;
    /** The most characters it takes */
    maxLength?: number;
    isDisabled?: boolean;
    className?: string;
}
/** A message field with its send button, as in the chat. Enter sends, Shift-Enter starts a new line, and an empty message can't be sent */
export declare function Composer({ 'aria-label': label, placeholder, submitLabel, submitIcon, onSubmit, value, defaultValue, onChange, context, description, maxLength, isDisabled, className }: ComposerProps): import("react").JSX.Element;
