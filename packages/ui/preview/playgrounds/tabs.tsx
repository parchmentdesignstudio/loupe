import { useState } from 'react';
import { type Key, RouterProvider } from 'react-aria-components';
import { type IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Tab, TabList, TabPanel, Tabs } from '../../src/index.js';
import { Choice, Playground, SwitchControl, longWords, pick, solidIcons } from '../playground.js';

const pages = [
	{ name: 'Brief', icon: 'note-text', panel: 'A studio site that shows the work first, then the people behind it.' },
	{ name: 'Type', icon: 'text-alignleft', panel: 'Elza Round for text, with Auger Mono for small labels.' },
	{ name: 'Colour', icon: 'sun-max', panel: 'Ink on a cream ground, with white for anything you can press.' },
	{ name: 'Files', icon: 'paperclip', panel: 'The Sketch library, its exports and the type kit, in one shared folder.' },
	{ name: 'People', icon: 'person', panel: 'Two designers, a developer, and the client’s marketing lead.' },
	{ name: 'Notes', icon: 'note', panel: 'Questions from the last call, and what we agreed to try next.' },
	{ name: 'Activity', icon: 'arrow-clockwise', panel: 'Every change to the project, newest first.' },
	{ name: 'Messages', icon: 'message', panel: 'The thread with the client, kept beside the work it’s about.' },
	{ name: 'Exports', icon: 'square-and-arrow-up', panel: 'Each size the site needs, ready to download as one zip.' },
	{ name: 'Links', icon: 'link', panel: 'The staging site, the shared folder and the type licence.' },
	{ name: 'Schedule', icon: 'briefcase', panel: 'Six weeks, with a check-in at the end of each one.' },
	{ name: 'Settings', icon: 'component', panel: 'Who can see the project, and who can change it.' },
] satisfies { name: string; icon: IconName; panel: string }[];

const longPanel = 'A much longer panel, to see how it wraps beside a column of tabs and how far it pushes what’s under it. It goes on for a while, past where anyone would stop reading, so the panel is clearly taller than the tabs beside it, and its last line sits well below theirs.';

const orientations = ['horizontal', 'vertical'] as const;
const counts = ['2', '5', '12'] as const;

// With links on, each tab has an href and the router chooses the tab its href names, as a site's own router would
export function TabsPlayground() {
	const [orientation, setOrientation] = useState<(typeof orientations)[number]>('horizontal');
	const [count, setCount] = useState<(typeof counts)[number]>('5');
	const [selected, setSelected] = useState<Key>('tab-1');
	const [hasIcons, setIcons] = useState(false);
	const [icons, setIconNames] = useState<IconName[]>(pages.map((page) => page.icon));
	const [isLongLabel, setLongLabel] = useState(false);
	const [isLongPanel, setLongPanel] = useState(false);
	const [hasDisabled, setHasDisabled] = useState(false);
	const [asLinks, setAsLinks] = useState(false);

	const tabs = pages.slice(0, Number(count)).map((page, i) => ({ ...page, id: `tab-${i}`, icon: icons[i], name: i === 1 && isLongLabel ? longWords : page.name }));
	// The last tab, unless it's the one chosen
	const disabledKeys = hasDisabled ? [tabs[tabs.length - 1].id].filter((id) => id !== selected) : [];
	const selectedKey = tabs.some((tab) => tab.id === selected) ? selected : tabs[0].id;

	const shuffle = () => {
		const nextCount = pick(counts);
		const names = solidIcons();
		setOrientation(pick(orientations));
		setCount(nextCount);
		setSelected(`tab-${Math.floor(Math.random() * Number(nextCount))}`);
		setIcons(Math.random() < 0.4);
		setIconNames(pages.map(() => pick(names)));
		setLongLabel(Math.random() < 0.3);
		setLongPanel(Math.random() < 0.3);
		setHasDisabled(Math.random() < 0.3);
		setAsLinks(Math.random() < 0.3);
	};

	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<Choice label="Orientation" options={orientations} value={orientation} onChange={setOrientation} />
					<Choice label="Tabs" options={counts} value={count} onChange={setCount} />
					<SwitchControl label="Icons" value={hasIcons} onChange={setIcons} />
					<SwitchControl label="Long tab name" value={isLongLabel} onChange={setLongLabel} />
					<SwitchControl label="Long panel" value={isLongPanel} onChange={setLongPanel} />
					<SwitchControl label="A disabled tab" value={hasDisabled} onChange={setHasDisabled} />
					<SwitchControl label="Tabs are links" value={asLinks} onChange={setAsLinks} />
				</>
			}
		>
			<RouterProvider navigate={(href) => setSelected(href.slice(1))}>
				<Tabs orientation={orientation} selectedKey={selectedKey} onSelectionChange={setSelected} disabledKeys={disabledKeys} className="w-full">
					<TabList aria-label="Project">
						{tabs.map((tab) => (
							<Tab key={tab.id} id={tab.id} href={asLinks ? `#${tab.id}` : undefined}>
								{hasIcons && <Icon name={tab.icon} />}
								{tab.name}
							</Tab>
						))}
					</TabList>
					{tabs.map((tab) => (
						<TabPanel key={tab.id} id={tab.id}>
							{isLongPanel ? longPanel : tab.panel}
						</TabPanel>
					))}
				</Tabs>
			</RouterProvider>
		</Playground>
	);
}
