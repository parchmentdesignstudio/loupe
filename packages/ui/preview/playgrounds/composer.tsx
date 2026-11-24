import { useState } from 'react';
import type { IconName } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import { Button, Chip, Composer, Menu, MenuItem, MenuTrigger } from '../../src/index.js';
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
	const [hasContext, setContext] = useRemembered('hasContext', false);
	const [hasActions, setActions] = useRemembered('hasActions', false);
	const [model, setModel] = useState('Opus 5.5');
	const shuffle = () => {
		setPlaceholder(pick(lengths));
		setSubmitIcon(pick(solidIcons()));
		setWidth(pick(Object.keys(widths) as Width[]));
		setMessage(drafts[pick(lengths)]);
		setContext(Math.random() < 0.4);
		setActions(Math.random() < 0.4);
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
						<SwitchControl label="Context" value={hasContext} onChange={setContext} />
						<SwitchControl label="Actions" value={hasActions} onChange={setActions} />
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
					context={
						hasContext ? (
							<Chip size="small" onPress={() => setContext(false)}>
								Leek and potato soup
							</Chip>
						) : undefined
					}
					actions={
						hasActions ? (
							<MenuTrigger>
								<Button variant="ghost" size="small">
									{model}
								</Button>
								<Menu placement="top end" selectionMode="single" selectedKeys={[model]} onSelectionChange={(keys) => keys !== 'all' && keys.size && setModel(String([...keys][0]))}>
									{['Opus 5.5', 'Sonnet 5.5', 'Haiku 5.5'].map((name) => (
										<MenuItem key={name} id={name}>
											{name}
										</MenuItem>
									))}
								</Menu>
							</MenuTrigger>
						) : undefined
					}
					description="Enter sends, Shift-Enter starts a new line"
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
