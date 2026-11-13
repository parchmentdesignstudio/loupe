import type { ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps, composeRenderProps } from 'react-aria-components';
import type { VariantProps } from 'tailwind-variants';
import { ProgressCircle } from './ProgressBar.js';
import { focusRing, tv } from './tv.js';

// The states are React Aria's render props, so each variant is named for the one it answers to. The fill sits on a
// ::before. Secondary insets it 1px so the root's background is a faux border; primary and accent fill the whole button
// and take their edge from a shadow. Either way every variant is the same size, with a border or without
export const button = tv({
	extend: focusRing,
	base: [
		'relative z-0 inline-flex shrink-0 cursor-default items-center justify-center rounded-[var(--button-radius,var(--radius-lg))] text-control font-medium transition-[background-color,box-shadow,opacity] duration-150 ease-out motion-reduce:transition-none',
		// What's inside presses in as one, so the button's edge and shadow stay where they are
		'*:transition-[scale] *:duration-150 *:ease-out motion-reduce:*:transition-none',
		'before:absolute before:inset-px before:-z-1 before:rounded-[calc(var(--button-radius,var(--radius-lg))-1px)] before:transition-[background-color,box-shadow] before:duration-150 before:ease-out motion-reduce:before:transition-none',
	],
	variants: {
		// Primary is marigold, the brand's yellow, for what a page leads with. On a marigold ground it nearly blends in, and its
		// rim and shadow lift it. Secondary is white and raised, for most actions. Accent is slate, the brand's light partner
		// to pine, for a lead quieter than marigold. Primary and accent keep ink text in the dark too, as their fills stay light. Each sets a --fill, and a --rim a sixth darker for its
		// border; primary's turns 16° on the wheel too, so it leans orange rather than olive. A trial: the fills move to
		// tokens if they stay. The fill has to stay opaque, or the faux border shows through it, so hovers lay a wash over
		// it rather than going translucent. Outline is secondary's edge alone, outside the box as the others' are, so it lines up with them
		variant: {
			primary: [
				'text-pine-26',
				'[--fill:oklch(0.834_0.153_85.6)]',
				'[--rim:oklch(from_var(--fill)_calc(l*0.84)_c_calc(h-16))]',
			],
			// In the dark, surface's fill and a stronger edge, as a chosen toggle has, so it stands clear of the panel and of outline
			secondary:
				'bg-[light-dark(var(--color-raised),var(--color-surface))] text-ink shadow-button [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),color-mix(in_oklab,var(--bleed)_16%,transparent))] before:bg-[light-dark(var(--color-raised),var(--color-surface))]',
			accent: [
				'text-pine-26',
				'[--fill:oklch(0.858_0.027_196.7)]',
				'[--rim:oklch(from_var(--fill)_calc(l*0.84)_calc(c*0.84)_h)]',
			],
			// For an action that destroys something. Red in both themes, as the danger token turns light in the dark, so its
			// text stays white
			danger: [
				'text-white',
				'[--fill:var(--color-red-50)]',
				'[--rim:oklch(from_var(--fill)_calc(l*0.84)_c_h)]',
			],
			// Fainter in the dark, where secondary's lighter fill would otherwise be all that tells them apart
			outline: 'text-ink shadow-[0_0_0_1px_var(--edge)] [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),color-mix(in_oklab,var(--bleed)_8%,transparent))]',
			ghost: 'text-ink',
		},
		// Rounded corners, or full: a pill round a label and a circle round an icon. Rounded, inside a rounded box a button can
		// set --button-radius to the box's radius less the gap around it, and sit concentric
		shape: {
			rounded: '',
			full: 'rounded-full before:rounded-full',
		},
		// No set height: the padding adds to the 20px line, so 32px medium and 28px small. An icon sits on the line, as
		// text does, so a button with only an icon is as tall. The label brings 4px of its own each side, so a side
		// with text pads 12px (10px small) and a side with an icon 8px (6px), tucking it into the corner. A button with
		// just an icon pads it evenly, so it's square, or a circle when full
		size: {
			medium: 'px-2 py-1.5',
			small: 'px-1.5 py-1',
		},
		isHovered: {
			true: '',
		},
		isPressed: {
			true: '*:scale-95',
		},
		isDisabled: {
			true: 'text-muted',
		},
	},
	compoundVariants: [
		// Primary and accent. Each line is one part, and hover lightens the gradient
		{
			variant: ['primary', 'accent', 'danger'],
			class: [
				// Secondary's shadow, with its ring as the border, in the button's own --rim. The fill covers the whole button,
				// so the ring is the only edge. In the dark a darker rim muddies the fill against the ground, so there's none,
				// and the inner line below does its job. The shape and drop are --shadow-button and --drop-raised in tokens.css
				'shadow-button [--edge:light-dark(var(--rim),transparent)] before:inset-0 before:rounded-[inherit]',
				// The fill: 4% lighter at the top, to its colour at the bottom
				'before:bg-linear-to-b',
				'before:from-[color-mix(in_oklab,var(--fill),white_4%)]',
				'before:to-(color:--fill)',
				// A line inside the edge, a shade lighter, and twice that in the dark, where it's the only edge
				'before:inset-ring-[1px] before:inset-ring-[light-dark(color-mix(in_oklab,var(--fill),white_20%),color-mix(in_oklab,var(--fill),white_40%))]',
				// A bevel along the bottom in the --rim's tint: a crisp line, then a soft band above it. Tailwind adds the inset
				'before:inset-shadow-[0_1px_1px_-.5px_color-mix(in_oklab,var(--fill),white_20%),0_1px_3px_-1.5px_color-mix(in_oklab,var(--fill),white_20%),0_-1px_3px_-1.5px_color-mix(in_oklab,var(--rim)_20%,transparent)]',
			],
		},
		{
			variant: ['primary', 'accent', 'danger'],
			isHovered: true,
			class: [
				'shadow-button-lifted',
				'before:from-[color-mix(in_oklab,var(--fill),white_16%)]',
				'before:to-[color-mix(in_oklab,var(--fill),white_12%)]',
			],
		},
		{ variant: 'secondary', isHovered: true, class: 'shadow-button-lifted bg-linear-to-r from-bleed/4 to-bleed/4 before:bg-linear-to-r before:from-bleed/4 before:to-bleed/4' },
		{ variant: ['outline', 'ghost'], isHovered: true, class: 'bg-bleed/4' },
		// Hovered, a raised button lifts a little, as --shadow-button-lifted. Pressed, it sits down: the drop goes, leaving
		// the edge ring, and primary and accent lose their inner line and bevel as their fill flattens.
		// After the hovers, so it wins while both are true
		{ variant: ['primary', 'secondary', 'accent', 'danger'], isPressed: true, class: '[--drop-raised:transparent]' },
		{ variant: ['primary', 'accent', 'danger'], isPressed: true, class: 'before:from-(color:--fill) before:to-(color:--fill) before:inset-ring-0 before:inset-shadow-none' },
		// Disabled, a raised button goes flat and grey: the ::before goes, taking the fill, inner line and bevel with it,
		// and so does the shadow. Outline keeps its line and ghost stays bare, both with muted text
		{ variant: ['primary', 'secondary', 'accent', 'danger'], isDisabled: true, class: 'bg-bleed/12 shadow-none before:content-none' },
	],
	defaultVariants: {
		variant: 'primary',
		shape: 'rounded',
		size: 'medium',
	},
});

