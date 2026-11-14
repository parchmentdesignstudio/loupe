import { type ColorThumbProps } from 'react-aria-components';
export type { ColorThumbProps };
export declare const colorThumb: import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        true: string;
    };
}, undefined, "size-5 rounded-full border-2 border-white shadow-[0_0_0_1px_oklch(0_0_0/24%),0_1px_3px_oklch(0_0_0/32%)] transition-[scale] duration-150 ease-out motion-reduce:transition-none", undefined, undefined, undefined>;
/** The handle of a ColorArea or ColorSlider, which places it */
export declare function ColorThumb(props: ColorThumbProps): import("react").JSX.Element;
