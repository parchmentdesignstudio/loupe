import type { ReactNode } from 'react';
import { type SelectProps as RACSelectProps, type ListBoxItemProps, type ValidationResult } from 'react-aria-components';
export interface SelectProps<T extends object> extends Omit<RACSelectProps<T>, 'children'> {
    label?: ReactNode;
    description?: ReactNode;
    errorMessage?: string | ((validation: ValidationResult) => string);
    items?: Iterable<T>;
    children: ReactNode | ((item: T) => ReactNode);
}
export declare function Select<T extends object>({ label, description, errorMessage, items, children, ...props }: SelectProps<T>): import("react").JSX.Element;
export declare function SelectItem(props: ListBoxItemProps): import("react").JSX.Element;
