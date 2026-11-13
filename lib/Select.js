import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Select as AriaSelect, SelectValue } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, focusRing, tv } from './tv.js';
// Looks like a text field, but it's a button, so its text is medium like a button's, and its ring shows for keyboard
// focus only. The chevron sits 8px in, as a circle button's icon does
export const trigger = tv({
    extend: focusRing,
    base: 'flex w-full cursor-default items-center gap-2 rounded-lg text-left text-control font-medium text-ink outline-offset-0 [-webkit-tap-highlight-color:transparent]',
    variants: {
        // As a text field's, before the states so theirs win
        variant: {
            raised: 'bg-raised shadow-raised',
            filled: 'bg-bleed/8 shadow-none',
        },
        size: {
            medium: 'py-1.5 pr-2 pl-3',
            small: 'py-1 pr-1.5 pl-2.5',
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
    return (_jsx(AriaSelect, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: ({ isInvalid }) => (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Button, { className: (state) => trigger({ ...state, isInvalid, variant, size }), children: [_jsx(SelectValue, { className: "min-w-0 flex-1 truncate data-[placeholder]:text-muted", children: ({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? defaultChildren : selectedText) }), _jsx(ChevronDown, { className: "size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { className: "max-w-[max(var(--trigger-width),20rem)] min-w-(--trigger-width)", children: _jsx(ListBox, { items: items, children: children }) })] })) }));
}
