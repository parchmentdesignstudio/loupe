import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, FileTrigger } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, Playground, SwitchControl, TextControl, pick, sampleWords, solidIcons, useRemembered } from '../playground.js';
import { type Accepts, type Seed, accepts, seeds } from './files.js';

const variants = ['primary', 'secondary', 'quiet', 'outline', 'ghost'] as const;
const cameras = ['none', 'user', 'environment'] as const;
const sizes = ['medium', 'small'] as const;

// The camera only shows on a phone, where it opens the camera straight away rather than the picker
export function FileTriggerPlayground() {
	const [variant, setVariant] = useRemembered('variant', 'secondary', variants);
	const [size, setSize] = useRemembered('size', 'medium', sizes);
	const [label, setLabel] = useRemembered('label', 'Choose artwork');
	const [hasIcon, setHasIcon] = useRemembered('hasIcon', true);
	const [icon, setIcon] = useRemembered<IconName>('icon', 'paperclip', (name) => solidIcons().includes(name));
	const [accepted, setAccepted] = useRemembered('accepted', 'images', Object.keys(accepts) as Accepts[]);
	const [isMultiple, setMultiple] = useRemembered('isMultiple', true);
	const [isDirectory, setDirectory] = useRemembered('isDirectory', false);
	const [camera, setCamera] = useRemembered('camera', 'none', cameras);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [seed, setSeed] = useRemembered('seed', 'none', Object.keys(seeds) as Seed[]);
	const [names, setNames] = useState<string[]>(() => [...seeds[seed]]);
	const choose = (next: Seed) => {
		setSeed(next);
		setNames([...seeds[next]]);
	};
	const shuffle = () => {
		setVariant(pick(variants));
		setSize(pick(sizes));
		setLabel(pick(['Choose artwork', 'Upload', 'Add files', ...sampleWords]));
		setHasIcon(Math.random() < 0.6);
		setIcon(pick(solidIcons()));
		setAccepted(pick(Object.keys(accepts) as Accepts[]));
		setMultiple(Math.random() < 0.5);
		choose(pick(Object.keys(seeds) as Seed[]));
	};
	const types = accepts[accepted];
	return (
		<Playground
			onRandom={shuffle}
			box="flex-col gap-3"
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<SwitchControl label="Icon" value={hasIcon} onChange={setHasIcon} />
						{hasIcon && <IconPicker label="Icon name" value={icon} onChange={setIcon} />}
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
						<Choice label="Size" options={sizes} value={size} onChange={setSize} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						{!isDirectory && <Choice label="Accepts" options={Object.keys(accepts) as Accepts[]} value={accepted} onChange={setAccepted} />}
						<SwitchControl label="Several at once" value={isMultiple} onChange={setMultiple} />
						<SwitchControl label="A folder" value={isDirectory} onChange={setDirectory} />
						<Choice label="Camera" options={cameras} value={camera} onChange={setCamera} />
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Chosen" options={Object.keys(seeds) as Seed[]} value={seed} onChange={choose} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<FileTrigger
				acceptedFileTypes={types && [...types]}
				allowsMultiple={isMultiple}
				acceptDirectory={isDirectory}
				defaultCamera={camera === 'none' ? undefined : camera}
				onSelect={(files) => setNames([...(files ?? [])].map((file) => file.webkitRelativePath || file.name))}
			>
				<Button variant={variant} size={size} start={hasIcon ? <Icon name={icon} /> : undefined} isDisabled={isDisabled}>
					{label}
				</Button>
			</FileTrigger>
			<p className="max-w-full font-mono text-label break-words text-muted">{names.length > 0 ? names.join(', ') : 'Nothing chosen yet'}</p>
		</Playground>
	);
}
