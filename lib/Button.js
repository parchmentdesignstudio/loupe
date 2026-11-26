import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button as AriaButton, composeRenderProps } from 'react-aria-components';
import { ProgressCircle } from './ProgressBar.js';
import { focusRing, tv } from './tv.js';
// The states are React Aria's render props, so each variant is named for the one it answers to. The fill sits on a
// ::before. Secondary insets it 1px so the root's background is a faux border; primary and quiet fill the whole button
// and take their edge from a shadow. Either way every variant is the same size, with a border or without
export const button = tv({
    extend: focusRing,
    base: [
        'relative z-0 inline-flex shrink-0 cursor-default items-center justify-center rounded-(--button-radius) font-(family-name:--typeface-body) text-control font-(--button-font-weight) [--shadow-raised-color:var(--button-shadow)] transition-[background-color,box-shadow,opacity] duration-fast ease-standard motion-reduce:transition-none',
        // What's inside presses in as one, so the button's edge and shadow stay where they are
        '*:transition-[scale] *:duration-fast *:ease-standard motion-reduce:*:transition-none',
        'before:absolute before:inset-px before:-z-1 before:rounded-[calc(var(--button-radius)-1px)] before:transition-[background-color,box-shadow] before:duration-fast before:ease-standard motion-reduce:before:transition-none',
    ],
    variants: {
        // Primary is marigold, the brand's yellow, for what a page leads with. On a marigold ground it nearly blends in, and its
        // rim and shadow lift it. Secondary is white and raised, for most actions. Quiet is slate, the brand's light partner
        // to pine, for a lead quieter than marigold. Primary and quiet keep ink text in the dark too, as their fills stay light. Each sets a --fill, and a --rim a sixth darker for its
        // border; primary's turns 16° on the wheel too, so it leans orange rather than olive. The fills and their
        // text are tokens, as --button-primary-fill, so a site can recolour them. The fill has to stay opaque, or the faux border shows through it, so hovers lay a wash over
        // it rather than going translucent. Outline is secondary's edge alone, outside the box as the others' are, so it lines up with them
        variant: {
            primary: [
                'text-(color:--button-primary-text,var(--color-on-primary))',
                '[--fill:var(--button-primary-fill,var(--color-primary))]',
                '[--rim:oklch(from_var(--fill)_calc(l*var(--button-filled-rim))_c_calc(h-16))]',
                'shadow-button-primary before:shadow-button-primary-bevel',
            ],
            // In the dark, surface's fill and the dark edge, as a chosen toggle has, so it stands clear of the panel and of outline.
            // There the edge is half a pixel, as a field's is, since a full pixel of dark makes the button look a pixel smaller
            secondary: 'bg-[light-dark(var(--color-raised),var(--color-surface))] text-ink shadow-button [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),transparent)] [--fine-edge:light-dark(transparent,var(--dark-edge))] before:bg-[light-dark(var(--color-raised),var(--color-surface))]',
            quiet: [
                'text-(color:--button-quiet-text,var(--color-on-quiet))',
                '[--fill:var(--button-quiet-fill,var(--color-quiet))]',
                '[--rim:oklch(from_var(--fill)_calc(l*var(--button-filled-rim))_calc(c*0.84)_h)]',
                'shadow-button-quiet before:shadow-button-quiet-bevel',
            ],
            // For an action that destroys something. Red in both themes, as the danger token turns light in the dark
            danger: [
                'text-(color:--button-danger-text,var(--color-on-danger-fill))',
                '[--fill:var(--button-danger-fill,var(--color-danger-fill))]',
                '[--rim:oklch(from_var(--fill)_calc(l*var(--button-filled-rim))_c_h)]',
                'shadow-button-danger before:shadow-button-danger-bevel',
                '[--top-line-strength:var(--button-danger-top-line-dark-strength)] [--bottom-line-strength:var(--button-danger-bottom-line-dark-strength)]',
            ],
            // Fainter in the dark, where secondary's lighter fill would otherwise be all that tells them apart
            outline: 'text-ink shadow-[0_0_0_1px_var(--edge)] [--edge:light-dark(color-mix(in_oklab,var(--bleed)_12%,transparent),color-mix(in_oklab,var(--bleed)_8%,transparent))]',
            ghost: 'text-ink',
        },
        // Rounded corners, from --button-radius, or full: a pill round a label and a circle round an icon
        shape: {
            rounded: '',
            full: 'rounded-full before:rounded-full',
        },
        // No set height: the padding, a token for each size, adds to the 20px line. An icon sits on the line, as text does,
        // so a button with only an icon is as tall. The label brings 4px of its own each side, tucking an icon closer to the
        // corner than text. A button with just an icon pads it evenly, so it's square, or a circle when full
        size: {
            medium: 'px-(--button-padding-x) py-(--button-padding-y)',
            small: 'px-(--button-small-padding-x) py-(--button-small-padding-y)',
        },
        isHovered: {
            true: '',
        },
        isPressed: {
            true: '*:scale-(--button-press-scale)',
        },
        isDisabled: {
            true: 'text-muted',
        },
    },
    compoundVariants: [
        // Primary, quiet and danger: the colours their shadows and bevels are drawn in. The shadows themselves are each
        // variant's in styles/theme.css, side by side. Each line is one part, and hover lightens the gradient
        {
            variant: ['primary', 'quiet', 'danger'],
            class: [
                // Every amount here is a --button-filled-* token in styles/components.css, which is where to tweak them. Colours
                // go through variables, as Tailwind can't tell an arbitrary light-dark() is a colour and drops the class.
                // The ring is the border, in the button's own --rim, and the fill covers the whole button, so it's the only
                // edge. In the dark a darker rim muddies the fill against the ground, so there's none, and the lines inside
                // do its job. Under it, raised's shadow, whose first layer in the light is a fainter, wider contact shadow
                '[--contact:light-dark(color-mix(in_oklab,var(--shadow-raised-color)_var(--button-filled-contact),transparent),transparent)] [--close:light-dark(transparent,var(--shadow-raised-color))]',
                '[--edge:light-dark(var(--rim),transparent)]',
                'before:inset-0 before:rounded-[inherit]',
                // The fill: lighter at the top, to its colour at the bottom, or in the light a touch deeper than it
                '[--fill-bottom:light-dark(oklch(from_var(--fill)_calc(l_-_var(--button-filled-depth))_calc(c*var(--button-filled-depth-chroma))_h),var(--fill))]',
                'before:bg-linear-to-b before:from-[color-mix(in_oklab,var(--fill),white_var(--button-filled-light))] before:to-(color:--fill-bottom)',
                // The bevel, a crisp light line under the top and a soft band below it, and a band of the --rim's colour along
                // the bottom. In the light the bevel's line has a highlight over it, and a fainter one along the bottom
                '[--bevel:color-mix(in_oklab,var(--fill),white_var(--button-filled-bevel))] [--bevel-line:light-dark(var(--bevel),transparent)]',
                '[--highlight:light-dark(oklch(from_var(--bevel)_calc(l_+_var(--button-filled-highlight))_calc(c*var(--button-filled-highlight-chroma))_h),transparent)] [--highlight-bottom:color-mix(in_oklab,var(--highlight)_var(--button-filled-highlight-bottom),transparent)]',
                '[--rim-shade:light-dark(var(--rim),color-mix(in_oklab,var(--rim)_var(--button-filled-shade-dark),transparent))] [--rim-deep:light-dark(transparent,var(--rim))]',
                // In the dark, a bright line along the top and a lighter one along the bottom, as secondary's top light is. Danger
                // sets how much they show, as they're harsh on red
                '[--top-line:light-dark(transparent,color-mix(in_oklab,color-mix(in_oklab,var(--fill),white_var(--button-filled-top-line-dark))_var(--top-line-strength,100%),transparent))]',
                '[--bottom-line:light-dark(transparent,color-mix(in_oklab,color-mix(in_oklab,var(--fill),white_var(--button-filled-bottom-line-dark))_var(--bottom-line-strength,var(--button-filled-bottom-line-dark-strength)),transparent))]',
            ],
        },
        {
            variant: ['primary', 'quiet', 'danger'],
            isHovered: true,
            class: [
                'before:from-[color-mix(in_oklab,var(--fill),white_calc(var(--button-filled-hover-light)+var(--button-filled-light)))]',
                'before:to-[color-mix(in_oklab,var(--fill),white_var(--button-filled-hover-light))]',
            ],
        },
        // Lifted: the contact shadow tightens, and two deeper layers join, as secondary's do
        { variant: 'primary', isHovered: true, class: 'shadow-button-primary-lifted' },
        { variant: 'quiet', isHovered: true, class: 'shadow-button-quiet-lifted' },
        { variant: 'danger', isHovered: true, class: 'shadow-button-danger-lifted' },
        { variant: 'secondary', isHovered: true, class: 'shadow-button-lifted bg-linear-to-r from-bleed/4 to-bleed/4 before:bg-linear-to-r before:from-bleed/4 before:to-bleed/4' },
        { variant: ['outline', 'ghost'], isHovered: true, class: 'bg-bleed/4' },
        // Hovered, a raised button lifts a little, as --shadow-button-lifted. Pressed, it sits down: the shadow goes, leaving
        // the edge ring, and primary and quiet lose their inner line and bevel as their fill flattens.
        // After the hovers, so it wins while both are true
        { variant: ['primary', 'secondary', 'quiet', 'danger'], isPressed: true, class: '[--shadow-raised-color:transparent]' },
        { variant: ['primary', 'quiet', 'danger'], isPressed: true, class: 'before:from-(color:--fill) before:to-(color:--fill) before:shadow-none' },
        // Disabled, a raised button goes flat and grey: the ::before goes, taking the fill, inner line and bevel with it,
        // and so does the shadow. Outline keeps its line and ghost stays bare, both with muted text
        { variant: ['primary', 'secondary', 'quiet', 'danger'], isDisabled: true, class: 'bg-bleed/12 shadow-none before:content-none' },
    ],
    defaultVariants: {
        variant: 'primary',
        shape: 'rounded',
        size: 'medium',
    },
});
// Browsers snap text to whole pixels, so a lift under 1px does nothing and 1px lifts it too far. Left on its line, a
// label's capitals sit a touch low and its ascenders centre, which reads as centred. Its room either side is in em, 4px
// at the 13px control size and 5px at the 16px it goes to on a phone, rounded to the pixel, so it grows with the text, as the gap to an icon does
const label = 'px-[round(1em*4/13,1px)]';
// The icons and label together, so a press scales them around one centre and the gap between them with them
const contents = 'inline-flex items-center gap-[round(1em*4/13,1px)] [&>svg]:my-[calc((1lh-1rem)/2)]';
// Pending, the contents fade rather than go, so the button keeps its width and its name is still read out, and a
// spinner takes their place in the middle
const pending = 'opacity-0';
const spinner = 'absolute inset-0 m-auto';
// Text is a label, with room either side. Anything else, such as an icon, is the button's only content, padded evenly
const isText = (children) => typeof children === 'string' || (Array.isArray(children) && children.some((child) => typeof child === 'string'));
export function Button({ variant, shape, size, start, end, ...props }) {
    return (_jsx(AriaButton, { ...props, className: composeRenderProps(props.className, (className, state) => button({ ...state, variant, shape, size, className })), children: composeRenderProps(props.children, (children, { isPending }) => (_jsxs(_Fragment, { children: [_jsxs("span", { className: isPending ? `${contents} ${pending}` : contents, children: [start, isText(children) ? _jsx("span", { className: label, children: children }) : children, end] }), isPending && _jsx(ProgressCircle, { "aria-label": "Pending", isIndeterminate: true, className: spinner })] }))) }));
}
