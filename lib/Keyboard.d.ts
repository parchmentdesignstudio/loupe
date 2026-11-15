import { type ComponentProps } from 'react';
import { Keyboard as AriaKeyboard } from 'react-aria-components';
export interface KeyboardProps extends ComponentProps<typeof AriaKeyboard> {
    /** A key, raised off the text around it, or plain text in a quieter tone, as it is in a Tooltip */
    variant?: 'raised' | 'plain';
}
export declare const KeyboardVariantContext: import("react").Context<NonNullable<"plain" | "raised" | undefined>>;
/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export declare function Keyboard({ variant, ...props }: KeyboardProps): import("react").JSX.Element;
