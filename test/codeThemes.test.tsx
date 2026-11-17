/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { codeTheme } from '../src/shiki.js';
import themes from '../styles/code-themes.css?raw';

// A role the Shiki theme reads with a fallback, such as quotes falling back to strings, is set on :root, so a theme that
// predates it would keep Loupe's. Under data-code-theme it's set to its fallback instead, which these keep in step
const fallbacks = [...JSON.stringify(codeTheme).matchAll(/var\(--color-code-([\w-]+), var\(--color-code-([\w-]+)\)\)/g)].map(([, role, fallback]) => `--color-code-${role}: var(--color-code-${fallback});`);
const shared = themes.match(/\[data-code-theme\] \{(.*?)\}/s)?.[1] ?? '';

describe('code themes', () => {
	it('set each role the Shiki theme falls back from to the role it falls back to', () => {
		expect(fallbacks.length).toBeGreaterThan(2);
		for (const declaration of fallbacks) expect(shared).toContain(declaration);
	});
});
