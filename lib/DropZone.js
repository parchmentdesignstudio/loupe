import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DropZone as AriaDropZone, Text, composeRenderProps } from 'react-aria-components';
import { focusRing, tv } from './tv.js';
export { FileTrigger, isFileDropItem } from 'react-aria-components';
// Relative, so React Aria's hidden drop button stays inside. Otherwise focusing it can scroll the whole page
export const dropZone = tv({
    extend: focusRing,
    base: 'relative',
    variants: {
        variant: {
            dashed: 'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-bleed/16 p-6 text-center text-label text-muted transition-colors duration-150 ease-out motion-reduce:transition-none',
            quiet: '',
        },
        isDropTarget: {
            true: '',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
    compoundVariants: [
        { variant: 'dashed', isDropTarget: true, class: 'border-solid border-ink bg-bleed/4 text-ink' },
        // A quiet zone fills its panel, so its rings sit inside the edges rather than outside, where they'd be cut off
        { variant: 'quiet', isFocusVisible: true, class: '-outline-offset-8' },
        { variant: 'quiet', isDropTarget: true, class: 'outline-2 -outline-offset-8 outline-dashed' },
    ],
    defaultVariants: {
        variant: 'dashed',
    },
});
/** Somewhere to drop files, or paste them from its drop button. A FileTrigger inside offers the file picker too */
export function DropZone({ variant, label, ...props }) {
    return (_jsx(AriaDropZone, { ...props, className: composeRenderProps(props.className, (className, state) => dropZone({ ...state, variant, className })), children: composeRenderProps(props.children, (children) => (_jsxs(_Fragment, { children: [label != null && _jsx(Text, { slot: "label", children: label }), children] }))) }));
}
