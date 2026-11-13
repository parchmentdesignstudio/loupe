import { useContext } from 'react';
import {
	SelectionIndicator,
	ToggleButton as AriaToggleButton,
	ToggleButtonGroup as AriaToggleButtonGroup,
	type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
	type ToggleButtonProps,
	ToggleGroupStateContext,
	composeRenderProps,
} from 'react-aria-components';
import { focusRing, tv } from './tv.js';

export type { ToggleButtonProps };

// The track pads its buttons by --inset, and each button's corners are the track's less that inset, so they stay concentric.
// With one choice, the track is a well darker than the fill that slides in it: in the light, a tint under a white button,
// and in the dark, raised's fill under surface's lighter one. Its edge drops back and the chosen button's comes forward.
// With several, the group is one raised control, in the fill buttons and fields have, and its buttons are flat inside
// it, a pixel apart, so two chosen side by side don't share an edge
export const toggleButtonGroup = tv({
	base: 'group/toggle isolate inline-flex w-fit rounded-lg p-(--inset) [--chosen-edge:color-mix(in_oklab,var(--bleed)_16%,transparent)] [--chosen:light-dark(var(--color-raised),var(--color-surface))] [--inset:--spacing(0.75)]',
	variants: {
		orientation: {
			horizontal: '',
			vertical: 'flex-col',
		},
		isMultiple: {
			false: 'bg-[light-dark(color-mix(in_oklab,var(--bleed)_8%,transparent),var(--color-raised))] [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),color-mix(in_oklab,var(--bleed)_6%,transparent))]',
			true: 'gap-px bg-raised [--edge:var(--chosen-edge)]',
		},
		isDisabled: {
			false: '',
		},
	},
	// Flat when disabled, as a button is. The well and the raise are only on false, as their -none utilities come earlier
	// in the CSS and would lose
	compoundVariants: [
		{ isMultiple: false, isDisabled: false, class: 'inset-shadow-well' },
		{ isMultiple: true, isDisabled: false, class: 'shadow-raised' },
		{ isMultiple: true, isDisabled: true, class: 'bg-bleed/8' },
	],
});

export const toggleButton = tv({
	extend: focusRing,
	base: 'relative inline-flex cursor-default items-center justify-center gap-1.5 rounded-[calc(var(--radius-lg)-var(--inset,0px))] px-2.5 py-1 text-control font-medium text-muted [&>svg]:my-[calc((1lh-1rem)/2)] outline-offset-0 transition-[color,background-color] duration-150 ease-out group-data-[size=small]/toggle:px-2 group-data-[size=small]/toggle:py-0.5 motion-reduce:transition-none',
	variants: {
		isSelected: {
			true: 'text-ink',
		},
		isHovered: {
			true: 'text-ink',
		},
		isDisabled: {
			true: 'text-muted',
		},
		// In a group, the track's inset adds to the padding, so text sits 12px in, or 10px when small, as on a button.
		// On its own, a toggle is a button's 32px
		isInGroup: {
			false: 'px-3 py-1.5',
		},
		// Only a single-choice group slides a fill between its buttons. In a multi-choice group a chosen one is a ghost with
		// accent text, a lighter apricot in the dark so it reads on pine, and a grey fill when disabled so it still shows as
		// chosen. On its own, a toggle fills itself as a raised button
		hasIndicator: {
			false: '',
		},
	},
	compoundVariants: [
		{ isInGroup: false, isSelected: true, class: 'bg-(--chosen) shadow-raised' },
		{ isInGroup: false, isSelected: true, isDisabled: true, class: 'bg-bleed/12 shadow-none' },
		{ hasIndicator: false, isInGroup: true, isSelected: true, class: 'text-[light-dark(var(--color-accent),var(--color-apricot-73))]' },
		{ hasIndicator: false, isInGroup: true, isSelected: true, isHovered: true, class: 'bg-bleed/4' },
		{ hasIndicator: false, isInGroup: true, isSelected: true, isDisabled: true, class: 'bg-bleed/12 text-muted' },
		{ hasIndicator: false, isSelected: false, isHovered: true, class: 'bg-bleed/4' },
	],
});

// React Aria moves the fill to the chosen button by its translate and size, so those are what transition. Flat in a
// disabled group, as a disabled button is
const indicator = 'absolute top-0 left-0 -z-10 size-full rounded-[inherit] bg-(--chosen) shadow-raised [--edge:var(--chosen-edge)] transition-[translate,width,height] duration-250 ease-in-out group-data-[disabled]/toggle:bg-bleed/12 group-data-[disabled]/toggle:shadow-none motion-reduce:transition-none';

export interface ToggleButtonGroupProps extends AriaToggleButtonGroupProps {
	/** 32px tall, or 28px when small, like a button */
	size?: 'medium' | 'small';
}

/** A segmented control: a few toggle buttons side by side. With one choice, the default, a fill slides to it and one always stays chosen */
export function ToggleButtonGroup({ size = 'medium', selectionMode = 'single', disallowEmptySelection = selectionMode === 'single', ...props }: ToggleButtonGroupProps) {
	return (
		<AriaToggleButtonGroup
			data-size={size}
			selectionMode={selectionMode}
			disallowEmptySelection={disallowEmptySelection}
			{...props}
			className={composeRenderProps(props.className, (className, state) => toggleButtonGroup({ ...state, isMultiple: selectionMode === 'multiple', className }))}
		/>
	);
}

/** One button in a ToggleButtonGroup, where it needs an id, or a toggle on its own */
export function ToggleButton(props: ToggleButtonProps) {
	const group = useContext(ToggleGroupStateContext);
	const hasIndicator = group?.selectionMode === 'single';
	return (
		<AriaToggleButton {...props} className={composeRenderProps(props.className, (className, state) => toggleButton({ ...state, isInGroup: group != null, hasIndicator, className }))}>
			{composeRenderProps(props.children, (children) => (
				<>
					{hasIndicator && <SelectionIndicator className={indicator} />}
					{children}
				</>
			))}
		</AriaToggleButton>
	);
}
