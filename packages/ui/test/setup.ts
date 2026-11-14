import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom has no IntersectionObserver or element scrolling, which React Aria’s Sheet slides and swipes with
globalThis.IntersectionObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
} as unknown as typeof IntersectionObserver;
Element.prototype.scrollTo ??= (() => {}) as Element['scrollTo'];

// Nor getAnimations, which React Aria's SelectionIndicator reads as it slides between buttons
Element.prototype.getAnimations ??= () => [];

// Nor matchMedia, which React Aria reads for reduced motion
window.matchMedia ??= ((media: string) => ({
	matches: false,
	media,
	onchange: null,
	addListener() {},
	removeListener() {},
	addEventListener() {},
	removeEventListener() {},
	dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

// Nor a canvas to draw on, which axe reaches for around a colour picker's popover. Without one it carries on, so this
// only quiets jsdom's warning
HTMLCanvasElement.prototype.getContext = (() => null) as HTMLCanvasElement['getContext'];
