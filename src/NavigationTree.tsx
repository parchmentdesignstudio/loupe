import { type ReactNode, createContext, useContext, useState } from 'react';
import {
	Button as AriaButton,
	Link as AriaLink,
	NavigationTree as AriaNavigationTree,
	NavigationTreeHeader as AriaNavigationTreeHeader,
	type NavigationTreeHeaderProps,
	NavigationTreeItem as AriaNavigationTreeItem,
	NavigationTreeItemContent as AriaNavigationTreeItemContent,
	type NavigationTreeItemContentProps as AriaNavigationTreeItemContentProps,
	type NavigationTreeItemProps,
	type NavigationTreeProps as AriaNavigationTreeProps,
	NavigationTreeSection as AriaNavigationTreeSection,
	type NavigationTreeSectionProps,
	type Key,
	type PressEvent,
} from 'react-aria-components';
import { TriangleDown } from './glyphs.js';
import { header } from './Header.js';
import { composeClassName, focusRing, tv } from './tv.js';

// The app only moves selectedRoute once the page has changed, so a pressed link would drop back to its hover fill in
// between and flicker. Each link reports its press here, and shows as current until selectedRoute moves on
export type { NavigationTreeHeaderProps, NavigationTreeItemProps, NavigationTreeSectionProps };

const TreeContext = createContext<{ press: (event: PressEvent) => void; hasTitles: boolean; hasIcons: boolean; hasFolderTriangles: boolean } | null>(null);

export interface NavigationTreeProps<T extends object> extends AriaNavigationTreeProps<T> {
	/** The top-level items are small titles that fold what's under them, and what's under them starts at the edge */
	hasTitles?: boolean;
	/** The top-level items have icons, so what's under them lines up with their text rather than their icon */
	hasIcons?: boolean;
	/** A folder shows a triangle to open it. Without one, pressing the folder opens it, so give it no href. A title keeps its triangle */
	hasFolderTriangles?: boolean;
}

/** Links to the pages of a site or tool, in sections. The item whose href matches selectedRoute is the current page */
export function NavigationTree<T extends object>({ hasTitles = false, hasIcons = false, hasFolderTriangles = true, ...props }: NavigationTreeProps<T>) {
	const [pressed, setPressed] = useState<{ href: string; from: string | null | undefined } | null>(null);
	const selectedRoute = pressed && pressed.from === props.selectedRoute ? pressed.href : props.selectedRoute;

	const press = (event: PressEvent) => {
		const href = event.target.getAttribute('href');
		const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.getAttribute('target') === '_blank';
		if (href && props.selectedRoute !== undefined && !opensElsewhere) setPressed({ href, from: props.selectedRoute });
	};

	return (
		<TreeContext.Provider value={{ press, hasTitles, hasIcons, hasFolderTriangles }}>
			<AriaNavigationTree {...props} selectedRoute={selectedRoute} className={composeClassName(props.className, 'flex flex-col gap-0.5 outline-0')} />
		</TreeContext.Provider>
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
	base: 'flex cursor-default items-center gap-2 rounded-(--navigation-tree-item-radius) px-(--navigation-tree-item-padding-x) py-(--navigation-tree-item-padding-y) text-control font-(--navigation-tree-item-font-weight) text-(color:--navigation-tree-item-text,var(--color-ink)) in-data-[show-focus]:outline-2',
	variants: {
		isHovered: {
			true: 'bg-bleed/4',
		},
		isPressed: {
			true: 'bg-bleed/8',
		},
		isCurrent: {
			true: 'text-(color:--navigation-tree-item-current-text,var(--color-accent))',
		},
		isDisabled: {
			true: 'text-muted',
		},
	},
});

// What React Aria hands an item's content, for its tree's state
type Values = Parameters<Extract<AriaNavigationTreeItemContentProps['children'], (...args: never[]) => unknown>>[0];

// Where each depth's text and fill start, in px. Each depth steps in 12px, and its fill starts 6px before its text,
// clear of the current page's mark under the parent's first letter. Under an item with an icon, its 14px and 4px gap take
// the text 6px further, so it lines up with the item's name
const textAt = (depth: number, hasIcons = false) => 12 * Math.max(depth, 1) + (hasIcons && depth > 1 ? 6 : 0);
const fillAt = (depth: number, hasIcons = false) => (depth < 2 ? 0 : textAt(depth, hasIcons) - 6);

