import type { PopoverProps } from '../../src/index.js';

// Shared by the overlay playgrounds: where it sits beside its trigger, and how much it has to say

export const sides = ['top', 'bottom', 'start', 'end'] as const;
export const aligns = ['centre', 'start', 'end'] as const;
export type Side = (typeof sides)[number];
export type Align = (typeof aligns)[number];

/** React Aria's placement for a side and an alignment along it. Beside the start or end, alignment is top or bottom */
export function placementOf(side: Side, align: Align) {
	if (align === 'centre') return side;
	const along = side === 'top' || side === 'bottom' ? align : align === 'start' ? 'top' : 'bottom';
	return `${side} ${along}` as NonNullable<PopoverProps['placement']>;
}

export const lengths = ['none', 'short', 'long', 'scrolling'] as const;
export type Length = (typeof lengths)[number];

export const shortBody = 'Anyone with the link can view this project.';
const paragraph = 'Anyone with the link can view this project, but they won’t be able to change it until you invite them. You can turn the link off at any time, and it stops working straight away for everyone who has it.';

/** Paragraphs of body copy for a length, from nothing to enough to scroll */
export function bodyOf(length: Length): string[] {
	if (length === 'none') return [];
	if (length === 'short') return [shortBody];
	if (length === 'long') return [paragraph];
	return Array.from({ length: 12 }, () => paragraph);
}
