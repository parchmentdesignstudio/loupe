// Compiles styles.css to compiled/styles.css, as code layers can't run Tailwind: pnpm --filter @parchment/ui elyx:css
import tailwindcss from '@tailwindcss/vite';
import { type Plugin, defineConfig } from 'vite';

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

const flatten = (): Plugin => ({
	name: 'flatten-layers',
	generateBundle(_, bundle) {
		for (const file of Object.values(bundle)) {
			if (file.type === 'asset' && file.fileName.endsWith('.css')) file.source = resolveLightDark(flattenLayers(String(file.source)));
		}
	},
});

export default defineConfig({
	root: import.meta.dirname,
	plugins: [tailwindcss(), flatten()],
	build: {
		outDir: 'compiled',
		emptyOutDir: true,
		cssMinify: false,
		rollupOptions: {
			input: 'styles.css',
			output: { assetFileNames: 'styles.css' },
		},
	},
});
