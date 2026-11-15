import type { ShikiTransformer, ThemeRegistration } from 'shiki/core';
/**
 * One theme for light and dark, as each colour is a role token (tokens.css) that's already light-dark(). A site sets
 * the tokens, or data-code-theme, to restyle its code, and passes this to its own Shiki, such as @shikijs/rehype
 */
export declare const codeTheme: ThemeRegistration;
/**
 * Bare custom properties, with no rule around them, highlighted as the values they are. Shiki's CSS grammar only reads
 * declarations inside a rule, so this wraps them in one and drops it again
 */
export declare function transformerCssProperties(): ShikiTransformer;
/**
 * Tailwind's @theme read as an at-rule with declarations in it. Shiki's CSS grammar doesn't know @theme, so it reads
 * @font-face in its place, which takes declarations, and shows @theme again
 */
export declare function transformerCssTheme(): ShikiTransformer;
/**
 * Line numbers in a column of their own, beside the lines, so the lines scroll sideways and the numbers stay. On with
 * showLineNumbers in a code fence's meta, or showLineNumbers=12 to start at 12, as in ```css showLineNumbers
 */
export declare function transformerLineNumbers(): ShikiTransformer;
/**
 * Loupe's transformers, for a site's own Shiki, such as @shikijs/rehype. Code styles the lines each marks: {6-8} or
 * /word/ in a fence's meta, and // [!code highlight], [!code ++], [!code --], [!code focus], [!code error],
 * [!code warning] and [!code word:name] in the code. Then Tailwind's @theme, bare custom properties and line numbers
 */
export declare const codeTransformers: () => ShikiTransformer[];
declare const grammars: {
    tsx: () => Promise<typeof import("shiki/dist/langs/tsx.mjs")>;
    ts: () => Promise<typeof import("shiki/dist/langs/typescript.mjs")>;
    jsx: () => Promise<typeof import("shiki/dist/langs/jsx.mjs")>;
    js: () => Promise<typeof import("shiki/dist/langs/javascript.mjs")>;
    css: () => Promise<typeof import("shiki/dist/langs/css.mjs")>;
    html: () => Promise<typeof import("shiki/dist/langs/html.mjs")>;
    json: () => Promise<typeof import("shiki/dist/langs/json.mjs")>;
    bash: () => Promise<typeof import("shiki/dist/langs/shellscript.mjs")>;
};
export type CodeLanguage = keyof typeof grammars | 'text';
export interface HighlightOptions {
    language?: CodeLanguage;
    /** Numbers each line, from 1, or from the number given */
    lineNumbers?: boolean | number;
    /** What a code fence's meta would say, such as {6-8} to highlight lines 6 to 8, or /gap/ to highlight a word */
    meta?: string;
    /** A line of code in running text, as spans to put in a <code>, without Code's <pre> or its line marks */
    isInline?: boolean;
}
/** Code as Shiki's highlighted HTML, in Loupe's theme, for Code's html */
export declare function highlight(code: string, { language, lineNumbers, meta, isInline }?: HighlightOptions): Promise<string>;
/** Code highlighted in the browser, for Code's html: undefined until Shiki and the language have loaded */
export declare function useHighlight(code: string, { language, lineNumbers, meta, isInline }?: HighlightOptions): string | undefined;
export {};
