import { useState } from 'react';
import { Disclosure, DisclosureGroup, DisclosureHeader, DisclosurePanel } from '../../src/index.js';
import { Choice, Playground, SwitchControl, longWords, pick } from '../playground.js';

const questions = [
	{ title: 'What’s a disclosure?', answer: 'A heading that shows or hides what’s under it, such as an answer under its question.' },
	{ title: 'Can several be open at once?', answer: 'In a group, opening one closes the others, unless the group allows several.' },
	{ title: 'Does it animate?', answer: 'Its panel grows to fit what’s in it, and opens at once when reduced motion is on.' },
	{ title: 'What happens to my files?', answer: 'They stay in your browser, and nothing is uploaded.' },
	{ title: 'Can I change the order?', answer: 'Drag a row by its handle, or move it with the arrow keys while it’s focused.' },
	{ title: 'Who can see a project?', answer: 'Anyone you invite, and anyone with the link once you’ve shared it.' },
	{ title: 'How do I export?', answer: 'Choose Export, pick the sizes you need, and the files arrive as one zip.' },
	{ title: 'Is there a free plan?', answer: 'Yes, for one project at a time, with every feature in it.' },
	{ title: 'Can I cancel?', answer: 'Whenever you like, and your projects stay until the end of the month.' },
	{ title: 'Where’s the changelog?', answer: 'At the foot of every page, and in the menu under Help.' },
	{ title: 'Do you have an API?', answer: 'Not yet, though exports can be scripted from the command line.' },
	{ title: 'Who made this?', answer: 'A small studio, between client projects.' },
];

const longAnswer = [
	'A much longer answer, to see how the panel grows as it opens and how its text wraps beside a narrow header.',
	'It runs to a second paragraph, so there’s more than one block of text to animate, and a third after that.',
	'By now the panel is taller than the header, and closing it should still feel as quick as opening it did.',
];

const layouts = ['alone', 'group'] as const;
const counts = ['2', '5', '12'] as const;
const openings = ['none', 'first', 'all'] as const;
const disablings = ['none', 'one', 'all'] as const;
const widths = ['narrow', 'wide'] as const;

export function DisclosurePlayground() {
	const [size, setSize] = useState<'medium' | 'small'>('medium');
	const [layout, setLayout] = useState<(typeof layouts)[number]>('group');
	const [count, setCount] = useState<(typeof counts)[number]>('5');
	const [allowsMultiple, setAllowsMultiple] = useState(false);
	const [opened, setOpened] = useState<(typeof openings)[number]>('first');
	const [isLongTitle, setLongTitle] = useState(false);
	const [isLongPanel, setLongPanel] = useState(false);
	const [disabled, setDisabled] = useState<(typeof disablings)[number]>('none');
	const [width, setWidth] = useState<(typeof widths)[number]>('wide');
	const isGroup = layout === 'group';

	const items = questions.slice(0, isGroup ? Number(count) : 1).map((question, i) => ({
		id: `q${i}`,
		title: i === 0 && isLongTitle ? longWords : question.title,
		answer: question.answer,
	}));
	const ids = items.map((item) => item.id);
	const expandedKeys = opened === 'all' ? ids : opened === 'first' ? ids.slice(0, 1) : [];

	const shuffle = () => {
		setSize(pick(['medium', 'small'] as const));
		setLayout(pick(layouts));
		setCount(pick(counts));
		setAllowsMultiple(Math.random() < 0.5);
		setOpened(pick(openings));
		setLongTitle(Math.random() < 0.3);
		setLongPanel(Math.random() < 0.3);
		setDisabled(Math.random() < 0.2 ? pick(disablings) : 'none');
		setWidth(pick(widths));
	};

	const panel = (answer: string) => (
		<DisclosurePanel>
			{isLongPanel ? (
				<div className="flex flex-col gap-3">
					{longAnswer.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
			) : (
				<p className={size === 'small' ? 'text-muted' : undefined}>{answer}</p>
			)}
		</DisclosurePanel>
	);

	// Remounts when what starts open changes, so "Open at start" applies again
	const key = `${layout}-${count}-${opened}-${allowsMultiple}`;

	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<Choice label="Size" options={['medium', 'small'] as const} value={size} onChange={setSize} />
					<Choice label="Layout" options={layouts} value={layout} onChange={setLayout} />
					<Choice label="How many" options={counts} value={count} onChange={setCount} isDisabled={!isGroup} />
					{isGroup && <SwitchControl label="Several open at once" value={allowsMultiple} onChange={setAllowsMultiple} />}
					<Choice label="Open at start" options={openings} value={opened} onChange={setOpened} />
					<SwitchControl label="Long title" value={isLongTitle} onChange={setLongTitle} />
					<SwitchControl label="Long panel" value={isLongPanel} onChange={setLongPanel} />
					<Choice label="Disabled" options={disablings} value={disabled} onChange={setDisabled} />
					<Choice label="Width" options={widths} value={width} onChange={setWidth} />
				</>
			}
		>
			<div className={width === 'narrow' ? 'w-56' : 'w-full max-w-xl'}>
				{isGroup ? (
					<DisclosureGroup key={key} size={size} allowsMultipleExpanded={allowsMultiple} defaultExpandedKeys={expandedKeys} isDisabled={disabled === 'all'}>
						{items.map((item, i) => (
							// The second one, so a disabled disclosure sits between two that work
							<Disclosure key={item.id} id={item.id} isDisabled={disabled === 'one' && i === Math.min(1, items.length - 1)}>
								<DisclosureHeader>{item.title}</DisclosureHeader>
								{panel(item.answer)}
							</Disclosure>
						))}
					</DisclosureGroup>
				) : (
					<Disclosure key={key} size={size} defaultExpanded={opened !== 'none'} isDisabled={disabled !== 'none'}>
						<DisclosureHeader>{items[0].title}</DisclosureHeader>
						{panel(items[0].answer)}
					</Disclosure>
				)}
			</div>
		</Playground>
	);
}
