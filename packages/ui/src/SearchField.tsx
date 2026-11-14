import { Button, Group, Input, SearchField as AriaSearchField, type SearchFieldProps as AriaSearchFieldProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label, readOnly } from './Field.js';
import { Cross, MagnifyingGlass } from './glyphs.js';
import { composeClassName, tv } from './tv.js';

// Sized like a text field, with the glass at its start and the clear button inside, as the combo box has its button.
// The clear button only hides while empty, so the text doesn't shift as you type the first letter
const searchField = tv({
	slots: {
		group: ['flex items-center rounded-lg bg-raised [--bleed:var(--raised-bleed)] pr-1 pl-2.5 shadow-raised outline-offset-0 outline-ink forced-colors:outline-[Highlight]', readOnly],
		glass: 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted',
		input: 'min-w-0 flex-1 appearance-none bg-transparent py-1.5 pl-1.5 text-control text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden',
		clear: 'flex shrink-0 cursor-default items-center justify-center rounded-sm p-1 text-muted outline-0 data-[hovered]:bg-bleed/4 data-[pressed]:bg-bleed/12',
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
		isEmpty: {
			true: { clear: 'invisible' },
		},
	},
});

export interface SearchFieldProps extends AriaSearchFieldProps, FieldTextProps {
	placeholder?: string;
}

/** A field to search with, and a button that clears it. Escape clears it too, and Enter calls onSubmit */
export function SearchField({ label, description, errorMessage, placeholder, ...props }: SearchFieldProps) {
	return (
		<AriaSearchField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{({ isEmpty, isInvalid, isDisabled }) => {
				const slots = searchField({ isEmpty, isInvalid, isDisabled });
				return (
					<>
						{label && <Label>{label}</Label>}
						<Group className={(state) => slots.group(state)}>
							<MagnifyingGlass className={slots.glass()} />
							<Input placeholder={placeholder} className={slots.input()} />
							<Button className={slots.clear()}>
								<Cross />
							</Button>
						</Group>
						{description && <Description>{description}</Description>}
						<FieldError>{errorMessage}</FieldError>
					</>
				);
			}}
		</AriaSearchField>
	);
}
