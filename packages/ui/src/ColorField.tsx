import { ColorField as AriaColorField, type ColorFieldProps as AriaColorFieldProps, Input } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
import { input } from './TextField.js';
import { composeClassName } from './tv.js';

export interface ColorFieldProps extends AriaColorFieldProps, FieldTextProps {
	placeholder?: string;
}

/** A colour typed as hex, such as #fbf6ef, or one channel of it as a number when given a channel */
export function ColorField({ label, description, errorMessage, placeholder, ...props }: ColorFieldProps) {
	return (
		<AriaColorField {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<Input placeholder={placeholder} className={(state) => input(state)} />
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaColorField>
	);
}
