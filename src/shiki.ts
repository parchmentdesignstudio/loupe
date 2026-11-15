import { useEffect, useState } from 'react';
import type { HighlighterCore, ShikiTransformer, ThemeRegistration } from 'shiki/core';

// Loupe's Shiki theme, transformers and a highlighter, as @parchment/ui/shiki, apart from the components so a site that
// doesn't highlight never loads Shiki. Code shows what this makes

const role = (name: string) => `var(--color-code-${name})`;

/**
 * One theme for light and dark, as each colour is a role token (tokens.css) that's already light-dark(). A site sets
 * the tokens, or data-code-theme, to restyle its code, and passes this to its own Shiki, such as @shikijs/rehype
 */
export const codeTheme: ThemeRegistration = {
	name: 'loupe',
	type: 'light',
	colors: {
		'editor.background': role('ground'),
		'editor.foreground': role('text'),
	},
	tokenColors: [
		{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: role('comment') } },
		{ scope: ['punctuation', 'keyword.operator', 'variable', 'variable.other', 'entity.name.namespace', 'entity.name.scope-resolution'], settings: { foreground: role('text') } },
		{ scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string', 'meta.attribute string'], settings: { foreground: role('string') } },
		{
			scope: [
				'constant.numeric',
				'constant.language',
				'constant.other',
				'support.constant',
				'support.type.builtin',
				'keyword.other.unit',
				'constant.other.color.rgb-value.hex.css',
				'punctuation.definition.constant.css',
				'keyword.other.important',
			],
			settings: { foreground: role('constant') },
		},
		{ scope: ['keyword', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'storage.type', 'storage.modifier'], settings: { foreground: role('keyword') } },
		{
			scope: [
				'entity.name.function',
				'support.function',
				'meta.function-call entity.name.function',
				'entity.other.attribute-name',
				'support.type.property-name',
				'meta.property-name.css',
				'variable.css',
				'variable.scss',
				'variable.argument.css',
			],
			settings: { foreground: role('function') },
		},
		{
			scope: ['entity.name.type', 'entity.other.inherited-class', 'support.class', 'string.regexp', 'markup.underline.link', 'keyword.control.at-rule', 'punctuation.definition.keyword.css', 'entity.name.tag.reference.scss'],
			settings: { foreground: role('type') },
		},
		{
			scope: ['support.function.css', 'support.function.misc.css', 'support.function.gradient.css', 'support.function.url.css', 'support.function.transform.css', 'support.function.calc.css'],
			settings: { foreground: role('builtin') },
		},
		{ scope: ['entity.name.tag', 'support.class.component', 'punctuation.definition.tag'], settings: { foreground: role('tag') } },
		// A selector's tags, classes and pseudo-classes, and a property's keyword values, read as plain CSS
		{
			scope: [
				'entity.other.attribute-name.class.css',
				'entity.other.attribute-name.id.css',
				'entity.other.attribute-name.pseudo-class.css',
				'entity.other.attribute-name.pseudo-element.css',
				'entity.name.tag.css',
				'punctuation.definition.entity.css',
				'support.constant.property-value.css',
			],
			settings: { foreground: role('text') },
		},
		{ scope: ['markup.bold', 'keyword.other.important'], settings: { fontStyle: 'bold' } },
		{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
	],
};

/**
 * Bare custom properties, with no rule around them, highlighted as the values they are. Shiki's CSS grammar only reads
 * declarations inside a rule, so this wraps them in one and drops it again
 */
export function transformerCssProperties(): ShikiTransformer {
	let isWrapped = false;
	return {
		name: 'loupe:css-properties',
		preprocess(code) {
			isWrapped = false;
			if (this.options.lang !== 'css') return code;
			const lines = code.split('\n').filter((line) => line.trim() !== '');
			const isBare = lines.length > 0 && lines.every((line) => /^(--|\/\*|\*|\/\/|\)[,;]?$)/.test(line.trim()) || /^\s/.test(line));
			if (!isBare) return code;
			isWrapped = true;
			return `:root {\n${code}\n}`;
		},
		tokens(tokens) {
			return isWrapped ? tokens.slice(1, -1) : tokens;
		},
	};
}

/**
 * Tailwind's @theme read as an at-rule with declarations in it. Shiki's CSS grammar doesn't know @theme, so it reads
 * @font-face in its place, which takes declarations, and shows @theme again
 */
export function transformerCssTheme(): ShikiTransformer {
	let lines = new Set<number>();
	return {
		name: 'loupe:css-theme',
		preprocess(code) {
			lines = new Set();
			if (this.options.lang !== 'css') return code;
			return code
				.split('\n')
				.map((line, i) => {
					if (!/^\s*@theme\b/.test(line)) return line;
					lines.add(i);
					return line.replace(/@theme\b/, '@font-face');
				})
				.join('\n');
		},
		tokens(tokens) {
			for (const i of lines) {
				const token = tokens[i]?.find((each) => each.content.includes('@font-face'));
				if (token) token.content = token.content.replace('@font-face', '@theme');
			}
			return tokens;
		},
	};
}

