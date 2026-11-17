import { useEffect, useState } from 'react';
import { Button, Meter, ProgressBar, ProgressCircle } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, longWords, pick, useRemembered } from '../playground.js';

const kinds = ['bar', 'circle', 'meter'] as const;
const labels = ['none', 'short', 'long'] as const;
const values = ['percent', 'custom'] as const;
const widths = { narrow: 'w-32', medium: 'w-64', wide: 'w-full max-w-md' } as const;
type Width = keyof typeof widths;
const sizes = ['medium', 'large'] as const;

export function ProgressBarPlayground() {
	const [kind, setKind] = useRemembered('kind', 'bar', kinds);
	const [label, setLabel] = useRemembered('label', 'short', labels);
	const [value, setValue] = useRemembered('value', 45, (stored) => stored >= 0 && stored <= 100);
	const [isIndeterminate, setIndeterminate] = useRemembered('isIndeterminate', false);
	const [isRunning, setRunning] = useRemembered('isRunning', false);
	const [valueText, setValueText] = useRemembered('valueText', 'percent', values);
	const [size, setSize] = useRemembered('size', 'medium', sizes);
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const isMeter = kind === 'meter';
	const isCircle = kind === 'circle';
	// Running, it counts up and starts again, to watch the fill move
	useEffect(() => {
		if (!isRunning) return;
		const timer = setInterval(() => setValue((current) => (current >= 100 ? 0 : Math.min(100, current + 7))), 300);
		return () => clearInterval(timer);
	}, [isRunning, setValue]);
	const shuffle = () => {
		setKind(pick(kinds));
		setLabel(pick(labels));
		setValue(Math.round(Math.random() * 100));
		setIndeterminate(Math.random() < 0.3);
		setValueText(pick(values));
		setSize(pick(sizes));
		setWidth(pick(Object.keys(widths) as Width[]));
	};
	const name = isMeter ? 'Storage' : 'Uploading artwork';
	const shown = label === 'none' ? undefined : label === 'long' ? longWords : name;
	const custom = valueText === 'custom' ? (isMeter ? `${(value / 10).toFixed(1)} of 10 GB` : `${Math.round(value / 12.5)} of 8 files`) : undefined;
	const indeterminate = !isMeter && isIndeterminate;
	return (
		<Playground
			onRandom={shuffle}
			preview={!isCircle && <Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label={isCircle ? 'Label, read out' : 'Label'} options={labels} value={label} onChange={setLabel} />
						{!isCircle && <Choice label="Value text" options={values} value={valueText} onChange={setValueText} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Kind" options={kinds} value={kind} onChange={setKind} />
						{isCircle && <Choice label="Size" options={sizes} value={size} onChange={setSize} />}
					</ControlGroup>
					<ControlGroup label="State">
						<NumberControl label="Value" value={value} onChange={setValue} minValue={0} maxValue={100} />
						<SwitchControl label="Running" value={isRunning} onChange={setRunning} />
						{!isMeter && <SwitchControl label="Indeterminate" value={isIndeterminate} onChange={setIndeterminate} />}
					</ControlGroup>
				</>
			}
		>
			{kind === 'bar' && <ProgressBar label={shown} aria-label={shown ? undefined : name} value={value} valueLabel={custom} isIndeterminate={indeterminate} className={widths[width]} />}
			{isMeter && <Meter label={shown} aria-label={shown ? undefined : name} value={value} valueLabel={custom} className={widths[width]} />}
			{isCircle && <ProgressCircle aria-label={shown ?? name} value={value} isIndeterminate={indeterminate} size={size} />}
		</Playground>
	);
}

/** A button that spins while its action runs, then settles */
export function Saving() {
	const [isPending, setPending] = useState(false);
	const save = () => {
		setPending(true);
		setTimeout(() => setPending(false), 2400);
	};
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Button isPending={isPending} onPress={save}>
				Save changes
			</Button>
			<Button variant="secondary" isPending={isPending} onPress={save}>
				Publish
			</Button>
		</div>
	);
}
