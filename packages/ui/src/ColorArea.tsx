import { ColorArea as AriaColorArea, type ColorAreaProps, composeRenderProps } from 'react-aria-components';
import { ColorThumb } from './ColorThumb.js';
import { tv } from './tv.js';

export type { ColorAreaProps };

const colorArea = tv({
	base: 'aspect-square w-full shrink-0 rounded-lg inset-ring inset-ring-bleed/12',
	variants: {
		isDisabled: {
			true: 'opacity-50',
		},
	},
});

/** Two channels of a colour at once, such as saturation across and brightness up, picked by dragging its thumb or with the arrow keys */
export function ColorArea(props: ColorAreaProps) {
	return (
		<AriaColorArea {...props} className={composeRenderProps(props.className, (className, state) => colorArea({ ...state, className }))}>
			<ColorThumb />
		</AriaColorArea>
	);
}
