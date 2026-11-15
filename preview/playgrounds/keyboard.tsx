import { useState } from 'react';
import { Icon } from '@parchment/icons/react';
import { Button, Keyboard, Tooltip, TooltipTrigger } from '../../src/index.js';
import { Choice, ControlGroup, Playground, TextControl, pick } from '../playground.js';

const contexts = ['alone', 'sentence', 'tooltip'] as const;
const variants = ['raised', 'plain'] as const;
const sizes = { label: 'text-label', control: 'text-control', body: 'text-body', title: 'text-title' } as const;
const shortcuts = ['⌘Z', '⇧⌘Z', '⌥⌘I', 'Space', 'Esc', 'Return', 'Ctrl Alt Shift Delete', '?'];
type Context = (typeof contexts)[number];
type Size = keyof typeof sizes;
type Variant = (typeof variants)[number];

// A tooltip's shortcuts are plain, and everywhere else they're raised keys
const variantIn = (context: Context): Variant => (context === 'tooltip' ? 'plain' : 'raised');

// The tooltip is held open and drawn in a layer of its own, so it sits on the page whatever the ground
export function KeyboardPlayground() {
	const [shortcut, setShortcut] = useState('⌘Z');
	const [context, setContext] = useState<Context>('sentence');
	const [size, setSize] = useState<Size>('body');
	const [variant, setVariant] = useState<Variant>('raised');
	const moveTo = (next: Context) => {
		setContext(next);
		setVariant(variantIn(next));
	};
	const shuffle = () => {
		setShortcut(pick(shortcuts));
		moveTo(pick(contexts));
		setSize(pick(Object.keys(sizes) as Size[]));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<Choice label="In" options={contexts} value={context} onChange={moveTo} />
					<Choice label="Text size" options={Object.keys(sizes) as Size[]} value={size} onChange={setSize} isDisabled={context === 'tooltip'} />
				</>
			}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Shortcut" value={shortcut} onChange={setShortcut} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
					</ControlGroup>
				</>
			}
		>
			{context === 'alone' && (
				<span className={sizes[size]}>
					<Keyboard variant={variant}>{shortcut}</Keyboard>
				</span>
			)}
			{context === 'sentence' && (
				<p className={`max-w-sm ${sizes[size]}`}>
					Press <Keyboard variant={variant}>{shortcut}</Keyboard> to undo the last change, or hold it down to keep stepping back through everything you’ve done since the file was opened.
				</p>
			)}
			{context === 'tooltip' && (
				<TooltipTrigger isOpen>
					<Button variant="secondary" shape="full" aria-label="Undo">
						<Icon name="arrow-uturn-left" />
					</Button>
					<Tooltip>
						Undo
						<Keyboard variant={variant}>{shortcut}</Keyboard>
					</Tooltip>
				</TooltipTrigger>
			)}
		</Playground>
	);
}