// Browsers snap text to whole pixels, so a lift under 1px does nothing and 1px lifts it too far. Left on its line, a
// label's capitals sit a touch low and its ascenders centre, which reads as centred
const label = 'px-1';
// The icons and label together, so a press scales them around one centre and the gap between them with them
const contents = 'inline-flex items-center gap-1 [&>svg]:my-[calc((1lh-1rem)/2)]';
// Pending, the contents fade rather than go, so the button keeps its width and its name is still read out, and a
// spinner takes their place in the middle
const pending = 'opacity-0';
const spinner = 'absolute inset-0 m-auto';

export interface ButtonProps extends AriaButtonProps, Pick<VariantProps<typeof button>, 'variant' | 'shape' | 'size'> {
	/** An icon before the label, on the left in a left-to-right language */
	start?: ReactNode;
	/** An icon after the label, on the right in a left-to-right language */
	end?: ReactNode;
	/** Shows a spinner in place of the label while what it started is under way, such as a save. It can still be focused, but
	 * not pressed, and a screen reader hears it’s busy */
	isPending?: boolean;
}

// Text is a label, with room either side. Anything else, such as an icon, is the button's only content, padded evenly
const isText = (children: ReactNode) => typeof children === 'string' || (Array.isArray(children) && children.some((child) => typeof child === 'string'));

/**
 * A button for any action, with an icon at the start or end if it helps. With just an icon as its child it's square, or
 * a circle when its shape is full, and needs an aria-label. isPending spins while its action runs
 */
export function Button({ variant, shape, size, start, end, ...props }: ButtonProps) {
	return (
		<AriaButton {...props} className={composeRenderProps(props.className, (className, state) => button({ ...state, variant, shape, size, className }))}>
			{composeRenderProps(props.children, (children, { isPending }) => (
				<>
					<span className={isPending ? `${contents} ${pending}` : contents}>
						{start}
						{isText(children) ? <span className={label}>{children}</span> : children}
						{end}
					</span>
					{isPending && <ProgressCircle aria-label="Pending" isIndeterminate className={spinner} />}
				</>
			))}
		</AriaButton>
	);
}
