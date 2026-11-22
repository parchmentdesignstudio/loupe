import { useState } from 'react';
import { Switch, SwitchGroup } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';

const labels = ['Send me the newsletter', 'Dark mode', 'Show rulers', 'Notify me when someone replies', 'Autosave'];
const counts = ['1', '3', '8'] as const;
const shapes = ['rounded', 'full'] as const;

// More than one stacks them, as in a settings list, to see how the labels and tracks line up
export function SwitchPlayground() {
	const [label, setLabel] = useRemembered('label', labels[0]);
	const [hasLabel, setHasLabel] = useRemembered('hasLabel', true);
	const [shape, setShape] = useRemembered('shape', 'rounded', shapes);
	const [count, setCount] = useRemembered('count', '1', counts);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	// The first switch apart from the rest, as it's the one On sets and the only one remembered
	const [isOn, setOn] = useRemembered('isOn', true);
	const [others, setOthers] = useState([false, true, false, false, true, false, false]);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isReadOnly, setReadOnly] = useRemembered('isReadOnly', false);
	const selected = [isOn, ...others];
	const select = (index: number, on: boolean) => (index === 0 ? setOn(on) : setOthers(others.map((value, i) => (i === index - 1 ? on : value))));
	const total = Number(count);
	const textFor = (index: number) => (index === 0 ? label : labels[index % labels.length]);
	const shuffle = () => {
		setLabel(Math.random() < 0.2 ? longWords : pick(labels));
		setHasLabel(Math.random() < 0.85);
		setCount(pick(counts));
		const next = selected.map(() => Math.random() < 0.5);
		setOn(next[0]);
		setOthers(next.slice(1));
		setShape(pick(shapes));
		setDisabled(Math.random() < 0.1);
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Switches" options={counts} value={count} onChange={setCount} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<SwitchControl label="Label shown" value={hasLabel} onChange={setHasLabel} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Shape" options={shapes} value={shape} onChange={setShape} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<SwitchControl label="On" value={isOn} onChange={setOn} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
					</ControlGroup>
				</>
			}
		>
			<div className="flex w-full max-w-sm flex-col">
				{Array.from({ length: total }, (_, i) => (
					<Switch
						key={i}
						shape={shape}
						isSelected={selected[i]}
						onChange={(on) => select(i, on)}
						isDisabled={isDisabled}
						isReadOnly={isReadOnly}
						aria-label={hasLabel ? undefined : textFor(i)}
						data-show-focus={isFocused || undefined}
					>
						{hasLabel ? textFor(i) : undefined}
					</Switch>
				))}
			</div>
		</Playground>
	);
}

/** A settings screen's notifications: a few switches under each heading, each label first and its switch at the end */
export function Notifications() {
	return (
		<div className="flex w-full max-w-160 flex-col gap-10">
			<SwitchGroup label="Email">
				<Switch defaultSelected description="When someone tags you or answers a comment of yours">
					Mentions and replies
				</Switch>
				<Switch defaultSelected>Comments on my projects</Switch>
				<Switch defaultSelected>Invoices paid or overdue</Switch>
				<Switch>Product news and tips</Switch>
			</SwitchGroup>
			<SwitchGroup label="Push">
				<Switch defaultSelected>Direct messages</Switch>
				<Switch description="A summary each morning at 9am, rather than as they happen">Daily digest</Switch>
			</SwitchGroup>
		</div>
	);
}
