import {
	Link as AriaLink,
	NavigationTree as AriaNavigationTree,
	NavigationTreeHeader as AriaNavigationTreeHeader,
	type NavigationTreeHeaderProps,
	NavigationTreeItem as AriaNavigationTreeItem,
	NavigationTreeItemContent as AriaNavigationTreeItemContent,
	type NavigationTreeItemContentProps,
	type NavigationTreeItemProps,
	type NavigationTreeProps,
	NavigationTreeSection as AriaNavigationTreeSection,
	type NavigationTreeSectionProps,
} from 'react-aria-components';
import { header } from './Header.js';
import { composeClassName, focusRing, tv } from './tv.js';

/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export function NavigationTree<T extends object>(props: NavigationTreeProps<T>) {
	return <AriaNavigationTree {...props} className={composeClassName(props.className, 'flex flex-col gap-0.5 outline-0')} />;
}

const section = tv({
	base: 'flex flex-col gap-0.5 not-first:mt-5',
});

export function NavigationTreeSection<T extends object>(props: NavigationTreeSectionProps<T>) {
	return <AriaNavigationTreeSection {...props} className={section({ className: props.className })} />;
}

export function NavigationTreeHeader({ children, ...props }: NavigationTreeHeaderProps) {
	return (
		<AriaNavigationTreeHeader {...props}>
			<span className={header({ className: 'block pt-0' })}>{children}</span>
		</AriaNavigationTreeHeader>
	);
}

export function NavigationTreeItem<T extends object>(props: NavigationTreeItemProps<T>) {
	return <AriaNavigationTreeItem {...props} className={composeClassName(props.className, 'outline-0')} />;
}

// The link fills its row, so the row's states are the link's: hovered, the current page and the focus ring
export const navigationTreeLink = tv({
	extend: focusRing,
	base: 'block rounded-lg px-3 py-1.5 text-body text-ink',
	variants: {
		isHovered: {
			true: 'bg-ink/5',
		},
		isPressed: {
			true: 'bg-ink/8',
		},
		isCurrent: {
			true: 'bg-ink/8 font-medium',
		},
		isDisabled: {
			true: 'opacity-40',
		},
	},
});

/** An item’s text, inside the link React Aria gives each item */
export function NavigationTreeItemContent({ children }: NavigationTreeItemContentProps) {
	return (
		<AriaNavigationTreeItemContent>
			{(values) => <AriaLink className={(state) => navigationTreeLink(state)}>{typeof children === 'function' ? children(values) : children}</AriaLink>}
		</AriaNavigationTreeItemContent>
	);
}
