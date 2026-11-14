import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { Navigation, NavigationTree } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, pick } from '../playground.js';
import { type TreeShape, TreeSections, buildTree, depths, itemCounts, parentIds, sectionCounts } from './navigation-tree.js';

const heights = ['short', 'tall'] as const;
const heightClass = { short: 'h-72', tall: 'h-[36rem]' };

// Navigation is a column from md up and a button that opens a sheet below it, by the window's width rather than the
// box's, so narrow the window to see the sheet. Its height is the screen's, so here it fills a frame instead
export function NavigationPlayground() {
	const [label, setLabel] = useState('Pages');
	const [hasTitle, setTitle] = useState(true);
	const [sections, setSections] = useState<TreeShape['sections']>('2');
	const [items, setItems] = useState<TreeShape['items']>('5');
	const [depth, setDepth] = useState<TreeShape['depth']>('1');
	const [isLong, setLong] = useState(false);
	const [height, setHeight] = useState<(typeof heights)[number]>('tall');
	const [route, setRoute] = useState('#s0-1');

	const tree = buildTree({ sections, items, depth, isLong, parentsLink: true });

	const shuffle = () => {
		setTitle(Math.random() < 0.7);
		setSections(pick(sectionCounts));
		setItems(pick(itemCounts));
		setDepth(pick(depths));
		setLong(Math.random() < 0.3);
		setHeight(pick(heights));
	};

	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			preview={<Choice label="Height" options={heights} value={height} onChange={setHeight} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label, and the phone button" value={label} onChange={setLabel} />
						<SwitchControl label="Title above" value={hasTitle} onChange={setTitle} />
						<Choice label="Sections" options={sectionCounts} value={sections} onChange={setSections} />
						<Choice label="Pages in each" options={itemCounts} value={items} onChange={setItems} />
						<Choice label="Levels deep" options={depths} value={depth} onChange={setDepth} />
						<SwitchControl label="Long page name" value={isLong} onChange={setLong} />
					</ControlGroup>
				</>
			}
		>
			<RouterProvider navigate={(href) => setRoute(href)}>
				<div className={`flex w-full overflow-hidden rounded-lg border border-bleed/8 max-md:flex-col ${heightClass[height]}`}>
					<Navigation aria-label={label} className="md:h-full">
						{hasTitle && <p className="px-3 font-medium text-ink">Parchment</p>}
						<NavigationTree key={`${sections}-${items}-${depth}`} aria-label={label} selectedRoute={route} defaultExpandedKeys={tree.flatMap((section) => parentIds(section.pages))}>
							<TreeSections sections={tree} hasHeaders={sections !== '1'} />
						</NavigationTree>
					</Navigation>
					<div className="flex-1 p-6 text-muted">
						The page for <span className="font-mono text-label">{route}</span>
					</div>
				</div>
			</RouterProvider>
		</Playground>
	);
}
