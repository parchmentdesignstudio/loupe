import { Link as AriaLink, type LinkProps as AriaLinkProps, composeRenderProps } from 'react-aria-components';
import { focusRing, tv } from './tv.js';

export const link = tv({
	extend: focusRing,
	base: 'rounded-sm text-ink underline decoration-ink/32 underline-offset-2 transition-[text-decoration-color] duration-150 ease-out motion-reduce:transition-none',
	variants: {
		isHovered: {
			true: 'decoration-ink',
		},
		isCurrent: {
			true: 'font-medium no-underline',
		},
		isDisabled: {
			true: 'no-underline opacity-40',
		},
	},
});

export interface LinkProps extends AriaLinkProps {}

/** A link to another page, or a place on this one. aria-current="page" marks the page you’re on */
export function Link(props: LinkProps) {
	return <AriaLink {...props} className={composeRenderProps(props.className, (className, state) => link({ ...state, className }))} />;
}
