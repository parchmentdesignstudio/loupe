import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Tag, TagGroup } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick, solidIcons } from '../playground.js';

const counts = { none: 0, few: 4, many: 16 } as const;
type Count = keyof typeof counts;
const selections = ['none', 'single', 'multiple'] as const;
const words = ['Fraunces', 'Literata', 'Newsreader', 'Work Sans', 'Serif', 'Sans', 'Display', 'Italic', 'Bold', 'Condensed', 'Variable', 'Mono', 'Old style', 'Small caps', 'Ligatures', 'Swash'];

const tagsFor = (count: Count, text: 'short' | 'long') => words.slice(0, counts[count]).map((word, index) => (text === 'long' && index % 3 === 1 ? `${word}: ${longWords.toLowerCase()}` : word));

// Removing a tag takes it out of the list, so changing the count or the text puts them all back
export function TagGroupPlayground() {
	const [label, setLabel] = useState('Typefaces to compare');
	const [selectionMode, setSelectionMode] = useState<(typeof selections)[number]>('multiple');
	const [count, setCount] = useState<Count>('few');
	const [text, setText] = useState<'short' | 'long'>('short');
	const [width, setWidth] = useState<'narrow' | 'wide'>('narrow');
	const [tags, setTags] = useState(() => tagsFor('few', 'short'));
	const [selected, setSelected] = useState<Selection>(new Set(['Literata']));
	const [isRemovable, setRemovable] = useState(false);
	const [hasIcons, setIcons] = useState(false);
	const [icon, setIcon] = useState<IconName>('checkmark');
	const [hasDescription, setDescription] = useState(false);
	const [hasError, setError] = useState(false);
	const [hasDisabled, setDisabled] = useState(false);
	const reset = (nextCount: Count, nextText: 'short' | 'long') => {
		setCount(nextCount);
		setText(nextText);
		setTags(tagsFor(nextCount, nextText));
	};
	const shuffle = () => {
		reset(Math.random() < 0.1 ? 'none' : pick(['few', 'many'] as const), Math.random() < 0.3 ? 'long' : 'short');
		setSelectionMode(pick(selections));
		setWidth(pick(['narrow', 'wide'] as const));
		setRemovable(Math.random() < 0.5);
		setIcons(Math.random() < 0.3);
		setIcon(pick(solidIcons()));
		setDescription(Math.random() < 0.4);
		setError(Math.random() < 0.2);
		setDisabled(Math.random() < 0.3);
	};
	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<TextControl label="Label" value={label} onChange={setLabel} />
					<Choice label="Selection" options={selections} value={selectionMode} onChange={setSelectionMode} />
					<Choice label="Tags" options={Object.keys(counts) as Count[]} value={count} onChange={(next) => reset(next, text)} />
					<Choice label="Text" options={['short', 'long'] as const} value={text} onChange={(next) => reset(count, next)} />
					<Choice label="Width" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />
					<SwitchControl label="Removable" value={isRemovable} onChange={setRemovable} />
					<SwitchControl label="Icons" value={hasIcons} onChange={setIcons} />
					<SwitchControl label="Description" value={hasDescription} onChange={setDescription} />
					<SwitchControl label="Error" value={hasError} onChange={setError} />
					<SwitchControl label="A disabled tag" value={hasDisabled} onChange={setDisabled} />
				</>
			}
		>
			<TagGroup
				label={label || undefined}
				aria-label={label ? undefined : 'Tags'}
				description={hasDescription ? (isRemovable ? 'Remove one with its cross, or with Backspace' : 'Choose any that suit the brief') : undefined}
				errorMessage={hasError ? 'Choose at least two to compare' : undefined}
				selectionMode={selectionMode}
				selectedKeys={selected}
				onSelectionChange={setSelected}
				disabledKeys={hasDisabled && tags.length > 1 ? [tags[1]] : undefined}
				onRemove={isRemovable ? (keys) => setTags((list) => list.filter((tag) => !keys.has(tag))) : undefined}
				items={tags.map((tag) => ({ id: tag }))}
				renderEmptyState={() => 'None to compare'}
				className={width === 'narrow' ? 'w-full max-w-xs' : 'w-full'}
			>
				{(item) => (
					<Tag textValue={item.id}>
						{hasIcons && <Icon name={icon} className="size-3 shrink-0" />}
						{item.id}
					</Tag>
				)}
			</TagGroup>
		</Playground>
	);
}
