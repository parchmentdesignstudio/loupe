import { Fragment, useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, Separator, ToggleButton, ToggleButtonGroup, Toolbar } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, sampleWords, solidIcons } from '../playground.js';

const counts = { few: 3, some: 6, many: 14 } as const;
const contents = ['icons', 'labels', 'both'] as const;
const surfaces = ['plain', 'floating'] as const;
const starters: IconName[] = ['arrow-uturn-left', 'arrow-uturn-right', 'text-alignleft', 'text-aligncenter', 'text-alignright', 'link', 'paperclip', 'magnifyingglass', 'square-and-arrow-up', 'pencil-tip', 'ruler', 'frame', 'component', 'magnet'];

export function ToolbarPlayground() {
	const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
	const [surface, setSurface] = useState<(typeof surfaces)[number]>('plain');
	const [count, setCount] = useState<keyof typeof counts>('some');
	const [content, setContent] = useState<(typeof contents)[number]>('icons');
	const [text, setText] = useState<'short' | 'long'>('short');
	const [variant, setVariant] = useState<'ghost' | 'secondary' | 'outline'>('ghost');
	const [size, setSize] = useState<'medium' | 'small'>('medium');
	const [hasTools, setTools] = useState(true);
	const [hasSeparators, setSeparators] = useState(true);
	const [hasDisabled, setDisabled] = useState(false);
	const [icons, setIcons] = useState<IconName[]>(starters);
	const isIcons = content === 'icons';
	const label = (index: number) => (text === 'long' && index === 1 ? longWords : sampleWords[index % sampleWords.length]);
	const shuffle = () => {
		const names = solidIcons();
		setOrientation(Math.random() < 0.25 ? 'vertical' : 'horizontal');
		setSurface(pick(surfaces));
		setCount(pick(Object.keys(counts) as (keyof typeof counts)[]));
		setContent(pick(contents));
		setText(Math.random() < 0.3 ? 'long' : 'short');
		setVariant(pick(['ghost', 'secondary', 'outline'] as const));
		setSize(pick(['medium', 'small'] as const));
		setTools(Math.random() < 0.6);
		setSeparators(Math.random() < 0.7);
		setDisabled(Math.random() < 0.3);
		setIcons(Array.from({ length: counts.many }, () => pick(names)));
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Buttons" options={Object.keys(counts) as (keyof typeof counts)[]} value={count} onChange={setCount} />
						<Choice label="Content" options={contents} value={content} onChange={setContent} />
						<Choice label={isIcons ? 'Label, read out' : 'Label'} options={['short', 'long'] as const} value={text} onChange={setText} />
						<SwitchControl label="Tool group" value={hasTools} onChange={setTools} />
						<SwitchControl label="Separators" value={hasSeparators} onChange={setSeparators} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Orientation" options={['horizontal', 'vertical'] as const} value={orientation} onChange={setOrientation} />
						<Choice label="Surface" options={surfaces} value={surface} onChange={setSurface} />
						<Choice label="Variant" options={['ghost', 'secondary', 'outline'] as const} value={variant} onChange={setVariant} />
						<Choice label="Size" options={['medium', 'small'] as const} value={size} onChange={setSize} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="A disabled button" value={hasDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<Toolbar
				aria-label="Editing"
				orientation={orientation}
				className={['max-w-full', surface === 'floating' && 'rounded-xl bg-overlay p-1 shadow-floating [--bleed:var(--overlay-bleed)]'].filter(Boolean).join(' ')}
			>
				{hasTools && (
					<>
						<ToggleButtonGroup aria-label="Tool" orientation={orientation} size={size} defaultSelectedKeys={['select']}>
							<ToggleButton id="select" aria-label="Select">
								<Icon name="cursorarrow" />
							</ToggleButton>
							<ToggleButton id="pan" aria-label="Pan">
								<Icon name="arrow-up-and-down-and-arrow-left-and-right" />
							</ToggleButton>
							<ToggleButton id="draw" aria-label="Draw">
								<Icon name="scribble" />
							</ToggleButton>
						</ToggleButtonGroup>
						{hasSeparators && <Separator />}
					</>
				)}
				{icons.slice(0, counts[count]).map((name, index) => (
					<Fragment key={index}>
						{hasSeparators && index > 0 && index % 3 === 0 && <Separator />}
						<Button
							variant={variant}
							size={size}
							shape={isIcons ? 'full' : undefined}
							aria-label={isIcons ? label(index) : undefined}
							start={content === 'both' ? <Icon name={name} /> : undefined}
							isDisabled={hasDisabled && index === 1}
						>
							{isIcons ? <Icon name={name} /> : label(index)}
						</Button>
					</Fragment>
				))}
			</Toolbar>
		</Playground>
	);
}
