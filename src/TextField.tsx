import { Input, TextArea, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label, readOnly } from './Field.js';
import { composeClassName, tv } from './tv.js';

// Control text, which is 16px on touch screens, as iOS zooms into anything smaller. Like a button, the padding and the
// 20px line make it 32px tall. Chrome ignores an input's line if it's no taller than the text, so a 16px line, an
// icon's, would make it 37px on a touch screen. A field shows its focus however it was focused
export const input = tv({
	base: ['w-full rounded-lg bg-raised px-3 py-1.5 text-control text-ink shadow-raised outline-offset-0 outline-ink placeholder:text-muted forced-colors:outline-[Highlight]', readOnly],
	variants: {
		isFocused: {
			false: 'outline-0',
			true: 'outline-2',
		},
		isInvalid: {
			true: 'outline-danger shadow-invalid',
		},
		isDisabled: {
			true: 'opacity-50',
		},
	},
});

export interface TextFieldProps extends AriaTextFieldProps, FieldTextProps {
	placeholder?: string;
	/** Several lines, in a text area that grows taller by dragging */
	multiline?: boolean;
	/** How many lines a multiline field shows to begin with */
	rows?: number;
}

/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export function TextField({ label, description, errorMessage, placeholder, multiline = false, rows = 4, ...props }: TextFieldProps) {
	return (
		<AriaTextField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			{multiline ? (
				<TextArea placeholder={placeholder} rows={rows} className={(state) => input({ ...state, className: 'resize-y leading-[1.5]' })} />
			) : (
				<Input placeholder={placeholder} className={(state) => input(state)} />
			)}
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaTextField>
	);
}
