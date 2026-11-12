import { useState } from 'react';
import { Switch } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const labels = ['Send me the newsletter', 'Dark mode', 'Show rulers', 'Notify me when someone replies', 'Autosave'];
const counts = ['1', '3', '8'] as const;

// More than one stacks them, as in a settings list, to see how the labels and tracks line up
export function SwitchPlayground() {
	const [label, setLabel] = useState(labels[0]);
	const [hasLabel, setHasLabel] = useState(true);
	const [count, setCount] = useState<(typeof counts)[number]>('1');
	const [selected, setSelected] = useState<boolean[]>([true, false, true, false, false, true, false, false]);
	const [isDisabled, setDisabled] = useState(false);
	const [isReadOnly, setReadOnly] = useState(false);
	const total = Number(count);
	const textFor = (index: number) => (index === 0 ? label : labels[index % labels.length]);
	const shuffle = () => {
		setLabel(Math.random() < 0.2 ? longWords : pick(labels));
		setHasLabel(Math.random() < 0.85);
		setCount(pick(counts));
		setSelected(selected.map(() => Math.random() < 0.5));
		setDisabled(Math.random() < 0.1);
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<TextControl label="Label" value={label} onChange={setLabel} />
					<SwitchControl label="Label shown" value={hasLabel} onChange={setHasLabel} />
					<SwitchControl label="On" value={selected[0]} onChange={(on) => setSelected(selected.map((value, i) => (i === 0 ? on : value)))} />
					<Choice label="Switches" options={counts} value={count} onChange={setCount} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
				</>
			}
		>
			<div className="flex w-full max-w-sm flex-col">
				{Array.from({ length: total }, (_, i) => (
					<Switch
						key={i}
						isSelected={selected[i]}
						onChange={(on) => setSelected(selected.map((value, j) => (j === i ? on : value)))}
						isDisabled={isDisabled}
						isReadOnly={isReadOnly}
						aria-label={hasLabel ? undefined : textFor(i)}
					>
						{hasLabel ? textFor(i) : undefined}
					</Switch>
				))}
			</div>
		</Playground>
	);
}
