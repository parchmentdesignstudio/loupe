import { type SearchFieldProps as AriaSearchFieldProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export interface SearchFieldProps extends AriaSearchFieldProps, FieldTextProps {
    placeholder?: string;
}
/** A field to search with, and a button that clears it. Escape clears it too, and Enter calls onSubmit */
export declare function SearchField({ label, description, errorMessage, placeholder, ...props }: SearchFieldProps): import("react").JSX.Element;
