import type { ReactNode } from 'react';
import { FieldError as AriaFieldError, type FieldErrorProps, Label as AriaLabel, type LabelProps, Text, type TextProps, type ValidationResult } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';

// The parts every field shares, so a select reads like a text field
export const field = tv({
	slots: {
		label: 'w-fit cursor-default font-mono text-label text-ink',
		description: 'text-label text-muted',
		error: 'text-label text-danger',
	},
});

const slots = field();

/** The props a field takes for the text around its control */
export interface FieldTextProps {
	label?: ReactNode;
	description?: ReactNode;
	errorMessage?: string | ((validation: ValidationResult) => string);
}

export function Label(props: LabelProps) {
	return <AriaLabel {...props} className={slots.label({ className: props.className })} />;
}

export function Description(props: TextProps) {
	return <Text {...props} slot="description" className={slots.description({ className: props.className })} />;
}

export function FieldError(props: FieldErrorProps) {
	return <AriaFieldError {...props} className={composeClassName(props.className, slots.error())} />;
}
