import { useState } from 'react';
import { Breadcrumb, Breadcrumbs } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, longWords, pick } from '../playground.js';

const counts = { two: 2, four: 4, eight: 8 } as const;
type Count = keyof typeof counts;
const widths = { narrow: 'max-w-60', medium: 'max-w-md', wide: 'max-w-none' } as const;
type Width = keyof typeof widths;
const names = ['Parchment', 'Clients', 'Hartley & Webb', 'Projects', 'Brand identity', 'Logo', 'Lockups', 'Horizontal'];

// The second crumb is a group with no page, as Actions is in loupe's own trail, when Group is on
const trailFor = (count: Count, text: 'short' | 'long', hasGroup: boolean) =>
	names.slice(-counts[count]).map((name, index, all) => ({
		name: text === 'long' && (index === all.length - 1 || index === 2) ? `${name}: ${longWords.toLowerCase()}` : name,
		href: hasGroup && index === 1 ? undefined : `#/ui/breadcrumbs`,
	}));

export function BreadcrumbsPlayground() {
	const [count, setCount] = useState<Count>('eight');
	const [text, setText] = useState<'short' | 'long'>('short');
	const [width, setWidth] = useState<Width>('medium');
	const [hasGroup, setGroup] = useState(true);
	const [hasLimit, setLimit] = useState(false);
	const [maxVisible, setMaxVisible] = useState(3);
	const [isDisabled, setDisabled] = useState(false);
	const shuffle = () => {
		setCount(pick(['two', 'four', 'eight'] as const));
		setText(Math.random() < 0.3 ? 'long' : 'short');
		setWidth(pick(Object.keys(widths) as Width[]));
		setGroup(Math.random() < 0.5);
		setLimit(Math.random() < 0.3);
		setMaxVisible(pick([2, 3, 4]));
		setDisabled(Math.random() < 0.1);
	};
	const trail = trailFor(count, text, hasGroup);
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Crumbs" options={Object.keys(counts) as Count[]} value={count} onChange={setCount} />
						<Choice label="Text" options={['short', 'long'] as const} value={text} onChange={setText} />
						<SwitchControl label="A group with no page" value={hasGroup} onChange={setGroup} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<SwitchControl label="Limit how many show" value={hasLimit} onChange={setLimit} />
						{hasLimit && <NumberControl label="Most to show" value={maxVisible} onChange={setMaxVisible} minValue={2} maxValue={8} />}
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			{/* The dashed edge shows the room the trail has to fit in */}
			<div className={`w-full rounded-md p-2 outline outline-dashed outline-bleed/16 ${widths[width]}`}>
				<Breadcrumbs maxVisible={hasLimit ? maxVisible : undefined} isDisabled={isDisabled}>
					{trail.map((crumb, index) => (
						<Breadcrumb key={index} href={crumb.href}>
							{crumb.name}
						</Breadcrumb>
					))}
				</Breadcrumbs>
			</div>
		</Playground>
	);
}
