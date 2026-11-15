import { useState } from 'react';
import { Code, type CodeTheme } from '../../src/index.js';
import { type CodeLanguage, useHighlight } from '../../src/shiki.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, pick } from '../playground.js';

// Code that shows each colour, with a line long enough to scroll
const samples = {
	tsx: {
		title: 'Toolbar.tsx',
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
		title: 'app.css',
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
	bash: { title: 'Terminal', code: 'pnpm add github:parchmentdesignstudio/loupe#ui\npnpm release icons # pushes packages/icons to its branch, and tags it\n' },
	json: { title: 'package.json', code: '{\n\t"dependencies": {\n\t\t"@parchment/icons": "github:parchmentdesignstudio/loupe#icons@0.8.0",\n\t\t"shiki": "^4.5.0"\n\t},\n\t"private": true\n}\n' },
} satisfies Partial<Record<CodeLanguage, { title: string; code: string }>>;

type Sample = keyof typeof samples;
const languages = Object.keys(samples) as Sample[];
const themes = ['loupe', 'iamsteve', 'mcknny'] as const satisfies readonly CodeTheme[];
// Languages as they're written, and the sites as they write their own names
const names = { tsx: 'TSX', css: 'CSS', json: 'JSON', iamsteve: 'iamsteve', mcknny: 'mcknny' };

export function CodePlayground() {
	const [language, setLanguage] = useState<Sample>('tsx');
	const [theme, setTheme] = useState<CodeTheme>('loupe');
	const [title, setTitle] = useState(samples.tsx.title);
	const [hasLineNumbers, setLineNumbers] = useState(false);
	const [isCopyable, setCopyable] = useState(true);
	const { code } = samples[language];
	const html = useHighlight(code, { language, lineNumbers: hasLineNumbers });
	const choose = (next: Sample) => {
		setLanguage(next);
		setTitle(samples[next].title);
	};
	return (
		<Playground
			box="items-stretch px-4"
			onRandom={() => {
				choose(pick(languages));
				setTheme(pick(themes));
				setLineNumbers(Math.random() > 0.5);
			}}
			controls={
				<ControlGroup label="Content">
					<Choice label="Language" options={languages} labels={names} value={language} onChange={choose} />
					<TextControl label="Title" value={title} onChange={setTitle} />
					<SwitchControl label="Line numbers" value={hasLineNumbers} onChange={setLineNumbers} />
					<SwitchControl label="Copy" value={isCopyable} onChange={setCopyable} />
				</ControlGroup>
			}
			preview={<Choice label="Theme" options={themes} labels={names} value={theme} onChange={setTheme} />}
		>
			<Code code={code} html={html} title={title || undefined} theme={theme} isCopyable={isCopyable} className="w-full max-w-160" />
		</Playground>
	);
}
