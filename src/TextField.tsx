import { Input, TextArea, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, type Size, type FieldVariant, Label, readOnly } from './Field.js';
import { composeClassName, tv } from './tv.js';

// Control text, which is 16px on touch screens, as iOS zooms into anything smaller. Like a button, the padding and the
// 20px line make it 32px tall. Chrome ignores an input's line if it's no taller than the text, so a 16px line, an
// icon's, would make it 37px on a touch screen. A field shows its focus however it was focused
export const textFieldInput = tv({
	base: ['w-full rounded-(--field-radius) text-control text-(color:--field-text,var(--color-ink)) outline-offset-2 outline-(color:--field-focus-ring,var(--color-ink)) placeholder:text-(color:--field-placeholder,var(--color-muted)) forced-colors:outline-[Highlight] in-data-[show-focus]:outline-2', readOnly],
	variants: {
		// Before the states, so invalid's ring and disabled's fill win over them
		variant: {
			raised: 'bg-(--field-fill,var(--color-raised)) shadow-raised [--shadow-raised-color:var(--field-shadow)]',
			filled: 'bg-bleed/8 shadow-none',
		},
		// The 20px line and this padding make 32px, or 28px when small, as a button's do
		size: {
			medium: 'px-(--field-padding-x) py-(--field-padding-y)',
			small: 'px-(--field-small-padding-x) py-(--field-small-padding-y)',
		},
		isFocused: {
			false: 'outline-0',
			true: 'outline-2',
		},
		isInvalid: {
			true: 'outline-danger shadow-invalid',
		},
		isDisabled: {
			true: 'bg-bleed/12 text-muted shadow-none',
		},
	},
	// Filled is already grey, so disabled goes lighter rather than darker
	compoundVariants: [{ variant: 'filled', isDisabled: true, class: 'bg-bleed/4' }],
	defaultVariants: { variant: 'raised', size: 'medium' },
});

export interface TextFieldProps extends AriaTextFieldProps, FieldTextProps {
	placeholder?: string;
	/** Several lines, in a text area that grows taller by dragging */
	isMultiline?: boolean;
	/** How many lines a multiline field shows to begin with */
	rows?: number;
	/** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
	variant?: FieldVariant;
	/** 32px tall, or 28px when small, as a button is */
	size?: Size;
}

/** A labelled text input, with an optional description and the error React Aria's validation gives it */
export function TextField({ label, description, errorMessage, placeholder, isMultiline = false, rows = 4, variant, size, ...props }: TextFieldProps) {
	return (
		<AriaTextField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label className="pb-0.5">{label}</Label>}
			{isMultiline ? (
				<TextArea placeholder={placeholder} rows={rows} className={(state) => textFieldInput({ ...state, variant, size, className: 'resize-y leading-[1.5]' })} />
			) : (
				<Input placeholder={placeholder} className={(state) => textFieldInput({ ...state, variant, size })} />
			)}
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaTextField>
	);
}
