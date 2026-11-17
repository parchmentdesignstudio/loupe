import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, Keyboard, Tooltip, TooltipTrigger } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, NumberControl, Playground, SwitchControl, TextControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';
import { type Align, type Side, aligns, placementOf, sides } from './overlay.js';

const contents = ['icon', 'label'] as const;
const opensOn = ['hover', 'focus'] as const;
const labels = ['Send message', 'Copy link', 'Add to favourites', 'Show sidebar', 'Undo'];

export function TooltipPlayground() {
	const [text, setText] = useRemembered('text', 'Send message');
	const [hasShortcut, setHasShortcut] = useRemembered('hasShortcut', false);
	const [shortcut, setShortcut] = useRemembered('shortcut', '⌘↩');
	const [side, setSide] = useRemembered<Side>('side', 'top', sides);
	const [align, setAlign] = useRemembered<Align>('align', 'centre', aligns);
	const [showArrow, setShowArrow] = useRemembered('showArrow', false);
	const [delay, setDelay] = useRemembered('delay', 300, (stored) => stored >= 0 && stored <= 3000);
	const [closeDelay, setCloseDelay] = useRemembered('closeDelay', 500, (stored) => stored >= 0 && stored <= 3000);
	const [opensFrom, setOpensFrom] = useRemembered('opensFrom', 'hover', opensOn);
	const [shape, setShape] = useRemembered('shape', 'icon', contents);
	const [icon, setIcon] = useRemembered<IconName>('icon', 'arrow-up', (name) => solidIcons().includes(name));
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [keepOpen, setKeepOpen] = useRemembered('keepOpen', false);
	const [isOpen, setOpen] = useState(keepOpen);
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
