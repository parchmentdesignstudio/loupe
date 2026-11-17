import { type ButtonProps as AriaButtonProps, type GroupProps } from 'react-aria-components';
export declare const chip: import("tailwind-variants").TVReturnType<{
    size: {
        small: string;
        medium: string;
        large: string;
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
}, undefined, "relative inline-flex cursor-default after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-11 after:min-w-11 after:-translate-1/2 items-center bg-(--chip-fill,var(--color-raised)) text-(color:--chip-text,var(--color-ink)) shadow-raised [--shadow-raised-color:var(--chip-shadow)] transition-[scale,background-color,opacity] duration-150 ease-out motion-reduce:transition-none", {
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
export interface ChipProps extends AriaButtonProps {
    /** Small is 20px tall and medium 24px, for a value in a table or a line of text. Large, 32px, is a reply to tap */
    size?: 'small' | 'medium' | 'large';
}
export type ChipGroupProps = GroupProps;
/** A suggestion to tap, such as a reply in the chat. Several sit in a ChipGroup */
export declare function Chip({ size, ...props }: ChipProps): import("react").JSX.Element;
/** Chips that go together, under a name for screen readers: give it an aria-label, or aria-labelledby */
export declare function ChipGroup(props: ChipGroupProps): import("react").JSX.Element;
