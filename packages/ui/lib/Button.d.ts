import type { ReactNode } from 'react';
import { type ButtonProps as AriaButtonProps } from 'react-aria-components';
import type { VariantProps } from 'tailwind-variants';
export declare const button: import("tailwind-variants").TVReturnType<{
    variant: {
        primary: string[];
        secondary: string[];
        tertiary: string;
        outline: string;
        quiet: string;
    };
    shape: {
        circle: string;
    };
    size: {
        medium: string;
        small: string;
    };
    hasStart: {
        true: string;
    };
    hasEnd: {
        true: string;
    };
    isHovered: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, string[], {
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
export interface ButtonProps extends AriaButtonProps, Pick<VariantProps<typeof button>, 'variant' | 'shape' | 'size'> {
    /** An icon before the label, on the left in a left-to-right language */
    start?: ReactNode;
    /** An icon after the label, on the right in a left-to-right language */
    end?: ReactNode;
}
/** A button for any action, with an icon at the start or end if it helps. A circle holds just an icon, so it needs an aria-label */
export declare function Button({ variant, shape, size, start, end, ...props }: ButtonProps): import("react").JSX.Element;
