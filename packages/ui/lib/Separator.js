import { jsx as _jsx } from "react/jsx-runtime";
import { Separator as AriaSeparator, SeparatorContext, useSlottedContext } from 'react-aria-components';
import { tv } from './tv.js';
const separator = tv({
    base: 'shrink-0 border-0 bg-bleed/8',
    variants: {
        orientation: {
            horizontal: 'h-px w-full',
            vertical: 'mx-1 h-5 w-px self-center',
        },
        // A Toolbar sets the orientation. Across a column of controls, it's as short as an upright one is in a row
        isInToolbar: {
            true: '',
        },
    },
    compoundVariants: [{ orientation: 'horizontal', isInToolbar: true, class: 'my-1 w-5 self-center' }],
});
/** A line between groups of controls, or sections of a panel. In a Toolbar it stands upright */
export function Separator(props) {
    const context = useSlottedContext(SeparatorContext, props.slot);
    const orientation = props.orientation ?? context?.orientation ?? 'horizontal';
    return _jsx(AriaSeparator, { ...props, className: separator({ orientation, isInToolbar: props.orientation == null && context?.orientation != null, className: props.className }) });
}
