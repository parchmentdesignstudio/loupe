// Compiles styles.css to compiled/styles.css, as code layers can't run Tailwind: pnpm --filter @parchment/ui elyx:css
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Polyfills, compile, optimize } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';

// Code layers don't read rules inside @layer, which is where Tailwind puts the tokens and the utilities.
// This takes each layer's rules out of it, in the order Tailwind wrote them, and drops the order statement
function flattenLayers(css: string) {
	let out = '';
	let i = 0;
	const unwrapped: number[] = [];
	let depth = 0;
	while (i < css.length) {
		const char = css[i];
		if (char === '"' || char === "'") {
			const end = css.indexOf(char, i + 1);
			out += css.slice(i, end + 1);
			i = end + 1;
			continue;
		}
		if (css.startsWith('@layer', i)) {
			const open = css.indexOf('{', i);
			const end = css.indexOf(';', i);
			// An order statement such as @layer theme, base; has no block
			if (end !== -1 && (open === -1 || end < open)) {
				i = end + 1;
				continue;
			}
			i = open + 1;
			unwrapped.push(depth);
			depth++;
			continue;
		}
		if (char === '{') depth++;
		if (char === '}') {
			depth--;
			if (unwrapped[unwrapped.length - 1] === depth) {
				unwrapped.pop();
				i++;
				continue;
			}
		}
		out += char;
		i++;
	}
	return out;
}

// Code layers don't read light-dark() either, and Elyx passes them no theme, so each role takes its light value
function resolveLightDark(css: string) {
	let out = '';
	let i = 0;
	for (let start = css.indexOf('light-dark(', i); start !== -1; start = css.indexOf('light-dark(', i)) {
		let depth = 0;
		let comma = -1;
		let end = start + 'light-dark'.length;
		for (; end < css.length; end++) {
			if (css[end] === '(') depth++;
			if (css[end] === ')' && --depth === 0) break;
			if (css[end] === ',' && depth === 1 && comma === -1) comma = end;
		}
		out += css.slice(i, start) + resolveLightDark(css.slice(start + 'light-dark('.length, comma)).trim();
		i = end + 1;
	}
	return out + css.slice(i);
}

const base = import.meta.dirname;
const from = join(base, 'styles.css');
// The Vite plugin can't turn polyfills off. Every browser supported has had color-mix() for years, so its fallbacks
// only split each rule round an @supports. The @property fallback stays, as code layers may not read @property
const compiler = await compile(await readFile(from, 'utf8'), { base, from, onDependency: () => {}, polyfills: Polyfills.AtProperty });
const root = compiler.root === 'none' ? [] : compiler.root === null ? [{ base, pattern: '**/*', negated: false }] : [{ ...compiler.root, negated: false }];
const scanner = new Scanner({ sources: [...root, ...compiler.sources] });
const { code } = optimize(compiler.build(scanner.scan()), { minify: false });

await mkdir(join(base, 'compiled'), { recursive: true });
await writeFile(join(base, 'compiled/styles.css'), resolveLightDark(flattenLayers(code)));
