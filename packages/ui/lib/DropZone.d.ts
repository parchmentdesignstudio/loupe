import type { ReactNode } from 'react';
import { type DropZoneProps as AriaDropZoneProps } from 'react-aria-components';
export { FileTrigger, isFileDropItem, type FileTriggerProps } from 'react-aria-components';
export declare const dropZone: import("tailwind-variants").TVReturnType<{
    variant: {
        dashed: string;
        quiet: string;
    };
    isDropTarget: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "relative", {
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
export interface DropZoneProps extends AriaDropZoneProps {
    /** Dashed, a box that says it takes files, or quiet, for a panel or canvas that shows it's taking them only as they're dragged over */
    variant?: 'dashed' | 'quiet';
    /** What to drop here, shown in the zone and read out for its drop button. A quiet zone takes an aria-label instead */
    label?: ReactNode;
}
/** Somewhere to drop files, or paste them from its drop button. A FileTrigger inside offers the file picker too */
export declare function DropZone({ variant, label, ...props }: DropZoneProps): import("react").JSX.Element;
