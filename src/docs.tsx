import { type ReactNode, type Ref, useEffect, useState } from 'react';
import { Autocomplete, useFilter } from 'react-aria-components';
import { Breadcrumb, Breadcrumbs } from './Breadcrumbs.js';
import { Button } from './Button.js';
import { Dialog, Modal } from './Dialog.js';
import { Drawer, DrawerTrigger } from './Drawer.js';
import { Ellipsis, MagnifyingGlass } from './glyphs.js';
import { ListBox, ListBoxItem } from './ListBox.js';
import { Navigation } from './Navigation.js';
import { SearchField } from './SearchField.js';
import { Tooltip, TooltipTrigger } from './Tooltip.js';

// The frame of a design system's docs, as Loupe's own are laid out: its pages in a sidebar on the ground, and the page
// on a panel that scrolls inside, under a bar with where it sits and its tools. On phones a bar across the top, with
// the pages in a drawer. It's coloured by the roles alone, so a site that re-sets them has it in its own colours

export interface DocsCrumb {
	name: string;
	/** Where it goes. A group, which has no page, has none */
	href?: string;
}

export interface DocsShellProps {
	/** The system's logo and name, with its version, at the top of the sidebar and the phone bar */
	brand: ReactNode;
	/** The pages, as a NavigationTree, in the sidebar and the phone's drawer */
	nav: ReactNode;
	/** Names the pages for a screen reader */
	navLabel: string;
	/** Where the page sits, from the system's home down. On phones the first is left out, as the bar above shows it */
	trail: DocsCrumb[];
	/** Before the breadcrumbs, such as a menu of the page's sections */
	barStart?: ReactNode;
	/** At the bar's end, on wider screens, such as search */
	actions?: ReactNode;
	/** At the phone bar's end, before the button that opens the pages */
	phoneActions?: ReactNode;
	/** Under the pages in the phone's drawer */
	drawerEnd?: ReactNode;
	/** Beside the page under the bar, such as settings */
	aside?: ReactNode;
	/** The page's address. When it changes, the phone's drawer closes to show it */
	current?: string;
	/** The panel that scrolls, for anything that follows its scroll */
	scrollerRef?: Ref<HTMLDivElement>;
	children: ReactNode;
}

export function DocsShell({ brand, nav, navLabel, trail, barStart, actions, phoneActions, drawerEnd, aside, current, scrollerRef, children }: DocsShellProps) {
	const [isOpen, setOpen] = useState(false);
	const [shown, setShown] = useState(current);
	if (shown !== current) {
		setShown(current);
		setOpen(false);
	}
	return (
		<div className="font-sans text-body text-ink md:flex">
			{/* Navigation has its own button for phones, which the phone bar takes the place of */}
			<div className="contents max-md:hidden">
				<Navigation aria-label={navLabel} className="md:border-r-0">
					{/* As tall as the page's bar and level with it, so the logo lines up with the breadcrumbs */}
					<div className="-mt-4 flex h-12 shrink-0 items-center gap-2.5 px-3">{brand}</div>
					{nav}
				</Navigation>
			</div>
			<header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-ground px-4 py-2 [--bleed:var(--ground-bleed)] md:hidden">
				<div className="flex items-center gap-2.5">{brand}</div>
				<div className="-mr-1.5 flex items-center gap-1">
					{phoneActions}
					<DrawerTrigger isOpen={isOpen} onOpenChange={setOpen}>
						<Button variant="ghost" shape="full" size="small" aria-label={navLabel}>
							<Ellipsis />
						</Button>
						<Drawer position="end" aria-label={navLabel}>
							<div className="flex flex-col gap-6">
								{nav}
								{drawerEnd && <div className="flex flex-col gap-6 px-3">{drawerEnd}</div>}
							</div>
						</Drawer>
					</DrawerTrigger>
				</div>
			</header>
			{/* On wider screens the page is a card that scrolls inside, so what's beside it stays in view. Raised over the
			    sticky columns either side, which would otherwise paint over its shadow */}
			<div ref={scrollerRef} className="min-w-0 flex-1 bg-panel md:relative md:z-1 md:my-2 md:mr-2 md:h-[calc(100dvh-1rem)] md:overflow-y-auto md:rounded-xl md:shadow-panel">
				{/* The card's own bleed, so lines inside suit it, while its shadow keeps the ground's */}
				<div className="flex min-h-full flex-col [--bleed:var(--panel-bleed)]">
					{/* Sticks below the phone's header, which is as tall as its 28px buttons and its padding */}
					<div className="sticky top-11 z-10 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-bleed/8 bg-panel px-4 md:top-0 md:px-5">
						<div className="flex min-w-0 flex-1 items-center gap-2">
							{barStart}
							<Breadcrumbs>
								{trail.map((crumb, index) => (
									<Breadcrumb key={`${index}${crumb.name}`} href={crumb.href} className="first:max-md:hidden">
										{crumb.name}
									</Breadcrumb>
								))}
							</Breadcrumbs>
						</div>
						{actions && <div className="-mr-1.5 flex items-center gap-1 max-md:hidden">{actions}</div>}
					</div>
					{/* Clipped, not hidden, so an aside past the card's edge can't scroll it sideways */}
					<div className="flex flex-1 overflow-x-clip">
						<main className="min-w-0 flex-1">{children}</main>
						{aside}
					</div>
				</div>
			</div>
		</div>
	);
}

