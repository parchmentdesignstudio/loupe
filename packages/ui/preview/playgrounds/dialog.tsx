import { Button, Dialog, DialogActions, DialogClose, DialogHeading, DialogTrigger, Modal, TextField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';
import { type Length, bodyOf, lengths } from './overlay.js';

const sizes = ['small', 'medium', 'large'] as const;
const headings = ['none', 'short', 'long'] as const;
const actionSets = ['none', 'one', 'two', 'three'] as const;
const titles = ['Rename project', 'Share link', 'Delete project', 'Invite people', 'Export'];

// A modal covers the controls, so there's no keep-open switch here. With every way out turned off, a Done button stays
export function DialogPlayground() {
	const [size, setSize] = useRemembered('size', 'medium', sizes);
	const [heading, setHeading] = useRemembered('heading', 'short', headings);
	const [title, setTitle] = useRemembered('title', 'Rename project');
	const [body, setBody] = useRemembered<Length>('body', 'short', lengths);
	const [hasField, setHasField] = useRemembered('hasField', false);
	const [actions, setActions] = useRemembered('actions', 'two', actionSets);
	const [hasClose, setHasClose] = useRemembered('hasClose', true);
	const [isDismissable, setDismissable] = useRemembered('isDismissable', true);
	const [escapeCloses, setEscapeCloses] = useRemembered('escapeCloses', true);
	const [trigger, setTrigger] = useRemembered('trigger', 'Open dialog');
	const isTrapped = !hasClose && actions === 'none' && !isDismissable && !escapeCloses;
	const shuffle = () => {
		setSize(pick(sizes));
		setHeading(pick(headings));
		setTitle(pick(titles));
		setBody(pick(lengths));
		setHasField(Math.random() < 0.4);
		setActions(pick(actionSets));
		setHasClose(Math.random() < 0.7);
		setDismissable(Math.random() < 0.6);
		setEscapeCloses(Math.random() < 0.8);
	};
	const headingText = heading === 'long' ? longWords : title;
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Heading" options={headings} value={heading} onChange={setHeading} />
						{heading === 'short' && <TextControl label="Heading text" value={title} onChange={setTitle} />}
						<Choice label="Body" options={lengths} value={body} onChange={setBody} />
						<SwitchControl label="Text field" value={hasField} onChange={setHasField} />
						<Choice label="Actions" options={actionSets} value={actions} onChange={setActions} />
						<SwitchControl label="Close button" value={hasClose} onChange={setHasClose} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Size" options={sizes} value={size} onChange={setSize} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<SwitchControl label="Click outside closes" value={isDismissable} onChange={setDismissable} />
						<SwitchControl label="Escape closes" value={escapeCloses} onChange={setEscapeCloses} />
					</ControlGroup>
					<ControlGroup label="Trigger">
						<TextControl label="Trigger" value={trigger} onChange={setTrigger} />
					</ControlGroup>
				</>
			}
		>
			<DialogTrigger>
				<Button variant="secondary">{trigger || 'Open dialog'}</Button>
				<Modal size={size} isDismissable={isDismissable} isKeyboardDismissDisabled={!escapeCloses}>
					<Dialog aria-label={heading === 'none' ? title || 'Dialog' : undefined}>
						{heading !== 'none' && <DialogHeading>{headingText}</DialogHeading>}
						{hasClose && <DialogClose />}
						{bodyOf(body).map((text, index) => (
							<p key={index} className={['text-body text-muted', heading === 'none' && index === 0 ? '' : 'mt-2'].join(' ')}>
								{text}
							</p>
						))}
						{hasField && <TextField label="Name" defaultValue="Loupe" autoFocus className="mt-4" />}
						{actions !== 'none' && (
							<DialogActions>
								{actions === 'three' && (
									<Button slot="close" variant="ghost" className="me-auto">
										Don’t save
									</Button>
								)}
								{actions !== 'one' && (
									<Button slot="close" variant="secondary">
										Cancel
									</Button>
								)}
								<Button slot="close">{actions === 'one' ? 'Done' : 'Save'}</Button>
							</DialogActions>
						)}
						{isTrapped && (
							<DialogActions>
								<Button slot="close">Done</Button>
							</DialogActions>
						)}
					</Dialog>
				</Modal>
			</DialogTrigger>
		</Playground>
	);
}
