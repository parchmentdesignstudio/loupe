import { type ReactNode } from 'react';
export declare const code: import("tailwind-variants").TVReturnType<{
    hasBar: {
        true: {
            body: string;
        };
    };
}, {
    base: string;
    bar: string;
    title: string;
    folder: string;
    changes: string;
    swap: string;
    gone: string;
    body: string;
    plain: string;
    aside: string;
    line: string;
}, undefined, undefined, undefined, undefined>;
export type CodeTheme = 'loupe' | 'iamsteve' | 'mcknny';
/**
 * The code without Shiki's [!code ++] style notes, as Shiki shows it, for Copy and for the code before it's highlighted.
 * A comment left empty goes with them, and so does a line that was only that comment. A note inside a line stays, as
 * Shiki leaves it
 */
export declare function withoutNotes(source: string): string;
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
    /**
     * Copy as an icon, such as square-on-square from @parchment/icons, with its name in a tooltip, rather than as the
     * word. copiedIcon takes its place once it's copied, such as checkmark
     */
    copyIcon?: ReactNode;
    copiedIcon?: ReactNode;
    className?: string;
}
/** A block of code, highlighted, with a title, what a diff changes, and Copy. Long code scrolls inside it, both ways */
export declare function Code({ code: text, html, title, theme, isCopyable, copyIcon, copiedIcon, className }: CodeProps): import("react").JSX.Element;
