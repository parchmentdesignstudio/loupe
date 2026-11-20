import { useState } from 'react';
import { Button, TextEffect } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, pick, useRemembered } from '../playground.js';

const sizes = { label: 'text-label', body: 'text-body', title: 'text-title' } as const;
type Size = keyof typeof sizes;
const tones = ['ink', 'muted'] as const;

// What the text says in turn. Each press moves it on, which plays the ray
const phrases = ['What should I cook tonight?', 'Something with what’s in the fridge', 'Thinking', 'A quick pasta, with the last of the spinach', 'Found three recipes'];

export function TextEffectPlayground() {
	const [size, setSize] = useRemembered<Size>('size', 'title', Object.keys(sizes) as Size[]);
	const [tone, setTone] = useRemembered('tone', 'ink', tones);
	const [loop, setLoop] = useRemembered('loop', false);
	const [pace, setPace] = useRemembered('pace', 0.35);
	const [index, setIndex] = useState(0);
	const next = () => setIndex((at) => (at + 1) % phrases.length);
	return (
		<Playground
			onRandom={() => {
				setSize(pick(Object.keys(sizes) as Size[]));
				setTone(pick(tones));
				next();
			}}
			box="flex-col items-start gap-4"
			controls={
				<>
					<ControlGroup label="Behaviour">
						<SwitchControl label="Loop" value={loop} onChange={setLoop} />
						<NumberControl label="Pace, px a ms" value={pace} onChange={setPace} minValue={0.05} maxValue={2} step={0.05} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Size" options={Object.keys(sizes) as Size[]} value={size} onChange={setSize} />
						<Choice label="Colour" options={tones} value={tone} onChange={setTone} />
					</ControlGroup>
				</>
			}
		>
			<TextEffect variant="ray" loop={loop} pace={pace} className={`${sizes[size]} ${tone === 'ink' ? 'text-ink' : 'text-muted'}`}>
				{phrases[index]}
			</TextEffect>
			<Button variant="secondary" size="small" onPress={next}>
				Change the text
			</Button>
		</Playground>
	);
}

// While something works, the ray loops over a word, and stops when it's done
export function Thinking() {
	const [isThinking, setThinking] = useState(true);
	return (
		<div className="flex flex-col items-start gap-4">
			<TextEffect variant="ray" loop={isThinking} className="text-body text-muted">
				{isThinking ? 'Thinking' : 'Found three recipes'}
			</TextEffect>
			<Button variant="secondary" size="small" onPress={() => setThinking(!isThinking)}>
				{isThinking ? 'Finish' : 'Think again'}
			</Button>
		</div>
	);
}
