import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Tag, TagGroup } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';

const counts = { none: 0, few: 4, many: 16 } as const;
type Count = keyof typeof counts;
const selections = ['none', 'single', 'multiple'] as const;
const texts = ['short', 'long'] as const;
const widths = ['narrow', 'wide'] as const;
const words = ['Fraunces', 'Literata', 'Newsreader', 'Work Sans', 'Serif', 'Sans', 'Display', 'Italic', 'Bold', 'Condensed', 'Variable', 'Mono', 'Old style', 'Small caps', 'Ligatures', 'Swash'];

const tagsFor = (count: Count, text: 'short' | 'long') => words.slice(0, counts[count]).map((word, index) => (text === 'long' && index % 3 === 1 ? `${word}: ${longWords.toLowerCase()}` : word));

// Removing a tag takes it out of the list, so changing the count or the text puts them all back
export function TagGroupPlayground() {
	const [label, setLabel] = useRemembered('label', 'Typefaces to compare');
	const [selectionMode, setSelectionMode] = useRemembered('selectionMode', 'multiple', selections);
	const [count, setCount] = useRemembered('count', 'few', Object.keys(counts) as Count[]);
	const [text, setText] = useRemembered('text', 'short', texts);
	const [width, setWidth] = useRemembered('width', 'narrow', widths);
	const [tags, setTags] = useState(() => tagsFor(count, text));
	const [selected, setSelected] = useState<Selection>(new Set(['Literata']));
	const [isRemovable, setRemovable] = useRemembered('isRemovable', false);
	const [hasIcons, setIcons] = useRemembered('hasIcons', false);
	const [icon, setIcon] = useState<IconName>('checkmark');
	const [hasDescription, setDescription] = useRemembered('hasDescription', false);
	const [hasError, setError] = useRemembered('hasError', false);
	const [hasDisabled, setDisabled] = useRemembered('hasDisabled', false);
	const reset = (nextCount: Count, nextText: 'short' | 'long') => {
		setCount(nextCount);
		setText(nextText);
		setTags(tagsFor(nextCount, nextText));
	};
	const shuffle = () => {
		reset(Math.random() < 0.1 ? 'none' : pick(['few', 'many'] as const), Math.random() < 0.3 ? 'long' : 'short');
		setSelectionMode(pick(selections));
		setWidth(pick(widths));
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
			preview={<Choice label="Width" options={widths} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<Choice label="Tags" options={Object.keys(counts) as Count[]} value={count} onChange={(next) => reset(next, text)} />
						<Choice label="Text" options={texts} value={text} onChange={(next) => reset(count, next)} />
						<SwitchControl label="Icons" value={hasIcons} onChange={setIcons} />
						<SwitchControl label="Description" value={hasDescription} onChange={setDescription} />
						<SwitchControl label="Error" value={hasError} onChange={setError} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Selection" options={selections} value={selectionMode} onChange={setSelectionMode} />
						<SwitchControl label="Removable" value={isRemovable} onChange={setRemovable} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="A disabled tag" value={hasDisabled} onChange={setDisabled} />
					</ControlGroup>
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
