import { longWords } from '../playground.js';

// The MIME types each choice takes, or none for anything. Shared by the drop zone and file trigger
export const accepts = {
	anything: undefined,
	images: ['image/svg+xml', 'image/png', 'image/jpeg'],
	svg: ['image/svg+xml'],
	pdf: ['application/pdf'],
} as const;
export type Accepts = keyof typeof accepts;

// Files already shown, to see a few or some very long names before dropping any
export const seeds = {
	none: [],
	few: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png'],
	long: [`${longWords.toLowerCase().replaceAll(' ', '-').replace(',', '')}.svg`, 'apple-touch-icon-180x180-final-final-v3.png'],
} as const;
export type Seed = keyof typeof seeds;
