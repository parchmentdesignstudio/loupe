import { createContext, useContext, useState } from 'react';
import {
	Button as AriaButton,
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
	type PressEvent,
} from 'react-aria-components';
import { ChevronRight } from './glyphs.js';
import { header } from './Header.js';
import { composeClassName, focusRing, tv } from './tv.js';

// The app only moves selectedRoute once the page has changed, so a pressed link would drop back to its hover fill in
// between and flicker. Each link reports its press here, and shows as current until selectedRoute moves on
const PressContext = createContext<((event: PressEvent) => void) | null>(null);

/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export function NavigationTree<T extends object>(props: NavigationTreeProps<T>) {
	const [pressed, setPressed] = useState<{ href: string; from: string | null | undefined } | null>(null);
	const selectedRoute = pressed && pressed.from === props.selectedRoute ? pressed.href : props.selectedRoute;

	const press = (event: PressEvent) => {
		const href = event.target.getAttribute('href');
		const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.getAttribute('target') === '_blank';
		if (href && props.selectedRoute !== undefined && !opensElsewhere) setPressed({ href, from: props.selectedRoute });
	};

	return (
		<PressContext.Provider value={press}>
			<AriaNavigationTree {...props} selectedRoute={selectedRoute} className={composeClassName(props.className, 'flex flex-col gap-0.5 outline-0')} />
		</PressContext.Provider>
	);
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
	base: 'flex items-center gap-2 rounded-lg px-3 py-1.5 text-control font-medium text-ink',
	variants: {
		isHovered: {
			true: 'bg-bleed/4',
		},
		isPressed: {
			true: 'bg-bleed/8',
		},
		isCurrent: {
			true: 'bg-bleed/8',
		},
		isDisabled: {
			true: 'text-muted',
		},
	},
});

/**
 * An item’s text, inside the link React Aria gives each item. Each level in steps in by 12px. An item with pages under
 * it has a chevron that turns as it opens: a button of its own, beside the link rather than in it, so a screen reader
 * can open and close it
 */
export function NavigationTreeItemContent({ children }: NavigationTreeItemContentProps) {
	const press = useContext(PressContext);
	return (
		<AriaNavigationTreeItemContent>
			{(values) => (
				<div className="relative flex">
					<AriaLink
						onPress={press ?? undefined}
						className={(state) => navigationTreeLink({ ...state, className: 'flex-1' })}
						style={{ paddingInlineStart: `calc(var(--spacing) * ${3 * values.level})`, paddingInlineEnd: values.hasChildItems ? 'calc(var(--spacing) * 9)' : undefined }}
					>
						<span className="min-w-0 flex-1">{typeof children === 'function' ? children(values) : children}</span>
					</AriaLink>
					{values.hasChildItems && (
						<AriaButton
							slot="chevron"
							className={(state) => focusRing({ ...state, className: 'absolute inset-y-0 end-1 my-auto flex size-7 items-center justify-center rounded-md text-muted outline-offset-0 hover:bg-bleed/4 hover:text-ink' })}
						>
							<ChevronRight
								className={`size-4 shrink-0 fill-none stroke-current stroke-[1.5] transition-[rotate] duration-150 ease-out motion-reduce:transition-none rtl:-scale-x-100 ${values.isExpanded ? 'rotate-90' : ''}`}
							/>
						</AriaButton>
					)}
				</div>
			)}
		</AriaNavigationTreeItemContent>
	);
}
