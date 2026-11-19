import { Radio, RadioGroup } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';

const pool = ['Under £5k', '£5–15k', 'Over £15k', 'Not sure yet', 'Monthly retainer', 'Day rate', 'Fixed price', 'Equity', 'Pro bono', 'Let’s talk'];
const counts = ['none', '2', '5', '30'] as const;
const lengths = ['short', 'long', 'mixed'] as const;
const labels = ['Budget', 'How should we bill you?', 'Pick one', 'Preferred contact'];
const orientations = ['vertical', 'horizontal'] as const;

type Length = (typeof lengths)[number];

const optionName = (index: number, length: Length) => {
	const name = pool[index % pool.length] + (index >= pool.length ? ` ${Math.floor(index / pool.length) + 1}` : '');
	return length === 'long' || (length === 'mixed' && index % 3 === 1) ? `${name}, ${longWords.toLowerCase()}` : name;
};

export function RadioGroupPlayground() {
	const [label, setLabel] = useRemembered('label', labels[0]);
	const [description, setDescription] = useRemembered('description', 'You can change this later');
	const [errorMessage, setErrorMessage] = useRemembered('errorMessage', 'Choose a budget');
	const [orientation, setOrientation] = useRemembered('orientation', 'vertical', orientations);
	const [count, setCount] = useRemembered('count', '5', counts);
	const [length, setLength] = useRemembered('length', 'short', lengths);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	// The option's value, or '' for nothing chosen, as null would read as nothing stored
	const [value, setValue] = useRemembered('value', 'option-1');
	const [hasDisabledOption, setDisabledOption] = useRemembered('hasDisabledOption', false);
	const [isInvalid, setInvalid] = useRemembered('isInvalid', false);
	const [isRequired, setRequired] = useRemembered('isRequired', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isReadOnly, setReadOnly] = useRemembered('isReadOnly', false);
	const total = count === 'none' ? 0 : Number(count);
	const shuffle = () => {
		const nextCount = pick(counts.filter((c) => c !== 'none'));
		setLabel(pick(labels));
		setOrientation(Math.random() < 0.3 ? 'horizontal' : 'vertical');
		setCount(nextCount);
		setLength(pick(lengths));
		setValue(Math.random() < 0.2 ? '' : `option-${Math.floor(Math.random() * Number(nextCount))}`);
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
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<TextControl label="Description" value={description} onChange={setDescription} />
						<TextControl label="Error, when invalid" value={errorMessage} onChange={setErrorMessage} />
						<Choice label="Options" options={counts} value={count} onChange={setCount} />
						<Choice label="Option text" options={lengths} value={length} onChange={setLength} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Orientation" options={orientations} value={orientation} onChange={setOrientation} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<SwitchControl label="A disabled option" value={hasDisabledOption} onChange={setDisabledOption} />
						<SwitchControl label="Nothing chosen" value={!value} onChange={(none) => setValue(none ? '' : 'option-0')} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						<SwitchControl label="Required" value={isRequired} onChange={setRequired} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
					</ControlGroup>
				</>
			}
		>
			<RadioGroup
				label={label || undefined}
				aria-label={label ? undefined : 'Options'}
				description={description || undefined}
				errorMessage={errorMessage}
				orientation={orientation}
				value={value || null}
				onChange={setValue}
				isInvalid={isInvalid}
				isRequired={isRequired}
				isDisabled={isDisabled}
				isReadOnly={isReadOnly}
				className="w-full max-w-sm"
			>
				{Array.from({ length: total }, (_, i) => (
					<Radio key={i} value={`option-${i}`} data-show-focus={(isFocused && i === 0) || undefined} isDisabled={hasDisabledOption && i === Math.min(2, total - 1)}>
						{optionName(i, length)}
					</Radio>
				))}
			</RadioGroup>
		</Playground>
	);
}
