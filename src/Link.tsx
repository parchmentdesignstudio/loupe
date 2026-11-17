import { Link as AriaLink, type LinkProps, composeRenderProps } from 'react-aria-components';
import { focusRing, tv } from './tv.js';

export const link = tv({
	extend: focusRing,
	base: 'rounded-sm text-ink underline decoration-(color:--underline) underline-offset-(--link-underline-offset) [--underline:var(--link-underline)] transition-[text-decoration-color] duration-150 ease-out motion-reduce:transition-none',
	variants: {
		isHovered: {
			true: '[--underline:var(--link-hover-underline)]',
		},
		isCurrent: {
			true: 'font-medium no-underline',
		},
		isDisabled: {
			true: 'text-muted no-underline',
		},
	},
});

export type { LinkProps };

/** A link to another page, or a place on this one. aria-current="page" marks the page you’re on */
export function Link(props: LinkProps) {
	return <AriaLink {...props} className={composeRenderProps(props.className, (className, state) => link({ ...state, className }))} />;
}
