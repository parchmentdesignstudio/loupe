import { Button as UiButton } from '../lib/Button.js';

export function Button({ label = 'Schedule call', variant = 'primary', size = 'medium', isDisabled = false }: { label?: string; variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'quiet'; size?: 'medium' | 'small'; isDisabled?: boolean }) {
	return (
		<UiButton variant={variant} size={size} isDisabled={isDisabled}>
			{label}
		</UiButton>
	);
}
