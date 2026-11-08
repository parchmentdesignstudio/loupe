import type { ReactNode } from 'react';
import { type ComboBoxProps as RACComboBoxProps, type ListBoxItemProps, type ValidationResult } from 'react-aria-components';
export interface ComboBoxProps<T extends object> extends Omit<RACComboBoxProps<T>, 'children'> {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
    placeholder?: string;
    children: ReactNode | ((item: T) => ReactNode);
}
export declare function ComboBox<T extends object>({ label, description, errorMessage, placeholder, children, items, ...props }: ComboBoxProps<T>): import("react").JSX.Element;
export declare function ComboBoxItem(props: ListBoxItemProps): import("react").JSX.Element;
