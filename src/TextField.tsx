import { Input, TextArea, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
import { composeClassName, tv } from './tv.js';

// 16px text, as iOS zooms into anything smaller. A field shows its focus however it was focused
export const input = tv({
	base: 'min-h-11 w-full rounded-2xl bg-paper px-4 py-2.5 text-base text-ink shadow-raised outline-offset-0 outline-ink placeholder:text-muted forced-colors:outline-[Highlight]',
	variants: {
		isFocused: {
			false: 'outline-0',
			true: 'outline-2',
		},
		isInvalid: {
			true: 'outline-danger shadow-[0_0_0_1px_var(--color-danger)]',
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
				<TextArea placeholder={placeholder} rows={rows} className={(state) => input({ ...state, className: 'resize-y' })} />
			) : (
				<Input placeholder={placeholder} className={(state) => input(state)} />
			)}
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaTextField>
	);
}
