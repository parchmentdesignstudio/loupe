import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const pool = ['Brand identity', 'Website', 'Design system', 'Illustration', 'Typography', 'Signage', 'Packaging', 'Motion', 'Photography', 'Copywriting'];
const counts = ['none', '2', '5', '30'] as const;
const lengths = ['short', 'long', 'mixed'] as const;
const states = ['off', 'on', 'indeterminate'] as const;
const labels = ['What do you need?', 'Services', 'Send me updates about', 'Which of these apply?'];
const singles = ['I’ve read the terms', 'Send me the newsletter', 'All services', 'Remember me'];

type Length = (typeof lengths)[number];

const optionName = (index: number, length: Length) => {
	const name = pool[index % pool.length] + (index >= pool.length ? ` ${Math.floor(index / pool.length) + 1}` : '');
	return length === 'long' || (length === 'mixed' && index % 3 === 1) ? `${name}, ${longWords.toLowerCase()}` : name;
};

export function CheckboxPlayground() {
	const [mode, setMode] = useState<'single' | 'group'>('group');
	const [state, setState] = useState<(typeof states)[number]>('off');
	const [single, setSingle] = useState(singles[0]);
	const [label, setLabel] = useState(labels[0]);
	const [description, setDescription] = useState('Pick as many as you like');
	const [errorMessage, setErrorMessage] = useState('Pick at least one');
	const [count, setCount] = useState<(typeof counts)[number]>('5');
	const [length, setLength] = useState<Length>('short');
	const [value, setValue] = useState<string[]>(['option-1']);
	const [hasDisabledOption, setDisabledOption] = useState(false);
	const [isInvalid, setInvalid] = useState(false);
	const [isRequired, setRequired] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const isGroup = mode === 'group';
	const total = count === 'none' ? 0 : Number(count);
	const shuffle = () => {
		const nextCount = pick(counts.filter((c) => c !== 'none'));
		setMode(Math.random() < 0.3 ? 'single' : 'group');
		setState(pick(states));
		setSingle(Math.random() < 0.2 ? longWords : pick(singles));
		setLabel(pick(labels));
		setCount(nextCount);
		setLength(pick(lengths));
		setValue(Array.from({ length: Number(nextCount) }, (_, i) => `option-${i}`).filter(() => Math.random() < 0.4));
		setDisabledOption(Math.random() < 0.3);
		setInvalid(Math.random() < 0.25);
		setDisabled(Math.random() < 0.1);
	};
	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<Choice label="Mode" options={['single', 'group'] as const} value={mode} onChange={setMode} />
					{isGroup ? (
						<>
							<TextControl label="Label" value={label} onChange={setLabel} />
							<TextControl label="Description" value={description} onChange={setDescription} />
							<TextControl label="Error, when invalid" value={errorMessage} onChange={setErrorMessage} />
							<Choice label="Options" options={counts} value={count} onChange={setCount} />
							<Choice label="Option text" options={lengths} value={length} onChange={setLength} />
							<SwitchControl label="A disabled option" value={hasDisabledOption} onChange={setDisabledOption} />
							<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						</>
					) : (
						<>
							<TextControl label="Label" value={single} onChange={setSingle} />
							<Choice label="State" options={states} value={state} onChange={setState} />
						</>
					)}
					<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
				</>
			}
		>
			<div className="w-full max-w-sm">
				{isGroup ? (
					<CheckboxGroup
						label={label || undefined}
						aria-label={label ? undefined : 'Options'}
						description={description || undefined}
						errorMessage={errorMessage}
						value={value}
						onChange={setValue}
						isInvalid={isInvalid}
						isRequired={isRequired}
						isDisabled={isDisabled}
						isReadOnly={isReadOnly}
					>
						{Array.from({ length: total }, (_, i) => (
							<Checkbox key={i} value={`option-${i}`} isDisabled={hasDisabledOption && i === Math.min(2, total - 1)}>
								{optionName(i, length)}
							</Checkbox>
						))}
					</CheckboxGroup>
				) : (
					<Checkbox
						isSelected={state === 'on'}
						isIndeterminate={state === 'indeterminate'}
						onChange={(selected) => setState(selected ? 'on' : 'off')}
						isInvalid={isInvalid}
						isDisabled={isDisabled}
						isReadOnly={isReadOnly}
						aria-label={single ? undefined : 'Checkbox'}
					>
						{single}
					</Checkbox>
				)}
			</div>
		</Playground>
	);
}
