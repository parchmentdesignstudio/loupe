#!/usr/bin/env node
// Fails on code that uses Loupe wrongly, as the Loupe skill (skills/loupe) describes it: raw colours, sizes, corners,
// spacing and shadows in place of tokens, palette steps in place of roles, hand-built controls in place of
// components, and a Button with no variant. It's for code that builds with Loupe, not Loupe's own components, which
// need raw values to make the tokens what they are
//
//   node packages/ui/lint/misuse.mjs [files or folders…]
//
// With none, it checks the preview's screens and blocks, which are built as a site would build. A line can be let off
// with a comment on the line above saying why: // loupe-lint-ignore: the brand's exact yellow, as an illustration
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { parseAst } from 'vite';

const ui = join(import.meta.dirname, '..');
const theme = readFileSync(join(ui, 'styles/theme.css'), 'utf8');

// Loupe's palette, by name, and Tailwind's own, which a site still has unless it clears it
const loupePalette = new Set([...theme.matchAll(/--color-([a-z]+)-\d+:/g)].map(([, name]) => name));
const tailwindPalette = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const palette = [...new Set([...loupePalette, ...tailwindPalette])].join('|');

// The utilities that take a colour
const colour = String.raw`(?:bg|text|border(?:-[xytblrse])?|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow|inset-shadow)`;
const sides = String.raw`(?:-[xytblrse]|-[tb][lr]|-[se][se])?`;
const space = String.raw`(?:p|m|-m)[xytblrse]?|gap(?:-[xy])?|space-[xy]|-?(?:inset(?:-[xy])?|top|left|right|bottom|start|end)`;

