import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tv } from './tv.js';
// Each tone sets --status, the dot's colour, and a badge tints its fill from it. The text stays ink, so it reads the
// same in every tone and theme, and the colour only backs up what the label says. The hues match an avatar's status dot
export const status = tv({
    slots: {
        base: 'inline-flex max-w-full min-w-0 items-center gap-2 align-middle whitespace-nowrap text-ink',
        dot: 'size-2 shrink-0 rounded-full bg-(--status)',
        label: 'truncate',
        // Short of room, the detail gives way first, so the label, which says it all, stays whole for longest
        detail: 'flex min-w-0 shrink-[99] items-center gap-2 text-muted',
    },
    variants: {
        tone: {
            neutral: { base: '[--status:var(--color-sand-66)]' },
            info: { base: '[--status:var(--color-blue-56)]' },
            success: { base: '[--status:var(--color-green-68)]' },
            warning: { base: '[--status:var(--color-yellow-76)]' },
            danger: { base: '[--status:var(--color-red-67)]' },
        },
        // A dot beside the text for a table or list, or a badge, a pill tinted in the tone, to stand out on a card or a heading.
        // The badge is 20px tall, on the label's 16px line, so it fits a 20px line of text without growing it
        variant: {
            dot: { base: 'text-control' },
            badge: { base: 'gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--status)_16%,transparent)] px-2 py-0.5 text-label font-medium', dot: 'size-1.5' },
        },
    },
    defaultVariants: { tone: 'neutral', variant: 'dot' },
});
/** Where something is up to, such as a lead that’s qualified or an invoice that’s overdue, as a coloured dot and a label */
export function Status({ tone, variant, detail, className, children, ...props }) {
    const styles = status({ tone, variant });
    return (_jsxs("span", { ...props, className: styles.base({ className }), children: [_jsx("span", { "aria-hidden": true, className: styles.dot() }), _jsx("span", { className: styles.label(), children: children }), detail != null && (_jsxs("span", { className: styles.detail(), children: [_jsx("span", { "aria-hidden": true, children: "\u00B7" }), _jsx("span", { className: "truncate", children: detail })] }))] }));
}
