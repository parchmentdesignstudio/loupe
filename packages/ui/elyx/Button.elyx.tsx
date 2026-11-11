import { Button as UiButton } from '../lib/Button.js';

export function Button({ label = 'Schedule call', variant = 'solid', size = 'medium', isDisabled = false }: { label?: string; variant?: 'solid' | 'void' | 'plain' | 'quiet'; size?: 'medium' | 'small'; isDisabled?: boolean }) {
	return (
		<UiButton variant={variant} size={size} isDisabled={isDisabled}>
			{label}
		</UiButton>
	);
}
