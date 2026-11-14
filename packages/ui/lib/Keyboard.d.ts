import type { ComponentProps } from 'react';
import { Keyboard as AriaKeyboard } from 'react-aria-components';
export type KeyboardProps = ComponentProps<typeof AriaKeyboard>;
/** A keyboard shortcut, such as ⌘Z, in a sentence, a Tooltip, or last in a MenuItem, which it sits at the end of */
export declare function Keyboard(props: KeyboardProps): import("react").JSX.Element;
