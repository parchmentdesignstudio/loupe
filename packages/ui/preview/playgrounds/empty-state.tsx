import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, EmptyState } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, Playground, SwitchControl, TextControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';

const descriptions = {
	none: undefined,
	short: 'Try fewer words, or check the spelling',
	long: 'A brief sets out what a project is for, who it’s for and what it needs to do, so start one before the first call and keep it to hand as the work goes on, then come back to it whenever a decision needs a reason',
} as const;
type Description = keyof typeof descriptions;
const titles = ['No briefs yet', 'No matches', 'Nothing here', 'No projects yet', 'No files'];
const actionCounts = ['none', 'one', 'two'] as const;
const actionLabels = ['short', 'long'] as const;
const widths = ['narrow', 'wide'] as const;

export function EmptyStatePlayground() {
	const [title, setTitle] = useRemembered('title', 'No briefs yet');
	const [description, setDescription] = useRemembered('description', 'short', Object.keys(descriptions) as Description[]);
	const [hasIcon, setHasIcon] = useRemembered('hasIcon', true);
	const [icon, setIcon] = useRemembered<IconName>('icon', 'note-text-badge-plus', (name) => solidIcons().includes(name));
	const [actions, setActions] = useRemembered('actions', 'one', actionCounts);
	const [action, setAction] = useRemembered('action', 'short', actionLabels);
	const [width, setWidth] = useRemembered('width', 'wide', widths);
	const shuffle = () => {
		setTitle(Math.random() < 0.15 ? longWords : pick(titles));
		setDescription(pick(Object.keys(descriptions) as Description[]));
		setHasIcon(Math.random() < 0.7);
		setIcon(pick(solidIcons()));
		setActions(pick(actionCounts));
		setAction(Math.random() < 0.2 ? 'long' : 'short');
		setWidth(pick(widths));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={widths} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Title" value={title} onChange={setTitle} />
						<Choice label="Description" options={Object.keys(descriptions) as Description[]} value={description} onChange={setDescription} />
						<SwitchControl label="Icon" value={hasIcon} onChange={setHasIcon} />
						{hasIcon && <IconPicker label="Icon name" value={icon} onChange={setIcon} />}
						<Choice label="Actions" options={actionCounts} value={actions} onChange={setActions} />
						{actions !== 'none' && <Choice label="Action label" options={actionLabels} value={action} onChange={setAction} />}
					</ControlGroup>
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
