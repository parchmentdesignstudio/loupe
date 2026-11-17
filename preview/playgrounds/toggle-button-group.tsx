import { useState } from 'react';
import type { Key } from 'react-aria-components';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { ToggleButton, ToggleButtonGroup } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';

const words = ['Day', 'Week', 'Month', 'Quarter', 'Year', 'Decade', 'Century', 'All time'];
const icons: IconName[] = ['text-alignleft', 'text-aligncenter', 'text-alignright', 'text-justify', 'sidebar-left', 'sidebar-right', 'square-grid-3x3', 'monitor'];
const counts = ['2', '3', '5', '8'] as const;
const contents = ['text', 'icon', 'both'] as const;
const lengths = ['short', 'long', 'mixed'] as const;
const gaps = ['0', '1', '2', '4'] as const;
const variants = ['auto', 'well', 'raised'] as const;
const modes = ['single', 'multiple'] as const;
const sizes = ['medium', 'small'] as const;
const orientations = ['horizontal', 'vertical'] as const;
const widths = ['hug', 'fill'] as const;

// Going back to one choice keeps only the first of several, as a single-choice group can't hold more
export function ToggleButtonGroupPlayground() {
	const [selectionMode, setSelectionMode] = useRemembered('selectionMode', 'single', modes);
	const [size, setSize] = useRemembered('size', 'medium', sizes);
	const [orientation, setOrientation] = useRemembered('orientation', 'horizontal', orientations);
	const [count, setCount] = useRemembered('count', '3', counts);
	const [content, setContent] = useRemembered('content', 'text', contents);
	const [length, setLength] = useRemembered('length', 'short', lengths);
	const [iconSet, setIconSet] = useState<IconName[]>(icons);
	const [selected, setSelected] = useState<Set<Key>>(new Set(['button-1']));
	const [gap, setGap] = useRemembered('gap', '2', gaps);
	const [hasDividers, setDividers] = useRemembered('hasDividers', true);
	const [width, setWidth] = useRemembered('width', 'hug', widths);
	const [variant, setVariant] = useRemembered('variant', 'auto', variants);
	const [allowsEmpty, setAllowsEmpty] = useRemembered('allowsEmpty', false);
	const [hasDisabledButton, setDisabledButton] = useRemembered('hasDisabledButton', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const total = Number(count);
	const isSingle = selectionMode === 'single';
	const textFor = (index: number) => (length === 'long' || (length === 'mixed' && index === 1) ? longWords : words[index]);
	const changeMode = (mode: 'single' | 'multiple') => {
		setSelectionMode(mode);
		if (mode === 'single') setSelected(new Set([...selected].slice(0, 1).concat(selected.size ? [] : ['button-0'])));
	};
	const shuffle = () => {
		const nextCount = Number(pick(counts));
		const mode = Math.random() < 0.3 ? 'multiple' : 'single';
		const keys = Array.from({ length: nextCount }, (_, i) => `button-${i}`);
		setSelectionMode(mode);
		setSize(pick(sizes));
		setOrientation(Math.random() < 0.2 ? 'vertical' : 'horizontal');
		setCount(String(nextCount) as (typeof counts)[number]);
		setContent(pick(contents));
		setLength(Math.random() < 0.2 ? pick(['long', 'mixed'] as const) : 'short');
		setIconSet(Array.from({ length: icons.length }, () => pick(solidIcons())));
		setSelected(new Set(mode === 'single' ? [pick(keys)] : keys.filter(() => Math.random() < 0.4)));
		setDisabledButton(Math.random() < 0.2);
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Buttons" options={counts} value={count} onChange={setCount} />
						<Choice label="Content" options={contents} value={content} onChange={setContent} />
						{content !== 'icon' && <Choice label="Text" options={lengths} value={length} onChange={setLength} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
						<Choice label="Size" options={sizes} value={size} onChange={setSize} />
						<Choice label="Width" options={widths} value={width} onChange={setWidth} />
						<Choice label="Orientation" options={orientations} value={orientation} onChange={setOrientation} />
						<Choice label="Gap" options={gaps} value={gap} onChange={setGap} />
						<SwitchControl label="Dividers" value={hasDividers} onChange={setDividers} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Selection" options={modes} value={selectionMode} onChange={changeMode} />
						{!isSingle && <SwitchControl label="Can choose none" value={allowsEmpty} onChange={setAllowsEmpty} />}
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="A disabled button" value={hasDisabledButton} onChange={setDisabledButton} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<ToggleButtonGroup
				aria-label="Options"
				selectionMode={selectionMode}
				disallowEmptySelection={isSingle || !allowsEmpty}
				size={size}
				orientation={orientation}
				gap={Number(gap) as 0 | 1 | 2 | 4}
				hasDividers={hasDividers}
				variant={variant === 'auto' ? undefined : variant}
				width={width}
				selectedKeys={selected}
				onSelectionChange={setSelected}
				isDisabled={isDisabled}
				className="max-w-full"
			>
				{Array.from({ length: total }, (_, i) => (
					<ToggleButton key={i} id={`button-${i}`} isDisabled={hasDisabledButton && i === total - 1} aria-label={content === 'icon' ? textFor(i) : undefined}>
						{content !== 'text' && <Icon name={iconSet[i]} />}
						{content !== 'icon' && textFor(i)}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</Playground>
	);
}
