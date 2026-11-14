import type { ReactNode } from 'react';
import { type ButtonProps as AriaButtonProps } from 'react-aria-components';
import type { VariantProps } from 'tailwind-variants';
export declare const button: import("tailwind-variants").TVReturnType<{
    variant: {
        primary: string[];
        secondary: string;
        accent: string[];
        danger: string[];
        outline: string;
        ghost: string;
    };
    shape: {
        rounded: string;
        full: string;
    };
    size: {
        medium: string;
        small: string;
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
    /** Shows a spinner in place of the label while what it started is under way, such as a save. It can still be focused, but
     * not pressed, and a screen reader hears it’s busy */
    isPending?: boolean;
}
/**
 * A button for any action, with an icon at the start or end if it helps. With just an icon as its child it's square, or
 * a circle when its shape is full, and needs an aria-label. isPending spins while its action runs
 */
export declare function Button({ variant, shape, size, start, end, ...props }: ButtonProps): import("react").JSX.Element;
