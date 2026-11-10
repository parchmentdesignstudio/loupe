import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, ListBoxSection as AriaListBoxSection, composeRenderProps } from 'react-aria-components';
import { Check } from './glyphs.js';
import { composeClassName, tv } from './tv.js';
/** A list of options, as in a select or combo box */
export function ListBox(props) {
    return _jsx(AriaListBox, { ...props, className: composeClassName(props.className, 'max-h-[inherit] overflow-auto p-1.5 outline-0') });
}
// One option in a list or menu. Keyboard and pointer both move the highlight, so focus shows as a fill
export const option = tv({
    base: 'group flex cursor-default items-center gap-3 rounded-sm px-3 py-1.5 text-control text-ink outline-0 select-none forced-color-adjust-none',
    variants: {
        isFocused: {
            true: 'bg-bleed/8 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
        },
        isPressed: {
            true: 'bg-bleed/12',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
});
/** An option with its text as children. It's ticked when selected */
export function ListBoxItem(props) {
    const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
    return (_jsx(AriaListBoxItem, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, state) => option({ ...state, className })), children: composeRenderProps(props.children, (children, { isSelected }) => (_jsxs(_Fragment, { children: [_jsx("span", { className: "flex min-w-0 flex-1 items-center gap-2 truncate group-data-[selected]:font-medium", children: children }), isSelected && _jsx(Check, {})] }))) }));
}
// Shared by list box and menu sections
export const section = tv({
    base: 'not-first:mt-1.5 not-first:border-t not-first:border-bleed/8 not-first:pt-1.5',
});
/** Options grouped under a Header, which goes first inside it */
export function ListBoxSection(props) {
    return _jsx(AriaListBoxSection, { ...props, className: section({ className: props.className }) });
}
