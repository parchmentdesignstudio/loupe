import { jsx as _jsx } from "react/jsx-runtime";
import { SeparatorContext, Toolbar as AriaToolbar, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';
const toolbar = tv({
    base: 'flex items-center gap-1',
    variants: {
        orientation: {
            horizontal: '',
            vertical: 'flex-col',
        },
    },
});
/** Controls in a row, such as an editor's tools: one Tab stop, with the arrow keys between them. Give it an aria-label */
export function Toolbar(props) {
    // A Separator runs across the toolbar: upright in a row, flat in a column
    const across = props.orientation === 'vertical' ? 'horizontal' : 'vertical';
    return (_jsx(SeparatorContext.Provider, { value: { orientation: across }, children: _jsx(AriaToolbar, { ...props, className: composeRenderProps(props.className, (className, state) => toolbar({ ...state, className })) }) }));
}
