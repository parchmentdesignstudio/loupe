import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Composer } from '../../src/index.js';
import { Choice, ControlGroup, IconPicker, Playground, ShowFocus, SwitchControl, TextControl, longWords, pick, solidIcons, useRemembered } from '../playground.js';

const lengths = ['none', 'short', 'long'] as const;
const widths = { narrow: 'w-56', medium: 'w-80', wide: 'w-full max-w-lg' } as const;
type Length = (typeof lengths)[number];
type Width = keyof typeof widths;

const placeholders = { none: undefined, short: 'Tell me what you’re working on', long: longWords };

const drafts = { none: '', short: 'Could we move the call to Thursday?', long: `${longWords}. ${longWords}. ${longWords}.` };
export function ComposerPlayground() {
	const [placeholder, setPlaceholder] = useRemembered('placeholder', 'short', lengths);
	const [submitLabel, setSubmitLabel] = useRemembered('submitLabel', 'Send');
	const [submitIcon, setSubmitIcon] = useRemembered<IconName>('submitIcon', 'arrow-up', (name) => solidIcons().includes(name));
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [sent, setSent] = useState<string[]>([]);
	const [message, setMessage] = useRemembered('message', '');
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const shuffle = () => {
		setPlaceholder(pick(lengths));
		setSubmitIcon(pick(solidIcons()));
		setWidth(pick(Object.keys(widths) as Width[]));
		setMessage(drafts[pick(lengths)]);
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			box="flex-col gap-3"
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Placeholder" options={lengths} value={placeholder} onChange={setPlaceholder} />
						<Choice label="Draft" options={lengths} value={(Object.keys(drafts) as Length[]).find((key) => drafts[key] === message) ?? 'short'} onChange={(next) => setMessage(drafts[next])} />
						<IconPicker label="Send icon" value={submitIcon} onChange={setSubmitIcon} />
						<TextControl label="Send button, read out" value={submitLabel} onChange={setSubmitLabel} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<ShowFocus when={isFocused}>
				<Composer
					aria-label="Your message"
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
			</ShowFocus>
			{sent.length > 0 && <p className={`font-mono text-label ${widths[width]}`}>Sent: {sent.join(', ')}</p>}
		</Playground>
	);
}
