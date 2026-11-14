import { Checkbox as UiCheckbox } from '../lib/Checkbox.js';
import { Switch as UiSwitch } from '../lib/Switch.js';

export function Checkbox({ label = 'Brand identity', isSelected = false, isIndeterminate = false, isInvalid = false, isDisabled = false }: { label?: string; isSelected?: boolean; isIndeterminate?: boolean; isInvalid?: boolean; isDisabled?: boolean }) {
	return (
		<UiCheckbox isSelected={isSelected} isIndeterminate={isIndeterminate} isInvalid={isInvalid} isDisabled={isDisabled}>
			{label}
		</UiCheckbox>
	);
}

export function Switch({ label = 'Send me the newsletter', isSelected = false, isDisabled = false }: { label?: string; isSelected?: boolean; isDisabled?: boolean }) {
	return (
		<UiSwitch isSelected={isSelected} isDisabled={isDisabled}>
			{label}
		</UiSwitch>
	);
}
