import { type PopoverProps as RACPopoverProps } from 'react-aria-components';
export interface PopoverProps extends Omit<RACPopoverProps, 'children'> {
    showArrow?: boolean;
    children: React.ReactNode;
}
export declare const popover: import("tailwind-variants").TVReturnType<{
    isEntering: {
        true: string;
    };
    isExiting: {
        true: string;
    };
}, undefined, "rounded-lg border border-line bg-raised text-ink bg-clip-padding shadow-lg shadow-ink/10 outline-0", undefined, undefined, undefined>;
export declare function Popover({ children, showArrow, className, ...props }: PopoverProps): import("react").JSX.Element;
