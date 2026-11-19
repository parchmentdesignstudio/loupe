import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Chip, ChipGroup } from '../../src/index.js';
import { Choice, ControlGroup, ControlRow, IconPicker, NumberControl, Playground, SwitchControl, TextControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';

const replies = ['A new website', 'Rework my site', 'Not sure yet', 'Book a call', 'Show me examples', 'How much?', 'Later', 'Tell me more', 'Yes', 'No thanks'];
const lengths = ['short', 'mixed', 'long'] as const;
const places = ['none', 'start', 'end'] as const;
const sizes = ['small', 'medium', 'large'] as const;
const widths = { narrow: 'max-w-56', medium: 'max-w-md', wide: 'max-w-none' } as const;
type Width = keyof typeof widths;
const disabling = ['none', 'one', 'all'] as const;

function labelFor(index: number, length: (typeof lengths)[number], first: string) {
	if (index === 0) return length === 'long' ? longWords : first;
	if (length === 'long' || (length === 'mixed' && index % 3 === 1)) return longWords;
	return replies[index % replies.length];
}

export function ChipPlayground() {
	const [count, setCount] = useRemembered('count', 3, (stored) => stored >= 0 && stored <= 40);
	const [first, setFirst] = useRemembered('first', 'A new website');
	const [length, setLength] = useRemembered('length', 'short', lengths);
	const [place, setPlace] = useRemembered('place', 'none', places);
	const [icon, setIcon] = useRemembered<IconName>('icon', 'paperplane', (name) => solidIcons().includes(name));
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [size, setSize] = useRemembered('size', 'large', sizes);
	const [disabled, setDisabled] = useRemembered('disabled', 'none', disabling);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const [pressed, setPressed] = useState<string>();
	const names = solidIcons();
	const shuffle = () => {
		setCount(pick([1, 2, 3, 5, 8, 16]));
		setFirst(pick(replies));
		setLength(pick(lengths));
		setPlace(pick(places));
		setIcon(pick(names));
		setWidth(pick(Object.keys(widths) as Width[]));
		setSize(pick(sizes));
		setDisabled(Math.random() < 0.2 ? pick(['one', 'all'] as const) : 'none');
	};
	const chips = Array.from({ length: count }, (_, index) => {
		const label = labelFor(index, length, first);
		return (
			<Chip key={index} size={size} data-show-focus={(isFocused && index === 0) || undefined} onPress={() => setPressed(label)} isDisabled={disabled === 'all' || (disabled === 'one' && index === 1)}>
				{place === 'start' && <Icon name={icon} />}
				{label}
				{place === 'end' && <Icon name={icon} />}
			</Chip>
		);
	});
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="Room" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />
					<ControlRow label="Last pressed">
						<span className="max-w-56 truncate text-control text-ink">{pressed ?? 'Nothing yet'}</span>
					</ControlRow>
				</>
			}
			controls={
				<>
					<ControlGroup label="Content">
						<NumberControl label="Chips" value={count} onChange={setCount} minValue={0} maxValue={40} />
						<TextControl label="First label" value={first} onChange={setFirst} />
						<Choice label="Labels" options={lengths} value={length} onChange={setLength} />
						<Choice label="Icon" options={places} value={place} onChange={setPlace} />
						{place !== 'none' && <IconPicker label="Icon name" value={icon} onChange={setIcon} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Size" options={sizes} value={size} onChange={setSize} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<Choice label="Disabled" options={disabling} value={disabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<div className={['w-full', widths[width]].join(' ')}>
				{count === 0 ? (
					<p className="text-control text-muted">No chips</p>
				) : (
					<ChipGroup aria-label="Or start with">{chips}</ChipGroup>
				)}
			</div>
		</Playground>
	);
}
