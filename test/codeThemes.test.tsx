/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { codeTheme } from '../src/shiki.js';
import themes from '../styles/code-themes.css?raw';

// A role the Shiki theme reads with a fallback, such as quotes falling back to strings, is set on :root, so a theme that
// left it out would keep Parchment's. Each theme sets it outright, as one pointing it at its fallback is two hops
const roles = [...JSON.stringify(codeTheme).matchAll(/var\(--color-code-([\w-]+), var\(--color-code-[\w-]+\)\)/g)].map(([, role]) => role);
const named = [...themes.matchAll(/\[data-code-theme='([\w-]+)'\] \{(.*?)\n\t\}/gs)].map(([, name, body]) => ({ name, body }));

describe('code themes', () => {
	it('set each role the Shiki theme falls back from', () => {
		expect(roles.length).toBeGreaterThan(2);
		expect(named.length).toBeGreaterThan(1);
		for (const { name, body } of named) for (const role of roles) expect(body, `${name} sets --color-code-${role}`).toMatch(new RegExp(`--color-code-${role}:`));
	});
});
