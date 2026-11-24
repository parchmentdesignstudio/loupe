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
    /** Controls for how it's sent, such as a Menu to pick who answers, in a row under the field, at its end */
    actions?: ReactNode;
    /** A hint for screen readers, read out with the field's name, such as how to send */
    description?: string;
    /** The most characters it takes */
    maxLength?: number;
    isDisabled?: boolean;
    className?: string;
}
/**
 * A message field with its send button, as in the chat. Enter sends, Shift-Enter starts a new line. The button is
 * always live: an empty message isn't sent, and the field says so by taking focus with a shake
 */
export declare function Composer({ 'aria-label': label, placeholder, submitLabel, submitIcon, onSubmit, value, defaultValue, onChange, context, actions, description, maxLength, isDisabled, className }: ComposerProps): import("react").JSX.Element;
