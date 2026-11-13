import type { ReactNode } from 'react';
import { FieldError as AriaFieldError, type FieldErrorProps, Label as AriaLabel, type LabelProps, Text, type TextProps, type ValidationResult } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';

// The parts every field shares, so a select reads like a text field. A required field's label ends in a muted *,
// which screen readers skip, as the field already says it's required
export const field = tv({
	slots: {
		label: "w-fit cursor-default text-control text-ink in-data-required:after:ms-0.5 in-data-required:after:text-muted in-data-required:after:content-['*'_/_'']",
		description: 'text-label text-muted',
		error: 'text-label text-danger',
	},
});

const slots = field();

/** A read-only field keeps its edge but loses its fill and lift, so it reads as set rather than waiting for input */
export const readOnly = 'in-data-readonly:bg-transparent in-data-readonly:shadow-[0_0_0_.5px_var(--edge)]';

/** How a field's box looks. Raised is white with a lift, for a form. Filled is flat and grey, as a design tool's
 * inspector has it, for dense panels of settings. Its grey is the layer's own tint, so it suits the ground, a panel or
 * a raised card without saying which */
export type FieldVariant = 'raised' | 'filled';

/** 32px tall, or 28px when small, as a button is */
export type FieldSize = 'medium' | 'small';

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
