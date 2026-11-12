import type { ReactNode } from 'react';
import { type MeterProps as AriaMeterProps, type ProgressBarProps as AriaProgressBarProps } from 'react-aria-components';
export declare const progressBar: import("tailwind-variants").TVReturnType<{
    hasLabel: {
        true: {
            track: string;
        };
        false: {
            value: string;
        };
    };
    isIndeterminate: {
        true: {
            track: string;
            fill: string;
        };
    };
}, {
    base: string;
    label: string;
    value: string;
    track: string;
    fill: string;
}, undefined, undefined, undefined, undefined>;
interface BarProps {
    /** Shown above the bar. Without one, give it an aria-label, and its value follows the bar on the same line */
    label?: ReactNode;
}
export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'children'>, BarProps {
}
/**
 * How far along something is, such as an upload, as a percentage or a valueLabel of your own, such as “3 of 8 files”.
 * When there’s no telling how long it’ll take, isIndeterminate slides a fill across instead
 */
export declare function ProgressBar({ label, ...props }: ProgressBarProps): import("react").JSX.Element;
export interface MeterProps extends Omit<AriaMeterProps, 'children'>, BarProps {
}
/** A quantity within known limits, such as storage used, drawn as a progress bar is. For progress, use a ProgressBar */
export declare function Meter({ label, ...props }: MeterProps): import("react").JSX.Element;
export declare const progressCircle: import("tailwind-variants").TVReturnType<{
    size: {
        medium: {
            base: string;
        };
        large: {
            base: string;
            svg: string;
        };
    };
    isIndeterminate: {
        true: {
            svg: string;
        };
    };
}, {
    base: string;
    svg: string;
    track: string;
    fill: string;
}, undefined, undefined, undefined, undefined>;
export interface ProgressCircleProps extends Omit<AriaProgressBarProps, 'children'> {
    /** Medium is 16px, an icon’s size, for a button or a row. Large is 32px, for a panel that’s loading */
    size?: 'medium' | 'large';
}
/**
 * A spinner, or a ring that fills, for progress in the space of an icon. It takes its colour from the text around it.
 * Give it an aria-label, as it has no label to show
 */
export declare function ProgressCircle({ size, ...props }: ProgressCircleProps): import("react").JSX.Element;
export {};
