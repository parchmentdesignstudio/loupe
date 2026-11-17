import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogClose, DialogHeading, DialogTrigger, Popover, TextField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';
import { type Align, type Length, type Side, aligns, bodyOf, lengths, placementOf, sides } from './overlay.js';

const headings = ['none', 'short', 'long'] as const;
const widths = ['auto', 'narrow', 'wide'] as const;
const widthClass = { auto: undefined, narrow: 'w-56', wide: 'w-96' };
const titles = ['Share link', 'Filters', 'Rename', 'Invite people', 'Details'];

export function PopoverPlayground() {
	const [side, setSide] = useRemembered<Side>('side', 'bottom', sides);
	const [align, setAlign] = useRemembered<Align>('align', 'centre', aligns);
	const [showArrow, setShowArrow] = useRemembered('showArrow', false);
	const [width, setWidth] = useRemembered('width', 'narrow', widths);
	const [heading, setHeading] = useRemembered('heading', 'short', headings);
	const [title, setTitle] = useRemembered('title', 'Share link');
	const [body, setBody] = useRemembered<Length>('body', 'short', lengths);
	const [hasField, setHasField] = useRemembered('hasField', false);
	const [hasActions, setHasActions] = useRemembered('hasActions', false);
	const [hasClose, setHasClose] = useRemembered('hasClose', false);
	const [keepOpen, setKeepOpen] = useRemembered('keepOpen', false);
	const [isOpen, setOpen] = useState(keepOpen);
	const [trigger, setTrigger] = useRemembered('trigger', 'Share');
	const shuffle = () => {
		setSide(pick(sides));
		setAlign(pick(aligns));
		setShowArrow(Math.random() < 0.5);
		setWidth(pick(widths));
		setHeading(pick(headings));
		setTitle(pick(titles));
		setBody(pick(lengths));
		setHasField(Math.random() < 0.3);
		setHasActions(Math.random() < 0.3);
		setHasClose(Math.random() < 0.3);
	};
	const keep = (value: boolean) => {
		setKeepOpen(value);
		setOpen(value);
	};
	// Any close, such as Escape or a close button, lets go of keep open, so it never sticks
	const openChange = (value: boolean) => {
		setOpen(value);
		if (!value) setKeepOpen(false);
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="Width" options={widths} value={width} onChange={setWidth} />
					<SwitchControl label="Keep open" value={keepOpen} onChange={keep} />
				</>
			}
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
					<ControlGroup label="Appearance">
						<SwitchControl label="Arrow" value={showArrow} onChange={setShowArrow} />
					</ControlGroup>
					<ControlGroup label="Placement">
						<Choice label="Side" options={sides} value={side} onChange={setSide} />
						<Choice label="Align" options={aligns} value={align} onChange={setAlign} />
					</ControlGroup>
					<ControlGroup label="Trigger">
						<TextControl label="Trigger" value={trigger} onChange={setTrigger} />
					</ControlGroup>
				</>
			}
		>
			<DialogTrigger isOpen={isOpen} onOpenChange={openChange}>
				<Button variant="secondary">{trigger || 'Share'}</Button>
				{/* Kept open, it's non-modal and ignores clicks outside, so the controls stay usable */}
				<Popover placement={placementOf(side, align)} showArrow={showArrow} isNonModal={keepOpen} shouldCloseOnInteractOutside={keepOpen ? () => false : undefined} className={widthClass[width]}>
					<Dialog aria-label={heading === 'none' ? title || 'Popover' : undefined}>
						{heading !== 'none' && <DialogHeading className="text-body">{heading === 'long' ? longWords : title}</DialogHeading>}
						{hasClose && <DialogClose />}
						{bodyOf(body).map((text, index) => (
							<p key={index} className={['text-label text-muted', heading === 'none' && index === 0 ? '' : 'mt-1'].join(' ')}>
								{text}
							</p>
						))}
						{hasField && <TextField label="Email" placeholder="name@example.com" className="mt-3" />}
						{hasActions && (
							<DialogActions>
								<Button slot="close" variant="secondary" size="small">
									Cancel
								</Button>
								<Button slot="close" size="small">
									Invite
								</Button>
							</DialogActions>
						)}
					</Dialog>
				</Popover>
			</DialogTrigger>
		</Playground>
	);
}
