import { Button, DialogActions, DialogClose, DialogHeading, Drawer, DrawerTrigger, TextField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';
import { codeOf } from '../code.js';
import { type Length, bodyOf, lengths } from './overlay.js';

const modes = ['overlay', 'push'] as const;
const positions = ['bottom', 'top', 'start', 'end', 'center'] as const;
const sides = ['start', 'end'] as const;
const pushFroms = ['md', 'lg', 'xl'] as const;
const reflows = ['once', 'continuous'] as const;
const headings = ['none', 'short', 'long'] as const;
const snaps = ['none', 'two', 'three'] as const;
const titles = ['Rename project', 'Share link', 'Filters', 'Invite people', 'Settings'];

// Snap points are how much of the drawer shows, so the last one is all of it
const snapPointsOf = { none: undefined, two: ['50%', '100%'], three: ['25%', '60%', '100%'] };

// An overlay covers the controls, so there's no keep-open switch. Stopping dismissal with no buttons left keeps a Done
// button. A pushing drawer gets a stand-in page to push aside
export function DrawerPlayground() {
	const [mode, setMode] = useRemembered('mode', 'overlay', modes);
	const [position, setPosition] = useRemembered('position', 'bottom', positions);
	const [side, setSide] = useRemembered('side', 'end', sides);
	const [pushFrom, setPushFrom] = useRemembered('pushFrom', 'md', pushFroms);
	const [reflow, setReflow] = useRemembered('reflow', 'once', reflows);
	const [heading, setHeading] = useRemembered('heading', 'short', headings);
	const [title, setTitle] = useRemembered('title', 'Rename project');
	const [body, setBody] = useRemembered<Length>('body', 'short', lengths);
	const [hasField, setHasField] = useRemembered('hasField', false);
	const [hasActions, setHasActions] = useRemembered('hasActions', true);
	const [hasClose, setHasClose] = useRemembered('hasClose', true);
	const [snap, setSnap] = useRemembered('snap', 'none', snaps);
	const [preventDismissal, setPreventDismissal] = useRemembered('preventDismissal', false);
	const [trigger, setTrigger] = useRemembered('trigger', 'Open drawer');
	const isPush = mode === 'push';
	const isTrapped = !isPush && preventDismissal && !hasClose && !hasActions;
	const shuffle = () => {
		setMode(pick(modes));
		setPosition(pick(positions));
		setSide(pick(sides));
		setReflow(pick(reflows));
		setHeading(pick(headings));
		setTitle(pick(titles));
		setBody(pick(lengths));
		setHasField(Math.random() < 0.4);
		setHasActions(Math.random() < 0.6);
		setHasClose(Math.random() < 0.7);
		setSnap(Math.random() < 0.7 ? 'none' : pick(snaps));
		setPreventDismissal(Math.random() < 0.2);
	};

	const button = <Button variant="secondary">{trigger || 'Open drawer'}</Button>;
	const drawer = (
		<Drawer
			mode={isPush ? 'push' : undefined}
			position={isPush ? side : position}
			pushFrom={isPush ? pushFrom : undefined}
			reflow={isPush ? reflow : undefined}
			snapPoints={isPush ? undefined : snapPointsOf[snap]}
			preventDismissal={!isPush && preventDismissal}
			aria-label={heading === 'none' ? title || 'Drawer' : undefined}
		>
			{heading !== 'none' && <DialogHeading>{heading === 'long' ? longWords : title}</DialogHeading>}
			{hasClose && <DialogClose />}
			{bodyOf(body).map((text, index) => (
				<p key={index} className={['text-body text-muted', heading === 'none' && index === 0 ? '' : 'mt-2'].join(' ')}>
					{text}
				</p>
			))}
			{hasField && <TextField label="Name" defaultValue="Loupe" autoFocus className="mt-4" />}
			{(hasActions || isTrapped) && (
				<DialogActions>
					{hasActions && (
						<Button slot="close" variant="secondary">
							Cancel
						</Button>
					)}
					<Button slot="close">{hasActions ? 'Save' : 'Done'}</Button>
				</DialogActions>
			)}
		</Drawer>
	);

	return (
		<Playground
			onRandom={shuffle}
			// The stand-in page isn't part of the code to copy
			code={isPush ? codeOf(<DrawerTrigger>{button}{drawer}</DrawerTrigger>) : undefined}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Heading" options={headings} value={heading} onChange={setHeading} />
						{heading === 'short' && <TextControl label="Heading text" value={title} onChange={setTitle} />}
						<Choice label="Body" options={lengths} value={body} onChange={setBody} />
						<SwitchControl label="Text field" value={hasField} onChange={setHasField} />
						<SwitchControl label="Actions" value={hasActions} onChange={setHasActions} />
						<SwitchControl label="Close button" value={hasClose} onChange={setHasClose} />
					</ControlGroup>
					<ControlGroup label="Placement">
						<Choice label="Mode" options={modes} value={mode} onChange={setMode} />
						{isPush ? (
							<>
								<Choice label="Position" options={sides} value={side} onChange={setSide} />
								<Choice label="Push from" options={pushFroms} value={pushFrom} onChange={setPushFrom} />
								<Choice label="Reflow" options={reflows} value={reflow} onChange={setReflow} />
							</>
						) : (
							<>
								<Choice label="Position" options={positions} value={position} onChange={setPosition} />
								<Choice label="Snap points" options={snaps} value={snap} onChange={setSnap} />
							</>
						)}
					</ControlGroup>
					{!isPush && (
						<ControlGroup label="Behaviour">
							<SwitchControl label="Prevent dismissal" value={preventDismissal} onChange={setPreventDismissal} />
						</ControlGroup>
					)}
					<ControlGroup label="Trigger">
						<TextControl label="Trigger" value={trigger} onChange={setTrigger} />
					</ControlGroup>
				</>
			}
		>
			{isPush ? (
				<DrawerTrigger>
					<div className="flex h-96 w-full overflow-hidden rounded-lg bg-ground [--bleed:var(--ground-bleed)]">
						{side === 'start' && drawer}
						<div data-drawer-follows className="flex min-w-0 flex-1 flex-col items-start gap-3 p-6">
							{button}
							<p className="max-w-prose text-body text-muted">{bodyOf('long').join(' ')}</p>
						</div>
						{side === 'end' && drawer}
					</div>
				</DrawerTrigger>
			) : (
				<DrawerTrigger>
					{button}
					{drawer}
				</DrawerTrigger>
			)}
		</Playground>
	);
}