export interface DocsPageProps {
	/** The page's name and what it is */
	header: ReactNode;
	/** Its sections, beside it on wide screens */
	contents?: ReactNode;
	/** As wide as the panel, for what needs the room, such as a canvas. Otherwise a column that suits reading */
	isWide?: boolean;
	children: ReactNode;
}

/** A page in DocsShell: its header over what it shows, with its sections beside them from the top on wide screens */
export function DocsPage({ header, contents, isWide, children }: DocsPageProps) {
	const column = isWide ? '' : 'mx-auto max-w-[40rem]';
	return (
		<div className={contents ? 'xl:grid xl:grid-cols-[13rem_minmax(0,1fr)] xl:items-start' : undefined}>
			<div className="px-4 pt-10 pb-10 md:px-10 xl:col-start-2">
				<div className={column}>{header}</div>
			</div>
			{contents}
			<div className="min-w-0 px-4 pb-10 md:px-10 xl:col-start-2 xl:row-start-2">
				<div className={`flex flex-col gap-10 ${column}`}>{children}</div>
			</div>
		</div>
	);
}

/** A small pill beside the brand, such as its version */
export function DocsBadge({ children }: { children: ReactNode }) {
	return <span className="rounded-full bg-bleed/8 px-2 py-0.5 font-mono text-label text-muted">{children}</span>;
}

export interface DocsSearchButtonProps {
	onPress: () => void;
	/** In place of the magnifying glass */
	icon?: ReactNode;
	/** A tooltip, such as Search ⌘K. Left out on phones */
	tooltip?: string;
}

/** Opens DocsSearch */
export function DocsSearchButton({ onPress, icon, tooltip }: DocsSearchButtonProps) {
	const button = (
		<Button variant="ghost" shape="full" size="small" aria-label="Search" onPress={onPress}>
			{icon ?? <MagnifyingGlass />}
		</Button>
	);
	if (!tooltip) return button;
	return (
		<TooltipTrigger>
			{button}
			<Tooltip>{tooltip}</Tooltip>
		</TooltipTrigger>
	);
}

export interface DocsSearchPage {
	/** Where it is, which is also its key */
	href: string;
	name: string;
	/** What it's in, shown at the row's end */
	group: string;
}

export interface DocsSearchProps {
	pages: DocsSearchPage[];
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	placeholder?: string;
}

/** Finds a page by name: type to narrow the list, the arrow keys to move through it, and Enter to go. ⌘K opens it */
export function DocsSearch({ pages, isOpen, onOpenChange, placeholder = 'Search components' }: DocsSearchProps) {
	const { contains } = useFilter({ sensitivity: 'base' });

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				onOpenChange(true);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onOpenChange]);

	// It opens over the page, outside DocsShell, so it sets its own type
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="items-start pt-[12vh]">
			<Dialog aria-label="Search" className="flex max-h-[min(28rem,70vh)] flex-col gap-2 p-3 font-sans text-body">
				{({ close }) => (
					<Autocomplete filter={contains}>
						<SearchField aria-label="Search" placeholder={placeholder} autoFocus />
						<ListBox
							aria-label="Pages"
							items={pages}
							onAction={(key) => {
								window.location.assign(String(key));
								close();
							}}
							renderEmptyState={() => <p className="px-3 py-1.5 text-control text-muted">Nothing called that</p>}
							className="-mx-1 -mb-1 min-h-0 flex-1"
						>
							{(page) => (
								<ListBoxItem id={page.href} textValue={page.name}>
									{page.name}
									<span className="ms-auto text-label text-muted">{page.group}</span>
								</ListBoxItem>
							)}
						</ListBox>
					</Autocomplete>
				)}
			</Dialog>
		</Modal>
	);
}
