import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, ComboBox as AriaComboBox, Group, Input } from 'react-aria-components';
import { Description, FieldError, Label } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, tv } from './tv.js';
const combo = tv({
    slots: {
        group: 'flex min-h-11 items-center rounded-2xl bg-paper pr-1.5 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]',
        input: 'min-w-0 flex-1 bg-transparent py-2.5 pl-4 text-base text-ink outline-none placeholder:text-muted',
        button: 'flex size-8 shrink-0 cursor-default items-center justify-center rounded-full text-muted outline-0 data-[hovered]:bg-ink/5 data-[pressed]:bg-ink/10',
    },
    variants: {
        isFocusWithin: {
            false: { group: 'outline-0' },
            true: { group: 'outline-2' },
        },
        isInvalid: {
            true: { group: 'outline-danger shadow-[0_0_0_1px_var(--color-danger)]' },
        },
        isDisabled: {
            true: { group: 'opacity-50' },
        },
    },
});
/** A text field that filters a list of options as you type */
export function ComboBox({ label, description, errorMessage, placeholder, children, ...props }) {
    return (_jsx(AriaComboBox, { ...props, className: composeClassName(props.className, 'flex flex-col gap-1.5'), children: ({ isInvalid, isDisabled }) => {
            const slots = combo({ isInvalid, isDisabled });
            return (_jsxs(_Fragment, { children: [label && _jsx(Label, { children: label }), _jsxs(Group, { className: (state) => slots.group(state), children: [_jsx(Input, { placeholder: placeholder, className: slots.input() }), _jsx(Button, { className: slots.button(), children: _jsx(ChevronDown, {}) })] }), description && _jsx(Description, { children: description }), _jsx(FieldError, { children: errorMessage }), _jsx(Popover, { className: "min-w-(--trigger-width)", children: _jsx(ListBox, { children: children }) })] }));
        } }));
}
