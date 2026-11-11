import type { ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps, composeRenderProps } from 'react-aria-components';
import type { VariantProps } from 'tailwind-variants';
import { focusRing, tv } from './tv.js';

// The states are React Aria's render props, so each variant is named for the one it answers to. The fill sits on a
// ::before. Tertiary insets it 1px so the root's background is a faux border; primary and secondary fill the whole button
// and take their edge from a shadow. Either way every variant is the same size, with a border or without
export const button = tv({
	extend: focusRing,
	base: [
		'relative z-0 inline-flex shrink-0 cursor-default items-center justify-center gap-2 rounded-lg text-control font-medium [&>svg]:my-[calc((1lh-1rem)/2)] transition-[scale,background-color,box-shadow,opacity] duration-150 ease-out motion-reduce:transition-none',
		'before:absolute before:inset-px before:-z-1 before:rounded-[calc(var(--radius-lg)-1px)] before:transition-[background-color] before:duration-150 before:ease-out motion-reduce:before:transition-none',
	],
	variants: {
		// Primary is yellow, for what a page leads with. Secondary is sage, ink's light, for where the yellow is too loud. Both
		// keep ink text in the dark too, as their fills stay light. Each sets a --fill, and a --rim a sixth darker for its
		// border; primary's turns 16° on the wheel too, so it leans orange rather than olive. A trial: the fills move to
		// tokens if they stay. The fill has to stay opaque, or the faux border shows through it, so hovers lay a wash over
		// it rather than going translucent. Outline has no fill to hide a faux border, so its line is an inset ring
		variant: {
			primary: [
				'text-pine-26',
				'[--fill:oklch(0.865_0.159_87.4)]',
				'[--rim:oklch(from_var(--fill)_calc(l*0.84)_c_calc(h-16))]',
			],
			secondary: [
				'text-pine-26',
				'[--fill:oklch(0.807_0.019_175.2)]',
				'[--rim:oklch(from_var(--fill)_calc(l*0.84)_calc(c*0.84)_h)]',
			],
			tertiary: 'bg-raised text-ink shadow-raised before:bg-raised',
			outline: 'text-ink inset-ring inset-ring-bleed/16',
			quiet: 'text-ink',
		},
		shape: {
			circle: 'rounded-full before:rounded-full',
		},
		// No set height: the padding adds to the 20px line, so 32px medium and 28px small. An icon sits on the line, as
		// text does, so a button with only an icon is as tall
		size: {
			medium: 'px-3 py-1.5',
			small: 'px-2.5 py-1',
		},
		// An icon at either end needs a little less room than text, so its side pads less
		hasStart: {
			true: '',
		},
		hasEnd: {
			true: '',
		},
		isHovered: {
			true: '',
		},
		isPressed: {
			true: 'scale-97',
		},
		isDisabled: {
			true: 'text-muted',
		},
	},
	compoundVariants: [
		// Primary and secondary. Each line is one part, and hover lightens the gradient
		{
			variant: ['primary', 'secondary'],
			class: [
				// Tertiary's shadow, with its ring as the border, in the button's own --rim. The fill covers the whole button,
				// so the ring is the only edge. The shape and drop are --shadow-raised and --drop-raised in tokens.css
				'shadow-raised [--edge:var(--rim)] before:inset-0 before:rounded-[inherit]',
				// The fill: 4% lighter at the top, to its colour at the bottom
				'before:bg-linear-to-b',
				'before:from-[color-mix(in_oklab,var(--fill),white_4%)]',
				'before:to-(color:--fill)',
				// A half-pixel line inside the edge, a shade lighter
				'before:inset-ring-[0.5px] before:inset-ring-[color-mix(in_oklab,var(--fill),white_20%)]',
				// A bevel along the bottom in the --rim's tint: a crisp line, then a soft band above it. Tailwind adds the inset
				'before:inset-shadow-[0_1px_1px_-.5px_color-mix(in_oklab,var(--fill),white_20%),0_1px_3px_-1.5px_color-mix(in_oklab,var(--fill),white_20%),0_-1px_3px_-1.5px_color-mix(in_oklab,var(--rim)_20%,transparent)]',
			],
		},
		{
			variant: ['primary', 'secondary'],
			isHovered: true,
			class: [
				'before:from-[color-mix(in_oklab,var(--fill),white_16%)]',
				'before:to-[color-mix(in_oklab,var(--fill),white_12%)]',
			],
		},
		{ variant: 'tertiary', isHovered: true, class: 'bg-linear-to-r from-bleed/4 to-bleed/4 before:bg-linear-to-r before:from-bleed/4 before:to-bleed/4' },
		{ variant: ['outline', 'quiet'], isHovered: true, class: 'bg-bleed/4' },
		// Pressed, a raised button sits down: the drop goes, leaving the edge ring, and primary and secondary's fill flattens.
		// After the hovers, so it wins while both are true
		{ variant: ['primary', 'secondary', 'tertiary'], isPressed: true, class: '[--drop-raised:transparent]' },
		{ variant: ['primary', 'secondary'], isPressed: true, class: 'before:from-(color:--fill) before:to-(color:--fill)' },
		// Disabled, a raised button goes flat and grey: the ::before goes, taking the fill, inner line and bevel with it,
		// and so does the shadow. Outline keeps its line and quiet stays bare, both with muted text
		{ variant: ['primary', 'secondary', 'tertiary'], isDisabled: true, class: 'bg-bleed/8 shadow-none before:content-none' },
		// After the sizes' padding: a circle pads its icon evenly, counting the line it sits on, so it stays round
		{ hasStart: true, size: 'medium', class: 'ps-2.5' },
		{ hasStart: true, size: 'small', class: 'ps-2' },
		{ hasEnd: true, size: 'medium', class: 'pe-2.5' },
		{ hasEnd: true, size: 'small', class: 'pe-2' },
		{ shape: 'circle', size: 'medium', class: 'px-2 py-1.5' },
		{ shape: 'circle', size: 'small', class: 'px-1.5 py-1' },
	],
	defaultVariants: {
		variant: 'primary',
		size: 'medium',
	},
});

export interface ButtonProps extends AriaButtonProps, Pick<VariantProps<typeof button>, 'variant' | 'shape' | 'size'> {
	/** An icon before the label, on the left in a left-to-right language */
	start?: ReactNode;
	/** An icon after the label, on the right in a left-to-right language */
	end?: ReactNode;
}

/** A button for any action, with an icon at the start or end if it helps. A circle holds just an icon, so it needs an aria-label */
export function Button({ variant, shape, size, start, end, ...props }: ButtonProps) {
	const hasStart = start != null;
	const hasEnd = end != null;
	return (
		<AriaButton
			{...props}
			className={composeRenderProps(props.className, (className, state) => button({ ...state, variant, shape, size, hasStart, hasEnd, className }))}
		>
			{composeRenderProps(props.children, (children) => (
				<>
					{start}
					{children}
					{end}
				</>
			))}
		</AriaButton>
	);
}
