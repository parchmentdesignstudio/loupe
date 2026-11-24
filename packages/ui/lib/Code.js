import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button } from './Button.js';
import { Tooltip, TooltipTrigger } from './Tooltip.js';
import { tv } from './tv.js';
export const code = tv({
    slots: {
        // not-prose, so in Prose its parts are laid out as Code lays them out, rather than as writing. In the dark its edge
        // is dark, so a sheen inside it and a light along its top lift it from the panel as they lift a secondary button.
        // They're a layer over the bar and the code, which would cover them on the block itself, and in the light they're clear
        base: [
            'not-prose relative flex flex-col overflow-hidden rounded-(--code-radius) text-code-text shadow-[0_0_0_.5px_var(--edge)] [--bleed:var(--panel-bleed)]',
            'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_.5px_0_var(--toplight),inset_0_0_0_.5px_var(--sheen)]',
        ],
        // The title, what's changed and Copy, on a line of their own above the code, as an editor's tab bar has them.
        // The ground under the block shows through it, lightened in the light, and as it is in the dark, where the code is a
        // step lighter, as a button is. The code casts the line between them, so it sits a little above the bar
        bar: 'flex items-center gap-3 bg-[light-dark(color-mix(in_oklab,var(--color-white)_40%,transparent),transparent)] py-1 ps-4 pe-1 text-control font-medium',
        // Padded as a small button is, so the bar's the same height with Copy at its end or without it
        title: 'min-w-0 flex-1 truncate py-(--button-small-padding-y)',
        // A path's folders, quieter than its file
        folder: 'font-normal text-code-comment',
        changes: 'flex gap-1.5 font-mono text-label tabular-nums',
        // Copy's icon and the one that takes its place, stacked, so one blurs, fades and shrinks a little as it goes while
        // the other comes in from as small. Only the fade with reduced motion. A line high, as Button gives an icon of its
        // own, so the button stays square
        swap: 'grid h-[1lh] place-items-center *:col-start-1 *:row-start-1 *:transition-[opacity,filter,scale] *:duration-250 *:ease-out motion-reduce:*:transition-opacity',
        gone: 'scale-90 opacity-0 blur-[3px] motion-reduce:scale-100 motion-reduce:blur-none',
        // Shiki's <pre>, or a plain one before it's highlighted, laid out the same, so nothing moves when it is. Its own
        // background goes, for the block's. Line numbers, from Loupe's transformer, sit in a column that stays as the lines scroll
        body: [
            // The ground is the code's alone, so the bar's shade is over whatever's behind the block
            'bg-code-ground',
            '[&_pre]:m-0 [&_pre]:max-h-[24lh] [&_pre]:overflow-auto [&_pre]:overscroll-contain [&_pre]:bg-transparent! [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-label/5 [&_pre]:[tab-size:2]',
            '[&_code]:flex [&_code]:min-w-max [&_code]:flex-col',
            '[&_.line]:relative [&_.line]:min-h-[1lh] [&_.line]:px-4',
            '[&_code[data-line-numbers]]:grid [&_code[data-line-numbers]]:min-w-0 [&_code[data-line-numbers]]:grid-cols-[auto_1fr]',
            // Above the lines, which are positioned for their + and − signs, so would scroll over it otherwise
            '[&_[data-line-numbers-col]]:sticky [&_[data-line-numbers-col]]:left-0 [&_[data-line-numbers-col]]:z-1 [&_[data-line-numbers-col]]:flex [&_[data-line-numbers-col]]:flex-col [&_[data-line-numbers-col]]:bg-code-ground [&_[data-line-numbers-col]]:text-end [&_[data-line-numbers-col]]:text-code-comment [&_[data-line-numbers-col]]:select-none',
            // On each number rather than the column, so a marked line's tint runs under its number too. The gap after it is
            // the number's too, rather than the line's, so it stays as the lines scroll under it
            '[&_[data-line-number]]:relative [&_[data-line-number]]:ps-4 [&_[data-line-number]]:pe-4',
            '[&_[data-line-numbers-content]]:flex [&_[data-line-numbers-content]]:flex-col [&_[data-line-numbers-content]_.line]:ps-0',
            // Marked lines, from @shikijs/transformers, and their numbers, which take the same classes. A warning is
            // highlighted as well, so it's marked as one, and an error is marked as a removal
            '[&_.highlighted:not(.error)]:bg-code-mark [&_[data-line-number].highlighted:not(.error)]:text-code-mark-edge',
            '[&_.diff.add]:bg-code-add [&_[data-line-number].add]:text-code-add-edge',
            '[&_:is(.diff.remove,.error)]:bg-code-remove [&_[data-line-number]:is(.remove,.error)]:text-code-remove-edge',
            // A removed line's stripes, under its number too, so it reads apart from an added one by more than its colour.
            // Tiled a line square, with a whole number of stripes across the tile, so they run on from one line to the next.
            // A numbered line's are set back by its number's width, its digits and the padding either side, so they run on
            // from its number's. Not fixed to the page, which would keep them joined as the lines scroll sideways, but has
            // browsers repaint the page on the main thread as it scrolls
            '[&_:is(.line,[data-line-number]):is(.diff.remove,.error)]:bg-[repeating-linear-gradient(-45deg,color-mix(in_oklch,var(--color-code-remove-edge)_8%,transparent)_0_1px,transparent_1px_10%)] [&_:is(.line,[data-line-number]):is(.diff.remove,.error)]:bg-size-[1lh_1lh]',
            '[&_[data-line-numbers-content]_.line]:bg-position-[calc(var(--line-number-digits)*-1ch-(--spacing(8)))_0]',
            // A bar down the changed line's edge, or its number's with numbers: solid for an addition, and for a removal its
            // fine stripes in the edge colour on a paler red, tiled as the line's are, so it reads as one bar, striped up
            // close. The red is mixed with the ground as bg-code-ground reads it, where it's used, as --color-code-ground by
            // name resolves on :root
            "[&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:absolute [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:inset-y-0 [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:start-0 [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:w-0.75 [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:content-['']",
            '[&_:is(code:not([data-line-numbers])_.line,[data-line-number]).add]:before:bg-code-add-edge [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.remove,.error)]:before:bg-[repeating-linear-gradient(-45deg,var(--color-code-remove-edge)_0_1px,color-mix(in_oklch,var(--color-code-remove-edge)_35%,light-dark(white,--theme(--color-code-ground)))_1px_10%)] [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.remove,.error)]:before:bg-size-[1lh_1lh]',
            '[&_.highlighted-word]:-mx-0.5 [&_.highlighted-word]:rounded-sm [&_.highlighted-word]:bg-code-mark [&_.highlighted-word]:px-0.5',
            // A word marked on a changed line, as what changed in it, takes the line's tint again over the line's own
            '[&_.diff.add_.highlighted-word]:bg-code-add [&_:is(.diff.remove,.error)_.highlighted-word]:bg-code-remove',
            // With lines in focus, the rest fade back until the block's hovered
            '[&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:opacity-40 [&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:blur-[1px] [&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:transition-[opacity,filter] motion-reduce:[&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:transition-none',
            '[&_pre.has-focused:hover_:is(.line,[data-line-number]):not(.focused)]:opacity-100 [&_pre.has-focused:hover_:is(.line,[data-line-number]):not(.focused)]:blur-none',
        ].join(' '),
        plain: 'px-4 whitespace-pre',
        // Copy, without a title to sit beside, over the code's corner, so the code scrolls the block's full width. Set as
        // the code is, with Copy centred on a line's height, so it's level with the first line. Outlined, on the code's
        // ground, so a line that runs under it stops at its edge. The ground is under Copy rather than on it, where it
        // would cover the tint Copy takes on hover
        aside: 'pointer-events-none absolute end-0 top-0 py-3 pe-2 font-mono text-label/5',
        line: 'flex h-[1lh] items-center',
        ground: 'pointer-events-auto flex rounded-(--button-radius) bg-code-ground',
    },
    variants: {
        hasBar: { true: { body: 'relative shadow-[0_-.5px_var(--edge),0_-1px_3px_-1.5px_var(--shadow-raised-color)]' } },
    },
});
// The notes Loupe's transformers read, as each takes them out of a comment: every one of a kind, but only the first
// word note. And any note at all, read or not, so its -- isn't taken for a comment
const readNotes = /#?\s*\[!code (?:\+\+|--|highlight|hl|focus|error|warning|info)(?::\d+)?\]/gi;
const wordNote = /\s*\[!code word:(?:\\.|[^:\]])+(?::\d+)?\]/;
const anyNote = /\[!code\b(?:\\.|[^\]])*\]/gi;
/** Where the comment that ends a line starts, as Shiki finds it, with its opener and closer */
function lastComment(end) {
    for (const [open, close] of [['{/*', '*/}'], ['/*', '*/'], ['<!--', '-->']]) {
        const at = end.endsWith(close) ? end.lastIndexOf(open, end.length - close.length - open.length) : -1;
        if (at >= 0)
            return [at, open, close];
    }
    // A line comment, from the opener nearest its last note, as Shiki splits one at each //, or a doc comment's *
    const last = [...end.matchAll(anyNote)].at(-1);
    if (last == null)
        return;
    const before = end.slice(0, last.index).replace(anyNote, (note) => ' '.repeat(note.length));
    const opener = [...before.matchAll(/\/\/+|-{2,}|;+|%+|#+|(?<=^\s*)\*(?!\/)/g)].at(-1);
    if (opener == null)
        return;
    // Not one in a string, which a quote before it opens and one after the note closes
    const after = end.slice(last.index + last[0].length);
    if (["'", '"', '`'].some((quote) => end.slice(0, opener.index).split(quote).length % 2 === 0 && after.includes(quote)))
        return;
    return [opener.index, opener[0].slice(0, /^[#*]/.test(opener[0]) ? 1 : 2), ''];
}
/**
 * The code without the [!code ++] style notes Loupe's transformers read, as Shiki shows it, for Copy and for the code
 * before it's highlighted. Shiki reads them in the comment that ends a line, after its last //, so one in a string
 * stays, and so does one before another //. A comment left empty goes, and so does a line that was only that comment
 */
export function withoutNotes(source) {
    return source
        .split('\n')
        .flatMap((line) => {
        const end = line.trimEnd();
        const comment = lastComment(end);
        if (comment == null)
            return [line];
        const [at, open, close] = comment;
        const text = end.slice(at + open.length, end.length - close.length);
        const rest = text.replace(readNotes, '').replace(wordNote, '');
        if (rest === text)
            return [line];
        // With an opener the notes leave at its end gone too, as Shiki takes it
        const kept = rest.replace(/\s*(?:\/\/|#|;{1,2}|%{1,2}|--)\s*$/, '');
        if (kept.trim())
            return [end.slice(0, at + open.length) + kept + close];
        const left = end.slice(0, at).trimEnd();
        return left.trim() ? [left] : [];
    })
        .join('\n');
}
// How many lines a diff removes and adds, from Shiki's marks on them, which can sit among others, such as highlighted
function changesIn(html = '') {
    const lines = [...html.matchAll(/class="([^"]*)"/g)].map(([, names]) => new Set(names?.split(/\s+/))).filter((names) => names.has('line') && names.has('diff'));
    return { removed: lines.filter((names) => names.has('remove')).length, added: lines.filter((names) => names.has('add')).length };
}
/** A block of code, highlighted, with a title, what a diff changes, and Copy. Long code scrolls inside it, both ways */
export function Code({ code: text, html, title, theme, isCopyable = true, copyIcon, copiedIcon, className }) {
    const { base, bar, title: name, folder, changes, swap, gone, body, plain, aside, line, ground } = code({ hasBar: title != null });
    const [isCopied, setCopied] = useState(false);
    useEffect(() => {
        if (!isCopied)
            return;
        const timer = setTimeout(() => setCopied(false), 1000);
        return () => clearTimeout(timer);
    }, [isCopied]);
    const label = isCopied ? 'Copied' : 'Copy';
    const onCopy = () => void navigator.clipboard.writeText(withoutNotes(text)).then(() => setCopied(true));
    const copy = isCopyable &&
        (copyIcon ? (_jsxs(TooltipTrigger, { children: [_jsx(Button, { variant: title == null ? 'outline' : 'ghost', size: "small", "aria-label": label, onPress: onCopy, children: _jsxs("span", { className: swap(), children: [_jsx("span", { className: isCopied ? gone() : undefined, children: copyIcon }), _jsx("span", { className: isCopied ? undefined : gone(), children: copiedIcon ?? copyIcon })] }) }), _jsx(Tooltip, { children: label })] })) : (_jsx(Button, { variant: title == null ? 'outline' : 'ghost', size: "small", onPress: onCopy, children: label })));
    const { removed, added } = changesIn(html);
    const folders = typeof title === 'string' ? title.split('/') : [];
    const file = folders.pop();
    return (_jsxs("figure", { "data-code-theme": theme === 'loupe' ? undefined : theme, className: base({ className }), children: [title != null ? (_jsxs("figcaption", { className: bar(), children: [_jsxs("span", { className: name(), children: [file == null
                                ? title
                                : folders.map((each, i) => (_jsxs("span", { className: folder(), children: [each, " /", ' '] }, i))), file] }), (removed > 0 || added > 0) && (_jsxs("span", { className: changes(), children: [_jsxs("span", { className: "sr-only", children: [removed, " ", removed === 1 ? 'line' : 'lines', " removed, ", added, " added"] }), _jsxs("span", { "aria-hidden": true, className: "text-code-remove-edge", children: ["\u2212", removed] }), _jsxs("span", { "aria-hidden": true, className: "text-code-add-edge", children: ["+", added] })] })), copy] })) : null, html ? (_jsx("div", { className: body(), dangerouslySetInnerHTML: { __html: html } })) : (_jsx("div", { className: body(), children: _jsx("pre", { children: _jsx("code", { className: plain(), children: withoutNotes(text).replace(/\n$/, '') }) }) })), title == null && copy && (_jsx("div", { className: aside(), children: _jsx("div", { className: line(), children: _jsx("div", { className: ground(), children: copy }) }) }))] }));
}
