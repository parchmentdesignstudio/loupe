import type { HTMLAttributes, ReactNode } from 'react';
export declare const aside: import("tailwind-variants").TVReturnType<{
    variant: {
        signpost: string;
        afterthought: string;
    };
}, undefined, "border-s-(length:--rule) ps-[calc(--spacing(4)-var(--rule))] text-body in-[.prose]:-ms-4 *:not-first:mt-[var(--prose-line,1em)]", undefined, undefined, undefined>;
export interface AsideProps extends HTMLAttributes<HTMLElement> {
    /** A signpost to what’s coming or what the reader needs first, or an afterthought, a tangent to read or skip */
    variant?: 'signpost' | 'afterthought';
    children: ReactNode;
}
/**
 * The writer’s own voice beside the main text: a signpost, such as “I assume you’re comfortable setting up Tailwind”,
 * or an afterthought. In prose its rule hangs in the margin, so its text lines up with the paragraphs. Someone else’s
 * words are a Quote
 */
export declare function Aside({ variant, className, ...props }: AsideProps): import("react").JSX.Element;
