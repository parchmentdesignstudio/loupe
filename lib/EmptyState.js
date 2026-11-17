import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tv } from './tv.js';
export const emptyState = tv({
    slots: {
        base: 'flex flex-col items-center gap-4 px-(--empty-state-padding-x) py-(--empty-state-padding-y) text-center',
        // A raised tile, like a secondary button, so the icon reads as the thing that'll be here
        icon: 'flex size-10 items-center justify-center rounded-(--empty-state-icon-radius) bg-(--empty-state-icon-fill,var(--color-raised)) text-(color:--empty-state-icon,var(--color-muted)) shadow-panel',
        text: 'flex max-w-[36ch] flex-col gap-1',
        title: '[font-weight:var(--empty-state-title-font-weight)] text-ink',
        description: 'text-pretty text-muted',
        actions: 'mt-1 flex flex-wrap justify-center gap-2',
    },
});
/** Where there's nothing to show yet: what will be here, and the first step to fill it. The title isn't a heading, so it fits in a list or under a page's own */
export function EmptyState({ icon, title, children, actions, className }) {
    const { base, icon: tile, text, title: name, description, actions: row } = emptyState();
    return (_jsxs("div", { className: base({ className }), children: [icon && (_jsx("div", { className: tile(), "aria-hidden": "true", children: icon })), _jsxs("div", { className: text(), children: [_jsx("p", { className: name(), children: title }), children && _jsx("p", { className: description(), children: children })] }), actions && _jsx("div", { className: row(), children: actions })] }));
}
