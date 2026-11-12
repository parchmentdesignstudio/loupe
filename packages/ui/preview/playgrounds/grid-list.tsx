import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, GridList, GridListHeader, GridListItem, GridListSection } from '../../src/index.js';
import { Choice, Playground, SwitchControl, longWords, pick } from '../playground.js';

const counts = { none: 0, few: 3, many: 12 } as const;
type Count = keyof typeof counts;
const selections = ['none', 'single', 'multiple'] as const;

const projects: { name: string; detail: string; icon: IconName }[] = [
	{ name: 'Parchment', detail: 'Studio site', icon: 'house' },
	{ name: 'Loupe', detail: 'Icons and components', icon: 'magnifyingglass' },
	{ name: 'Favicon', detail: 'A tool', icon: 'square-grid-3x3' },
	{ name: 'Brand identity', detail: 'Marks and colour', icon: 'pencil-tip' },
	{ name: 'Website', detail: 'Six pages', icon: 'desktopcomputer' },
	{ name: 'Design system', detail: 'Tokens and parts', icon: 'component' },
	{ name: 'Illustration', detail: 'Spot drawings', icon: 'scribble' },
	{ name: 'Annual report', detail: 'Print, 48 pages', icon: 'books-vertical' },
	{ name: 'Wayfinding', detail: 'Signs for a gallery', icon: 'arrow-turn-up-right' },
	{ name: 'Packaging', detail: 'Three boxes', icon: 'square-on-square' },
	{ name: 'Menu cards', detail: 'A café in Leith', icon: 'note-text' },
	{ name: 'Exhibition', detail: 'Wall text and labels', icon: 'frame' },
];

export function GridListPlayground() {
	const [layout, setLayout] = useState<'stack' | 'grid'>('stack');
	const [selectionMode, setSelectionMode] = useState<(typeof selections)[number]>('single');
	const [behaviour, setBehaviour] = useState<'toggle' | 'replace'>('toggle');
	const [count, setCount] = useState<Count>('few');
	const [text, setText] = useState<'short' | 'long'>('short');
	const [width, setWidth] = useState<'narrow' | 'wide'>('narrow');
	const [hasDetail, setDetail] = useState(true);
	const [hasIcon, setIcon] = useState(true);
	const [hasAction, setAction] = useState(false);
	const [hasSections, setSections] = useState(false);
	const [hasDisabled, setDisabled] = useState(false);
	const [isTruncated, setTruncated] = useState(false);
	const [disallowEmpty, setDisallowEmpty] = useState(false);
	const [selected, setSelected] = useState<Selection>(new Set(['item-0']));
	const isGrid = layout === 'grid';
	const items = projects.slice(0, counts[count]).map((project, index) => ({ ...project, id: `item-${index}`, name: text === 'long' && index % 2 === 0 ? `${project.name}: ${longWords.toLowerCase()}` : project.name }));
	const half = Math.ceil(items.length / 2);
	const groups = hasSections ? [{ name: 'This month', items: items.slice(0, half) }, { name: 'Earlier', items: items.slice(half) }].filter((group) => group.items.length > 0) : [];
	const shuffle = () => {
		setLayout(pick(['stack', 'grid'] as const));
		setSelectionMode(pick(selections));
		setBehaviour(Math.random() < 0.7 ? 'toggle' : 'replace');
		setCount(Math.random() < 0.1 ? 'none' : pick(['few', 'many'] as const));
		setText(Math.random() < 0.3 ? 'long' : 'short');
		setWidth(pick(['narrow', 'wide'] as const));
		setDetail(Math.random() < 0.7);
		setIcon(Math.random() < 0.7);
		setAction(Math.random() < 0.4);
		setSections(Math.random() < 0.3);
		setDisabled(Math.random() < 0.3);
		setTruncated(Math.random() < 0.5);
	};
	const truncate = isTruncated ? 'truncate' : '';
	const item = (project: (typeof items)[number]) => (
		<GridListItem key={project.id} id={project.id} textValue={project.name}>
			{hasIcon &&
				(isGrid ? (
					<span aria-hidden="true" className="flex aspect-square items-center justify-center rounded-md bg-bleed/4 text-muted">
						<Icon name={project.icon} className="size-6" />
					</span>
				) : (
					<Icon name={project.icon} className="shrink-0 text-muted" />
				))}
			<span className="flex min-w-0 flex-1 flex-col">
				<span className={['font-medium', truncate].join(' ')}>{project.name}</span>
				{hasDetail && <span className={['text-label text-muted', truncate].join(' ')}>{project.detail}</span>}
			</span>
			{hasAction && (
				<Button variant="ghost" size="small">
					Open
				</Button>
			)}
		</GridListItem>
	);
	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<Choice label="Layout" options={['stack', 'grid'] as const} value={layout} onChange={setLayout} />
					<Choice label="Selection" options={selections} value={selectionMode} onChange={setSelectionMode} />
					<Choice label="Selection behaviour" options={['toggle', 'replace'] as const} value={behaviour} onChange={setBehaviour} isDisabled={selectionMode === 'none'} />
					<Choice label="Items" options={Object.keys(counts) as Count[]} value={count} onChange={setCount} />
					<Choice label="Name" options={['short', 'long'] as const} value={text} onChange={setText} />
					<Choice label="Width" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />
					<SwitchControl label="Truncate" value={isTruncated} onChange={setTruncated} />
					<SwitchControl label="Detail" value={hasDetail} onChange={setDetail} />
					<SwitchControl label={isGrid ? 'Preview' : 'Icon'} value={hasIcon} onChange={setIcon} />
					<SwitchControl label="Button" value={hasAction} onChange={setAction} />
					<SwitchControl label="Sections" value={hasSections} onChange={setSections} />
					<SwitchControl label="A disabled item" value={hasDisabled} onChange={setDisabled} />
					<SwitchControl label="Keep one chosen" value={disallowEmpty} onChange={setDisallowEmpty} />
				</>
			}
		>
			<GridList
				aria-label="Projects"
				layout={layout}
				selectionMode={selectionMode}
				selectionBehavior={behaviour}
				disallowEmptySelection={disallowEmpty}
				selectedKeys={selected}
				onSelectionChange={setSelected}
				disabledKeys={hasDisabled ? ['item-1'] : undefined}
				renderEmptyState={() => 'No projects yet'}
				className={width === 'narrow' ? (isGrid ? 'w-full max-w-md' : 'w-full max-w-xs') : 'w-full'}
			>
				{hasSections
					? groups.map((group) => (
							<GridListSection key={group.name} id={group.name}>
								<GridListHeader>{group.name}</GridListHeader>
								{group.items.map(item)}
							</GridListSection>
						))
					: items.map(item)}
			</GridList>
		</Playground>
	);
}
