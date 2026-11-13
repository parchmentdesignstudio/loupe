import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { Button, Disclosure as AriaDisclosure, DisclosureGroup as AriaDisclosureGroup, DisclosurePanel as AriaDisclosurePanel, DisclosureStateContext, Heading, } from 'react-aria-components';
import { ChevronDown } from './glyphs.js';
import { composeClassName, focusRing, tv } from './tv.js';
// A group hands its size to each disclosure in it, and a disclosure to its header and panel
const SizeContext = createContext('medium');
const trigger = tv({
    extend: focusRing,
    base: 'flex w-full cursor-default items-center justify-between gap-4 rounded-sm text-left font-medium text-ink',
    variants: {
        size: {
            medium: 'py-4 text-base',
            // The chevron follows the title, so it stays put when a wider panel opens
            small: 'justify-start gap-1.5 py-1.5 text-body',
        },
        isDisabled: {
            true: 'text-muted',
        },
    },
});
const chevron = tv({
    base: 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted transition-transform duration-250 ease-in-out motion-reduce:transition-none',
    variants: {
        isHovered: {
            true: 'text-ink',
        },
        isExpanded: {
            true: 'rotate-180',
        },
    },
});
// React Aria sets --disclosure-panel-height as the panel opens and closes, so the height transitions. The padding sits
// inside, so it closes to nothing
const panel = tv({
    slots: {
        base: 'h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-in-out motion-reduce:transition-none',
        content: '',
    },
    variants: {
        size: {
            medium: { content: 'pb-4' },
            small: { content: '' },
        },
    },
});
/** Disclosures that open one at a time, unless allowsMultipleExpanded */
export function DisclosureGroup({ size = 'medium', ...props }) {
    return (_jsx(SizeContext.Provider, { value: size, children: _jsx(AriaDisclosureGroup, { ...props, className: composeClassName(props.className, size === 'medium' ? 'flex flex-col divide-y divide-bleed/8' : 'flex flex-col') }) }));
}
/** A DisclosureHeader that shows or hides the DisclosurePanel under it */
export function Disclosure({ size, ...props }) {
    const groupSize = useContext(SizeContext);
    return (_jsx(SizeContext.Provider, { value: size ?? groupSize, children: _jsx(AriaDisclosure, { ...props }) }));
}
/** A heading whose button opens and closes its disclosure, with a chevron that turns as it does */
export function DisclosureHeader({ children, level, className }) {
    const size = useContext(SizeContext);
    const isExpanded = useContext(DisclosureStateContext)?.isExpanded ?? false;
    return (_jsx(Heading, { level: level, children: _jsx(Button, { slot: "trigger", className: (state) => trigger({ ...state, size, className }), children: ({ isHovered }) => (_jsxs(_Fragment, { children: [children, _jsx(ChevronDown, { className: chevron({ isHovered, isExpanded }) })] })) }) }));
}
/** What a disclosure shows when it's open. A closed panel stays in the page, hidden until found */
export function DisclosurePanel({ children, ...props }) {
    const slots = panel({ size: useContext(SizeContext) });
    return (_jsx(AriaDisclosurePanel, { ...props, className: composeClassName(props.className, slots.base()), children: _jsx("div", { className: slots.content(), children: children }) }));
}
