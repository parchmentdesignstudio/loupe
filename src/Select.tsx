import type { ReactNode } from 'react';
import { Button, Select as AriaSelect, type SelectProps as AriaSelectProps, SelectValue } from 'react-aria-components';
import { boxField, boxLabel, Description, FieldError, type Size, type FieldTextProps, type FieldVariant, Label } from './Field.js';
import { ChevronDown } from './glyphs.js';
import { ListBox } from './ListBox.js';
import { Popover } from './Popover.js';
import { composeClassName, focusRing, tv } from './tv.js';

// Looks like a text field, but it's a button, so its text is medium like a button's, and its ring shows for keyboard
// focus only. The chevron sits 8px in, as a circle button's icon does
export const selectTrigger = tv({
	extend: focusRing,
	base: 'flex w-full cursor-default items-center gap-2 rounded-(--field-radius) text-left text-control font-(--weight-medium) text-(color:--field-text,var(--color-ink)) [-webkit-tap-highlight-color:transparent] in-data-[show-focus]:outline-2',
	variants: {
		// As a text field's, before the states so theirs win
		variant: {
			raised: 'bg-(--field-fill,var(--color-raised)) shadow-raised [--shadow-raised-color:var(--field-shadow)]',
			filled: 'bg-bleed/8 shadow-none',
		},
		size: {
			medium: 'py-(--field-padding-y) pr-2 pl-(--field-padding-x)',
			small: 'py-(--field-small-padding-y) pr-1.5 pl-(--field-small-padding-x)',
		},
		isInvalid: {
			true: 'shadow-invalid',
		},
		isDisabled: {
			true: 'bg-bleed/12 text-muted shadow-none',
		},
	},
	compoundVariants: [{ variant: 'filled', isDisabled: true, class: 'bg-bleed/4' }],
	defaultVariants: { variant: 'raised', size: 'medium' },
});

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'>, FieldTextProps {
	items?: Iterable<T>;
	/** ListBoxItems, or a function that makes one from each of items */
	children: ReactNode | ((item: T) => ReactNode);
	/** Raised, white with a lift, by default. Filled is flat and grey, for a dense panel of settings */
	variant?: FieldVariant;
	/** 32px tall, or 28px when small, as a button is */
	size?: Size;
}

/** Picks one option from a list that opens below it */
export function Select<T extends object>({ label, description, errorMessage, items, children, variant, size, ...props }: SelectProps<T>) {
	return (
		<AriaSelect {...props} className={composeClassName(props.className, boxField)}>
			{({ isInvalid }) => (
				<>
					{label && <Label className={boxLabel}>{label}</Label>}
					<Button className={(state) => selectTrigger({ ...state, isInvalid, variant, size })}>
						<SelectValue className="min-w-0 flex-1 truncate data-[placeholder]:text-(color:--field-placeholder,var(--color-muted))">{({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? defaultChildren : selectedText)}</SelectValue>
						<ChevronDown className="size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" />
					</Button>
					{description && <Description>{description}</Description>}
					<FieldError>{errorMessage}</FieldError>
					<Popover className="max-w-[max(var(--trigger-width),20rem)] min-w-(--trigger-width)">
						<ListBox items={items}>{children}</ListBox>
					</Popover>
				</>
			)}
		</AriaSelect>
	);
}