/** The item before this one under the same parent, skipping the content node React Aria keeps among them */
function previous(collection: Values['state']['collection'], key: Key) {
	let next = collection.getItem(key)?.prevKey;
	while (next != null) {
		const node = collection.getItem(next);
		if (node?.type === 'item') return node;
		next = node?.prevKey;
	}
	return null;
}

// The current page's mark, in the accent, under the first letter of its folder's name, or its icon, as tall as its text.
// Nothing at the top depth, which has no folder to sit under
function CurrentMark({ depth, hasIcons }: { depth: number; hasIcons: boolean }) {
	if (depth < 2) return null;
	return <span aria-hidden="true" className="pointer-events-none absolute inset-y-1 w-0.5 rounded-full bg-accent" style={{ insetInlineStart: textAt(depth - 1, hasIcons) - 0.5 }} />;
}

// The triangle is drawn at 12px rather than its 16px, so it sits quietly by the text. It points along the line while
// closed, and turns down to open
const triangle = 'size-3 shrink-0 fill-current transition-transform duration-fast ease-standard motion-reduce:transition-none';

/**
 * An item’s text, with the link React Aria gives each item laid over its row, so the text can sit beside the triangle that
 * opens it. The triangle is a button of its own, over the link rather than in it, so a screen reader can open and close it.
 * Each depth steps in 12px. In a tree with titles, the top level are titles, and a title that isn't a link folds when it's
 * pressed
 */
export interface NavigationTreeItemContentProps extends AriaNavigationTreeItemContentProps {
	/** An icon before the text, in its colour: 14px beside an item's name, and 12px beside a title's smaller text */
	icon?: ReactNode;
}

export function NavigationTreeItemContent({ children, icon }: NavigationTreeItemContentProps) {
	const tree = useContext(TreeContext);
	return (
		<AriaNavigationTreeItemContent>
			{(values) => {
				const text = typeof children === 'function' ? children(values) : children;
				const isTitle = !!tree?.hasTitles && values.level === 1;
				const depth = tree?.hasTitles ? values.level - 1 : values.level;
				const isFirst = !previous(values.state.collection, values.id);
				// Pages inside a folder are muted, so the folders and the current page stand out
				const isPage = depth > 1 && !values.hasChildItems;
				return (
					<div className={['group/row relative flex items-center', isTitle && !isFirst && 'mt-5'].filter(Boolean).join(' ')}>
						<AriaLink
							onPress={tree?.press}
							className={(state) => navigationTreeLink({ ...state, className: 'absolute inset-y-0 end-0' })}
							style={{ insetInlineStart: fillAt(depth, tree?.hasIcons) }}
						>
							<span className="sr-only">{text}</span>
						</AriaLink>
						{!isTitle && values.isCurrent && <CurrentMark depth={depth} hasIcons={!!tree?.hasIcons} />}
						<span
							aria-hidden="true"
							className={[
								'pointer-events-none relative flex min-w-0 items-center gap-1 py-1 group-has-[[data-disabled]]/row:text-muted',
								isTitle
									? 'font-mono text-label text-muted group-has-[[aria-current=page]]/row:text-ink'
									: isPage
										? 'text-control text-muted group-hover/row:text-ink group-has-[[aria-current=page]]/row:font-(--weight-medium) group-has-[[aria-current=page]]/row:text-ink'
										: 'text-control font-(--weight-medium) text-ink',
							].join(' ')}
							style={{ paddingInlineStart: textAt(depth, tree?.hasIcons) }}
						>
							{icon && <span className={isTitle ? 'flex shrink-0 [&>svg]:size-3' : 'flex shrink-0 [&>svg]:size-3.5'}>{icon}</span>}
							<span className="min-w-0 truncate">{text}</span>
						</span>
						{values.hasChildItems && (isTitle || tree?.hasFolderTriangles !== false) && (
							<AriaButton
								slot="chevron"
								className={(state) =>
									// The triangle sits right by the text, in its colour, with the space to press it reaching past it
									focusRing({ ...state, className: ['relative flex size-4 shrink-0 cursor-default items-center justify-center rounded-sm outline-offset-1 after:absolute after:-inset-1', isTitle ? 'text-muted' : 'text-ink'].join(' ') })
								}
							>
								<TriangleDown className={values.isExpanded ? triangle : `${triangle} -rotate-90 rtl:rotate-90`} />
							</AriaButton>
						)}
					</div>
				);
			}}
		</AriaNavigationTreeItemContent>
	);
}
