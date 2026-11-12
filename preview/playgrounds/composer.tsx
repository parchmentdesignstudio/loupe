import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Composer } from '../../src/index.js';
import { Choice, IconPicker, Playground, SwitchControl, TextControl, longWords, pick, solidIcons } from '../playground.js';

const lengths = ['none', 'short', 'long'] as const;
const widths = { narrow: 'w-56', medium: 'w-80', wide: 'w-full max-w-lg' } as const;
type Length = (typeof lengths)[number];
type Width = keyof typeof widths;

const placeholders = { none: undefined, short: 'Tell me what you’re working on', long: longWords };

const drafts = { none: '', short: 'Could we move the call to Thursday?', long: `${longWords}. ${longWords}. ${longWords}.` };
export function ComposerPlayground() {
	const [placeholder, setPlaceholder] = useState<Length>('short');
	const [submitLabel, setSubmitLabel] = useState('Send');
	const [submitIcon, setSubmitIcon] = useState<IconName>('arrow-up');
	const [width, setWidth] = useState<Width>('medium');
	const [isDisabled, setDisabled] = useState(false);
	const [sent, setSent] = useState<string[]>([]);
	const [message, setMessage] = useState('');
	const shuffle = () => {
		setPlaceholder(pick(lengths));
		setSubmitIcon(pick(solidIcons()));
		setWidth(pick(Object.keys(widths) as Width[]));
		setMessage(drafts[pick(lengths)]);
	};
	return (
		<Playground
			onRandom={shuffle}
			box="flex-col gap-3"
			controls={
				<>
					<Choice label="Placeholder" options={lengths} value={placeholder} onChange={setPlaceholder} />
					<Choice label="Draft" options={lengths} value={(Object.keys(drafts) as Length[]).find((key) => drafts[key] === message) ?? 'short'} onChange={(next) => setMessage(drafts[next])} />
					<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />
					<IconPicker label="Send icon" value={submitIcon} onChange={setSubmitIcon} />
					<TextControl label="Send button, read out" value={submitLabel} onChange={setSubmitLabel} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
				</>
			}
		>
			<Composer
				label="Your message"
				placeholder={placeholders[placeholder]}
				submitLabel={submitLabel}
				submitIcon={<Icon name={submitIcon} />}
				value={message}
				onChange={setMessage}
				onSubmit={(next) => {
					setSent((list) => [...list, next]);
					setMessage('');
				}}
				isDisabled={isDisabled}
				className={widths[width]}
			/>
			{sent.length > 0 && <p className={`font-mono text-label ${widths[width]}`}>Sent: {sent.join(', ')}</p>}
		</Playground>
	);
}
