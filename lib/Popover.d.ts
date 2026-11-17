import type { ReactNode } from 'react';
import { type PopoverProps as AriaPopoverProps } from 'react-aria-components';
export declare const popover: import("tailwind-variants").TVReturnType<{
    isEntering: {
        true: string;
    };
    isExiting: {
        true: string;
    };
}, undefined, "rounded-(--popover-radius) bg-(--popover-fill,var(--color-overlay)) [--bleed:var(--overlay-bleed)] text-(color:--popover-text,var(--color-ink)) shadow-overlay [--shadow-overlay-color:var(--popover-shadow)] outline-0", undefined, undefined, undefined>;
export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
    /** Points back at what opened it, for a popover that isn't a list */
    showArrow?: boolean;
    children: ReactNode;
}
/** Content that floats beside what opened it, such as a DialogTrigger's button */
export declare function Popover({ showArrow, children, ...props }: PopoverProps): import("react").JSX.Element;
