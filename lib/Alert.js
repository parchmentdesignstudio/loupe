import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './Button.js';
import { Cross, DangerGlyph, InfoGlyph, SuccessGlyph, WarningGlyph } from './glyphs.js';
import { tv } from './tv.js';
// Each tone sets Status's hue as --alert, for the fill, and --alert-icon, a dark step of it in the light and a pale one
// in the dark, so the icon stands out at 3:1 from the fill or the ground in both. The text stays ink, or muted, as a
// status's does, so it reads the same in every tone and theme
export const alert = tv({
    slots: {
        base: 'flex items-start gap-3 text-body text-ink',
        // On the text's first line, as an icon in a button is
        icon: 'flex shrink-0 text-(--alert-icon) *:my-[calc((1lh-1rem)/2)]',
        content: 'flex min-w-0 flex-1 flex-col gap-0.5 wrap-break-word',
        title: 'font-(--alert-title-font-weight) text-pretty',
        description: 'text-pretty *:not-first:mt-2',
        actions: 'mt-2.5 flex flex-wrap gap-2',
        // A 28px button on the 20px line, centred on it
        dismiss: '-my-1 shrink-0',
    },
    variants: {
        tone: {
            neutral: { base: '[--alert-icon:light-dark(var(--color-sand-46),var(--color-sand-84))] [--alert:var(--tone-neutral,var(--color-sand-66))]' },
            info: { base: '[--alert-icon:light-dark(var(--color-blue-56),var(--color-blue-82))] [--alert:var(--tone-info,var(--color-blue-56))]' },
            success: { base: '[--alert-icon:light-dark(var(--color-green-46),var(--color-green-89))] [--alert:var(--tone-success,var(--color-green-68))]' },
            warning: { base: '[--alert-icon:light-dark(var(--color-yellow-40),var(--color-yellow-91))] [--alert:var(--tone-warning,var(--color-yellow-76))]' },
            danger: { base: '[--alert-icon:light-dark(var(--color-red-50),var(--color-red-81))] [--alert:var(--tone-danger,var(--color-red-67))]' },
        },
        // An alert is a box tinted in the tone, edged a little deeper, to draw the eye. A notice is a line in the flow,
        // with no box: the icon in the tone and muted text, for something worth knowing that needn't stop anyone
        variant: {
            alert: {
                base: 'rounded-(--alert-radius) bg-[color-mix(in_oklab,var(--alert)_12%,transparent)] py-(--alert-padding) ps-(--alert-padding) pe-(--alert-padding) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--alert)_20%,transparent)]',
            },
            notice: {
                description: 'text-muted',
            },
        },
        hasDismiss: {
            true: '',
        },
    },
    compoundVariants: [
        // The button's own padding stands in for the box's, so its cross sits as far in as the icon
        { variant: 'alert', hasDismiss: true, class: { base: 'pe-2' } },
    ],
    defaultVariants: { tone: 'info', variant: 'alert' },
});
const icons = {
    neutral: () => _jsx(InfoGlyph, {}),
    info: () => _jsx(InfoGlyph, {}),
    success: () => _jsx(SuccessGlyph, {}),
    warning: () => _jsx(WarningGlyph, {}),
    danger: () => _jsx(DangerGlyph, {}),
};
/**
 * Something to know about a page or a part of it: a tinted alert to draw the eye, or a quieter notice. It's on the page
 * when it loads, so it isn't announced. One that appears after something happens, such as a failed save, wants
 * role="alert" if it can't wait, or role="status" if it can, on an element that's already there before its text
 * changes, or a toast
 */
export function Alert({ tone = 'info', variant, title, icon, actions, onDismiss, dismissLabel = 'Dismiss', className, children, ...props }) {
    const styles = alert({ tone, variant, hasDismiss: onDismiss != null });
    const shown = icon === undefined ? icons[tone]() : icon;
    return (_jsxs("div", { ...props, className: styles.base({ className }), children: [shown != null && shown !== false && (_jsx("span", { className: styles.icon(), "aria-hidden": "true", children: shown })), _jsxs("div", { className: styles.content(), children: [title != null && _jsx("p", { className: styles.title(), children: title }), children != null && _jsx("div", { className: styles.description(), children: children }), actions != null && _jsx("div", { className: styles.actions(), children: actions })] }), onDismiss && (_jsx(Button, { variant: "ghost", shape: "full", size: "small", "aria-label": dismissLabel, onPress: onDismiss, className: styles.dismiss(), children: _jsx(Cross, {}) }))] }));
}
