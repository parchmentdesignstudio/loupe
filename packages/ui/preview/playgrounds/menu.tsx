import { type ReactNode, useContext, useState } from 'react';
import { type Key, PopoverContext, type Selection } from 'react-aria-components';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, Header, Keyboard, Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SubmenuTrigger } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';
import { type Align, type Side, aligns, placementOf, sides } from './overlay.js';

const actions: { label: string; icon: IconName; shortcut?: string }[] = [
	{ label: 'Rename', icon: 'pencil-tip', shortcut: '⌘R' },
	{ label: 'Duplicate', icon: 'square-on-square', shortcut: '⌘D' },
	{ label: 'Copy link', icon: 'link', shortcut: '⇧⌘C' },
	{ label: 'Share', icon: 'square-and-arrow-up' },
	{ label: 'Download', icon: 'arrow-down-to-line', shortcut: '⇧⌘S' },
	{ label: 'Find', icon: 'magnifyingglass', shortcut: '⌘F' },
	{ label: 'Comment', icon: 'message', shortcut: '⌥⌘M' },
	{ label: 'Attach a file', icon: 'paperclip' },
	{ label: 'Send', icon: 'paperplane', shortcut: '⌘↩' },
	{ label: 'Add a note', icon: 'note-text-badge-plus' },
	{ label: 'Version history', icon: 'arrow-counterclockwise' },
	{ label: 'Show sidebar', icon: 'sidebar-left', shortcut: '⌥⌘S' },
];
const folders = ['Projects', 'Archive', 'Shared with me', 'Clients', 'Drafts'];
const groupings = ['none', 'separators', 'sections'] as const;
const selectionModes = ['none', 'single', 'multiple'] as const;

