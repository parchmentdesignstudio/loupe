import type { ReactNode } from 'react';
import { type ComboBoxProps as AriaComboBoxProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'>, FieldTextProps {
    placeholder?: string;
    /** ListBoxItems, or a function that makes one from each of items or defaultItems */
    children: ReactNode | ((item: T) => ReactNode);
}
/** A text field that filters a list of options as you type */
export declare function ComboBox<T extends object>({ label, description, errorMessage, placeholder, children, ...props }: ComboBoxProps<T>): import("react").JSX.Element;
