import { jsx as _jsx } from "react/jsx-runtime";
import { tv } from './tv.js';
// A rule down the start edge, its width as --rule, and the padding short of 16px by it, so in prose the aside can hang
// rule and padding in the margin and its text lines up with the paragraphs'. On its own it stays in its box
export const aside = tv({
    base: 'border-s-(length:--rule) ps-[calc(--spacing(4)-var(--rule))] font-(family-name:--typeface-body) text-body in-[.prose]:-ms-4 *:not-first:mt-[var(--prose-line,1em)]',
    variants: {
        // A signpost is the writing's own text, behind the accent's rule, as what the reader needs before they go on.
        // An afterthought is quieter: a hairline, and muted italic, to read or skip
        variant: {
            signpost: 'border-(color:--aside-signpost-rule,var(--color-accent)) text-ink [--rule:var(--aside-signpost-rule-width)]',
            afterthought: 'border-bleed/24 text-(color:--aside-afterthought-text,var(--color-muted)) italic [--rule:var(--aside-afterthought-rule-width)]',
        },
    },
    defaultVariants: { variant: 'signpost' },
});
/**
 * The writer’s own voice beside the main text: a signpost, such as “I assume you’re comfortable setting up Tailwind”,
 * or an afterthought. In prose its rule hangs in the margin, so its text lines up with the paragraphs. Someone else’s
 * words are a Quote
 */
export function Aside({ variant, className, ...props }) {
    return _jsx("aside", { ...props, className: aside({ variant, className }) });
}
