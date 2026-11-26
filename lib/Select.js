import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Select as AriaSelect, SelectValue } from 'react-aria-components';
import { boxField, boxLabel, Description, FieldError, Label } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, focusRing, tv } from './tv.js';
// Looks like a text field, but it's a button, so its text is medium like a button's, and its ring shows for keyboard
// focus only. The chevron sits 8px in, as a circle button's icon does
export const selectTrigger = tv({
    extend: focusRing,
    base: 'flex w-full cursor-default items-center gap-2 rounded-(--field-radius) text-left font-(family-name:--typeface-body) text-control font-(--weight-medium) text-(color:--field-text,var(--color-ink)) [-webkit-tap-highlight-color:transparent] in-data-[show-focus]:outline-2',
    variants: {
        // As a text field's, before the states so theirs win
        variant: {
            raised: 'bg-(--field-fill,var(--color-raised)) shadow-raised [--shadow-raised-color:var(--field-shadow)]',
            filled: 'bg-bleed/8 shadow-none',
        },
        size: {
            medium: 'py-(--field-padding-y) pr-2 pl-(--field-padding-x)',
            small: 'py-(--field-small-padding-y) pr-1.5 pl-(--field-small-padding-x)',
        },
        isInvalid: {
            true: 'shadow-invalid',
        },
        isDisabled: {
            true: 'bg-bleed/12 text-muted shadow-none',
        },
    },
    compoundVariants: [{ variant: 'filled', isDisabled: true, class: 'bg-bleed/4' }],
    defaultVariants: { variant: 'raised', size: 'medium' },
});
/** Picks one option from a list that opens below it */
export function Select({ label, description, errorMessage, items, children, variant, size, ...props }) {
    return (_jsx(AriaSelect, { ...props, className: composeClassName(props.className, boxField), children: ({ isInvalid }) => (_jsxs(_Fragment, { children: [label && _jsx(Label, { className: boxLabel, children: label }), _jsxs(Button, { className: (state) => selectTrigger({ ...state, isInvalid, variant, size }), children: [_jsx(SelectValue, { className: "min-w-0 flex-1 truncate data-[placeholder]:text-(color:--field-placeholder,var(--color-muted))", children: ({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? defaultChildren : selectedText) }), _jsx(ChevronDown, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { className: "max-w-[max(var(--trigger-width),20rem)] min-w-(--trigger-width)", children: _jsx(ListBox, { items: items, children: children }) })] })) }));
}
