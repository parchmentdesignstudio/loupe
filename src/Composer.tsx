import { type FormEvent, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import { Form, Group, Text, TextArea, TextField as AriaTextField } from 'react-aria-components';
import { Button } from './Button.js';
import { tv } from './tv.js';

const composer = tv({
	slots: {
		// Context, when there is any, takes a row of its own above the text
		group: 'flex flex-wrap items-end gap-x-2 rounded-(--field-radius) bg-(--field-fill,var(--color-raised)) py-2 pr-3.5 pl-(--field-padding-x) shadow-raised [--shadow-raised-color:var(--field-shadow)] outline-offset-2 outline-(color:--field-focus-ring,var(--color-ink)) forced-colors:outline-[Highlight] in-data-[show-focus]:outline-2',
		// One line to begin with, growing with what's written up to about six, then it scrolls
		context: 'flex basis-full flex-wrap gap-1 pt-1.5',
		input: 'max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2 text-control leading-6 text-(color:--field-text,var(--color-ink)) outline-none field-sizing-content placeholder:text-(color:--field-placeholder,var(--color-muted))',
		// Centres the send button on the line of text. It sits further in than the box's radius, so it takes the smallest
		// corner rather than a concentric one, which would be square
		send: 'mb-1.5 [--button-radius:var(--radius-sm)]',
	},
	variants: {
		isFocusWithin: {
			false: { group: 'outline-0' },
			true: { group: 'outline-2' },
		},
		isDisabled: {
			true: { group: 'bg-bleed/12 shadow-none', input: 'text-muted' },
		},
	},
});

// Sending nothing doesn't send, but it isn't ignored either: the field takes focus, so its ring shows where to write,
// and gives a short shake, a no it can't be mistaken for a lag. Still, with reduced motion
const shake = [{ translate: '0' }, { translate: '-4px' }, { translate: '3px' }, { translate: '-2px' }, { translate: '0' }];

export interface ComposerProps {
	/** Names the field for screen readers, as it has no visible label */
	'aria-label': string;
	placeholder?: string;
	/** Names the send button */
	submitLabel?: string;
	/** The send button's icon, such as arrow-up from @parchment/icons */
	submitIcon: ReactNode;
	/** Gets the message, trimmed. The field then clears, unless its value is controlled, when that's up to you */
	onSubmit: (message: string) => void;
	/** The message, to control it, such as a draft kept elsewhere */
	value?: string;
	/** The message it starts with */
	defaultValue?: string;
	onChange?: (message: string) => void;
	/** What the message is about, such as Chips for a page or a file it's attached to, in a row above the text */
	context?: ReactNode;
	/** A hint for screen readers, read out with the field's name, such as how to send */
	description?: string;
	/** The most characters it takes */
	maxLength?: number;
	isDisabled?: boolean;
	className?: string;
}

// While an input method is composing, Enter picks the characters rather than sending
function sendOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
	if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
	event.preventDefault();
	event.currentTarget.form?.requestSubmit();
}

/**
 * A message field with its send button, as in the chat. Enter sends, Shift-Enter starts a new line. The button is
 * always live: an empty message isn't sent, and the field says so by taking focus with a shake
 */
export function Composer({ 'aria-label': label, placeholder, submitLabel = 'Send', submitIcon, onSubmit, value, defaultValue = '', onChange, context, description, maxLength, isDisabled = false, className }: ComposerProps) {
	const [draft, setDraft] = useState(defaultValue);
	const message = value ?? draft;
	const empty = message.trim() === '';
	const slots = composer();
	const field = useRef<HTMLTextAreaElement>(null);

	const change = (next: string) => {
		if (value === undefined) setDraft(next);
		onChange?.(next);
	};

	const send = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isDisabled) return;
		if (empty) {
			field.current?.focus();
			if (!matchMedia('(prefers-reduced-motion: reduce)').matches) field.current?.parentElement?.animate?.(shake, { duration: 280, easing: 'ease-out' });
			return;
		}
		onSubmit(message.trim());
		if (value === undefined) setDraft('');
	};

	return (
		<Form onSubmit={send} className={className}>
			<AriaTextField aria-label={label} value={message} onChange={change} maxLength={maxLength} isDisabled={isDisabled}>
				<Group className={(state) => slots.group(state)}>
					{context && <div className={slots.context()}>{context}</div>}
					{/* A phone's return key says Send, as that's what it does */}
					<TextArea ref={field} rows={1} placeholder={placeholder} enterKeyHint="send" onKeyDown={sendOnEnter} className={slots.input()} />
					<Button type="submit" variant="secondary" aria-label={submitLabel} size="small" isDisabled={isDisabled} className={slots.send()}>
						{submitIcon}
					</Button>
				</Group>
				{description && (
					<Text slot="description" className="sr-only">
						{description}
					</Text>
				)}
			</AriaTextField>
		</Form>
	);
}
