import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogClose, DialogHeading, DialogTrigger, Modal, TextField } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';
import { type Length, bodyOf, lengths } from './overlay.js';

const sizes = ['small', 'medium', 'large'] as const;
const headings = ['none', 'short', 'long'] as const;
const actionSets = ['none', 'one', 'two', 'three'] as const;
const titles = ['Rename project', 'Share link', 'Delete project', 'Invite people', 'Export'];

// A modal covers the controls, so there's no keep-open switch here. With every way out turned off, a Done button stays
export function DialogPlayground() {
	const [size, setSize] = useState<(typeof sizes)[number]>('medium');
	const [heading, setHeading] = useState<(typeof headings)[number]>('short');
	const [title, setTitle] = useState('Rename project');
	const [body, setBody] = useState<Length>('short');
	const [hasField, setHasField] = useState(false);
	const [actions, setActions] = useState<(typeof actionSets)[number]>('two');
	const [hasClose, setHasClose] = useState(true);
	const [isDismissable, setDismissable] = useState(true);
	const [escapeCloses, setEscapeCloses] = useState(true);
	const [trigger, setTrigger] = useState('Open dialog');
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
					<TextControl label="Trigger" value={trigger} onChange={setTrigger} />
					<Choice label="Size" options={sizes} value={size} onChange={setSize} />
					<Choice label="Heading" options={headings} value={heading} onChange={setHeading} />
					{heading === 'short' && <TextControl label="Heading text" value={title} onChange={setTitle} />}
					<Choice label="Body" options={lengths} value={body} onChange={setBody} />
					<SwitchControl label="Text field" value={hasField} onChange={setHasField} />
					<Choice label="Actions" options={actionSets} value={actions} onChange={setActions} />
					<SwitchControl label="Close button" value={hasClose} onChange={setHasClose} />
					<SwitchControl label="Click outside closes" value={isDismissable} onChange={setDismissable} />
					<SwitchControl label="Escape closes" value={escapeCloses} onChange={setEscapeCloses} />
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
