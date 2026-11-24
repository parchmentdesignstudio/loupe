export declare const scribble: import("tailwind-variants").TVReturnType<{}, undefined, "h-(--scribble-height) w-(--scribble-width) shrink-0", undefined, undefined, undefined>;
export interface ScribbleProps {
    /** Called as each pass after the first begins, as the pen lifts, so the words beside it can change with it */
    onPass?: () => void;
    className?: string;
}
/**
 * A pen writing loops, for while something's on its way, such as an answer. Its colour is the text's. It's hidden from
 * screen readers, so put words beside it that say what's happening. With reduced motion, the loops are written and
 * stay still
 */
export declare function Scribble({ onPass, className }: ScribbleProps): import("react").JSX.Element;
