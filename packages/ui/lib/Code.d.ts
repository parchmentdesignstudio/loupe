import { type ReactNode } from 'react';
export declare const code: import("tailwind-variants").TVReturnType<{
    hasBar: {
        false: {
            body: string;
        };
    };
}, {
    base: string;
    bar: string;
    title: string;
    body: string;
    plain: string;
}, undefined, undefined, undefined, undefined>;
export type CodeTheme = 'loupe' | 'iamsteve' | 'mcknny';
export interface CodeProps {
    /** The code as text, shown as it is until there's html, and what Copy copies */
    code: string;
    /**
     * The code highlighted, as Shiki's HTML in Loupe's theme: highlight or useHighlight from @parchment/ui/shiki in the
     * browser, or the same theme and transformers in a site's own build
     */
    html?: string;
    /** A file name or caption, on a bar above the code */
    title?: ReactNode;
    /** Whose colours, as Loupe's own or one of Parchment's sites'. A page can set them all with data-code-theme */
    theme?: CodeTheme;
    /** Copy, which copies the code. On unless turned off */
    isCopyable?: boolean;
    className?: string;
}
/** A block of code, highlighted, with a title and Copy. Long code scrolls inside it, both ways */
export declare function Code({ code: text, html, title, theme, isCopyable, className }: CodeProps): import("react").JSX.Element;
