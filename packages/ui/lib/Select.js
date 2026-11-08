import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Select as AriaSelect, SelectValue } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, focusRing, tv } from './tv.js';
// Looks like a text field, but it's a button, so its ring shows for keyboard focus only
export const trigger = tv({
    extend: focusRing,
    base: 'flex min-h-11 w-full cursor-default items-center gap-2 rounded-2xl bg-paper py-2.5 pr-3 pl-4 text-left text-base text-ink shadow-raised outline-offset-0 [-webkit-tap-highlight-color:transparent]',
    variants: {
        isHovered: {
            true: 'bg-surface',
        },
        isInvalid: {
            true: 'shadow-[0_0_0_1px_var(--color-danger)]',
        },
        isDisabled: {
            true: 'bg-paper opacity-50',
        },
    },
});
/** Picks one option from a list that opens below it */
export function Select({ label, description, errorMessage, items, children, ...props }) {
    return (_jsx(AriaSelect, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: ({ isInvalid }) => (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Button, { className: (state) => trigger({ ...state, isInvalid }), children: [_jsx(SelectValue, { className: "min-w-0 flex-1 truncate data-[placeholder]:text-muted", children: ({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? defaultChildren : selectedText) }), _jsx(ChevronDown, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { className: "min-w-(--trigger-width)", children: _jsx(ListBox, { items: items, children: children }) })] })) }));
}
