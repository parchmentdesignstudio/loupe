import type { HTMLAttributes, ReactNode } from 'react';
export declare const quote: import("tailwind-variants").TVReturnType<{
    variant: {
        quote: string;
        testimonial: {
            base: string;
            caption: string;
            person: string;
        };
    };
}, {
    base: string;
    words: string;
    caption: string;
    person: string;
}, undefined, undefined, undefined, undefined>;
export interface QuoteProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    /** What they said, as text or paragraphs. The opening mark is drawn for it, so leave the quote marks off */
    children: ReactNode;
    /** Who said it */
    cite?: ReactNode;
    /** Who they are, such as their role and company, under their name */
    detail?: ReactNode;
    /** A quote set apart in the writing, or a testimonial, with the person beside a photo */
    variant?: 'quote' | 'testimonial';
    /** A photo of them, for a testimonial. Their initials show until it loads, from the cite when it's text */
    avatar?: string;
}
/** Someone else’s words, set apart in Livory’s italic, with who said it under them. A testimonial puts their photo beside their name */
export declare function Quote({ children, cite, detail, variant, avatar, className, ...props }: QuoteProps): import("react").JSX.Element;
