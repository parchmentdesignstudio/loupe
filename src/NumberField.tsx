import { Button, Group, Input, NumberField as AriaNumberField, type NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components';
import { boxField, boxLabel, Description, FieldError, type FieldTextProps, type Size, type FieldVariant, Label, readOnly } from './Field.js';
import { Dash, Plus } from './glyphs.js';
import { composeClassName, tv } from './tv.js';

// Sized like a text field, with its steppers inside as the combo box has its button
export const numberField = tv({
	slots: {
		group: ['flex items-center rounded-(--field-radius) pe-1 outline-offset-2 outline-(color:--field-focus-ring,var(--color-ink)) forced-colors:outline-[Highlight] in-data-[show-focus]:outline-2', readOnly],
		input: 'min-w-0 flex-1 bg-transparent text-control text-(color:--field-text,var(--color-ink)) tabular-nums outline-none placeholder:text-(color:--field-placeholder,var(--color-muted))',
		stepper: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:text-bleed/24 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
	},
	variants: {
		// As a text field's. Raised tints its steppers' hover from white's bleed, and filled keeps the layer's
		variant: {
			raised: { group: 'bg-(--field-fill,var(--color-raised)) [--bleed:var(--raised-bleed)] shadow-raised [--shadow-raised-color:var(--field-shadow)]' },
			filled: { group: 'bg-bleed/8 shadow-none' },
		},
		// As a text field's: 32px, or 28px when small
		size: {
			medium: { input: 'py-(--field-padding-y) ps-(--field-padding-x)' },
			small: { input: 'py-(--field-small-padding-y) ps-(--field-small-padding-x)', stepper: 'p-0.5' },
		},
		isFocusWithin: {
			false: { group: 'outline-0' },
			true: { group: 'outline-2' },
		},
		isInvalid: {
			true: { group: 'outline-danger shadow-invalid' },
		},
		isDisabled: {
			true: { group: 'bg-bleed/12 shadow-none', input: 'text-muted' },
		},
	},
	compoundVariants: [{ variant: 'filled', isDisabled: true, class: { group: 'bg-bleed/4' } }],
	defaultVariants: { variant: 'raised', size: 'medium' },
});

export interface NumberFieldProps extends AriaNumberFieldProps, FieldTextProps {
	placeholder?: string;
	/** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
	variant?: FieldVariant;
	/** 32px tall, or 28px when small, as a button is */
	size?: Size;
}

/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export function NumberField({ label, description, errorMessage, placeholder, variant, size, ...props }: NumberFieldProps) {
	return (
		<AriaNumberField {...props} className={composeClassName(props.className, boxField)}>
			{({ isInvalid, isDisabled }) => {
				const slots = numberField({ isInvalid, isDisabled, variant, size });
				return (
					<>
						{label && <Label className={boxLabel}>{label}</Label>}
						<Group className={(state) => slots.group(state)}>
							<Input placeholder={placeholder} className={slots.input()} />
							<Button slot="decrement" className={slots.stepper()}>
								<Dash />
							</Button>
							<Button slot="increment" className={slots.stepper()}>
								<Plus />
							</Button>
						</Group>
						{description && <Description>{description}</Description>}
						<FieldError>{errorMessage}</FieldError>
					</>
				);
			}}
		</AriaNumberField>
	);
}
