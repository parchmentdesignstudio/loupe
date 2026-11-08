import { type ButtonProps as RACButtonProps } from 'react-aria-components';
export interface ButtonProps extends RACButtonProps {
    variant?: 'primary' | 'secondary' | 'quiet' | 'critical';
    size?: 'small' | 'medium';
}
export declare const button: import("tailwind-variants").TVReturnType<{
    variant: {
        primary: string;
        secondary: string;
        quiet: string;
        critical: string;
    };
    size: {
        small: string;
        medium: string;
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
}, undefined, "relative inline-flex items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap transition-colors cursor-default [-webkit-tap-highlight-color:transparent]", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline outline-offset-2 outline-accent", undefined, undefined, undefined>>;
export declare function Button({ variant, size, ...props }: ButtonProps): import("react").JSX.Element;
