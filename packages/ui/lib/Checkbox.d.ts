import type { ReactNode } from 'react';
import { type CheckboxGroupProps as AriaCheckboxGroupProps, type CheckboxProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export declare const choice: import("tailwind-variants").TVReturnType<{
    isDisabled: {
        true: string;
    };
}, undefined, "group relative flex cursor-default items-start gap-3 py-1 text-control text-ink [-webkit-tap-highlight-color:transparent]", undefined, undefined, undefined>;
export declare const box: import("tailwind-variants").TVReturnType<{
    isSelected: {
        false: string;
        true: string;
    };
    isHovered: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
}, undefined, "my-[calc((1lh-1.25rem)/2)] flex size-5 shrink-0 items-center justify-center rounded-md transition-[scale,background-color] duration-150 ease-out motion-reduce:transition-none", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight]", undefined, undefined, undefined>>;
/** A checkbox with its label as children. isIndeterminate shows a dash, for a parent of others that are mixed */
export declare function Checkbox(props: CheckboxProps): import("react").JSX.Element;
export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children'>, FieldTextProps {
    children?: ReactNode;
}
/** Checkboxes under one label, sent as one field */
export declare function CheckboxGroup({ label, description, errorMessage, children, ...props }: CheckboxGroupProps): import("react").JSX.Element;
