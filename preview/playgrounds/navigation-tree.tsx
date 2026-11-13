import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { Button, NavigationTree, NavigationTreeHeader, NavigationTreeItem, NavigationTreeItemContent, NavigationTreeSection } from '../../src/index.js';
import { Choice, ControlGroup, ControlRow, Playground, SwitchControl, longWords, pick } from '../playground.js';

const sectionNames = ['Guides', 'Components', 'Foundations', 'Resources'];
const pageNames = ['Overview', 'Getting started', 'Installation', 'Buttons', 'Forms', 'Colour', 'Typography', 'Icons', 'Layout', 'Spacing', 'Motion', 'Accessibility', 'Writing', 'Releases', 'Roadmap', 'Support'];
const subPageNames = ['Setup', 'Usage', 'Examples', 'Options', 'Details', 'Notes', 'Edge cases', 'Further reading'];

export const sectionCounts = ['1', '2', '4'] as const;
export const itemCounts = ['2', '5', '12'] as const;
export const depths = ['1', '2', '4'] as const;

export interface Page {
	id: string;
	name: string;
	href?: string;
	children: Page[];
}

export interface TreeShape {
	sections: (typeof sectionCounts)[number];
	items: (typeof itemCounts)[number];
	depth: (typeof depths)[number];
	isLong: boolean;
	/** Whether a page with pages under it is a link too, or only opens and closes */
	parentsLink: boolean;
}

// The first page in each section holds the nesting: two pages under it at each level, down to the depth asked for
function nest(id: string, name: string, level: number, shape: TreeShape): Page {
	const children = level < Number(shape.depth) ? [0, 1].map((k) => nest(`${id}-${k}`, subPageNames[(level * 2 + k) % subPageNames.length], level + 1, shape)) : [];
	return { id, name, href: children.length && !shape.parentsLink ? undefined : `#${id}`, children };
}

export function buildTree(shape: TreeShape) {
	return sectionNames.slice(0, Number(shape.sections)).map((name, s) => ({
		id: `s${s}`,
		name,
		pages: Array.from({ length: Number(shape.items) }, (_, i) => {
			const id = `s${s}-${i}`;
			const pageName = i === 1 && shape.isLong ? longWords : pageNames[(s * 5 + i) % pageNames.length];
			return i === 0 ? nest(id, pageName, 1, shape) : { id, name: pageName, href: `#${id}`, children: [] };
		}),
	}));
}

export const parentIds = (pages: Page[]): string[] => pages.flatMap((page) => (page.children.length ? [page.id, ...parentIds(page.children)] : []));

// The deepest page down the first branch, to make current and see its ancestors
function deepest(page: Page): Page {
	return page.children.length ? deepest(page.children[0]) : page;
}

function PageItem({ page }: { page: Page }) {
	return (
		<NavigationTreeItem id={page.id} href={page.href} textValue={page.name}>
			<NavigationTreeItemContent>{page.name}</NavigationTreeItemContent>
			{page.children.map((child) => (
				<PageItem key={child.id} page={child} />
			))}
		</NavigationTreeItem>
	);
}

export function TreeSections({ sections, hasHeaders }: { sections: ReturnType<typeof buildTree>; hasHeaders: boolean }) {
	return sections.map((section) => (
		<NavigationTreeSection key={section.id} id={section.id}>
			{hasHeaders && <NavigationTreeHeader>{section.name}</NavigationTreeHeader>}
			{section.pages.map((page) => (
				<PageItem key={page.id} page={page} />
			))}
		</NavigationTreeSection>
	));
}

const openings = ['none', 'first', 'all'] as const;
const widths = ['narrow', 'column', 'wide'] as const;
const widthClass = { narrow: 'w-44', column: 'w-60', wide: 'w-96' };

// The router keeps each click inside the playground, moving the current page rather than leaving the preview
export function NavigationTreePlayground() {
	const [sections, setSections] = useState<TreeShape['sections']>('2');
	const [items, setItems] = useState<TreeShape['items']>('5');
	const [depth, setDepth] = useState<TreeShape['depth']>('2');
	const [isLong, setLong] = useState(false);
	const [parentsLink, setParentsLink] = useState(true);
	const [hasHeaders, setHeaders] = useState(true);
	const [hasDisabled, setHasDisabled] = useState(false);
	const [width, setWidth] = useState<(typeof widths)[number]>('column');
	const [opened, setOpened] = useState<(typeof openings)[number]>('first');
	const [route, setRoute] = useState<string | null>('#s0-1');

	const tree = buildTree({ sections, items, depth, isLong, parentsLink });
	const allParents = tree.flatMap((section) => parentIds(section.pages));
	const expandedKeys = opened === 'all' ? allParents : opened === 'first' ? tree.flatMap((section) => (section.pages[0].children.length ? [section.pages[0].id] : [])) : [];
	// The last page of each section, so a disabled one sits among the rest
	const disabledKeys = hasDisabled ? tree.map((section) => section.pages[section.pages.length - 1].id) : [];
	const deepestHref = deepest(tree[0].pages[0]).href ?? null;

	const shuffle = () => {
		setSections(pick(sectionCounts));
		setItems(pick(itemCounts));
		setDepth(pick(depths));
		setLong(Math.random() < 0.3);
		setParentsLink(Math.random() < 0.5);
		setHeaders(Math.random() < 0.7);
		setHasDisabled(Math.random() < 0.3);
		setWidth(pick(widths));
		setOpened(pick(openings));
		setRoute(Math.random() < 0.5 ? '#s0-1' : '#s0-0-0');
	};

	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			preview={<Choice label="Width" options={widths} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Sections" options={sectionCounts} value={sections} onChange={setSections} />
						<SwitchControl label="Section headers" value={hasHeaders} onChange={setHeaders} />
						<Choice label="Pages in each" options={itemCounts} value={items} onChange={setItems} />
						<Choice label="Levels deep" options={depths} value={depth} onChange={setDepth} />
						<SwitchControl label="Long page name" value={isLong} onChange={setLong} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<SwitchControl label="Parents are links" value={parentsLink} onChange={setParentsLink} />
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Open at start" options={openings} value={opened} onChange={setOpened} isDisabled={depth === '1'} />
						<SwitchControl label="A disabled page" value={hasDisabled} onChange={setHasDisabled} />
						<ControlRow label="Current page">
							<div className="flex items-center gap-2">
								<span className="font-mono text-label text-muted">{route ?? 'None'}</span>
								<Button variant="secondary" size="small" onPress={() => setRoute(deepestHref)}>
									Deepest
								</Button>
								<Button variant="ghost" size="small" onPress={() => setRoute(null)}>
									Clear
								</Button>
							</div>
						</ControlRow>
					</ControlGroup>
				</>
			}
		>
			<RouterProvider navigate={(href) => setRoute(href)}>
				{/* Remounts when the shape or opening changes, so "Open at start" applies again */}
				<NavigationTree
					key={`${sections}-${items}-${depth}-${parentsLink}-${opened}`}
					aria-label="Pages"
					selectedRoute={route}
					defaultExpandedKeys={expandedKeys}
					disabledKeys={disabledKeys}
					className={widthClass[width]}
				>
					<TreeSections sections={tree} hasHeaders={hasHeaders} />
				</NavigationTree>
			</RouterProvider>
		</Playground>
	);
}
