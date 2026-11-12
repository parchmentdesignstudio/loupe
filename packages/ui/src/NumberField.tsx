import { Button, Group, Input, NumberField as AriaNumberField, type NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label, readOnly } from './Field.js';
import { Dash, Plus } from './glyphs.js';
import { composeClassName, tv } from './tv.js';

// Sized like a text field, with its steppers inside as the combo box has its button
const numberField = tv({
	slots: {
		group: ['flex items-center rounded-lg bg-raised [--bleed:var(--raised-bleed)] pr-1 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]', readOnly],
		input: 'min-w-0 flex-1 bg-transparent py-1.5 pl-3 text-control text-ink tabular-nums outline-none placeholder:text-muted',
		stepper: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[disabled]:opacity-40 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
	},
	variants: {
		isFocusWithin: {
			false: { group: 'outline-0' },
			true: { group: 'outline-2' },
		},
		isInvalid: {
			true: { group: 'outline-danger shadow-invalid' },
		},
		isDisabled: {
			true: { group: 'opacity-50' },
		},
	},
});

export interface NumberFieldProps extends AriaNumberFieldProps, FieldTextProps {
	placeholder?: string;
}

/** A number, typed or stepped. The arrow keys and its buttons move it by step, within minValue and maxValue, and formatOptions shows it as a percentage, currency or unit */
export function NumberField({ label, description, errorMessage, placeholder, ...props }: NumberFieldProps) {
	return (
		<AriaNumberField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{({ isInvalid, isDisabled }) => {
				const slots = numberField({ isInvalid, isDisabled });
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
