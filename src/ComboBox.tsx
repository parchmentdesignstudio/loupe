import type { ReactNode } from 'react';
import { Button, ComboBox as AriaComboBox, type ComboBoxProps as AriaComboBoxProps, Group, Input } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, tv } from './tv.js';

const combo = tv({
	slots: {
		group: 'flex min-h-11 items-center rounded-2xl bg-paper pr-1.5 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]',
		input: 'min-w-0 flex-1 bg-transparent py-2.5 pl-4 text-base text-ink outline-none placeholder:text-muted',
		button: 'flex size-8 shrink-0 cursor-default items-center justify-center rounded-full text-muted outline-0 data-[hovered]:bg-ink/5 data-[pressed]:bg-ink/10',
	},
	variants: {
		isFocusWithin: {
			false: { group: 'outline-0' },
			true: { group: 'outline-2' },
		},
		isInvalid: {
			true: { group: 'outline-danger shadow-[0_0_0_1px_var(--color-danger)]' },
		},
		isDisabled: {
			true: { group: 'opacity-50' },
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
		<AriaComboBox {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{({ isInvalid, isDisabled }) => {
				const slots = combo({ isInvalid, isDisabled });
				return (
					<>
						{label && <Label>{label}</Label>}
						<Group className={(state) => slots.group(state)}>
							<Input placeholder={placeholder} className={slots.input()} />
							<Button className={slots.button()}>
								<ChevronDown />
							</Button>
						</Group>
						{description && <Description>{description}</Description>}
						<FieldError>{errorMessage}</FieldError>
						<Popover className="min-w-(--trigger-width)">
							<ListBox>{children}</ListBox>
						</Popover>
					</>
				);
			}}
		</AriaComboBox>
	);
}
