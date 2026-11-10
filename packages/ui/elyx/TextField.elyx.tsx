import { SearchField as UiSearchField } from '../lib/SearchField.js';
import { TextField as UiTextField } from '../lib/TextField.js';

export function TextField({
	label = 'Your name',
	placeholder = 'Sam Smith',
	description = '',
	value = '',
	errorMessage = '',
	multiline = false,
	isInvalid = false,
	isDisabled = false,
}: {
	label?: string;
	placeholder?: string;
	description?: string;
	value?: string;
	errorMessage?: string;
	multiline?: boolean;
	isInvalid?: boolean;
	isDisabled?: boolean;
}) {
	return (
		<UiTextField
			label={label}
			placeholder={placeholder}
			description={description || undefined}
			value={value}
			onChange={() => {}}
			errorMessage={errorMessage || undefined}
			multiline={multiline}
			isInvalid={isInvalid}
			isDisabled={isDisabled}
			className="w-72"
		/>
	);
}

export function SearchField({ label = 'Typeface', placeholder = 'Search typefaces', value = '' }: { label?: string; placeholder?: string; value?: string }) {
	return <UiSearchField label={label} placeholder={placeholder} value={value} onChange={() => {}} className="w-72" />;
}
