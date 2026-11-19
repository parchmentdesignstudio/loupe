import { type IconName, type IconVariant, iconNames, resolveIcon } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, Playground, SwitchControl, TextControl, pick, sampleWords, useRemembered } from '../playground.js';

const variants = ['primary', 'secondary', 'quiet', 'danger', 'outline', 'ghost'] as const;
const places = ['none', 'start', 'end', 'both'] as const;
const sizes = ['medium', 'small'] as const;
const contents = ['label', 'icon'] as const;
const shapes = ['rounded', 'full'] as const;
const iconVariants = ['solid', 'line'] as const satisfies readonly IconVariant[];

// A style without the chosen icon leaves that end empty rather than failing
export function ButtonPlayground() {
	const [variant, setVariant] = useRemembered('variant', 'primary', variants);
	const [size, setSize] = useRemembered('size', 'medium', sizes);
	const [content, setContent] = useRemembered('content', 'label', contents);
	const [shape, setShape] = useRemembered('shape', 'rounded', shapes);
	const [place, setPlace] = useRemembered('place', 'start', places);
	const [iconVariant, setIconVariant] = useRemembered<IconVariant>('iconVariant', 'solid', iconVariants);
	const [startIcon, setStartIcon] = useRemembered<IconName>('startIcon', 'plus', (name) => iconNames({ size: 16 }).includes(name));
	const [endIcon, setEndIcon] = useRemembered<IconName>('endIcon', 'arrow-right', (name) => iconNames({ size: 16 }).includes(name));
	const [label, setLabel] = useRemembered('label', 'New project');
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isPending, setPending] = useRemembered('isPending', false);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const isIconOnly = content === 'icon';
	const hasStart = !isIconOnly && (place === 'start' || place === 'both');
	const hasEnd = !isIconOnly && (place === 'end' || place === 'both');
	const icon = (name: IconName) => (resolveIcon(name, { variant: iconVariant, size: 16 }) ? <Icon name={name} variant={iconVariant} /> : undefined);
	const shuffle = () => {
		const names = iconNames({ variant: iconVariant, size: 16 });
		setVariant(pick(variants));
		setSize(pick(sizes));
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
						<Choice label="Content" options={contents} value={content} onChange={setContent} />
						<TextControl label={isIconOnly ? 'Label, read out' : 'Label'} value={label} onChange={setLabel} />
						{!isIconOnly && <Choice label="Icon" options={places} value={place} onChange={setPlace} />}
						<Choice label="Icon style" options={iconVariants} value={iconVariant} onChange={setIconVariant} />
						{(isIconOnly || hasStart) && <IconPicker label={isIconOnly ? 'Icon' : 'Start icon'} variant={iconVariant} value={startIcon} onChange={setStartIcon} />}
						{hasEnd && <IconPicker label="End icon" variant={iconVariant} value={endIcon} onChange={setEndIcon} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
						<Choice label="Size" options={sizes} value={size} onChange={setSize} />
						<Choice label="Shape" options={shapes} value={shape} onChange={setShape} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
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
				data-show-focus={isFocused || undefined}
			>
				{isIconOnly ? icon(startIcon) : label}
			</Button>
		</Playground>
	);
}
