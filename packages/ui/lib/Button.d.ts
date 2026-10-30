import { type ButtonProps as AriaButtonProps } from 'react-aria-components';
import type { VariantProps } from 'tailwind-variants';
export declare const button: import("tailwind-variants").TVReturnType<{
    variant: {
        solid: string;
        plain: string;
        quiet: string;
    };
    shape: {
        pill: string;
        circle: string;
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
}, undefined, "inline-flex shrink-0 cursor-default items-center justify-center gap-2 rounded-full leading-none font-medium transition-[scale,background-color,opacity] duration-150 ease-out motion-reduce:transition-none", {
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
}
/** A button for any action. A circle holds just an icon, so it needs an aria-label */
export declare function Button({ variant, shape, size, ...props }: ButtonProps): import("react").JSX.Element;
