import type { ReactNode } from 'react';
import { type RadioGroupProps as AriaRadioGroupProps, type RadioProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
/** One option in a RadioGroup, with its label as children */
export declare function Radio(props: RadioProps): import("react").JSX.Element;
export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'>, FieldTextProps {
    children?: ReactNode;
}
/** Options where only one can be chosen. Set orientation to horizontal to lay them in a row */
export declare function RadioGroup({ label, description, errorMessage, children, ...props }: RadioGroupProps): import("react").JSX.Element;