// Keep open makes the menu's popover non-modal and deaf to clicks outside, through the context its MenuTrigger sets
function NonModal({ isOn, children }: { isOn: boolean; children: ReactNode }) {
	const context = useContext(PopoverContext);
	const value = isOn ? ({ ...context, isNonModal: true, shouldCloseOnInteractOutside: () => false } as typeof context) : context;
	return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export function MenuPlayground() {
	const [count, setCount] = useState(5);
	const [grouping, setGrouping] = useState<(typeof groupings)[number]>('none');
	const [hasIcons, setHasIcons] = useState(false);
	const [hasShortcuts, setHasShortcuts] = useState(false);
	const [hasLong, setHasLong] = useState(false);
	const [hasDisabled, setHasDisabled] = useState(false);
	const [hasSubmenu, setHasSubmenu] = useState(false);
	const [hasDanger, setHasDanger] = useState(true);
	const [selectionMode, setSelectionMode] = useState<(typeof selectionModes)[number]>('none');
	const [selected, setSelected] = useState<Selection>(new Set<Key>(['item-0']));
	const [side, setSide] = useState<Side>('bottom');
	const [align, setAlign] = useState<Align>('start');
	const [longPress, setLongPress] = useState(false);
	const [keepOpen, setKeepOpen] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [trigger, setTrigger] = useState('Project');
	const shuffle = () => {
		setCount(Math.random() < 0.2 ? 20 + Math.floor(Math.random() * 30) : 1 + Math.floor(Math.random() * 8));
		setGrouping(pick(groupings));
		setHasIcons(Math.random() < 0.5);
		setHasShortcuts(Math.random() < 0.5);
		setHasLong(Math.random() < 0.25);
		setHasDisabled(Math.random() < 0.3);
		setHasSubmenu(Math.random() < 0.3);
		setHasDanger(Math.random() < 0.5);
		setSelectionMode(pick(selectionModes));
		setSide(pick(sides));
		setAlign(pick(aligns));
	};
	const keep = (value: boolean) => {
		setKeepOpen(value);
		setOpen(value);
	};
	// Any close, such as Escape or choosing an action, lets go of keep open, so it never sticks
	const openChange = (value: boolean) => {
		setOpen(value);
		if (!value) setKeepOpen(false);
	};
	const items = Array.from({ length: count }, (_, index) => {
		const action = actions[index % actions.length];
		const round = Math.floor(index / actions.length);
		const label = hasLong && index === 0 ? longWords : round ? `${action.label} ${round + 1}` : action.label;
		return (
			<MenuItem key={index} id={`item-${index}`} textValue={label}>
				{hasIcons && <Icon name={action.icon} />}
				{label}
				{hasShortcuts && action.shortcut && <Keyboard>{action.shortcut}</Keyboard>}
			</MenuItem>
		);
	});
	const submenu = hasSubmenu && (
		<SubmenuTrigger key="move">
			<MenuItem id="move" textValue="Move to">
				{hasIcons && <Icon name="arrow-right" />}
				Move to
			</MenuItem>
			<Menu>
				{folders.map((folder) => (
					<MenuItem key={folder} id={`folder-${folder}`}>
						{folder}
					</MenuItem>
				))}
			</Menu>
		</SubmenuTrigger>
	);
	const half = Math.ceil(items.length / 2);
	const [first, second] = [items.slice(0, half), items.slice(half)];
	const body =
		grouping === 'sections' ? (
			<>
				<MenuSection>
					<Header>Project</Header>
					{first}
				</MenuSection>
				{(second.length > 0 || submenu) && (
					<MenuSection>
						<Header>More</Header>
						{second}
						{submenu}
					</MenuSection>
				)}
			</>
		) : grouping === 'separators' && second.length > 0 ? (
			<>
				{first}
				<MenuSeparator />
				{second}
				{submenu}
			</>
		) : (
			<>
				{items}
				{submenu}
			</>
		);
	return (
		<Playground
			onRandom={shuffle}
			preview={<SwitchControl label="Keep open" value={keepOpen} onChange={keep} />}
			controls={
				<>
					<ControlGroup label="Content">
						<NumberControl label="Items" value={count} onChange={setCount} minValue={1} maxValue={60} />
						<Choice label="Grouping" options={groupings} value={grouping} onChange={setGrouping} />
						<SwitchControl label="Icons" value={hasIcons} onChange={setHasIcons} />
						<SwitchControl label="Shortcuts" value={hasShortcuts} onChange={setHasShortcuts} />
						<SwitchControl label="Long first item" value={hasLong} onChange={setHasLong} />
						<SwitchControl label="Submenu" value={hasSubmenu} onChange={setHasSubmenu} />
						<SwitchControl label="Delete at the end" value={hasDanger} onChange={setHasDanger} />
					</ControlGroup>
					<ControlGroup label="Placement">
						<Choice label="Side" options={sides} value={side} onChange={setSide} />
						<Choice label="Align" options={aligns} value={align} onChange={setAlign} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Selection" options={selectionModes} value={selectionMode} onChange={setSelectionMode} />
						<SwitchControl label="Open on long press" value={longPress} onChange={setLongPress} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Disabled second item" value={hasDisabled} onChange={setHasDisabled} />
					</ControlGroup>
					<ControlGroup label="Trigger">
						<TextControl label="Trigger" value={trigger} onChange={setTrigger} />
					</ControlGroup>
				</>
			}
		>
			<MenuTrigger isOpen={isOpen} onOpenChange={openChange} trigger={longPress ? 'longPress' : 'press'}>
				<Button variant="secondary">{trigger || 'Project'}</Button>
				<NonModal isOn={keepOpen}>
					<Menu
						placement={placementOf(side, align)}
						selectionMode={selectionMode}
						selectedKeys={selected}
						onSelectionChange={setSelected}
						disabledKeys={hasDisabled ? ['item-1'] : []}
						shouldCloseOnSelect={keepOpen ? false : undefined}
					>
						{body}
						{hasDanger && <MenuSeparator />}
						{hasDanger && (
							<MenuItem id="delete" variant="danger" textValue="Delete">
								{hasIcons && <Icon name="xmark" />}
								Delete
							</MenuItem>
						)}
					</Menu>
				</NonModal>
			</MenuTrigger>
		</Playground>
	);
}
