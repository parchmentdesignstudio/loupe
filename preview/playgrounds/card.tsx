import type { CSSProperties } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Card, List, ListItem } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SliderControl, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';

const fills = ['raised', 'quiet'] as const;
const buttonCounts = ['none', 'one', 'two'] as const;
const titles = ['Team', 'Starter', 'Business', 'Revenue', 'Rebrand'];

export function CardPlayground() {
	const [title, setTitle] = useRemembered('title', 'Team');
	const [description, setDescription] = useRemembered('description', 'For small teams sharing work and deadlines');
	const [hasList, setList] = useRemembered('hasList', true);
	const [buttons, setButtons] = useRemembered('buttons', 'one', buttonCounts);
	const [fill, setFill] = useRemembered('fill', 'raised', fills);
	return (
		<Playground
			onRandom={() => {
				setTitle(Math.random() < 0.15 ? longWords : pick(titles));
				setList(Math.random() < 0.7);
				setButtons(pick(buttonCounts));
				setFill(pick(fills));
			}}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Title" value={title} onChange={setTitle} />
						<TextControl label="Description" value={description} onChange={setDescription} />
						<SwitchControl label="List" value={hasList} onChange={setList} />
						<Choice label="Buttons" options={buttonCounts} value={buttons} onChange={setButtons} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Fill" options={fills} value={fill} onChange={setFill} />
					</ControlGroup>
				</>
			}
		>
			<Card
				title={title}
				description={description || undefined}
				fill={fill}
				className="w-72"
				actions={
					buttons === 'none' ? undefined : (
						<>
							<Button variant="secondary">Start free trial</Button>
							{buttons === 'two' && <Button variant="ghost">Compare</Button>}
						</>
					)
				}
			>
				<p className="text-title">£12</p>
				{hasList && (
					<List variant="plain">
						<ListItem icon={<Icon name="checkmark" />}>Unlimited projects</ListItem>
						<ListItem icon={<Icon name="checkmark" />}>100 GB of storage</ListItem>
					</List>
				)}
			</Card>
		</Playground>
	);
}

const plans = [
	{ name: 'Starter', price: '£0', note: 'For one person trying it out', features: ['3 projects', '2 GB of storage'], button: 'Start for free' },
	{ name: 'Team', price: '£12', note: 'For small teams sharing work', features: ['Unlimited projects', '100 GB of storage', 'Guest access', 'Priority support'], button: 'Start free trial', isPicked: true },
	{ name: 'Business', price: '£24', note: 'For organisations', features: ['Everything in Team', 'Single sign-on'], button: 'Talk to sales' },
];

/** Plans side by side: each card stretches to the tallest, so their buttons line up at the foot */
export function PricingCards() {
	return (
		<div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
			{plans.map((plan) => (
				<Card key={plan.name} title={plan.name} description={plan.note} actions={<Button variant={plan.isPicked ? 'primary' : 'secondary'}>{plan.button}</Button>}>
					<p className="text-title">
						{plan.price} <span className="text-label text-muted">a month</span>
					</p>
					<List variant="plain">
						{plan.features.map((feature) => (
							<ListItem key={feature} icon={<Icon name="checkmark" />}>
								{feature}
							</ListItem>
						))}
					</List>
				</Card>
			))}
		</div>
	);
}

const stats = [
	['Revenue', '£18,430', 'Up 12% on last week'],
	['Orders', '312', 'Up 9%'],
	['Refunds', '6', '£342 returned'],
] as const;

/** Stats in a row: a card each, its title the label, the figure grouped with it, and the change under that */
export function StatCards() {
	return (
		<div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
			{stats.map(([label, figure, change]) => (
				<Card key={label} title={label} figure={figure} description={change} />
			))}
		</div>
	);
}

// Sizes a step apart on the 4px grid, each with a line 4px past it
const figureSizes = [20, 24, 28, 32, 36, 40];
const gaps = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];

/** Stats with the figure's size and the space round it on sliders, to settle the hierarchy */
export function StatPlayground() {
	const [size, setSize] = useRemembered('statSize', 28);
	const [tracking, setTracking] = useRemembered('statTracking', -0.02);
	const [titleGap, setTitleGap] = useRemembered('statTitleGap', 1);
	const [figureGap, setFigureGap] = useRemembered('statFigureGap', 6);
	const [fill, setFill] = useRemembered('statFill', 'raised', fills);
	const tokens = {
		'--card-figure-size': `${size}px`,
		'--card-figure-line-height': `${size + 4}px`,
		'--card-figure-letter-spacing': `${tracking}em`,
		'--card-figure-title-gap': `${titleGap * 4}px`,
		'--card-figure-gap': `${figureGap * 4}px`,
	} as CSSProperties;
	// Not a Playground, which would give the page's Component block this story's code over Build one's
	return (
		<div className="flex w-full flex-col gap-4">
			<div style={tokens} className="flex items-center justify-center rounded-lg bg-panel px-6 py-12 outline outline-ground">
				<div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
					{stats.map(([label, figure, change]) => (
						<Card key={label} title={label} figure={figure} description={change} fill={fill} />
					))}
				</div>
			</div>
			<div className="flex flex-col">
				<ControlGroup label="Figure">
					<SliderControl label="Size" unit="px" value={size} onChange={setSize} minValue={20} maxValue={40} steps={figureSizes} />
					<SliderControl label="Tracking" value={tracking} onChange={(value) => setTracking(Math.round(value * 1000) / 1000)} minValue={-0.04} maxValue={0} steps={[-0.04, -0.035, -0.03, -0.025, -0.02, -0.015, -0.0125, -0.01, -0.005, 0]} />
				</ControlGroup>
				<ControlGroup label="Space">
					<SliderControl label="Title to figure" unit="px" value={titleGap} onChange={setTitleGap} minValue={0} maxValue={8} steps={gaps} scale={4} />
					<SliderControl label="Figure to change" unit="px" value={figureGap} onChange={setFigureGap} minValue={0} maxValue={8} steps={gaps} scale={4} />
				</ControlGroup>
				<ControlGroup label="Appearance">
					<Choice label="Fill" options={fills} value={fill} onChange={setFill} />
				</ControlGroup>
			</div>
		</div>
	);
}
