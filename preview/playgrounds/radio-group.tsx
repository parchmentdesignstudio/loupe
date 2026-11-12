import { useState } from 'react';
import { Radio, RadioGroup } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const pool = ['Under £5k', '£5–15k', 'Over £15k', 'Not sure yet', 'Monthly retainer', 'Day rate', 'Fixed price', 'Equity', 'Pro bono', 'Let’s talk'];
const counts = ['none', '2', '5', '30'] as const;
const lengths = ['short', 'long', 'mixed'] as const;
const labels = ['Budget', 'How should we bill you?', 'Pick one', 'Preferred contact'];

type Length = (typeof lengths)[number];

const optionName = (index: number, length: Length) => {
	const name = pool[index % pool.length] + (index >= pool.length ? ` ${Math.floor(index / pool.length) + 1}` : '');
	return length === 'long' || (length === 'mixed' && index % 3 === 1) ? `${name}, ${longWords.toLowerCase()}` : name;
};

export function RadioGroupPlayground() {
	const [label, setLabel] = useState(labels[0]);
	const [description, setDescription] = useState('You can change this later');
	const [errorMessage, setErrorMessage] = useState('Choose a budget');
	const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
	const [count, setCount] = useState<(typeof counts)[number]>('5');
	const [length, setLength] = useState<Length>('short');
	const [value, setValue] = useState<string | null>('option-1');
	const [hasDisabledOption, setDisabledOption] = useState(false);
	const [isInvalid, setInvalid] = useState(false);
	const [isRequired, setRequired] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const total = count === 'none' ? 0 : Number(count);
	const shuffle = () => {
		const nextCount = pick(counts.filter((c) => c !== 'none'));
		setLabel(pick(labels));
		setOrientation(Math.random() < 0.3 ? 'horizontal' : 'vertical');
		setCount(nextCount);
		setLength(pick(lengths));
		setValue(Math.random() < 0.2 ? null : `option-${Math.floor(Math.random() * Number(nextCount))}`);
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
					<TextControl label="Label" value={label} onChange={setLabel} />
					<TextControl label="Description" value={description} onChange={setDescription} />
					<TextControl label="Error, when invalid" value={errorMessage} onChange={setErrorMessage} />
					<Choice label="Orientation" options={['vertical', 'horizontal'] as const} value={orientation} onChange={setOrientation} />
					<Choice label="Options" options={counts} value={count} onChange={setCount} />
					<Choice label="Option text" options={lengths} value={length} onChange={setLength} />
					<SwitchControl label="A disabled option" value={hasDisabledOption} onChange={setDisabledOption} />
					<SwitchControl label="Nothing chosen" value={value == null} onChange={(none) => setValue(none ? null : 'option-0')} />
					<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
					<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
				</>
			}
		>
			<RadioGroup
				label={label || undefined}
				aria-label={label ? undefined : 'Options'}
				description={description || undefined}
				errorMessage={errorMessage}
				orientation={orientation}
				value={value}
				onChange={setValue}
				isInvalid={isInvalid}
				isRequired={isRequired}
				isDisabled={isDisabled}
				isReadOnly={isReadOnly}
				className="w-full max-w-sm"
			>
				{Array.from({ length: total }, (_, i) => (
					<Radio key={i} value={`option-${i}`} isDisabled={hasDisabledOption && i === Math.min(2, total - 1)}>
						{optionName(i, length)}
					</Radio>
				))}
			</RadioGroup>
		</Playground>
	);
}
