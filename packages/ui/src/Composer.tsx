import { type FormEvent, type ReactNode, useState } from 'react';
import { Form, Group, Input, TextField as AriaTextField } from 'react-aria-components';
import { Button } from './Button.js';
import { tv } from './tv.js';

const composer = tv({
	slots: {
		group: 'flex items-end gap-2 rounded-[1.25rem] bg-paper py-2 pr-2 pl-4 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]',
		input: 'min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-muted',
	},
	variants: {
		isFocusWithin: {
			false: { group: 'outline-0' },
			true: { group: 'outline-2' },
		},
		isDisabled: {
			true: { group: 'opacity-50' },
		},
	},
});

export interface ComposerProps {
	/** Names the field for screen readers, as it has no visible label */
	label: string;
	placeholder?: string;
	/** Names the send button */
	submitLabel?: string;
	/** The send button's icon, such as arrow-up from @parchment/icons */
	submitIcon: ReactNode;
	/** Gets the message, trimmed. The field then clears */
	onSubmit: (message: string) => void;
	isDisabled?: boolean;
	className?: string;
}

/** A message field with its send button, as in the chat. Enter sends, and an empty message can't be sent */
export function Composer({ label, placeholder, submitLabel = 'Send', submitIcon, onSubmit, isDisabled = false, className }: ComposerProps) {
	const [message, setMessage] = useState('');
	const empty = message.trim() === '';
	const slots = composer();

	const send = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (empty || isDisabled) return;
		onSubmit(message.trim());
		setMessage('');
	};

	return (
		<Form onSubmit={send} className={className}>
			<AriaTextField aria-label={label} value={message} onChange={setMessage} isDisabled={isDisabled}>
				<Group className={(state) => slots.group(state)}>
					<Input placeholder={placeholder} className={slots.input()} />
					<Button type="submit" aria-label={submitLabel} shape="circle" size="small" isDisabled={isDisabled || empty}>
						{submitIcon}
					</Button>
				</Group>
			</AriaTextField>
		</Form>
	);
}
