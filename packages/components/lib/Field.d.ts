import { type FieldErrorProps, type GroupProps, type InputProps, type LabelProps, type TextProps } from 'react-aria-components';
export declare function Label(props: LabelProps): import("react").JSX.Element;
export declare function Description(props: TextProps): import("react").JSX.Element;
export declare function FieldError(props: FieldErrorProps): import("react").JSX.Element;
export declare const fieldBorder: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isFocused: {
        true: string;
    };
    isFocusWithin: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "border border-line", undefined, undefined, undefined>;
export declare const fieldGroup: import("tailwind-variants").TVReturnType<{}, undefined, "group flex h-10 items-center overflow-hidden rounded-md bg-raised", {
    isDisabled: {
        true: string;
    };
    isFocusVisible: {
        false: string;
        true: string;
    };
    isFocusWithin: {
        true: string;
    };
    isFocused: {
        true: string;
    };
    isHovered: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
}, undefined, [import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline outline-offset-2 outline-accent", undefined, undefined, undefined>, import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isFocused: {
        true: string;
    };
    isFocusWithin: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "border border-line", undefined, undefined, undefined>]>;
export declare const textInput: import("tailwind-variants").TVReturnType<{}, undefined, "min-w-0 rounded-md bg-raised px-3 py-2 text-sm text-ink placeholder:text-muted disabled:text-disabled", {
    isDisabled: {
        true: string;
    };
    isFocusVisible: {
        false: string;
        true: string;
    };
    isFocusWithin: {
        true: string;
    };
    isFocused: {
        true: string;
    };
    isHovered: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
}, undefined, [import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline outline-offset-2 outline-accent", undefined, undefined, undefined>, import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isFocused: {
        true: string;
    };
    isFocusWithin: {
        true: string;
    };
    isInvalid: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "border border-line", undefined, undefined, undefined>]>;
export declare function FieldGroup(props: GroupProps): import("react").JSX.Element;
export declare function Input(props: InputProps): import("react").JSX.Element;
export declare const fieldLayout = "group flex flex-col gap-1.5";
