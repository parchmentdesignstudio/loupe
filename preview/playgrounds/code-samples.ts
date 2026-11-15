import type { CodeLanguage } from '../../src/shiki.js';

// The Code playground's samples, apart from it so the preview's build can highlight each of them ahead of time
// (highlighted.mjs). Type-only imports, as Node reads this file as it is

// Code that shows each colour, with a line long enough to scroll
export const samples = {
	tsx: {
		title: 'src/Toolbar.tsx',
		marked: [6, 7],
		note: (notes: string) => ` {/* ${notes} */}`,
		change: ['600', '300'],
		code: `import { Button, Keyboard, Tooltip, TooltipTrigger } from '@parchment/ui';

// Undo, with its shortcut in the tooltip
export function Undo({ onUndo, isDisabled = false }: { onUndo: () => void; isDisabled?: boolean }) {
	return (
		<TooltipTrigger delay={600}>
			<Button variant="ghost" shape="full" aria-label="Undo" isDisabled={isDisabled} onPress={onUndo}>
				↶
			</Button>
			<Tooltip>
				Undo <Keyboard>⌘Z</Keyboard>
			</Tooltip>
		</TooltipTrigger>
	);
}
`,
	},
	css: {
		title: 'src/styles/app.css',
		marked: [5, 6],
		note: (notes: string) => ` /* ${notes} */`,
		change: ['284.7', '262'],
		code: `@import 'tailwindcss';
@import '@parchment/ui/tokens.css';

@theme {
	--color-code-keyword: light-dark(oklch(0.527 0.168 284.7), oklch(0.756 0.118 296.4));
	--radius-card: calc(var(--radius-xl) + 4px);
}

.card:has(> img) {
	padding: 0.5rem;
	border-radius: var(--radius-card);
	box-shadow: 0 0 0 0.5px var(--edge) !important;
}
`,
	},
	bash: { title: 'Terminal', marked: [1, 2], note: (notes: string) => ` # ${notes}`, change: ['#ui', '#ui@0.9.0'], code: 'pnpm add github:parchmentdesignstudio/loupe#ui\npnpm release icons # pushes packages/icons to its branch, and tags it\n' },
	json: { title: 'package.json', marked: [3, 4], note: (notes: string) => ` // ${notes}`, change: ['0.8.0', '0.9.0'], code: '{\n\t"dependencies": {\n\t\t"@parchment/icons": "github:parchmentdesignstudio/loupe#icons@0.8.0",\n\t\t"shiki": "^4.5.0"\n\t},\n\t"private": true\n}\n' },
} satisfies Partial<Record<CodeLanguage, { title: string; code: string; marked: [number, number]; note: (notes: string) => string; change: [string, string] }>>;

export type Sample = keyof typeof samples;
export const languages = Object.keys(samples) as Sample[];
export const markings = ['none', 'highlight', 'diff', 'focus'] as const;
export type Marking = (typeof markings)[number];

// The sample with its marked lines: highlighted from the meta, as a fence would, or with notes in the code. A diff
// removes the first marked line and adds it back with one change, each with the word that changed marked in it
export function mark(sample: Sample, marking: Marking) {
	const { code, marked, note, change } = samples[sample];
	const [from, to] = marked;
	if (marking === 'highlight') return { code, meta: `{${from}-${to}}` };
	if (marking === 'none') return { code };
	const [before, after] = change;
	const lines = code.split('\n').flatMap((line, i) => {
		const n = i + 1;
		if (marking === 'focus') return n < from || n > to ? [line] : [line + note('[!code focus]')];
		if (n !== from) return [line];
		return [line + note(`[!code --] [!code word:${before}:1]`), line.replace(before, after) + note(`[!code ++] [!code word:${after}:1]`)];
	});
	return { code: lines.join('\n') };
}

/** What a highlighted sample is filed under, in the build's highlighting and the playground's lookup of it */
export const highlightKey = (sample: Sample, marking: Marking, hasLineNumbers: boolean) => `${sample} ${marking} ${hasLineNumbers}`;