/**
 * Line numbers in a column of their own, beside the lines, so the lines scroll sideways and the numbers stay. On with
 * showLineNumbers in a code fence's meta, or showLineNumbers=12 to start at 12, as in ```css showLineNumbers
 */
export function transformerLineNumbers(): ShikiTransformer {
	return {
		name: 'loupe:line-numbers',
		code(node) {
			const meta = /showLineNumbers(?:=(\d+))?/.exec(this.options.meta?.__raw ?? '');
			if (!meta) return;
			const lines = node.children.filter((child) => child.type === 'element');
			// Shiki ends on an empty line for the code's last newline
			const last = lines.at(-1);
			if (last && last.children.every((child) => child.type === 'text' && child.value === '')) lines.pop();
			const start = Number(meta[1] ?? 1);
			const numbers = lines.map((line, i) => {
				line.properties['data-line'] = String(start + i);
				return { type: 'element' as const, tagName: 'span', properties: { 'data-line-number': '' }, children: [{ type: 'text' as const, value: String(start + i) }] };
			});
			node.properties['data-line-numbers'] = '';
			node.children = [
				{ type: 'element', tagName: 'span', properties: { 'data-line-numbers-col': '', 'aria-hidden': 'true' }, children: numbers },
				{ type: 'element', tagName: 'span', properties: { 'data-line-numbers-content': '' }, children: lines },
			];
		},
	};
}

/** Loupe's transformers, in the order they run. Add Shiki's own, such as @shikijs/transformers, alongside */
export const codeTransformers = () => [transformerCssProperties(), transformerCssTheme(), transformerLineNumbers()];

// Each language's grammar, loaded the first time it's asked for
const grammars = {
	tsx: () => import('shiki/langs/tsx.mjs'),
	ts: () => import('shiki/langs/typescript.mjs'),
	jsx: () => import('shiki/langs/jsx.mjs'),
	js: () => import('shiki/langs/javascript.mjs'),
	css: () => import('shiki/langs/css.mjs'),
	html: () => import('shiki/langs/html.mjs'),
	json: () => import('shiki/langs/json.mjs'),
	bash: () => import('shiki/langs/shellscript.mjs'),
};
const names: Record<CodeLanguage, string> = { tsx: 'tsx', ts: 'typescript', jsx: 'jsx', js: 'javascript', css: 'css', html: 'html', json: 'json', bash: 'shellscript', text: 'text' };

export type CodeLanguage = keyof typeof grammars | 'text';

let highlighter: Promise<HighlighterCore> | undefined;
const loaded = new Map<CodeLanguage, Promise<void>>();

// Shiki's JavaScript engine, rather than its WebAssembly one, so there's no .wasm to serve
async function highlighterFor(language: CodeLanguage) {
	highlighter ??= Promise.all([import('shiki/core'), import('shiki/engine/javascript')]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
		createHighlighterCore({ themes: [codeTheme], langs: [], engine: createJavaScriptRegexEngine() }),
	);
	const shiki = await highlighter;
	if (language !== 'text' && !loaded.has(language)) loaded.set(language, grammars[language]().then((grammar) => shiki.loadLanguage(grammar.default)));
	await loaded.get(language);
	return shiki;
}

export interface HighlightOptions {
	language?: CodeLanguage;
	/** Numbers each line, from 1, or from the number given */
	lineNumbers?: boolean | number;
}

/** Code as Shiki's highlighted HTML, in Loupe's theme, for Code's html */
export async function highlight(code: string, { language = 'tsx', lineNumbers }: HighlightOptions = {}) {
	const shiki = await highlighterFor(language);
	const meta = lineNumbers ? `showLineNumbers${typeof lineNumbers === 'number' ? `=${lineNumbers}` : ''}` : '';
	return shiki.codeToHtml(code.replace(/\n$/, ''), { lang: names[language], theme: 'loupe', meta: { __raw: meta }, transformers: codeTransformers() });
}

/** Code highlighted in the browser, for Code's html: undefined until Shiki and the language have loaded */
export function useHighlight(code: string, { language = 'tsx', lineNumbers }: HighlightOptions = {}) {
	const [result, setResult] = useState<{ key: string; html: string }>();
	const key = `${language} ${lineNumbers} ${code}`;
	useEffect(() => {
		let isCurrent = true;
		void highlight(code, { language, lineNumbers }).then((html) => isCurrent && setResult({ key, html }));
		return () => {
			isCurrent = false;
		};
	}, [code, language, lineNumbers, key]);
	return result?.key === key ? result.html : undefined;
}
