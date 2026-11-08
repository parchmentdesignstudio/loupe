import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Collection, Header, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, ListBoxSection as AriaListBoxSection, composeRenderProps } from 'react-aria-components';
import { Check } from './glyphs.js';
import { composeClassName, tv } from './tv.js';
/** A list of options, as in a select or combo box */
export function ListBox(props) {
    return _jsx(AriaListBox, { ...props, className: composeClassName(props.className, 'max-h-[inherit] overflow-auto p-1.5 outline-0') });
}
// One option in a list or menu. Keyboard and pointer both move the highlight, so focus shows as a fill
export const option = tv({
    base: 'group flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-body text-ink outline-0 select-none forced-color-adjust-none',
    variants: {
        isFocused: {
            true: 'bg-ink/6 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
        },
        isPressed: {
            true: 'bg-ink/10',
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
/** A heading within a list or menu */
export function SectionHeader({ children }) {
    return _jsx(Header, { className: "px-3 pt-2 pb-1 font-mono text-label text-muted", children: children });
}
/** Options grouped under a heading */
export function ListBoxSection({ title, items, children, ...props }) {
    return (_jsxs(AriaListBoxSection, { ...props, className: "not-first:mt-1.5 not-first:border-t not-first:border-ink/8 not-first:pt-1.5", children: [title && _jsx(SectionHeader, { children: title }), _jsx(Collection, { items: items, children: children })] }));
}
