import type { ReactNode } from 'react';
import { Button, ComboBox as AriaComboBox, type ComboBoxProps as AriaComboBoxProps, Group, Input } from 'react-aria-components';
import { boxField, boxLabel, Description, FieldError, type FieldTextProps, Label, readOnly } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, tv } from './tv.js';

const combo = tv({
	slots: {
		group: ['flex items-center rounded-(--field-radius) bg-(--field-fill,var(--color-raised)) [--bleed:var(--raised-bleed)] pr-1 shadow-raised [--shadow-raised-color:var(--field-shadow)] outline-offset-2 outline-(color:--field-focus-ring,var(--color-ink)) forced-colors:outline-[Highlight] in-data-[show-focus]:outline-2', readOnly],
		input: 'min-w-0 flex-1 bg-transparent py-(--field-padding-y) pl-(--field-padding-x) font-(family-name:--typeface-body) text-control text-(color:--field-text,var(--color-ink)) outline-none placeholder:text-(color:--field-placeholder,var(--color-muted))',
		button: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
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
			true: { group: 'bg-bleed/12 shadow-none', input: 'text-muted' },
		},
	},
});

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'>, FieldTextProps {
	placeholder?: string;
	/** ListBoxItems, or a function that makes one from each of items or defaultItems */
	children: ReactNode | ((item: T) => ReactNode);
}

/** A text field that filters a list of options as you type */
export function ComboBox<T extends object>({ label, description, errorMessage, placeholder, children, ...props }: ComboBoxProps<T>) {
	return (
		<AriaComboBox {...props} className={composeClassName(props.className, boxField)}>
			{({ isInvalid, isDisabled }) => {
				const slots = combo({ isInvalid, isDisabled });
				return (
					<>
						{label && <Label className={boxLabel}>{label}</Label>}
						<Group className={(state) => slots.group(state)}>
							<Input placeholder={placeholder} className={slots.input()} />
							<Button className={slots.button()}>
								<ChevronDown />
							</Button>
						</Group>
						{description && <Description>{description}</Description>}
						<FieldError>{errorMessage}</FieldError>
						<Popover className="max-w-[max(var(--trigger-width),20rem)] min-w-(--trigger-width)">
							<ListBox>{children}</ListBox>
						</Popover>
					</>
				);
			}}
		</AriaComboBox>
	);
}
