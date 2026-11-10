import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Group, Input, SearchField as AriaSearchField } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { Cross, MagnifyingGlass } from './glyphs.js';
import { composeClassName, tv } from './tv.js';
// Sized like a text field, with the glass at its start and the clear button inside, as the combo box has its button.
// The clear button only hides while empty, so the text doesn't shift as you type the first letter
const searchField = tv({
    slots: {
        group: 'flex items-center rounded-lg bg-raised [--bleed:var(--raised-bleed)] pr-1 pl-2.5 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]',
        glass: 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted',
        input: 'min-w-0 flex-1 appearance-none bg-transparent py-1.5 pl-1.5 text-control text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden',
        clear: 'flex shrink-0 cursor-default items-center justify-center rounded-full p-1 text-muted outline-0 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
    },
    variants: {
        isFocusWithin: {
            false: { group: 'outline-0' },
            true: { group: 'outline-2' },
        },
        isInvalid: {
            true: { group: 'outline-danger shadow-invalid' },
        },
        isDisabled: {
            true: { group: 'opacity-50' },
        },
        isEmpty: {
            true: { clear: 'invisible' },
        },
    },
});
/** A field to search with, and a button that clears it. Escape clears it too, and Enter calls onSubmit */
export function SearchField({ label, description, errorMessage, placeholder, ...props }) {
    return (_jsx(AriaSearchField, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: ({ isEmpty, isInvalid, isDisabled }) => {
            const slots = searchField({ isEmpty, isInvalid, isDisabled });
            return (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Group, { className: (state) => slots.group(state), children: [_jsx(MagnifyingGlass, { className: slots.glass() }), _jsx(Input, { placeholder: placeholder, className: slots.input() }), _jsx(Button, { className: slots.clear(), children: _jsx(Cross, {}) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage })] }));
        } }));
}
