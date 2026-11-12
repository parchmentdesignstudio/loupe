import { useState } from 'react';
import { Button, DialogActions, DialogClose, DialogHeading, Sheet, SheetTrigger, TextField } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';
import { type Length, bodyOf, lengths } from './overlay.js';

const positions = ['bottom', 'top', 'start', 'end', 'center'] as const;
const headings = ['none', 'short', 'long'] as const;
const snaps = ['none', 'two', 'three'] as const;
const titles = ['Rename project', 'Share link', 'Filters', 'Invite people', 'Settings'];

// Snap points are how much of the sheet shows, so the last one is all of it
const snapPointsOf = { none: undefined, two: ['50%', '100%'], three: ['25%', '60%', '100%'] };

// A sheet covers the controls, so there's no keep-open switch. Stopping dismissal with no buttons left keeps a Done button
export function SheetPlayground() {
	const [position, setPosition] = useState<(typeof positions)[number]>('bottom');
	const [heading, setHeading] = useState<(typeof headings)[number]>('short');
	const [title, setTitle] = useState('Rename project');
	const [body, setBody] = useState<Length>('short');
	const [hasField, setHasField] = useState(false);
	const [hasActions, setHasActions] = useState(true);
	const [hasClose, setHasClose] = useState(true);
	const [snap, setSnap] = useState<(typeof snaps)[number]>('none');
	const [preventDismissal, setPreventDismissal] = useState(false);
	const [trigger, setTrigger] = useState('Open sheet');
	const isTrapped = preventDismissal && !hasClose && !hasActions;
	const shuffle = () => {
		setPosition(pick(positions));
		setHeading(pick(headings));
		setTitle(pick(titles));
		setBody(pick(lengths));
		setHasField(Math.random() < 0.4);
		setHasActions(Math.random() < 0.6);
		setHasClose(Math.random() < 0.7);
		setSnap(Math.random() < 0.7 ? 'none' : pick(snaps));
		setPreventDismissal(Math.random() < 0.2);
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<TextControl label="Trigger" value={trigger} onChange={setTrigger} />
					<Choice label="Position" options={positions} value={position} onChange={setPosition} />
					<Choice label="Snap points" options={snaps} value={snap} onChange={setSnap} />
					<Choice label="Heading" options={headings} value={heading} onChange={setHeading} />
					{heading === 'short' && <TextControl label="Heading text" value={title} onChange={setTitle} />}
					<Choice label="Body" options={lengths} value={body} onChange={setBody} />
					<SwitchControl label="Text field" value={hasField} onChange={setHasField} />
					<SwitchControl label="Actions" value={hasActions} onChange={setHasActions} />
					<SwitchControl label="Close button" value={hasClose} onChange={setHasClose} />
					<SwitchControl label="Prevent dismissal" value={preventDismissal} onChange={setPreventDismissal} />
				</>
			}
		>
			<SheetTrigger>
				<Button variant="secondary">{trigger || 'Open sheet'}</Button>
				<Sheet position={position} snapPoints={snapPointsOf[snap]} preventDismissal={preventDismissal} aria-label={heading === 'none' ? title || 'Sheet' : undefined}>
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
				</Sheet>
			</SheetTrigger>
		</Playground>
	);
}
