import { useState } from 'react';
import { type IconName, type IconVariant, iconNames, resolveIcon } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, Playground, SwitchControl, TextControl, pick, sampleWords } from '../playground.js';

const variants = ['primary', 'secondary', 'accent', 'danger', 'outline', 'ghost'] as const;
const places = ['none', 'start', 'end', 'both'] as const;

// A style without the chosen icon leaves that end empty rather than failing
export function ButtonPlayground() {
	const [variant, setVariant] = useState<(typeof variants)[number]>('primary');
	const [size, setSize] = useState<'medium' | 'small'>('medium');
	const [content, setContent] = useState<'label' | 'icon'>('label');
	const [shape, setShape] = useState<'rounded' | 'full'>('rounded');
	const [place, setPlace] = useState<(typeof places)[number]>('start');
	const [iconVariant, setIconVariant] = useState<IconVariant>('solid');
	const [startIcon, setStartIcon] = useState<IconName>('plus');
	const [endIcon, setEndIcon] = useState<IconName>('arrow-right');
	const [label, setLabel] = useState('New project');
	const [isDisabled, setDisabled] = useState(false);
	const [isPending, setPending] = useState(false);
	const isIconOnly = content === 'icon';
	const hasStart = !isIconOnly && (place === 'start' || place === 'both');
	const hasEnd = !isIconOnly && (place === 'end' || place === 'both');
	const icon = (name: IconName) => (resolveIcon(name, { variant: iconVariant, size: 16 }) ? <Icon name={name} variant={iconVariant} /> : undefined);
	const shuffle = () => {
		const names = iconNames({ variant: iconVariant, size: 16 });
		setVariant(pick(variants));
		setSize(pick(['medium', 'small'] as const));
		setContent(Math.random() < 0.2 ? 'icon' : 'label');
		setShape(Math.random() < 0.2 ? 'full' : 'rounded');
		setPlace(pick(places));
		setStartIcon(pick(names));
		setEndIcon(pick(names));
		setLabel(pick(sampleWords));
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Content" options={['label', 'icon'] as const} value={content} onChange={setContent} />
						<TextControl label={isIconOnly ? 'Label, read out' : 'Label'} value={label} onChange={setLabel} />
						<Choice label="Icon" options={places} value={place} onChange={setPlace} isDisabled={isIconOnly} />
						<Choice label="Icon style" options={['solid', 'line'] as const} value={iconVariant} onChange={setIconVariant} />
						{(isIconOnly || hasStart) && <IconPicker label={isIconOnly ? 'Icon' : 'Start icon'} variant={iconVariant} value={startIcon} onChange={setStartIcon} />}
						{hasEnd && <IconPicker label="End icon" variant={iconVariant} value={endIcon} onChange={setEndIcon} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
						<Choice label="Size" options={['medium', 'small'] as const} value={size} onChange={setSize} />
						<Choice label="Shape" options={['rounded', 'full'] as const} value={shape} onChange={setShape} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
						<SwitchControl label="Pending" value={isPending} onChange={setPending} />
					</ControlGroup>
				</>
			}
		>
			<Button
				variant={variant}
				size={size}
				shape={shape}
				start={hasStart ? icon(startIcon) : undefined}
				end={hasEnd ? icon(endIcon) : undefined}
				aria-label={isIconOnly ? label : undefined}
				isDisabled={isDisabled}
				isPending={isPending}
			>
				{isIconOnly ? icon(startIcon) : label}
			</Button>
		</Playground>
	);
}
