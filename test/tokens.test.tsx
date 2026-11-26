/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

// The colour tokens are left unset, and each component reads one with the value components.css lists as its fallback,
// so it takes the roles of the section it's in. These keep the two the same
const sheets = import.meta.glob<string>('../styles/*.css', { query: '?raw', import: 'default', eager: true });
const code = import.meta.glob<string>('../src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true });
const { '../styles/components.css': css, ...others } = sheets;
const sources = [...Object.values(code), ...Object.values(others)];
const listed = [...css.matchAll(/@media not all \{(.*?)\n\t\t\}/gs)].flatMap(([, block]) => [...block.matchAll(/--([\w-]+): (.+);/g)].map(([, name, value]) => [name, value] as const));

// Each read of a token, in var() or a class's (--token), as the fallback it carries up to the bracket that closes it,
// or null for none
function readsOf(text: string, name: string) {
	return [...text.matchAll(new RegExp(`(?<=\\(|\\(color:)--${name}(?=[),])`, 'g'))].map((match) => {
		const after = match.index + match[0].length;
		if (text[after] === ')') return null;
		let depth = 0;
		let end = after + 1;
		for (; end < text.length; end++) {
			if (text[end] === '(') depth++;
			else if (text[end] === ')' && depth-- === 0) break;
		}
		return text.slice(after + 1, end);
	});
}

// A class writes a space as _ and none after a comma
const same = (value: string) => value.replace(/[\s_]/g, '');

describe('component tokens', () => {
	it('list the colours', () => {
		expect(listed.length).toBeGreaterThan(60);
	});

	it('read each colour with its listed value as the fallback', () => {
		for (const [name, value] of listed) {
			// A shadow's token is read first in its recipe, as --shadow-button-primary: var(--button-primary-shadow, …)
			const shadow = /^var\(--(shadow-[\w-]+)\)$/.exec(value)?.[1];
			if (shadow) {
				expect(others['../styles/theme.css'], `--${shadow} reads --${name}`).toMatch(new RegExp(`--${shadow}: var\\(--${name},`));
				continue;
			}
			const reads = sources.flatMap((text) => readsOf(text, name));
			expect(reads.length, `--${name} is read`).toBeGreaterThan(0);
			for (const fallback of reads) expect(fallback === null ? null : same(fallback), `--${name}'s fallback`).toBe(same(value));
		}
	});

	it('set no token on :root that starts at a role', () => {
		const set = css.replace(/@media not all \{.*?\n\t\t\}/gs, '');
		expect([...set.matchAll(/--([\w-]+): [^;]*var\(--(?:color-|edge\b|bleed\b)/g)].map(([, name]) => name)).toEqual([]);
	});
});
