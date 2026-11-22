import { type RefObject, useEffect, useState, useSyncExternalStore } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Link, Menu, MenuItem, MenuTrigger } from '../src/index.js';

export interface Heading {
	id: string;
	name: string;
}

// How far below the scroller's top a section counts as the one you're reading
const reading = 32;

const jump = (id: string) => {
	const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
	document.getElementById(id)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
};

/** The page's sections, beside its stories: each jumps to its section, and the one you're reading is marked */
export function Contents({ headings, scroller }: { headings: Heading[]; scroller: RefObject<HTMLElement | null> }) {
	const [current, setCurrent] = useState<string | undefined>(headings[0]?.id);

	useEffect(() => {
		const root = scroller.current;
		if (!root) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const top = root.getBoundingClientRect().top + reading;
			let found: string | undefined = headings[0]?.id;
			for (const heading of headings) if ((document.getElementById(heading.id)?.getBoundingClientRect().top ?? Infinity) <= top) found = heading.id;
			// The last sections may be too short to reach the top, so at the bottom it's the last
			if (root.scrollTop > 0 && root.scrollTop + root.clientHeight >= root.scrollHeight - 2) found = headings.at(-1)?.id;
			setCurrent(found);
		};
		const onScroll = () => {
			frame ||= requestAnimationFrame(update);
		};
		update();
		root.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			root.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	}, [headings, scroller]);

	return (
		<nav aria-label="On this page" className="sticky top-0 hidden h-[calc(100dvh-4rem)] flex-col gap-3 overflow-y-auto px-6 pt-12 pb-6 @4xl/page:col-start-1 @4xl/page:row-span-2 @4xl/page:row-start-1 @4xl/page:flex">
			<p className="text-label text-muted">On this page</p>
			<ul className="flex flex-col gap-2 text-label">
				{headings.map((heading) => (
					<li key={heading.id}>
						<Link
							onPress={() => jump(heading.id)}
							aria-current={heading.id === current ? 'location' : undefined}
							// A small ghost button on hover. The padding is taken back by a negative margin, so the fill grows outwards and nothing moves
							className="-mx-2 -my-1 flex cursor-default rounded-md px-2 py-1 no-underline transition-[background-color,color] duration-150 ease-out hover:bg-bleed/4 hover:text-ink data-[pressed]:bg-bleed/8 aria-[current]:font-normal aria-[current]:text-ink motion-reduce:transition-none"
						>
							{heading.name}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}

// Whether the page has room for the column, as its @4xl/page query has it: 56rem. The menu sits in the bar, outside the
// page, so it can't ask the page's container in CSS and measures it instead
const page = () => document.querySelector('[data-docs-page]');
const subscribe = (onChange: () => void) => {
	const observer = new ResizeObserver(onChange);
	const element = page();
	if (element) observer.observe(element);
	return () => observer.disconnect();
};
const hasRoom = () => (page()?.clientWidth ?? 0) >= 56 * parseFloat(getComputedStyle(document.documentElement).fontSize);

/** The same sections as a menu, beside the breadcrumbs where there's no room for the column */
export function ContentsMenu({ headings }: { headings: Heading[] }) {
	const isRoomy = useSyncExternalStore(subscribe, hasRoom, () => false);
	if (isRoomy) return null;
	return (
		<MenuTrigger>
			<Button variant="ghost" shape="full" size="small" aria-label="On this page" className="-ml-1.5">
				<Icon name="text-alignleft" />
			</Button>
			<Menu items={headings} onAction={(id) => jump(String(id))} placement="bottom start">
				{(heading) => <MenuItem id={heading.id}>{heading.name}</MenuItem>}
			</Menu>
		</MenuTrigger>
	);
}
