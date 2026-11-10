import { type ToggleButtonGroupProps as AriaToggleButtonGroupProps, type ToggleButtonProps } from 'react-aria-components';
export type { ToggleButtonProps };
export declare const toggleButtonGroup: import("tailwind-variants").TVReturnType<{
    orientation: {
        horizontal: string;
        vertical: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "group/toggle inline-flex w-fit rounded-lg bg-bleed/8 p-(--inset) [--inset:--spacing(0.5)]", undefined, undefined, undefined>;
export declare const toggleButton: import("tailwind-variants").TVReturnType<{
    isSelected: {
        true: string;
    };
    isHovered: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
    isInGroup: {
        false: string;
    };
    hasIndicator: {
        false: string;
    };
}, undefined, "relative isolate inline-flex cursor-default items-center justify-center gap-1.5 rounded-[calc(var(--radius-lg)-var(--inset,0px))] px-2.5 py-1 text-control font-medium text-muted [&>svg]:my-[calc((1lh-1rem)/2)] outline-offset-0 transition-[color,background-color] duration-150 ease-out group-data-[size=small]/toggle:px-2 group-data-[size=small]/toggle:py-0.5 motion-reduce:transition-none", {
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
export interface ToggleButtonGroupProps extends AriaToggleButtonGroupProps {
    /** 32px tall, or 28px when small, like a button */
    size?: 'medium' | 'small';
}
/** A segmented control: a few toggle buttons side by side. With one choice, the default, a fill slides to it and one always stays chosen */
export declare function ToggleButtonGroup({ size, selectionMode, disallowEmptySelection, ...props }: ToggleButtonGroupProps): import("react").JSX.Element;
/** One button in a ToggleButtonGroup, where it needs an id, or a toggle on its own */
export declare function ToggleButton(props: ToggleButtonProps): import("react").JSX.Element;
