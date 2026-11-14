import { createContext, useContext, useLayoutEffect, useRef } from 'react';
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
// A well is darker than the fill that marks a choice in it: in the light, a tint under a white button, and in the dark,
// raised's fill under surface's lighter one, each with the dark edge that carries depth there. Raised, the group is one
// control in the fill buttons and fields have, and its buttons are flat inside it. Buttons are 2px apart by default, so
// two chosen side by side don't share an edge, and a hairline divides each from the next, as macOS's segmented controls
// do, unless it's turned off
export const toggleButtonGroup = tv({
	base: 'group/toggle isolate inline-flex w-fit gap-(--gap) rounded-lg p-(--inset) [--divider:light-dark(color-mix(in_oklab,var(--bleed)_14%,transparent),color-mix(in_oklab,white_10%,transparent))] [--chosen-tint:light-dark(color-mix(in_oklab,var(--color-pink-56)_12%,transparent),color-mix(in_oklab,var(--color-pink-70)_18%,transparent))] [--chosen-edge:light-dark(color-mix(in_oklab,var(--bleed)_16%,transparent),var(--dark-edge))] [--chosen:light-dark(var(--color-raised),var(--color-surface))] [--inset:--spacing(0.75)]',
	variants: {
		orientation: {
			horizontal: '',
			vertical: 'flex-col',
		},
		// Filling, it takes the width it's given and shares it between its buttons equally
		width: {
			hug: '',
			fill: 'w-full',
		},
		variant: {
			well: 'bg-[light-dark(color-mix(in_oklab,var(--bleed)_8%,transparent),var(--color-raised))] [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),var(--dark-edge))]',
			raised: 'bg-raised [--edge:var(--chosen-edge)]',
		},
		isDisabled: {
			false: '',
		},
	},
	// Flat when disabled, as a button is. The well and the raise are only on false, as their -none utilities come earlier
	// in the CSS and would lose
	compoundVariants: [
		{ variant: 'well', isDisabled: false, class: 'inset-shadow-well' },
		{ variant: 'raised', isDisabled: false, class: 'shadow-raised' },
		{ variant: 'raised', isDisabled: true, class: 'bg-bleed/8' },
	],
});

// The divider sits in the middle of the gap before each button but the first. It goes from beside the chosen button
// and the pressed one, as the fill marks those edges already, and from beside the hovered one where hovering fills it
const divider = [
	'before:pointer-events-none before:absolute before:inset-y-1 before:left-[calc(var(--gap)/-2-0.5px)] before:w-px before:rounded-full before:bg-(--divider) before:opacity-0 before:transition-opacity before:duration-150 motion-reduce:before:transition-none',
	'group-data-[orientation=vertical]/toggle:before:inset-x-3 group-data-[orientation=vertical]/toggle:before:inset-y-auto group-data-[orientation=vertical]/toggle:before:top-[calc(var(--gap)/-2-0.5px)] group-data-[orientation=vertical]/toggle:before:h-px group-data-[orientation=vertical]/toggle:before:w-auto',
	'group-data-[divided]/toggle:not-first:before:opacity-100',
	'data-[selected]:before:opacity-0! data-[pressed]:before:opacity-0! [[data-selected]+&]:before:opacity-0! [[data-pressed]+&]:before:opacity-0!',
];

export const toggleButton = tv({
	extend: focusRing,
	base: 'relative inline-flex cursor-default items-center justify-center gap-1.5 group-data-[width=fill]/toggle:flex-1 rounded-[calc(var(--radius-lg)-var(--inset,0px))] px-2.5 py-1 text-control font-medium text-muted [&>svg]:my-[calc((1lh-1rem)/2)] outline-offset-0 transition-[color,background-color] duration-150 ease-out group-data-[size=small]/toggle:px-2 group-data-[size=small]/toggle:py-0.5 motion-reduce:transition-none',
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
		// In a well, a single choice has a fill that slides between the buttons, and several each fill as a raised button,
		// as a toggle on its own does. In a raised group a chosen one is tinted pink, with pink text: the brand board's pink
		// in the dark, and a darker one in the light so it reads on white. Disabled, either keeps a grey fill so it still
		// shows as chosen
		variant: {
			well: '',
			raised: '',
		},
		hasIndicator: {
			false: '',
		},
	},
	compoundVariants: [
		{ variant: 'well', hasIndicator: false, isSelected: true, class: 'bg-(--chosen) shadow-raised [--edge:var(--chosen-edge)]' },
		{ variant: 'well', hasIndicator: false, isSelected: true, isDisabled: true, class: 'bg-bleed/12 shadow-none' },
		{ variant: 'raised', isSelected: true, class: 'bg-(--chosen-tint) text-[light-dark(var(--color-pink-56),var(--color-pink-70))]' },
		{ variant: 'raised', isSelected: true, isDisabled: true, class: 'bg-bleed/12 text-muted' },
		{ variant: 'well', hasIndicator: false, isSelected: false, isHovered: true, class: 'bg-bleed/4' },
		// In a raised group, the hovered one sinks in the dark, to the panel's fill below the group's, rather than lift
		{ variant: 'raised', isSelected: false, isHovered: true, class: 'bg-[light-dark(color-mix(in_oklab,var(--bleed)_4%,transparent),var(--color-panel))]' },
		{ hasIndicator: false, isInGroup: true, class: 'data-[hovered]:before:opacity-0! [[data-hovered]+&]:before:opacity-0!' },
		{ isInGroup: true, class: divider },
	],
});

