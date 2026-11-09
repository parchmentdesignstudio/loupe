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
