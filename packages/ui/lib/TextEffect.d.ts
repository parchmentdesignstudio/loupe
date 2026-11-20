export interface TextEffectProps {
    /** The effect. Ray crosses the text as it changes, wiping what it said for what it says now */
    variant?: 'ray';
    /** The text, on one line, cut short where there isn't room. Each time it changes, the effect plays */
    children: string;
    /** Plays the effect over and over while it's true, such as while something is being worked on */
    loop?: boolean;
    /** How fast the ray crosses, in pixels a millisecond */
    pace?: number;
    className?: string;
}
/**
 * Text that changes with an effect, such as a ray of light that crosses it. With reduced motion, the text just changes
 */
export declare function TextEffect({ children, loop, pace, className }: TextEffectProps): import("react").JSX.Element;
