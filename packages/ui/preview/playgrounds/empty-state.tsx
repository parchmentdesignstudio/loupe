import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, EmptyState } from '../../src/index.js';
import { Choice, IconPicker, Playground, SwitchControl, TextControl, longWords, pick, solidIcons } from '../playground.js';

const descriptions = {
	none: undefined,
	short: 'Try fewer words, or check the spelling',
	long: 'A brief sets out what a project is for, who it’s for and what it needs to do, so start one before the first call and keep it to hand as the work goes on, then come back to it whenever a decision needs a reason',
} as const;
type Description = keyof typeof descriptions;
const titles = ['No briefs yet', 'No matches', 'Nothing here', 'No projects yet', 'No files'];

export function EmptyStatePlayground() {
	const [title, setTitle] = useState('No briefs yet');
	const [description, setDescription] = useState<Description>('short');
	const [hasIcon, setHasIcon] = useState(true);
	const [icon, setIcon] = useState<IconName>('note-text-badge-plus');
	const [actions, setActions] = useState<'none' | 'one' | 'two'>('one');
	const [action, setAction] = useState<'short' | 'long'>('short');
	const [width, setWidth] = useState<'narrow' | 'wide'>('wide');
	const shuffle = () => {
		setTitle(Math.random() < 0.15 ? longWords : pick(titles));
		setDescription(pick(Object.keys(descriptions) as Description[]));
		setHasIcon(Math.random() < 0.7);
		setIcon(pick(solidIcons()));
		setActions(pick(['none', 'one', 'two'] as const));
		setAction(Math.random() < 0.2 ? 'long' : 'short');
		setWidth(pick(['narrow', 'wide'] as const));
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<TextControl label="Title" value={title} onChange={setTitle} />
					<Choice label="Description" options={Object.keys(descriptions) as Description[]} value={description} onChange={setDescription} />
					<SwitchControl label="Icon" value={hasIcon} onChange={setHasIcon} />
					{hasIcon && <IconPicker label="Icon name" value={icon} onChange={setIcon} />}
					<Choice label="Actions" options={['none', 'one', 'two'] as const} value={actions} onChange={setActions} />
					<Choice label="Action label" options={['short', 'long'] as const} value={action} onChange={setAction} isDisabled={actions === 'none'} />
					<Choice label="Width" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />
				</>
			}
		>
			<EmptyState
				icon={hasIcon ? <Icon name={icon} /> : undefined}
				title={title}
				actions={
					actions === 'none' ? undefined : (
						<>
							<Button start={<Icon name="plus" />}>{action === 'long' ? longWords : 'New brief'}</Button>
							{actions === 'two' && <Button variant="secondary">Import one</Button>}
						</>
					)
				}
				className={width === 'narrow' ? 'w-full max-w-xs' : 'w-full'}
			>
				{descriptions[description]}
			</EmptyState>
		</Playground>
	);
}
