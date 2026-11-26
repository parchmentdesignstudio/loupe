import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tv } from './tv.js';
export const card = tv({
    slots: {
        base: 'flex min-w-0 flex-col gap-(--card-gap) rounded-(--card-radius) p-(--card-padding) text-ink',
        header: 'flex min-w-0 flex-col gap-0.5',
        // The title and its figure read as one, a label and its value, so they sit closer than anything else in the card
        lead: 'flex min-w-0 flex-col gap-(--card-figure-title-gap)',
        title: 'font-(family-name:--typeface-body) text-control font-(--card-title-font-weight) text-pretty',
        figure: 'text-(length:--card-figure-size) leading-(--card-figure-line-height) font-(--weight-bold) tracking-(--card-figure-letter-spacing) text-pretty',
        description: 'font-(family-name:--typeface-body) text-control text-pretty text-muted',
        body: 'flex min-w-0 flex-col gap-(--card-gap)',
        // Pushed to the foot, so in a row of cards that stretch to the tallest, their buttons line up whatever's above them
        actions: 'mt-auto flex flex-wrap gap-2 *:flex-1',
    },
    variants: {
        // With a figure, what describes it stands apart, as it's about the figure rather than part of it
        hasFigure: { true: { header: 'gap-(--card-figure-gap)' } },
        fill: {
            // White, off the page, with the panel's shadow for its edge
            raised: { base: 'bg-raised shadow-panel [--bleed:var(--raised-bleed)]' },
            // A tint of the page, for cards that sit inside something raised already
            quiet: { base: 'bg-bleed/4' },
        },
    },
    defaultVariants: { fill: 'raised' },
});
/**
 * A panel that groups one thing among others like it, such as a plan, a stat or a project. Its buttons sit at the foot,
 * so a row of cards lines them up. A section on its own isn't a card, and a Table never goes in one
 */
export function Card({ title, headingLevel = 3, figure, description, children, actions, fill, className }) {
    const styles = card({ fill, hasFigure: Boolean(figure) });
    const Heading = `h${headingLevel}`;
    return (_jsxs("article", { className: styles.base({ className }), children: [(title || figure || description) && (_jsxs("header", { className: styles.header(), children: [figure ? (_jsxs("div", { className: styles.lead(), children: [title && _jsx(Heading, { className: styles.title(), children: title }), _jsx("p", { className: styles.figure(), children: figure })] })) : (title && _jsx(Heading, { className: styles.title(), children: title })), description && _jsx("p", { className: styles.description(), children: description })] })), children && _jsx("div", { className: styles.body(), children: children }), actions && _jsx("div", { className: styles.actions(), children: actions })] }));
}
