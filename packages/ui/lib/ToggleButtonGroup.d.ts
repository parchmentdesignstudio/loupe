import { type ToggleButtonGroupProps as AriaToggleButtonGroupProps, type ToggleButtonProps } from 'react-aria-components';
export type { ToggleButtonProps };
export declare const toggleButtonGroup: import("tailwind-variants").TVReturnType<{
    orientation: {
        horizontal: string;
        vertical: string;
    };
    width: {
        hug: string;
        fill: string;
    };
    variant: {
        well: string;
        raised: string;
    };
    isDisabled: {
        false: string;
    };
}, undefined, "group/toggle isolate inline-flex w-fit gap-(--gap) rounded-lg p-(--inset) [--divider:light-dark(color-mix(in_oklab,var(--bleed)_14%,transparent),color-mix(in_oklab,white_10%,transparent))] [--chosen-tint:light-dark(color-mix(in_oklab,var(--color-pink-56)_12%,transparent),color-mix(in_oklab,var(--color-pink-70)_18%,transparent))] [--chosen-edge:light-dark(color-mix(in_oklab,var(--bleed)_16%,transparent),var(--dark-edge))] [--chosen:light-dark(var(--color-raised),var(--color-surface))] [--inset:--spacing(0.75)]", undefined, undefined, undefined>;
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
    variant: {
        well: string;
        raised: string;
    };
    hasIndicator: {
        false: string;
    };
}, undefined, "relative inline-flex cursor-default items-center justify-center gap-1.5 group-data-[width=fill]/toggle:flex-1 rounded-[calc(var(--radius-lg)-var(--inset,0px))] px-2.5 py-1 text-control font-medium text-muted [&>svg]:my-[calc((1lh-1rem)/2)] outline-offset-0 transition-[color,background-color] duration-150 ease-out group-data-[size=small]/toggle:px-2 group-data-[size=small]/toggle:py-0.5 motion-reduce:transition-none", {
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
    /** Pixels between the buttons */
    gap?: 0 | 1 | 2 | 4;
    /** A hairline between each button and the next, which goes from beside the chosen one */
    hasDividers?: boolean;
    /** Sunk into the page, with the chosen button filled, or raised from it, with the chosen one tinted. Well for one choice and raised for several, by default */
    variant?: 'well' | 'raised';
    /** As wide as its buttons, or as wide as it's given, with the buttons sharing it equally */
    width?: 'hug' | 'fill';
}
/** A segmented control: a few toggle buttons side by side. With one choice, the default, one always stays chosen, and in a well a fill slides to it */
export declare function ToggleButtonGroup({ size, selectionMode, disallowEmptySelection, gap, hasDividers, variant, width, ...props }: ToggleButtonGroupProps): import("react").JSX.Element;
/** One button in a ToggleButtonGroup, where it needs an id, or a toggle on its own */
export declare function ToggleButton(props: ToggleButtonProps): import("react").JSX.Element;
