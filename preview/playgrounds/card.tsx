import { Icon } from '@parchment/icons/react';
import { Button, Card, List, ListItem } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';

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

/** Stats in a row: a card each, its title the label and the figure under it */
export function StatCards() {
	return (
		<div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
			{[
				['Revenue', '£18,430', 'Up 12% on last week'],
				['Orders', '312', 'Up 9%'],
				['Refunds', '6', '£342 returned'],
			].map(([label, figure, change]) => (
				<Card key={label} title={label}>
					<p className="text-title">{figure}</p>
					<p className="text-label text-muted">{change}</p>
				</Card>
			))}
		</div>
	);
}
