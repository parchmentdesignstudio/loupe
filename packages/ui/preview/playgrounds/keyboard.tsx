import { useState } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Keyboard, Tooltip, TooltipTrigger } from '../../src/index.js';
import { Choice, ControlGroup, Playground, TextControl, pick } from '../playground.js';

const contexts = ['alone', 'sentence', 'tooltip'] as const;
const sizes = { label: 'text-label', control: 'text-control', body: 'text-body', title: 'text-title' } as const;
const shortcuts = ['⌘Z', '⇧⌘Z', '⌥⌘I', 'Space', 'Esc', 'Return', 'Ctrl Alt Shift Delete', '?'];
type Context = (typeof contexts)[number];
type Size = keyof typeof sizes;

// The tooltip is held open and drawn in a layer of its own, so it sits on the page whatever the ground
export function KeyboardPlayground() {
	const [shortcut, setShortcut] = useState('⌘Z');
	const [context, setContext] = useState<Context>('sentence');
	const [size, setSize] = useState<Size>('body');
	const shuffle = () => {
		setShortcut(pick(shortcuts));
		setContext(pick(contexts));
		setSize(pick(Object.keys(sizes) as Size[]));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="In" options={contexts} value={context} onChange={setContext} />
					<Choice label="Text size" options={Object.keys(sizes) as Size[]} value={size} onChange={setSize} isDisabled={context === 'tooltip'} />
				</>
			}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Shortcut" value={shortcut} onChange={setShortcut} />
					</ControlGroup>
				</>
			}
		>
			{context === 'alone' && (
				<span className={sizes[size]}>
					<Keyboard>{shortcut}</Keyboard>
				</span>
			)}
			{context === 'sentence' && (
				<p className={`max-w-sm ${sizes[size]}`}>
					Press <Keyboard>{shortcut}</Keyboard> to undo the last change, or hold it down to keep stepping back through everything you’ve done since the file was opened.
				</p>
			)}
			{context === 'tooltip' && (
				<TooltipTrigger isOpen>
					<Button variant="secondary" shape="full" aria-label="Undo">
						<Icon name="arrow-uturn-left" />
					</Button>
					<Tooltip>
						Undo
						<Keyboard>{shortcut}</Keyboard>
					</Tooltip>
				</TooltipTrigger>
			)}
		</Playground>
	);
}
