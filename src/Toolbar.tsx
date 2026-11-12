import { SeparatorContext, Toolbar as AriaToolbar, type ToolbarProps, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';

export type { ToolbarProps };

const toolbar = tv({
	base: 'flex items-center gap-1',
	variants: {
		orientation: {
			horizontal: 'flex-wrap',
			vertical: 'flex-col',
		},
	},
});

/** Controls in a row, such as an editor's tools: one Tab stop, with the arrow keys between them. Give it an aria-label */
export function Toolbar(props: ToolbarProps) {
	// A Separator runs across the toolbar: upright in a row, flat in a column
	const across = props.orientation === 'vertical' ? 'horizontal' : 'vertical';
	return (
		<SeparatorContext.Provider value={{ orientation: across }}>
			<AriaToolbar {...props} className={composeRenderProps(props.className, (className, state) => toolbar({ ...state, className }))} />
		</SeparatorContext.Provider>
	);
}
