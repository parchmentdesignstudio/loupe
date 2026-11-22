import { Icon } from '@parchment/icons/react';
import { List, ListItem, Status } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, useRemembered } from '../playground.js';

const variants = ['divided', 'plain'] as const;
const ends = ['none', 'amount', 'status'] as const;
const rows = [
	{ name: 'Plan', detail: 'Team, billed yearly', amount: '£144.00', icon: 'person' },
	{ name: 'Next invoice', detail: 'On 1 December 2026', amount: '£12.00', icon: 'calendar' },
	{ name: 'Invoices go to', detail: 'accounts@hartley-finch.co.uk', amount: '£0.00', icon: 'envelope' },
] as const;

export function ListPlayground() {
	const [variant, setVariant] = useRemembered('variant', 'divided', variants);
	const [hasIcons, setIcons] = useRemembered('hasIcons', false);
	const [hasDescriptions, setDescriptions] = useRemembered('hasDescriptions', true);
	const [end, setEnd] = useRemembered('end', 'amount', ends);
	const [isLong, setLong] = useRemembered('isLong', false);
	return (
		<Playground
			onRandom={() => {
				setVariant(pick(variants));
				setIcons(Math.random() < 0.5);
				setDescriptions(Math.random() < 0.6);
				setEnd(pick(ends));
				setLong(Math.random() < 0.15);
			}}
			controls={
				<ControlGroup label="Content">
					<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
					<SwitchControl label="Icons" value={hasIcons} onChange={setIcons} />
					<SwitchControl label="Descriptions" value={hasDescriptions} onChange={setDescriptions} />
					<Choice label="End" options={ends} value={end} onChange={setEnd} />
					<SwitchControl label="Long words" value={isLong} onChange={setLong} />
				</ControlGroup>
			}
		>
			<List variant={variant} aria-label="Billing" className="w-80">
				{rows.map((row, index) => (
					<ListItem
						key={row.name}
						icon={hasIcons ? <Icon name={row.icon} /> : undefined}
						description={hasDescriptions ? (isLong && index === 0 ? longWords : row.detail) : undefined}
						end={end === 'amount' ? row.amount : end === 'status' ? <Status tone={index ? 'neutral' : 'success'}>{index ? 'Scheduled' : 'Paid'}</Status> : undefined}
					>
						{row.name}
					</ListItem>
				))}
			</List>
		</Playground>
	);
}
