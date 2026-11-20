import { useState } from 'react';
import { Suggestion, Suggestions } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, useRemembered } from '../playground.js';

const variants = ['starter', 'follow-up'] as const;
const counts = ['two', 'three', 'four'] as const;
const sizes = { two: 2, three: 3, four: 4 };
const starters = ['What should I cook tonight?', 'Plan a week of lunches', 'What’s in season now?', 'Use up a bag of spinach'];
const followUps = ['Could it be vegan?', 'How long does it keep?', 'What goes with it?', 'Make it for six'];

// Pressing one shows what was asked. Each press also turns the first over to a fresh question, which the ray crosses
export function SuggestionsPlayground() {
	const [variant, setVariant] = useRemembered('variant', 'starter', variants);
	const [count, setCount] = useRemembered('count', 'three', counts);
	const [isLong, setLong] = useRemembered('isLong', false);
	const [asked, setAsked] = useState('');
	const [turn, setTurn] = useState(0);
	const list = (variant === 'starter' ? starters : followUps).slice(0, sizes[count]);
	const shown = list.map((text, index) => (index === 0 ? (isLong ? longWords : list[(turn % list.length)]) : text));
	return (
		<Playground
			onRandom={() => {
				setVariant(pick(variants));
				setCount(pick(counts));
			}}
			box="flex-col items-start gap-4"
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Questions" options={counts} value={count} onChange={setCount} />
						<SwitchControl label="Long question" value={isLong} onChange={setLong} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
					</ControlGroup>
				</>
			}
		>
			<Suggestions key={variant} aria-label={variant === 'starter' ? 'Suggested questions' : 'Follow-up questions'} variant={variant} className="w-full max-w-sm">
				{shown.map((text, index) => (
					<Suggestion
						key={index}
						onPress={() => {
							setAsked(text);
							setTurn((at) => at + 1);
						}}
					>
						{text}
					</Suggestion>
				))}
			</Suggestions>
			{asked && <p className="font-mono text-label">Asked: {asked}</p>}
		</Playground>
	);
}
