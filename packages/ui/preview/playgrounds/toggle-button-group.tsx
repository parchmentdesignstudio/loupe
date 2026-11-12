import { useState } from 'react';
import type { Key } from 'react-aria-components';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { ToggleButton, ToggleButtonGroup } from '../../src/index.js';
import { Choice, Playground, SwitchControl, longWords, pick, solidIcons } from '../playground.js';

const words = ['Day', 'Week', 'Month', 'Quarter', 'Year', 'Decade', 'Century', 'All time'];
const icons: IconName[] = ['text-alignleft', 'text-aligncenter', 'text-alignright', 'text-justify', 'sidebar-left', 'sidebar-right', 'square-grid-3x3', 'monitor'];
const counts = ['2', '3', '5', '8'] as const;
const contents = ['text', 'icon', 'both'] as const;
const lengths = ['short', 'long', 'mixed'] as const;

// Going back to one choice keeps only the first of several, as a single-choice group can't hold more
export function ToggleButtonGroupPlayground() {
	const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');
	const [size, setSize] = useState<'medium' | 'small'>('medium');
	const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
	const [count, setCount] = useState<(typeof counts)[number]>('3');
	const [content, setContent] = useState<(typeof contents)[number]>('text');
	const [length, setLength] = useState<(typeof lengths)[number]>('short');
	const [iconSet, setIconSet] = useState<IconName[]>(icons);
	const [selected, setSelected] = useState<Set<Key>>(new Set(['button-1']));
	const [allowsEmpty, setAllowsEmpty] = useState(false);
	const [hasDisabledButton, setDisabledButton] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const total = Number(count);
	const isSingle = selectionMode === 'single';
	const textFor = (index: number) => (length === 'long' || (length === 'mixed' && index === 1) ? longWords : words[index]);
	const changeMode = (mode: 'single' | 'multiple') => {
		setSelectionMode(mode);
		if (mode === 'single') setSelected(new Set([...selected].slice(0, 1).concat(selected.size ? [] : ['button-0'])));
	};
	const shuffle = () => {
		const nextCount = Number(pick(counts));
		const mode = Math.random() < 0.3 ? 'multiple' : 'single';
		const keys = Array.from({ length: nextCount }, (_, i) => `button-${i}`);
		setSelectionMode(mode);
		setSize(pick(['medium', 'small'] as const));
		setOrientation(Math.random() < 0.2 ? 'vertical' : 'horizontal');
		setCount(String(nextCount) as (typeof counts)[number]);
		setContent(pick(contents));
		setLength(Math.random() < 0.2 ? pick(['long', 'mixed'] as const) : 'short');
		setIconSet(Array.from({ length: icons.length }, () => pick(solidIcons())));
		setSelected(new Set(mode === 'single' ? [pick(keys)] : keys.filter(() => Math.random() < 0.4)));
		setDisabledButton(Math.random() < 0.2);
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<Choice label="Selection" options={['single', 'multiple'] as const} value={selectionMode} onChange={changeMode} />
					<Choice label="Size" options={['medium', 'small'] as const} value={size} onChange={setSize} />
					<Choice label="Orientation" options={['horizontal', 'vertical'] as const} value={orientation} onChange={setOrientation} />
					<Choice label="Buttons" options={counts} value={count} onChange={setCount} />
					<Choice label="Content" options={contents} value={content} onChange={setContent} />
					<Choice label="Text" options={lengths} value={length} onChange={setLength} isDisabled={content === 'icon'} />
					{!isSingle && <SwitchControl label="Can choose none" value={allowsEmpty} onChange={setAllowsEmpty} />}
					<SwitchControl label="A disabled button" value={hasDisabledButton} onChange={setDisabledButton} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
				</>
			}
		>
			<ToggleButtonGroup
				aria-label="Options"
				selectionMode={selectionMode}
				disallowEmptySelection={isSingle || !allowsEmpty}
				size={size}
				orientation={orientation}
				selectedKeys={selected}
				onSelectionChange={setSelected}
				isDisabled={isDisabled}
				className="max-w-full"
			>
				{Array.from({ length: total }, (_, i) => (
					<ToggleButton key={i} id={`button-${i}`} isDisabled={hasDisabledButton && i === total - 1} aria-label={content === 'icon' ? textFor(i) : undefined}>
						{content !== 'text' && <Icon name={iconSet[i]} />}
						{content !== 'icon' && textFor(i)}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</Playground>
	);
}
