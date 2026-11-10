import { type NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export interface NumberFieldProps extends AriaNumberFieldProps, FieldTextProps {
    placeholder?: string;
}
/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export declare function NumberField({ label, description, errorMessage, placeholder, ...props }: NumberFieldProps): import("react").JSX.Element;
