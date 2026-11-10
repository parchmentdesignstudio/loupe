import { Chip as UiChip, ChipGroup } from '../lib/Chip.js';

export function Chip({ label = 'Tell me more' }: { label?: string }) {
	return <UiChip>{label}</UiChip>;
}

export function Chips({ first = 'Tell me more', second = 'Book a call', third = 'Not now' }: { first?: string; second?: string; third?: string }) {
	return (
		<ChipGroup aria-label="Suggestions">
			<UiChip>{first}</UiChip>
			<UiChip>{second}</UiChip>
			<UiChip>{third}</UiChip>
		</ChipGroup>
	);
}
