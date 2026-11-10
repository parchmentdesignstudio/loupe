import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from 'react';
import { SelectionIndicator, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, ToggleGroupStateContext, composeRenderProps, } from 'react-aria-components';
import { focusRing, tv } from './tv.js';
// The track pads its buttons by --inset, and each button's corners are the track's less that inset, so they stay concentric
export const toggleButtonGroup = tv({
    base: 'group/toggle inline-flex w-fit rounded-lg bg-bleed/8 p-(--inset) [--inset:--spacing(0.5)]',
    variants: {
        orientation: {
            horizontal: '',
            vertical: 'flex-col',
        },
        isDisabled: {
            true: 'opacity-40',
        },
    },
});
export const toggleButton = tv({
    extend: focusRing,
    base: 'relative isolate inline-flex cursor-default items-center justify-center gap-1.5 rounded-[calc(var(--radius-lg)-var(--inset,0px))] px-2.5 py-1 text-control font-medium text-muted [&>svg]:my-[calc((1lh-1rem)/2)] outline-offset-0 transition-[color,background-color] duration-150 ease-out group-data-[size=small]/toggle:px-2 group-data-[size=small]/toggle:py-0.5 motion-reduce:transition-none',
    variants: {
        isSelected: {
            true: 'text-ink',
        },
        isHovered: {
            true: 'text-ink',
        },
        isDisabled: {
            true: 'opacity-40',
        },
        // In a group, the track's inset adds to the padding, so text sits 12px in, or 10px when small, as on a button.
        // On its own, a toggle is a button's 32px
        isInGroup: {
            false: 'px-3 py-1.5',
        },
        // Only a single-choice group slides a fill between its buttons. Otherwise each fills itself
        hasIndicator: {
            false: '',
        },
    },
    compoundVariants: [
        { hasIndicator: false, isSelected: true, class: 'bg-raised shadow-raised' },
        { hasIndicator: false, isSelected: false, isHovered: true, class: 'bg-bleed/4' },
    ],
});
// React Aria moves the fill to the chosen button by its translate and size, so those are what transition
const indicator = 'absolute top-0 left-0 -z-10 size-full rounded-[inherit] bg-raised shadow-raised transition-[translate,width,height] duration-250 ease-in-out motion-reduce:transition-none';
/** A segmented control: a few toggle buttons side by side. With one choice, the default, a fill slides to it and one always stays chosen */
export function ToggleButtonGroup({ size = 'medium', selectionMode = 'single', disallowEmptySelection = selectionMode === 'single', ...props }) {
    return (_jsx(AriaToggleButtonGroup, { "data-size": size, selectionMode: selectionMode, disallowEmptySelection: disallowEmptySelection, ...props, className: composeRenderProps(props.className, (className, state) => toggleButtonGroup({ ...state, className })) }));
}
/** One button in a ToggleButtonGroup, where it needs an id, or a toggle on its own */
export function ToggleButton(props) {
    const group = useContext(ToggleGroupStateContext);
    const hasIndicator = group?.selectionMode === 'single';
    return (_jsx(AriaToggleButton, { ...props, className: composeRenderProps(props.className, (className, state) => toggleButton({ ...state, isInGroup: group != null, hasIndicator, className })), children: composeRenderProps(props.children, (children) => (_jsxs(_Fragment, { children: [hasIndicator && _jsx(SelectionIndicator, { className: indicator }), children] }))) }));
}
