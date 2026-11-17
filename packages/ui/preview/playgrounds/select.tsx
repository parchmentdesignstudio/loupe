import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Header, ListBoxItem, ListBoxSection, Select } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';

const pool = ['Brand identity', 'Website', 'Design system', 'Illustration', 'Typography', 'Signage', 'Packaging', 'Motion', 'Photography', 'Copywriting'];
const headings = ['Popular', 'Recently used', 'Studio', 'Print', 'Digital', 'Everything else'];
const icons: IconName[] = ['component', 'display', 'square-grid-3x3', 'pencil-tip', 'note-text', 'frame', 'briefcase', 'play', 'sun-max', 'scribble'];
const counts = ['none', '2', '5', '30'] as const;
const lengths = ['short', 'long', 'mixed'] as const;
const widths = { narrow: 'w-40', medium: 'w-64', full: 'w-full max-w-sm' } as const;
const labels = ['Service', 'Timing', 'Sort by', 'Who should we send it to?'];
const placeholders = ['Choose a service', 'When do you want to start?', 'Pick one'];

type Length = (typeof lengths)[number];

const optionName = (index: number, length: Length) => {
	const name = pool[index % pool.length] + (index >= pool.length ? ` ${Math.floor(index / pool.length) + 1}` : '');
	return length === 'long' || (length === 'mixed' && index % 3 === 1) ? `${name}, ${longWords.toLowerCase()}` : name;
};

// Five to a heading, or two headings for a short list
const chunk = <T,>(list: T[]) => {
	const size = list.length <= 5 ? Math.max(1, Math.ceil(list.length / 2)) : 5;
	return Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));
};

export function SelectPlayground() {
	const [label, setLabel] = useRemembered('label', labels[0]);
	const [placeholder, setPlaceholder] = useRemembered('placeholder', placeholders[0]);
	const [description, setDescription] = useRemembered('description', 'We’ll tailor the proposal to it');
	const [errorMessage, setErrorMessage] = useRemembered('errorMessage', 'Choose a service');
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as (keyof typeof widths)[]);
	const [count, setCount] = useRemembered('count', '5', counts);
	const [length, setLength] = useRemembered('length', 'short', lengths);
	const [hasSections, setSections] = useRemembered('hasSections', false);
	const [hasIcons, setIcons] = useRemembered('hasIcons', false);
	const [iconSet, setIconSet] = useState<IconName[]>(icons);
	// The option's id, or '' for nothing chosen, as null would read as nothing stored
	const [selectedKey, setSelectedKey] = useRemembered('selectedKey', '');
	const [hasDisabledOption, setDisabledOption] = useRemembered('hasDisabledOption', false);
	const [isInvalid, setInvalid] = useRemembered('isInvalid', false);
	const [isRequired, setRequired] = useRemembered('isRequired', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const total = count === 'none' ? 0 : Number(count);
	const items = Array.from({ length: total }, (_, i) => ({ id: `option-${i}`, name: optionName(i, length), icon: iconSet[i % iconSet.length] }));
	const renderItem = (item: (typeof items)[number]) => (
		<ListBoxItem key={item.id} id={item.id} textValue={item.name}>
			{hasIcons && <Icon name={item.icon} />}
			{item.name}
		</ListBoxItem>
	);
	const shuffle = () => {
		const nextCount = pick(counts.filter((c) => c !== 'none'));
		setLabel(pick(labels));
		setPlaceholder(Math.random() < 0.2 ? longWords : pick(placeholders));
		setWidth(pick(Object.keys(widths) as (keyof typeof widths)[]));
		setCount(nextCount);
		setLength(pick(lengths));
		setSections(Math.random() < 0.4);
		setIcons(Math.random() < 0.4);
		setIconSet(icons.map(() => pick(solidIcons())));
		setSelectedKey(Math.random() < 0.4 ? '' : `option-${Math.floor(Math.random() * Number(nextCount))}`);
		setDisabledOption(Math.random() < 0.3);
		setInvalid(Math.random() < 0.25);
		setDisabled(Math.random() < 0.1);
	};
	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			preview={<Choice label="Width" options={Object.keys(widths) as (keyof typeof widths)[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<TextControl label="Placeholder" value={placeholder} onChange={setPlaceholder} />
						<TextControl label="Description" value={description} onChange={setDescription} />
						<TextControl label="Error, when invalid" value={errorMessage} onChange={setErrorMessage} />
						<Choice label="Options" options={counts} value={count} onChange={setCount} />
						<Choice label="Option text" options={lengths} value={length} onChange={setLength} />
						<SwitchControl label="Under headings" value={hasSections} onChange={setSections} />
						<SwitchControl label="Icons" value={hasIcons} onChange={setIcons} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Nothing chosen" value={!selectedKey} onChange={(none) => setSelectedKey(none ? '' : 'option-0')} />
						<SwitchControl label="A disabled option" value={hasDisabledOption} onChange={setDisabledOption} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<Select
				label={label || undefined}
				aria-label={label ? undefined : 'Options'}
				placeholder={placeholder}
				description={description || undefined}
				errorMessage={errorMessage}
				selectedKey={selectedKey || null}
				onSelectionChange={(key) => setSelectedKey(key == null ? '' : String(key))}
				disabledKeys={hasDisabledOption && total ? [`option-${Math.min(2, total - 1)}`] : undefined}
				isInvalid={isInvalid}
				isRequired={isRequired}
				isDisabled={isDisabled}
				className={widths[width]}
			>
				{hasSections
					? chunk(items).map((group, i) => (
							<ListBoxSection key={i} id={`section-${i}`}>
								<Header>{headings[i % headings.length]}</Header>
								{group.map(renderItem)}
							</ListBoxSection>
						))
					: items.map(renderItem)}
			</Select>
		</Playground>
	);
}