// React Aria moves the fill to the chosen button by its translate and size, so those are what transition. Flat in a
// disabled group, as a disabled button is
const indicator = 'absolute top-0 left-0 -z-10 size-full rounded-[inherit] bg-(--chosen) shadow-raised [--edge:var(--chosen-edge)] transition-[translate,width,height] duration-250 ease-in-out group-data-[disabled]/toggle:bg-bleed/12 group-data-[disabled]/toggle:shadow-none motion-reduce:transition-none';

// Which look the group has, for its buttons to follow. A toggle on its own is a well's, filling itself when chosen
const VariantContext = createContext<'well' | 'raised'>('well');

// React Aria starts the slide by setting the fill's old place inline and clears it a frame later. When its effect runs
// twice before that frame, as in StrictMode, the second run keeps the first's inline place as the one to go back to, and
// the fill stays where it was. Clearing it two frames on, after React Aria has, lets it slide home either way
function Fill() {
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				const style = ref.current?.style;
				if (!style) return;
				style.translate = '';
				style.width = '';
				style.height = '';
			});
		});
		return () => cancelAnimationFrame(frame);
	}, []);
	return <SelectionIndicator ref={ref} className={indicator} />;
}

const gaps = { 0: '[--gap:0px]', 1: '[--gap:1px]', 2: '[--gap:2px]', 4: '[--gap:4px]' };

export interface ToggleButtonGroupProps extends AriaToggleButtonGroupProps {
	/** 32px tall, or 28px when small, like a button */
	size?: 'medium' | 'small';
	/** Pixels between the buttons */
	gap?: 0 | 1 | 2 | 4;
	/** A hairline between each button and the next, which goes from beside the chosen one */
	hasDividers?: boolean;
	/** Sunk into the page, with the chosen button filled, or raised from it, with the chosen one tinted. Well for one choice and raised for several, by default */
	variant?: 'well' | 'raised';
	/** As wide as its buttons, or as wide as it's given, with the buttons sharing it equally */
	width?: 'hug' | 'fill';
}

/** A segmented control: a few toggle buttons side by side. With one choice, the default, one always stays chosen, and in a well a fill slides to it */
export function ToggleButtonGroup({
	size = 'medium',
	selectionMode = 'single',
	disallowEmptySelection = selectionMode === 'single',
	gap = 2,
	hasDividers = true,
	variant = selectionMode === 'multiple' ? 'raised' : 'well',
	width = 'hug',
	...props
}: ToggleButtonGroupProps) {
	return (
		<VariantContext value={variant}>
			<AriaToggleButtonGroup
				data-size={size}
				data-divided={hasDividers || undefined}
				data-width={width}
				selectionMode={selectionMode}
				disallowEmptySelection={disallowEmptySelection}
				{...props}
				className={composeRenderProps(props.className, (className, state) => toggleButtonGroup({ ...state, variant, width, className: [gaps[gap], className] }))}
			/>
		</VariantContext>
	);
}

/** One button in a ToggleButtonGroup, where it needs an id, or a toggle on its own */
export function ToggleButton(props: ToggleButtonProps) {
	const group = useContext(ToggleGroupStateContext);
	const variant = useContext(VariantContext);
	const hasIndicator = group?.selectionMode === 'single' && variant === 'well';
	return (
		<AriaToggleButton {...props} className={composeRenderProps(props.className, (className, state) => toggleButton({ ...state, isInGroup: group != null, variant, hasIndicator, className }))}>
			{composeRenderProps(props.children, (children) => (
				<>
					{hasIndicator && <Fill />}
					{children}
				</>
			))}
		</AriaToggleButton>
	);
}
