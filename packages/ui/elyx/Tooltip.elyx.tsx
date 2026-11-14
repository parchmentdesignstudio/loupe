import { Tooltip as UiTooltip, TooltipTrigger } from '../lib/Tooltip.js';
import { Button } from '../lib/Button.js';

// A tooltip needs its trigger, so it's drawn open beside a button
export function Tooltip({ label = 'Undo', buttonLabel = 'Edit', showArrow = false }: { label?: string; buttonLabel?: string; showArrow?: boolean }) {
	return (
		<TooltipTrigger isOpen>
			<Button variant="secondary">{buttonLabel}</Button>
			<UiTooltip showArrow={showArrow}>{label}</UiTooltip>
		</TooltipTrigger>
	);
}
