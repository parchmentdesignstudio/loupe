import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, Keyboard, Tooltip, TooltipTrigger } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, NumberControl, Playground, SwitchControl, TextControl, longWords, pick, solidIcons } from '../playground.js';
import { type Align, type Side, aligns, placementOf, sides } from './overlay.js';

const contents = ['icon', 'label'] as const;
const opensOn = ['hover', 'focus'] as const;
const labels = ['Send message', 'Copy link', 'Add to favourites', 'Show sidebar', 'Undo'];

export function TooltipPlayground() {
	const [text, setText] = useState('Send message');
	const [hasShortcut, setHasShortcut] = useState(false);
	const [shortcut, setShortcut] = useState('⌘↩');
	const [side, setSide] = useState<Side>('top');
	const [align, setAlign] = useState<Align>('centre');
	const [showArrow, setShowArrow] = useState(false);
	const [delay, setDelay] = useState(300);
	const [closeDelay, setCloseDelay] = useState(500);
	const [opensFrom, setOpensFrom] = useState<(typeof opensOn)[number]>('hover');
	const [shape, setShape] = useState<(typeof contents)[number]>('icon');
	const [icon, setIcon] = useState<IconName>('arrow-up');
	const [isDisabled, setDisabled] = useState(false);
	const [keepOpen, setKeepOpen] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const shuffle = () => {
		setText(Math.random() < 0.2 ? longWords : pick(labels));
		setHasShortcut(Math.random() < 0.4);
		setSide(pick(sides));
		setAlign(Math.random() < 0.7 ? 'centre' : pick(aligns));
		setShowArrow(Math.random() < 0.5);
		setShape(pick(contents));
		setIcon(pick(solidIcons()));
	};
	const keep = (value: boolean) => {
		setKeepOpen(value);
		setOpen(value);
	};
	// A tooltip blocks nothing, so kept open it ignores hover and blur until the switch goes off
	const openChange = (value: boolean) => {
		if (!keepOpen) setOpen(value);
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<SwitchControl label="Keep open" value={keepOpen} onChange={keep} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Text" value={text} onChange={setText} />
						<SwitchControl label="Shortcut" value={hasShortcut} onChange={setHasShortcut} />
						{hasShortcut && <TextControl label="Shortcut keys" value={shortcut} onChange={setShortcut} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<SwitchControl label="Arrow" value={showArrow} onChange={setShowArrow} />
					</ControlGroup>
					<ControlGroup label="Placement">
						<Choice label="Side" options={sides} value={side} onChange={setSide} />
						<Choice label="Align" options={aligns} value={align} onChange={setAlign} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Opens on" options={opensOn} value={opensFrom} onChange={setOpensFrom} />
						<NumberControl label="Delay, ms" value={delay} onChange={setDelay} minValue={0} maxValue={3000} step={100} />
						<NumberControl label="Close delay, ms" value={closeDelay} onChange={setCloseDelay} minValue={0} maxValue={3000} step={100} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
					<ControlGroup label="Trigger">
						<Choice label="Control" options={contents} value={shape} onChange={setShape} />
						{shape === 'icon' && <IconPicker label="Icon" value={icon} onChange={setIcon} />}
					</ControlGroup>
				</>
			}
		>
			<TooltipTrigger isOpen={isOpen} onOpenChange={openChange} delay={delay} closeDelay={closeDelay} trigger={opensFrom === 'focus' ? 'focus' : undefined} isDisabled={isDisabled}>
				{shape === 'icon' ? (
					<Button variant="secondary" shape="full" aria-label={text || 'Send message'}>
						<Icon name={icon} />
					</Button>
				) : (
					<Button variant="secondary">Send</Button>
				)}
				<Tooltip placement={placementOf(side, align)} showArrow={showArrow}>
					{text}
					{hasShortcut && <Keyboard>{shortcut}</Keyboard>}
				</Tooltip>
			</TooltipTrigger>
		</Playground>
	);
}
