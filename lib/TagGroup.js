import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Tag as AriaTag, TagGroup as AriaTagGroup, TagList, Text, composeRenderProps, } from 'react-aria-components';
import { Description, Label, field } from './Field.js';
import { Cross } from './glyphs.js';
import { focusRing, tv } from './tv.js';
const group = tv({ base: 'flex flex-col gap-1.5' });
/** Tags under one label. selectionMode lets them be chosen, and onRemove gives each a remove button */
export function TagGroup({ label, description, errorMessage, items, children, renderEmptyState, ...props }) {
    return (_jsxs(AriaTagGroup, { ...props, className: group({ className: props.className }), children: [label && _jsx(Label, { children: label }), _jsx(TagList, { items: items, renderEmptyState: renderEmptyState && ((state) => _jsx("span", { className: "text-label text-muted", children: renderEmptyState(state) })), className: "flex flex-wrap gap-1.5 outline-0", children: children }), description && _jsx(Description, { children: description }), errorMessage && (_jsx(Text, { slot: "errorMessage", className: field().error(), children: errorMessage }))] }));
}
export const tag = tv({
    extend: focusRing,
    base: 'inline-flex max-w-full cursor-default items-center gap-1 rounded-lg bg-bleed/8 px-2 py-1 text-label leading-4 text-ink transition-colors duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none',
    variants: {
        // Only a tag that can be chosen or acted on takes the hover
        isHovered: {
            true: 'bg-bleed/12',
        },
        isSelected: {
            true: 'bg-ink text-paper',
        },
        isDisabled: {
            true: 'opacity-40',
        },
        allowsRemoving: {
            true: 'pr-1',
        },
    },
    compoundVariants: [{ isSelected: true, isHovered: true, class: 'bg-ink/88' }],
});
// Tinted from the tag's own colour, so it suits a chosen tag as well
const remove = 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-0.5 outline-0 data-[hovered]:bg-current/12 data-[pressed]:bg-current/24';
/** A tag with its text as children. In a group with onRemove, it ends with a button to remove it */
export function Tag(props) {
    const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
    return (_jsx(AriaTag, { ...props, textValue: textValue, className: composeRenderProps(props.className, (className, state) => tag({ ...state, className })), children: composeRenderProps(props.children, (children, { allowsRemoving }) => (_jsxs(_Fragment, { children: [children, allowsRemoving && (_jsx(Button, { slot: "remove", className: remove, children: _jsx(Cross, { className: "size-3 shrink-0 fill-none stroke-current stroke-2" }) }))] }))) }));
}
