import { Button, Group, Input, NumberField as AriaNumberField, type NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, type FieldSize, type FieldVariant, Label, readOnly } from './Field.js';
import { Dash, Plus } from './glyphs.js';
import { composeClassName, tv } from './tv.js';

// Sized like a text field, with its steppers inside as the combo box has its button
const numberField = tv({
	slots: {
		group: ['flex items-center rounded-lg pr-1 outline-offset-0 outline-ink forced-colors:outline-[Highlight]', readOnly],
		input: 'min-w-0 flex-1 bg-transparent text-control text-ink tabular-nums outline-none placeholder:text-muted',
		stepper: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:text-bleed/24 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
	},
	variants: {
		// As a text field's. Raised tints its steppers' hover from white's bleed, and filled keeps the layer's
		variant: {
			raised: { group: 'bg-raised [--bleed:var(--raised-bleed)] shadow-raised' },
			filled: { group: 'bg-bleed/8 shadow-none' },
		},
		// As a text field's: 32px, or 28px when small
		size: {
			medium: { input: 'py-1.5 pl-3' },
			small: { input: 'py-1 pl-2.5', stepper: 'p-0.5' },
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
	size?: FieldSize;
}

/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export function NumberField({ label, description, errorMessage, placeholder, variant, size, ...props }: NumberFieldProps) {
	return (
		<AriaNumberField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{({ isInvalid, isDisabled }) => {
				const slots = numberField({ isInvalid, isDisabled, variant, size });
				return (
					<>
						{label && <Label>{label}</Label>}
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
