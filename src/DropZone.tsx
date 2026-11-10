import type { ReactNode } from 'react';
import { DropZone as AriaDropZone, type DropZoneProps as AriaDropZoneProps, Text, composeRenderProps } from 'react-aria-components';
import { focusRing, tv } from './tv.js';

export { FileTrigger, isFileDropItem, type FileTriggerProps } from 'react-aria-components';

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

export interface DropZoneProps extends AriaDropZoneProps {
	/** Dashed, a box that says it takes files, or quiet, for a panel or canvas that shows it's taking them only as they're dragged over */
	variant?: 'dashed' | 'quiet';
	/** What to drop here, shown in the zone and read out for its drop button. A quiet zone takes an aria-label instead */
	label?: ReactNode;
}

/** Somewhere to drop files, or paste them from its drop button. A FileTrigger inside offers the file picker too */
export function DropZone({ variant, label, ...props }: DropZoneProps) {
	return (
		<AriaDropZone {...props} className={composeRenderProps(props.className, (className, state) => dropZone({ ...state, variant, className }))}>
			{composeRenderProps(props.children, (children) => (
				<>
					{label != null && <Text slot="label">{label}</Text>}
					{children}
				</>
			))}
		</AriaDropZone>
	);
}
