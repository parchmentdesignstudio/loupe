import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { DropZone as AriaDropZone, FileTrigger as AriaFileTrigger, ButtonContext, Text, composeRenderProps, } from 'react-aria-components';
import { focusRing, tv } from './tv.js';
export { isFileDropItem } from 'react-aria-components';
// A FileTrigger in a DropZone offers the same types the zone takes
const AcceptedContext = createContext(undefined);
/** Opens the file picker from the Button inside it. In a DropZone, it takes the zone's acceptedFileTypes unless given its own */
export function FileTrigger(props) {
    const accepted = useContext(AcceptedContext);
    return _jsx(AriaFileTrigger, { acceptedFileTypes: accepted, ...props });
}
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
export function DropZone({ variant, label, acceptedFileTypes, ...props }) {
    // A drag only says what type each file is, image/png say, so an extension such as .pdf can't be checked until the
    // drop. With one in the list, any drag is taken
    const types = acceptedFileTypes?.some((type) => type.startsWith('.')) ? undefined : acceptedFileTypes;
    const getDropOperation = props.getDropOperation ?? (types ? (dragTypes, allowed) => (dragTypes.has(types) ? allowed[0] : 'cancel') : undefined);
    return (_jsx(AriaDropZone, { ...props, getDropOperation: getDropOperation, className: composeRenderProps(props.className, (className, state) => dropZone({ ...state, variant, className })), children: composeRenderProps(props.children, (children) => (_jsxs(AcceptedContext.Provider, { value: acceptedFileTypes, children: [variant !== 'quiet' && label != null && label !== '' && _jsx(Text, { slot: "label", children: label }), props.isDisabled ? _jsx(ButtonContext.Provider, { value: { isDisabled: true }, children: children }) : children] }))) }));
}