const classRules = [
	{ rule: 'raw-colour', pattern: new RegExp(String.raw`(?<![\w-])${colour}-\[(?:color:)?(?:#|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|color-mix\()`, 'g'), message: 'A raw colour. Use a role, such as bg-raised or text-muted' },
	{ rule: 'palette', pattern: new RegExp(String.raw`(?<![\w-])${colour}-(?:${palette})-\d{1,3}\b`, 'g'), message: "A palette step, which doesn't turn for the dark. Use a role, such as text-ink or bg-panel" },
	{ rule: 'palette', pattern: new RegExp(String.raw`(?<![\w-])(?:bg|text|border|fill|stroke)-(?:white|black)\b`, 'g'), message: 'White or black is the same in both themes. Use a role, such as bg-raised, text-ink or text-paper' },
	{ rule: 'raw-shadow', pattern: /(?<![\w-])(?:inset-)?shadow-(?:\[|(?:2xs|xs|sm|md|lg|xl|2xl)\b)/g, message: 'A shadow of its own. Use a level: shadow-raised, shadow-panel, shadow-floating or shadow-overlay' },
	{ rule: 'raw-radius', pattern: new RegExp(String.raw`(?<![\w-])rounded${sides}-(?:\[|(?:xs|2xl|4xl)\b)`, 'g'), message: 'A corner Loupe has none of. Use rounded-sm, md, lg, xl, 3xl or full' },
	{ rule: 'raw-text', pattern: /(?<![\w-])text-(?:\[(?:length:)?[\d.]|(?:xs|sm|base|lg|[2-9]?xl)\b)/g, message: 'A size outside Loupe. Use text-title, text-body, text-control or text-label' },
	{ rule: 'raw-weight', pattern: /(?<![\w-])font-(?:thin|extralight|light|semibold|bold|extrabold|black)\b/g, message: 'Loupe is regular and medium, with bold only in text-title. Use font-medium' },
	{ rule: 'raw-space', pattern: new RegExp(String.raw`(?<![\w-])(?:${space})-\[-?[\d.]`, 'g'), message: "A space off Loupe's 4px steps. Use one, such as gap-2 or p-4" },
];

// Elements Loupe has a component for, which a hand-built one loses the keyboard, focus and dark mode of
const components = { button: 'Button', input: 'TextField, Checkbox, Switch or another field', select: 'Select', textarea: 'TextField with isMultiline', dialog: 'Modal', progress: 'ProgressBar', meter: 'Meter' };

const lines = (text) => {
	const starts = [0];
	for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
	return (offset) => {
		let line = 0;
		while (line + 1 < starts.length && starts[line + 1] <= offset) line++;
		return { line: line + 1, column: offset - starts[line] + 1 };
	};
};

function check(file, text) {
	const problems = [];
	const at = lines(text);
	const ignored = new Set(text.split('\n').flatMap((line, index) => (/loupe-lint-ignore\b/.test(line) ? [index + 1, index + 2] : [])));
	const report = (offset, rule, message) => {
		const place = at(offset);
		if (!ignored.has(place.line)) problems.push({ ...place, rule, message });
	};
	const classes = (value, offset) => {
		for (const { rule, pattern, message } of classRules) for (const match of value.matchAll(pattern)) report(offset + match.index, rule, `${message}: ${/^\S+/.exec(value.slice(match.index))[0]}`);
	};

	if (/\.[jt]sx?$/.test(file)) {
		const ast = parseAst(text, { lang: extname(file).slice(1) });
		const walk = (node) => {
			if (!node || typeof node !== 'object') return;
			if (Array.isArray(node)) return node.forEach(walk);
			if (node.type === 'Literal' && typeof node.value === 'string') classes(node.value, node.start + 1);
			if (node.type === 'TemplateElement') classes(node.value.cooked ?? node.value.raw, node.start);
			if (node.type === 'JSXOpeningElement' && node.name.type === 'JSXIdentifier') {
				const { name } = node.name;
				const attribute = (key) => node.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === key);
				const spreads = node.attributes.some((a) => a.type === 'JSXSpreadAttribute');
				if (components[name] && !(name === 'input' && /^(hidden|file)$/.test(attribute('type')?.value?.value ?? ''))) report(node.start, 'raw-element', `A hand-built <${name}>. Use ${components[name]} from @parchment/ui`);
				if (name === 'Button' && !attribute('variant') && !spreads) report(node.start, 'button-variant', 'A Button with no variant is primary. Say which: primary once per view, otherwise secondary, outline or ghost');
			}
			for (const key in node) if (key !== 'parent') walk(node[key]);
		};
		walk(ast);
	} else {
		// Astro, HTML and the like: the classes in class, className and class:list
		for (const match of text.matchAll(/\bclass(?:Name|:list)?=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)) {
			const value = match[1] ?? match[2] ?? match[3];
			classes(value, match.index + match[0].indexOf(value));
		}
		for (const match of text.matchAll(/<(button|select|textarea|dialog|progress|meter)\b/g)) report(match.index, 'raw-element', `A hand-built <${match[1]}>. Use ${components[match[1]]} from @parchment/ui`);
	}
	return problems;
}

const extensions = /\.(?:[jt]sx?|astro|html|vue|svelte)$/;
function files(path) {
	if (statSync(path).isFile()) return extensions.test(path) ? [path] : [];
	return readdirSync(path).flatMap((name) => (/^(?:node_modules|dist|lib|\..*)$/.test(name) ? [] : files(join(path, name))));
}

const paths = process.argv.slice(2);
const targets = (paths.length ? paths : [join(ui, 'preview/screens'), join(ui, 'preview/blocks')]).flatMap(files);
let count = 0;
for (const file of targets) {
	for (const { line, column, rule, message } of check(file, readFileSync(file, 'utf8'))) {
		count++;
		console.log(`${relative(process.cwd(), file)}:${line}:${column} ${rule} ${message}`);
	}
}
if (count) {
	console.log(`\n${count} ${count === 1 ? 'use' : 'uses'} of Loupe to fix. The Loupe skill, in packages/ui/skills/loupe, says what to use instead`);
	process.exit(1);
}
console.log(`Loupe is used as it should be in ${targets.length} files`);
