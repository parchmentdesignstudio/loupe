import { type ColorSwatchProps } from 'react-aria-components';
export type { ColorSwatchProps };
export declare const colorSwatch: import("tailwind-variants").TVReturnType<{}, undefined, "size-8 shrink-0 rounded-lg inset-ring inset-ring-bleed/12 forced-colors:inset-ring-[CanvasText]", undefined, undefined, undefined>;
/** A checkerboard for a see-through colour to go over, as a background image in 8px squares */
export declare const checkerboard = "repeating-conic-gradient(color-mix(in oklab, var(--ink) 12%, var(--paper)) 0 25%, var(--paper) 0 50%)";
/** A colour on its own, named for screen readers, such as dark cyan */
export declare function ColorSwatch(props: ColorSwatchProps): import("react").JSX.Element;
