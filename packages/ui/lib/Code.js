import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button } from './Button.js';
import { tv } from './tv.js';
export const code = tv({
    slots: {
        base: 'relative flex flex-col overflow-hidden rounded-xl bg-code-ground text-code-text shadow-[0_0_0_.5px_var(--edge)] [--bleed:var(--panel-bleed)]',
        // The title and Copy, on a line of their own above the code
        bar: 'flex items-center gap-2 py-1 ps-4 pe-1 text-control font-medium shadow-[inset_0_-.5px_var(--edge)]',
        title: 'min-w-0 flex-1 truncate',
        // Shiki's <pre>, or a plain one before it's highlighted, laid out the same, so nothing moves when it is. Its own
        // background goes, for the block's. Line numbers, from Loupe's transformer, sit in a column that stays as the lines scroll
        body: [
            '[&_pre]:m-0 [&_pre]:max-h-[24lh] [&_pre]:overflow-auto [&_pre]:overscroll-contain [&_pre]:bg-transparent! [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-label/5 [&_pre]:[tab-size:2]',
            '[&_code]:flex [&_code]:min-w-max [&_code]:flex-col',
            '[&_.line]:min-h-[1lh] [&_.line]:px-4',
            '[&_code[data-line-numbers]]:grid [&_code[data-line-numbers]]:min-w-0 [&_code[data-line-numbers]]:grid-cols-[auto_1fr]',
            '[&_[data-line-numbers-col]]:sticky [&_[data-line-numbers-col]]:left-0 [&_[data-line-numbers-col]]:flex [&_[data-line-numbers-col]]:flex-col [&_[data-line-numbers-col]]:bg-code-ground [&_[data-line-numbers-col]]:ps-4 [&_[data-line-numbers-col]]:text-end [&_[data-line-numbers-col]]:text-code-comment [&_[data-line-numbers-col]]:select-none',
            '[&_[data-line-numbers-content]]:flex [&_[data-line-numbers-content]]:flex-col',
        ].join(' '),
        plain: 'px-4 whitespace-pre',
    },
    variants: {
        // Copy floats in the corner when there's no title to sit beside
        hasBar: { false: { body: '[&_pre]:pe-16' } },
    },
});
/** A block of code, highlighted, with a title and Copy. Long code scrolls inside it, both ways */
export function Code({ code: text, html, title, theme, isCopyable = true, className }) {
    const { base, bar, title: name, body, plain } = code({ hasBar: title != null });
    const [isCopied, setCopied] = useState(false);
    useEffect(() => {
        if (!isCopied)
            return;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [isCopied]);
    const copy = isCopyable && (_jsx(Button, { variant: "ghost", size: "small", onPress: () => void navigator.clipboard.writeText(text).then(() => setCopied(true)), children: isCopied ? 'Copied' : 'Copy' }));
    return (_jsxs("figure", { "data-code-theme": theme === 'loupe' ? undefined : theme, className: base({ className }), children: [title != null ? (_jsxs("figcaption", { className: bar(), children: [_jsx("span", { className: name(), children: title }), copy] })) : (copy && _jsx("div", { className: "absolute top-1.5 right-1.5 z-10", children: copy })), html ? (_jsx("div", { className: body(), dangerouslySetInnerHTML: { __html: html } })) : (_jsx("div", { className: body(), children: _jsx("pre", { children: _jsx("code", { className: plain(), children: text.replace(/\n$/, '') }) }) }))] }));
}
