import { type ButtonProps as AriaButtonProps, type GroupProps } from 'react-aria-components';
export declare const chip: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isPressed: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "inline-flex cursor-default items-center rounded-lg bg-raised px-3 py-1.5 text-control text-ink shadow-raised transition-[scale,background-color,opacity] duration-150 ease-out motion-reduce:transition-none", {
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
export type ChipProps = AriaButtonProps;
/** A suggestion to tap, such as a reply in the chat. Several sit in a ChipGroup */
export declare function Chip(props: ChipProps): import("react").JSX.Element;
/** Chips that go together, under a name for screen readers: give it an aria-label, or aria-labelledby */
export declare function ChipGroup(props: GroupProps): import("react").JSX.Element;
