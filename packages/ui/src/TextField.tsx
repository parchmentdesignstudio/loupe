import { FieldError, Input, Label, Text, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps, type ValidationResult } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';

const field = tv({
	slots: {
		label: 'font-mono text-label text-ink',
		description: 'text-label text-muted',
		error: 'text-label text-danger',
	},
});

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

export interface TextFieldProps extends AriaTextFieldProps {
	label?: string;
	description?: string;
	errorMessage?: string | ((validation: ValidationResult) => string);
	placeholder?: string;
}

/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export function TextField({ label, description, errorMessage, placeholder, ...props }: TextFieldProps) {
	const slots = field();
	return (
		<AriaTextField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label className={slots.label()}>{label}</Label>}
			<Input placeholder={placeholder} className={(state) => input(state)} />
			{description && (
				<Text slot="description" className={slots.description()}>
					{description}
				</Text>
			)}
			<FieldError className={slots.error()}>{errorMessage}</FieldError>
		</AriaTextField>
	);
}
