import type { ReactNode } from 'react';
import { type PopoverProps as AriaPopoverProps } from 'react-aria-components';
export declare const popover: import("tailwind-variants").TVReturnType<{
    isEntering: {
        true: string;
    };
    isExiting: {
        true: string;
    };
}, undefined, "rounded-2xl bg-paper text-ink shadow-overlay outline-0", undefined, undefined, undefined>;
export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
    /** Points back at what opened it, for a popover that isn't a list */
    showArrow?: boolean;
    children: ReactNode;
}
/** Content that floats beside what opened it, such as a DialogTrigger's button */
export declare function Popover({ showArrow, children, ...props }: PopoverProps): import("react").JSX.Element;
