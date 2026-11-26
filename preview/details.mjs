// What the preview shows beside each component: where it’s written, its props, what it’s built on, the states and
// tokens it styles, and where it’s used. It’s read from the source as virtual:details, and again as a file changes
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { parseAst } from 'vite';

const id = 'virtual:details';
const loaded = `\0${id}`;

export function details() {
	let ui = '';
	let root = '';
	let packages = [];
	let data;
	const concerns = (file) => file.startsWith(join(ui, 'styles') + sep) || (/\.tsx?$/.test(file) && packages.some((dir) => file.startsWith(join(dir, 'src') + sep)));
	return {
		name: 'details',
		configResolved(config) {
			ui = nearest(config.root, 'package.json') ?? config.root;
			root = nearest(config.root, 'pnpm-workspace.yaml') ?? ui;
			packages = packagesOf(root, ui);
		},
		resolveId: (source) => (source === id ? loaded : undefined),
		load(module) {
			if (module !== loaded) return;
			data ??= read(root, ui, packages);
			// It takes its own updates, filling the same object, so an edit to a style or a component doesn't reach the
			// modules that read it, which can't be refreshed and would reload the page
			return `const details = ${JSON.stringify(data)};
export default details;
if (import.meta.hot) import.meta.hot.accept((next) => {
	if (!next) return;
	for (const key of Object.keys(details)) delete details[key];
	Object.assign(details, next.default);
	window.dispatchEvent(new Event('loupe:details'));
});`;
		},
		// The other packages aren’t in the preview’s module graph, so their files are watched here
		configureServer(server) {
			server.watcher.add(packages.filter((dir) => dir !== ui).map((dir) => join(dir, 'src')));
		},
		hotUpdate({ file, modules }) {
			if (this.environment.name !== 'client' || !concerns(file)) return;
			data = undefined;
			const module = this.environment.moduleGraph.getModuleById(loaded);
			if (module) return [...modules, module];
		},
	};
}

function nearest(from, name) {
	for (let dir = from; ; dir = dirname(dir)) {
		if (existsSync(join(dir, name))) return dir;
		if (dirname(dir) === dir) return;
	}
}

// The workspace’s packages with a src folder, from pnpm-workspace.yaml’s list, such as tools/*
function packagesOf(root, ui) {
	const file = join(root, 'pnpm-workspace.yaml');
	if (!existsSync(file)) return [ui];
	const globs = [];
	let listed = false;
	for (const line of readFileSync(file, 'utf8').split('\n')) {
		if (/^\S/.test(line)) listed = line.startsWith('packages:');
		const glob = listed && /^\s*-\s*['"]?([^'"#\s]+)/.exec(line)?.[1];
		if (glob) globs.push(glob);
	}
	return globs
		.flatMap((glob) => {
			if (!glob.endsWith('/*')) return [join(root, glob)];
			const dir = join(root, glob.slice(0, -2));
			return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => join(dir, entry.name)) : [];
		})
		.filter((dir) => existsSync(join(dir, 'src')));
}

const filesIn = (dir) =>
	readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
		.map((entry) => join(entry.parentPath, entry.name))
		.filter((path) => !path.includes(`${sep}node_modules${sep}`));

const nameOf = (node) => (node.type === 'Identifier' ? node.name : String(node.value));

// A file’s imports, re-exports and top-level declarations by name, and the start of each line, for places
function parse(path, root, code = readFileSync(path, 'utf8')) {
	let ast;
	try {
		ast = parseAst(code, { lang: path.endsWith('.tsx') ? 'tsx' : 'ts' });
	} catch {
		// A file mid-edit that doesn’t parse is left out until it does
		return;
	}
	const imports = new Map();
	const reexports = new Map();
	const declarations = new Map();
	for (const statement of ast.body) {
		if (statement.type === 'ImportDeclaration') {
			for (const specifier of statement.specifiers) {
				const name = specifier.imported ? nameOf(specifier.imported) : specifier.type === 'ImportDefaultSpecifier' ? 'default' : '*';
				imports.set(specifier.local.name, { from: statement.source.value, name, type: statement.importKind === 'type' || specifier.importKind === 'type', node: specifier });
			}
		} else if (statement.type === 'ExportNamedDeclaration' && statement.source) {
			for (const specifier of statement.specifiers) {
				const type = statement.exportKind === 'type' || specifier.exportKind === 'type';
				reexports.set(nameOf(specifier.exported), { from: statement.source.value, name: nameOf(specifier.local), type, node: specifier });
			}
		}
		const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
		if (declaration?.type === 'VariableDeclaration') {
			for (const declarator of declaration.declarations) {
				if (declarator.id.type === 'Identifier') declarations.set(declarator.id.name, { node: declarator, statement });
				// A name taken out of an object keeps the key it came from, as Calendar takes root out of calendar()
				else if (declarator.id.type === 'ObjectPattern') {
					for (const property of declarator.id.properties) if (property.type === 'Property' && !property.computed && property.value.type === 'Identifier') declarations.set(property.value.name, { node: declarator, statement, key: nameOf(property.key) });
				}
			}
		} else if (declaration?.id?.type === 'Identifier' && declaration.type.endsWith('Declaration')) {
			declarations.set(declaration.id.name, { node: declaration, statement });
		}
	}
	const lines = [0];
	for (let at = code.indexOf('\n'); at !== -1; at = code.indexOf('\n', at + 1)) lines.push(at + 1);
	return { path, file: relative(root, path).split(sep).join('/'), code, ast, imports, reexports, declarations, lines };
}

function placeOf(source, offset) {
	let low = 0;
	let high = source.lines.length - 1;
	while (low < high) {
		const middle = (low + high + 1) >> 1;
		if (source.lines[middle] <= offset) low = middle;
		else high = middle - 1;
	}
	return { file: source.file, line: low + 1, column: offset - source.lines[low] + 1 };
}

const textOf = (source, node) => source.code.slice(node.start, node.end);

// The /** comment right before a node
function docOf(source, start) {
	const before = source.code.slice(0, start).trimEnd();
	if (!before.endsWith('*/')) return;
	const open = before.lastIndexOf('/**');
	if (open === -1 || before.indexOf('*/', open) !== before.length - 2) return;
	return (
		before
			.slice(open + 3, -2)
			.replace(/^\s*\* ?/gm, '')
			.replace(/\s+/g, ' ')
			.trim() || undefined
	);
}

// Calls back for every node under one, with its parent and the key it’s under. Types say nothing about styles or
// uses, so they’re skipped
const types = new Set(['typeAnnotation', 'typeArguments', 'typeParameters', 'returnType', 'superTypeArguments']);
function walk(node, visit, parent, key) {
	if (Array.isArray(node)) {
		for (const child of node) walk(child, visit, parent, key);
		return;
	}
	if (!node || typeof node.type !== 'string') return;
	visit(node, parent, key);
	for (const [name, value] of Object.entries(node)) if (value && typeof value === 'object' && !types.has(name)) walk(value, visit, node, name);
}

// An identifier that names a property rather than using a variable, as variant does in { variant: 'primary' }
const isKey = (parent, key) =>
	(key === 'key' && ['Property', 'PropertyDefinition', 'MethodDefinition'].includes(parent.type) && !parent.computed) ||
	(key === 'property' && parent.type === 'MemberExpression' && !parent.computed) ||
	['ImportSpecifier', 'ExportSpecifier', 'LabeledStatement', 'BreakStatement', 'ContinueStatement'].includes(parent.type);

const isStyles = (node) => node?.type === 'VariableDeclarator' && node.init?.type === 'CallExpression' && node.init.callee.type === 'Identifier' && node.init.callee.name === 'tv';

const propertyOf = (object, key) => (object?.type === 'ObjectExpression' ? object.properties.find((property) => property.type === 'Property' && nameOf(property.key) === key)?.value : undefined);

// A tv() call’s variants, with their options and default
function variantsOf(source, node) {
	const config = node.init.arguments[0];
	const defaults = propertyOf(config, 'defaultVariants');
	return (propertyOf(config, 'variants')?.properties ?? [])
		.filter((property) => property.type === 'Property')
		.map((property) => {
			const name = nameOf(property.key);
			const fallback = propertyOf(defaults, name);
			const options = property.value.type === 'ObjectExpression' ? property.value.properties.map((option) => nameOf(option.key)) : [];
			return { name, options, default: fallback && textOf(source, fallback) };
		});
}

// A tv() call’s class lists in order, each with the slot it styles and the variants it hangs on. As tailwind-variants
// has it, a list that names no slot styles base. What’s neither, such as an extended tv(), has no slot
function classListsOf(config) {
	if (config?.type !== 'ObjectExpression') return [{ node: config }];
	const slotted = propertyOf(config, 'slots')?.type === 'ObjectExpression';
	const lists = [];
	const add = (node, when = []) => {
		if (!slotted || node.type !== 'ObjectExpression') return void lists.push({ node, slot: 'base', when });
		for (const property of node.properties) lists.push(property.type === 'Property' ? { node: property.value, slot: nameOf(property.key), when } : { node: property });
	};
	for (const property of config.properties) {
		const key = property.type === 'Property' && !property.computed && nameOf(property.key);
		const value = property.value;
		if (key === 'base' || (key === 'slots' && slotted)) add(value);
		else if (key === 'variants' && value.type === 'ObjectExpression') {
			for (const variant of value.properties) {
				if (variant.type !== 'Property' || variant.value.type !== 'ObjectExpression') {
					lists.push({ node: variant });
					continue;
				}
				for (const option of variant.value.properties) {
					if (option.type === 'Property') add(option.value, [nameOf(variant.key)]);
					else lists.push({ node: option });
				}
			}
		} else if (key === 'compoundVariants' && value.type === 'ArrayExpression') {
			for (const compound of value.elements) {
				if (compound?.type !== 'ObjectExpression') {
					lists.push({ node: compound });
					continue;
				}
				const classes = compound.properties.filter((one) => one.type === 'Property' && ['class', 'className'].includes(nameOf(one.key)));
				const when = compound.properties.filter((one) => one.type === 'Property' && !classes.includes(one)).map((one) => nameOf(one.key));
				for (const one of classes) add(one.value, when);
			}
		} else if (key === 'extend') lists.push({ node: value, extend: true });
		// The default variants name options rather than classes
		else if (key !== 'defaultVariants') lists.push({ node: property });
	}
	return lists;
}

// isFocusVisible → focus-visible
const stateOf = (variant) => variant.slice(2).replace(/[A-Z]/g, (letter, at) => (at ? '-' : '') + letter.toLowerCase());

// The theme, by kind, each name with its value
const kinds = { color: 'colours', text: 'text', font: 'fonts', shadow: 'shadows', radius: 'corners', animate: 'animations' };
function themeOf(path, brand) {
	const theme = Object.fromEntries(Object.values(kinds).map((kind) => [kind, new Map()]));
	if (!existsSync(path)) return theme;
	// The brand's palette isn't a utility, but a component reads it as a token, as Alert does var(--color-sand-46)
	if (brand && existsSync(brand))
		for (const [, name, value] of readFileSync(brand, 'utf8').matchAll(/--color-([\w-]+)\s*:\s*(oklch\([^;]+\));/g)) theme.colours.set(name, value.trim());
	const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
	// A block can hold @keyframes, so its end is found by counting braces
	for (const match of css.matchAll(/@theme\b[^{]*\{/g)) {
		const start = match.index + match[0].length;
		let end = start;
		for (let depth = 1; depth && end < css.length; end++) {
			if (css[end] === '{') depth++;
			else if (css[end] === '}') depth--;
		}
		for (const [, namespace, name, value] of css.slice(start, end).matchAll(/--(color|text|font|shadow|radius|animate)-([\w-]+)\s*:\s*([^;]+);/g)) {
			// --text-body--line-height belongs to text-body
			if (!name.includes('--')) theme[kinds[namespace]].set(name, value.trim());
		}
	}
	return theme;
}

// What the styles set each custom property to, and where, as --color-ink is light-dark(var(--color-pine-26), var(--color-cream-95))
function declarationsOf(paths, root, declarations = new Map()) {
	if (Array.isArray(paths)) {
		for (const path of paths) declarationsOf(path, root, declarations);
		return declarations;
	}
	const path = paths;
	if (!existsSync(path)) return declarations;
	// Comments are blanked rather than cut, so an offset still finds its line
	const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
	const source = { file: relative(root, path).split(sep).join('/'), lines: [0] };
	for (let at = css.indexOf('\n'); at !== -1; at = css.indexOf('\n', at + 1)) source.lines.push(at + 1);
	// Where each @theme block runs, as only a token there is a Tailwind utility: one in :root is just a variable
	const themes = [];
	for (const theme of css.matchAll(/@theme\b[^{]*\{/g)) {
		let depth = 0;
		let at = theme.index + theme[0].length - 1;
		for (; at < css.length; at++) if (css[at] === '{') depth++;
		else if (css[at] === '}' && !--depth) break;
		themes.push([theme.index, at]);
	}
	for (const match of css.matchAll(/(?<=[{;\s])--([\w-]+)\s*:\s*([^;{}]+);/g)) {
		const theme = themes.some(([start, end]) => match.index > start && match.index < end);
		const value = match[2].replace(/\s+/g, ' ').trim();
		// A role theme.css only names for Tailwind, as --color-ink: var(--color-ink), is set by the brand, read first
		if (value === `var(--${match[1]})`) {
			if (theme && declarations.has(match[1])) declarations.get(match[1]).theme = true;
			continue;
		}
		if (!declarations.has(match[1])) declarations.set(match[1], { value, place: placeOf(source, match.index), theme });
	}
	return declarations;
}

// The tokens a value leads through, as var(--color-primary) is --color-primary, then --color-marigold-83, and the
// Tailwind name of the first, as --radius-lg is rounded-lg and --color-primary is primary
const utilities = [
	[/^radius-(.+)$/, 'rounded-$1'],
	[/^color-(.+)$/, '$1'],
	[/^shadow-(.+)$/, 'shadow-$1'],
	[/^text-(.+)$/, 'text-$1'],
	[/^font-(.+)$/, 'font-$1'],
];
function chainOf(value, declarations) {
	const themeUtility = (token) => {
		if (!declarations.get(token)?.theme) return;
		const [pattern, name] = utilities.find(([test]) => test.test(token)) ?? [];
		return pattern ? token.replace(pattern, name) : undefined;
	};
	// Tailwind's spacing function, as --spacing(2) is two of its 4px steps: the function, then the step it multiplies
	const spacing = /^--spacing\(([\d.]+)\)$/.exec(value)?.[1];
	if (spacing) {
		return {
			utility: `spacing ${spacing}`,
			steps: [
				{ kind: 'function', name: value, value: `calc(var(--spacing) * ${spacing})` },
				{ kind: 'theme', name: '--spacing', value: declarations.get('spacing')?.value ?? '', utility: 'spacing' },
			],
		};
	}
	const chain = [];
	for (let next = value, match; (match = /^var\(--([\w-]+)\)$/.exec(next)) && !chain.includes(match[1]); ) {
		chain.push(match[1]);
		next = declarations.get(match[1])?.value ?? '';
	}
	if (!chain.length) return {};
	// Each token with what it's set to, so a light-dark() at the end can show both sides. The last is the palette or
	// the theme's own value, and any between are roles, as --color-primary is
	const steps = chain.map((token, index) => {
		const set = declarations.get(token)?.value ?? '';
		const [light, dark] = sidesOf(set);
		const kind = index < chain.length - 1 ? 'role' : token.startsWith('color-') ? 'palette' : 'theme';
		return { kind, name: `--${token}`, value: set, utility: themeUtility(token), ...(dark ? { light, dark } : {}) };
	});
	return { chain: chain.map((token) => `--${token}`), utility: themeUtility(chain[0]), steps };
}

// Each component's own tokens, from styles/components.css: a heading on its own line, as
// Shape, groups the tokens under it, and the comment right above a token says what it changes. Keyed by component,
// as --button-radius is Button's, and --toggle-button-group-radius ToggleButtonGroup's rather than ToggleButton's
const kebab = (name) => name.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase();
// Tokens that no export's name starts, such as the fields' --field-radius, come back under shared
const shared = '';
function componentTokensOf(path, theme, root, names) {
	const owners = names.filter((name) => /^[A-Z]/.test(name)).map((name) => [kebab(name), name]).toSorted(([a], [b]) => b.length - a.length);
	const tokens = {};
	const declarations = declarationsOf([theme, path], root);
	if (!existsSync(path)) return tokens;
	const css = readFileSync(path, 'utf8');
	const block = css.indexOf('/*');
	const source = { file: relative(root, path).split(sep).join('/'), lines: [0] };
	for (let at = css.indexOf('\n'); at !== -1; at = css.indexOf('\n', at + 1)) source.lines.push(at + 1);
	let group = '';
	let doc = '';
	// Skip the file's own comment, then read comments and declarations in turn
	const body = css.indexOf('*/', block) + 2;
	for (const match of css.slice(body).matchAll(/\/\*([\s\S]*?)\*\/(\s*)|--([\w-]+)\s*:\s*([^;]+);/g)) {
		if (match[1] !== undefined) {
			const text = match[1].replace(/\s+/g, ' ').trim();
			// Followed by a blank line, a comment heads what's below it rather than saying what one token does
			if (/\n\s*\n/.test(match[2])) {
				group = text;
				doc = '';
			} else doc = text;
			continue;
		}
		const name = match[3];
		const component = owners.find(([prefix]) => name.startsWith(`${prefix}-`))?.[1] ?? shared;
		const value = match[4].replace(/\s+/g, ' ').trim();
		(tokens[component] ??= []).push({ name: `--${name}`, value, ...chainOf(value, declarations), group, doc: doc || undefined, place: placeOf(source, body + match.index) });
		doc = '';
	}
	return tokens;
}

// light-dark()’s two sides, split at the comma between them rather than one inside either
function sidesOf(value) {
	const inner = /^light-dark\((.*)\)$/s.exec(value)?.[1];
	if (inner === undefined) return [value];
	let depth = 0;
	for (let at = 0; at < inner.length; at++) {
		if (inner[at] === '(') depth++;
		else if (inner[at] === ')') depth--;
		else if (inner[at] === ',' && !depth) return [inner.slice(0, at).trim(), inner.slice(at + 1).trim()];
	}
	return [value];
}

// Each colour token, with the role it stands for: where the theme sets it, and to what in the light and the dark
function coloursOf(theme, path, root) {
	const declarations = declarationsOf(path, root);
	return Object.fromEntries(
		[...theme.colours]
			// The palette is colours too, but the page lists the roles
			.filter(([, value]) => !value.startsWith('oklch('))
			.map(([name, value]) => {
				// Bleed points at a variable each layer sets, so it's described by that. A role is set where it's named
				const pointed = /^var\(--([\w-]+)\)$/.exec(value)?.[1];
				const role = pointed && !pointed.startsWith('color-') ? declarations.get(pointed) : declarations.get(`color-${name}`);
				const swatch = `var(--color-${name})`;
				if (!role) return [name, { value: swatch }];
				const [light, dark = light] = sidesOf(role.value);
				return [name, { value: swatch, place: role.place, light, ...(dark !== light && { dark }) }];
			}),
	);
}

// Each size and family, for the typography page: what the theme sets it to, and where
function typographyOf(theme, path, root) {
	const declarations = declarationsOf(path, root);
	const sizes = [...theme.text.keys()].map((name) => {
		const size = declarations.get(`text-${name}`);
		return { name, size: size?.value, lineHeight: declarations.get(`text-${name}--line-height`)?.value, place: size?.place };
	});
	const families = [...theme.fonts.keys()].map((name) => ({ name, value: declarations.get(`font-${name}`)?.value, place: declarations.get(`font-${name}`)?.place }));
	return { sizes, families };
}

// A class’s utility without its variants, as bg-accent is in hover:bg-accent/88
function utilityOf(candidate) {
	let depth = 0;
	let start = 0;
	for (let at = 0; at < candidate.length; at++) {
		if ('[('.includes(candidate[at])) depth++;
		else if ('])'.includes(candidate[at])) depth--;
		else if (candidate[at] === ':' && !depth) start = at + 1;
	}
	return candidate
		.slice(start)
		.replace(/^!|!$/g, '')
		.replace(/^-/, '')
		.replace(/\/[\w.[\]%-]+$/, '');
}

// The theme’s tokens that the classes in some strings use, as text-body (a size) and text-ink (a colour)
function tokensOf(strings, theme) {
	const found = Object.fromEntries(Object.keys(theme).map((kind) => [kind, new Set()]));
	const add = (kind, name) => theme[kind].has(name) && found[kind].add(name);
	for (const string of strings) {
		for (const candidate of string.split(/\s+/)) {
			for (const [, namespace, name] of candidate.matchAll(/\(--(color|text|font|shadow|radius|animate)-([\w-]+)/g)) add(kinds[namespace], name);
			const utility = utilityOf(candidate);
			let match;
			if ((match = /^text-(.+)$/.exec(utility))) add(theme.text.has(match[1]) ? 'text' : 'colours', match[1]);
			else if ((match = /^shadow-(.+)$/.exec(utility))) add(theme.shadows.has(match[1]) ? 'shadows' : 'colours', match[1]);
			else if ((match = /^font-(.+)$/.exec(utility))) add('fonts', match[1]);
			else if ((match = /^rounded(?:-(?:[trblse]|tl|tr|br|bl|ss|se|es|ee))?-(.+)$/.exec(utility))) add('corners', match[1]);
			else if ((match = /^animate-(.+)$/.exec(utility))) add('animations', match[1]);
			else if ((match = /^(?:bg|border(?:-[xytrblse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|decoration|caret|accent|divide|placeholder|inset-shadow|inset-ring)-(.+)$/.exec(utility))) add('colours', match[1]);
		}
	}
	return Object.fromEntries(Object.entries(found).flatMap(([kind, names]) => (names.size ? [[kind, [...names]]] : [])));
}

// A prop the component hands to a variant of the same name, as Modal does size, defaults to the variant’s default
function fill(props, defaults) {
	for (const prop of props) {
		const fallback = defaults.get(prop.name);
		const options = prop.options ?? [...(prop.type ?? '').matchAll(/'([^']*)'/g)].map(([, option]) => option);
		if (prop.default === undefined && fallback && options.includes(fallback.replace(/^'|'$/g, ''))) prop.default = fallback;
	}
	return props;
}

function read(root, ui, packages) {
	const sheet = join(ui, 'styles', 'theme.css');
	// The brand sets the colours theme.css names, so it's read first
	const brand = join(ui, 'styles', 'brands', 'parchment.css');
	const sheets = [brand, sheet];
	const theme = themeOf(sheet, brand);
	const packageName = JSON.parse(readFileSync(join(ui, 'package.json'), 'utf8')).name;
	const library = new Map();
	for (const path of filesIn(join(ui, 'src'))) {
		const source = parse(path, root);
		if (source) library.set(path, source);
	}
	const index = library.get(join(ui, 'src', 'index.ts'));
	if (!index) return { project: basename(ui), components: {}, colours: {}, type: { sizes: [], families: [] }, componentTokens: {} };

	const fileOf = (from, specifier) => {
		const base = join(dirname(from.path), specifier).replace(/\.js$/, '');
		return library.get(`${base}.tsx`) ?? library.get(`${base}.ts`);
	};

	// Where a name a file uses comes from: a declaration in the library, React Aria, or another package
	const resolve = (source, name, seen = new Set()) => {
		if (seen.has(source)) return;
		seen.add(source);
		const declaration = source.declarations.get(name);
		if (declaration) return { source, ...declaration };
		const binding = source.imports.get(name) ?? source.reexports.get(name);
		if (!binding) return;
		if (binding.from === 'react-aria-components' || binding.from.startsWith('react-aria-components/')) return { source, aria: binding.name, node: binding.node };
		if (!binding.from.startsWith('.')) return { source, from: binding.from, name: binding.name };
		const target = fileOf(source, binding.from);
		return target && resolve(target, binding.name, seen);
	};

	// What the package exports, by the node that declares each, so a use can be traced back to its name
	const publics = new Map();
	const publicOf = new Map();
	for (const [exported, binding] of index.reexports) {
		const found = !binding.type && resolve(index, exported);
		if (!found?.node) continue;
		publics.set(exported, found);
		publicOf.set(found.node, exported);
	}

	// A props type’s own props, and the React Aria or HTML props it takes besides
	const shapeOf = (source, node, shape, seen) => {
		if (node.type === 'TSTypeLiteral') return membersOf(source, node.members, shape);
		if (node.type === 'TSIntersectionType') return node.types.forEach((type) => shapeOf(source, type, shape, seen));
		if (node.type !== 'TSTypeReference' || node.typeName.type !== 'Identifier') return;
		const type = node.typeName.name;
		const [first, second] = node.typeArguments?.params ?? [];
		if ((type === 'Pick' || type === 'Omit') && first && second) {
			const inner = { props: new Map(), rest: [] };
			shapeOf(source, first, inner, seen);
			const keys = (second.type === 'TSUnionType' ? second.types : [second]).flatMap((key) => (key.type === 'TSLiteralType' ? [String(key.literal.value)] : []));
			if (type === 'Pick') {
				// A few of React Aria’s props, by name
				const from = inner.rest[0];
				for (const key of keys) if (!inner.props.has(key) && from) inner.props.set(key, { name: key, from: from.aria ?? from.react });
				for (const key of inner.props.keys()) if (!keys.includes(key)) inner.props.delete(key);
			} else {
				for (const key of keys) inner.props.delete(key);
				shape.rest.push(...inner.rest);
			}
			for (const [key, prop] of inner.props) if (!shape.props.has(key)) shape.props.set(key, prop);
			return;
		}
		if (type === 'VariantProps' && first?.type === 'TSTypeQuery') {
			const styles = resolve(source, first.exprName.name);
			if (!isStyles(styles?.node)) return;
			for (const variant of variantsOf(styles.source, styles.node)) {
				if (variant.name.startsWith('is') || shape.props.has(variant.name)) continue;
				const boolean = variant.options.every((option) => option === 'true' || option === 'false');
				shape.props.set(variant.name, { name: variant.name, ...(boolean ? { type: 'boolean' } : { options: variant.options }), default: variant.default });
			}
			return;
		}
		if (type === 'ComponentProps' && first?.type === 'TSTypeQuery') {
			const target = resolve(source, first.exprName.name);
			if (target?.aria) shape.rest.push({ aria: target.aria });
			return;
		}
		const found = resolve(source, type);
		if (found?.aria) return void shape.rest.push({ aria: found.aria.replace(/Props$/, '') });
		if (found?.from === 'react') return void shape.rest.push({ react: found.name });
		const declaration = found?.node;
		if (!declaration || seen.has(declaration)) return;
		seen.add(declaration);
		if (declaration.type === 'TSInterfaceDeclaration') {
			membersOf(found.source, declaration.body.body, shape);
			for (const heritage of declaration.extends ?? []) shapeOf(found.source, { type: 'TSTypeReference', typeName: heritage.expression, typeArguments: heritage.typeArguments }, shape, seen);
		} else if (declaration.type === 'TSTypeAliasDeclaration') shapeOf(found.source, declaration.typeAnnotation, shape, seen);
	};

	// A type as written, with a local alias for a few options, such as Size, spelled out
	const typeOf = (source, node) => {
		const found = node.type === 'TSTypeReference' && node.typeName.type === 'Identifier' && !node.typeArguments && resolve(source, node.typeName.name);
		const alias = found?.node?.type === 'TSTypeAliasDeclaration' && found.node.typeAnnotation;
		if (alias?.type === 'TSUnionType' && alias.types.every((type) => type.type === 'TSLiteralType')) return textOf(found.source, alias);
		return textOf(source, node);
	};

	const membersOf = (source, members, shape) => {
		for (const member of members) {
			if (member.type !== 'TSPropertySignature' && member.type !== 'TSMethodSignature') continue;
			const key = nameOf(member.key);
			if (shape.props.has(key)) continue;
			const type = member.type === 'TSPropertySignature' ? member.typeAnnotation && typeOf(source, member.typeAnnotation.typeAnnotation) : textOf(source, member).slice(member.key.end - member.start).replace(/;$/, '');
			// A union of strings or numbers, such as 'dot' | 'badge' or 20 | 24, is a set of options, as a variant is
			const literal = /^(?:'[^']*'|-?\d+(?:\.\d+)?)$/;
			const parts = type?.split('|').map((part) => part.trim());
			const options = parts?.every((part) => literal.test(part)) ? parts.map((part) => part.replace(/^'|'$/g, '')) : undefined;
			shape.props.set(key, { name: key, ...(options ? { options } : { type }), required: !member.optional || undefined, doc: docOf(source, member.start) });
		}
	};

	// A component’s props in the order it takes them, and what it hands the rest to
	const propsOf = (source, fn) => {
		const [param] = fn.params;
		const pattern = param?.type === 'ObjectPattern' ? param : param?.type === 'AssignmentPattern' && param.left.type === 'ObjectPattern' ? param.left : undefined;
		const annotation = (pattern ?? param)?.typeAnnotation?.typeAnnotation;
		const shape = { props: new Map(), rest: [] };
		if (annotation) shapeOf(source, annotation, shape, new Set());
		const order = [];
		let passes = Boolean(param) && !pattern;
		for (const property of pattern?.properties ?? []) {
			if (property.type === 'RestElement') {
				passes = true;
				continue;
			}
			const key = nameOf(property.key);
			order.push(key);
			if (property.value.type !== 'AssignmentPattern') continue;
			shape.props.set(key, { ...(shape.props.get(key) ?? { name: key }), default: textOf(source, property.value.right) });
		}
		const rank = (prop) => (order.includes(prop.name) ? order.indexOf(prop.name) : order.length);
		const props = [...shape.props.values()].filter((prop) => prop.name !== 'className' && prop.name !== 'style').toSorted((a, b) => rank(a) - rank(b));
		const rest = passes ? shape.rest.filter((one, at) => shape.rest.findIndex((other) => (other.aria ?? other.react) === (one.aria ?? one.react)) === at) : [];
		return { props, rest };
	};

	// What a component draws, from React Aria and the library, and the states and tokens its classes use, following
	// its tv() calls, the constants it reads and the library’s unexported components and functions it uses, as
	// ColorField draws AnyColorField. Of styles with slots, only the slots it reads count, as Description draws
	// field()’s description and not its label
	const surveyOf = (source, start, self) => {
		const strings = [];
		const states = new Set();
		const aria = new Set();
		const parts = new Set();
		const styles = new Set();
		const defaults = new Map();
		// Each declaration walked, whole, or the slots of it walked so far
		const visited = new Map([[self, true]]);
		const parents = new WeakMap();
		// The slots read from tv() styles, as slots.label() reads label, or undefined for all of them. Styles are called
		// for their slots, so a call is passed through, and slots held in a variable are those read from it
		const slotsOf = (node, scope, given) => {
			let parent = parents.get(node);
			if (parent?.type === 'CallExpression' && parent.callee === node) [node, parent] = [parent, parents.get(parent)];
			if (node === scope) return given;
			if (parent?.type === 'MemberExpression' && parent.object === node && !parent.computed) return new Set([parent.property.name]);
			if (parent?.type !== 'VariableDeclarator' || parent.init !== node) return;
			const target = parent.id;
			if (target.type === 'ObjectPattern') return target.properties.every((property) => property.type === 'Property' && !property.computed) ? new Set(target.properties.map((property) => nameOf(property.key))) : undefined;
			if (target.type !== 'Identifier') return;
			const reads = new Set();
			let whole = false;
			walk(scope, (child, above, key) => {
				if (child.type !== 'Identifier' || child.name !== target.name || child === target || !above || isKey(above, key)) return;
				if (above.type === 'MemberExpression' && above.object === child && !above.computed) reads.add(above.property.name);
				else whole = true;
			});
			return whole ? undefined : reads;
		};
		// A tv() call’s classes, of the slots given or all of them, and the states its variants style there
		const draw = (from, node, extended, slots) => {
			const lists = classListsOf(node.init.arguments[0]).filter((list) => !slots || !list.slot || slots.has(list.slot));
			for (const variant of variantsOf(from, node)) {
				if (!/^is[A-Z]/.test(variant.name)) {
					if (!extended && variant.default && !defaults.has(variant.name)) defaults.set(variant.name, variant.default);
				} else if (!slots || lists.some((list) => list.when?.includes(variant.name))) states.add(stateOf(variant.name));
			}
			if (!extended && publicOf.has(node)) styles.add(publicOf.get(node));
			for (const list of lists) {
				if (list.extend && list.node.type === 'Identifier') follow(resolve(from, list.node.name), true, slots);
				else visit(from, list.node, true);
			}
		};
		const follow = (found, extended, slots) => {
			const node = found?.node;
			const body = node?.type === 'FunctionDeclaration' ? node : node?.type === 'VariableDeclarator' ? node.init : undefined;
			const seen = visited.get(node);
			if (!body || seen === true) return;
			const left = slots && node.type === 'VariableDeclarator' ? new Set([...slots].filter((slot) => !seen?.has(slot))) : undefined;
			if (left?.size === 0) return;
			visited.set(node, left ? new Set([...(seen ?? []), ...left]) : true);
			if (isStyles(node)) draw(found.source, node, extended, left);
			else visit(found.source, body, extended, left);
		};
		// Styles another tv() extends, as button does focusRing, aren’t the component’s own
		const visit = (from, scope, extended, slots) =>
			walk(scope, (child, parent, key) => {
				parents.set(child, parent);
				if (child.type === 'JSXOpeningElement') {
					if (child.name.type !== 'JSXIdentifier' || !/^[A-Z]/.test(child.name.name)) return;
					const found = resolve(from, child.name.name);
					if (found?.aria) aria.add(found.aria);
					else if (!publicOf.has(found?.node)) follow(found, extended);
					else if (found.node !== self) parts.add(publicOf.get(found.node));
				} else if (child.type === 'Literal' && typeof child.value === 'string') strings.push(child.value);
				else if (child.type === 'TemplateElement') strings.push(child.value.cooked ?? child.value.raw);
				else if (child.type === 'Identifier' && !(parent && isKey(parent, key))) {
					const found = resolve(from, child.name);
					// A function the package exports, such as composeClassName, draws for itself
					if (found?.node?.type !== 'FunctionDeclaration' || !publicOf.has(found.node)) follow(found, extended, found?.key ? new Set([found.key]) : slotsOf(child, scope, slots));
				}
			});
		visit(source, start, isStyles(self));
		return { survey: { aria: [...aria], parts: [...parts], states: [...states], styles: [...styles], tokens: tokensOf(strings, theme) }, defaults, strings };
	};

	// The classes each component draws with, for the shared tokens they read
	const drawn = new Map();
	const describe = (exported, found) => {
		if (found.aria) return { name: exported, kind: 'aria', place: placeOf(found.source, found.node.start), aria: [found.aria], uses: [] };
		const { source, node, statement } = found;
		const detail = { name: exported, kind: 'value', place: placeOf(source, statement.start), doc: docOf(source, statement.start), uses: [] };
		const fn = node.type === 'FunctionDeclaration' ? node : ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.init?.type) ? node.init : undefined;
		if (node.type === 'ClassDeclaration') {
			const parent = node.superClass?.type === 'Identifier' && resolve(source, node.superClass.name);
			return { ...detail, kind: 'class', rest: parent?.aria ? [{ aria: parent.aria }] : [] };
		}
		if (isStyles(node)) {
			const { survey } = surveyOf(source, node.init, node);
			return { ...detail, kind: 'styles', ...survey };
		}
		if (fn && /^[A-Z]/.test(exported)) {
			const { props, rest } = propsOf(source, fn);
			const { survey, defaults, strings } = surveyOf(source, fn, node);
			drawn.set(exported, strings);
			return { ...detail, kind: 'component', props: fill(props, defaults), rest, ...survey };
		}
		return { ...detail, kind: fn ? 'function' : 'value' };
	};

	const components = {};
	for (const [exported, found] of publics) components[exported] = describe(exported, found);

	// Where each export is used: by the library’s other components, and by the packages that import it
	const record = (source, project, base, names) =>
		walk(source.ast, (node) => {
			const local =
				node.type === 'JSXOpeningElement' && node.name.type === 'JSXIdentifier' ? node.name.name : ['CallExpression', 'NewExpression'].includes(node.type) && node.callee.type === 'Identifier' ? node.callee.name : undefined;
			const exported = local && names.get(local);
			if (exported) components[exported].uses.push({ project, path: relative(base, source.path).split(sep).join('/'), ...placeOf(source, node.start) });
		});
	for (const source of library.values()) {
		const names = new Map();
		for (const [local, binding] of source.imports) {
			const found = !binding.type && binding.from.startsWith('.') && resolve(source, local);
			if (publicOf.has(found?.node)) names.set(local, publicOf.get(found.node));
		}
		record(source, basename(ui), join(ui, 'src'), names);
	}
	for (const dir of packages) {
		if (dir === ui) continue;
		for (const path of filesIn(join(dir, 'src'))) {
			const code = readFileSync(path, 'utf8');
			const source = code.includes(packageName) && parse(path, root, code);
			if (!source) continue;
			const names = new Map();
			for (const [local, binding] of source.imports) if (binding.from === packageName &&!binding.type && publics.has(binding.name)) names.set(local, binding.name);
			record(source, basename(dir), join(dir, 'src'), names);
		}
	}
	// The packages that use it first, then the library itself
	const own = basename(ui);
	for (const detail of Object.values(components)) {
		detail.uses.sort((a, b) => (a.project === own) - (b.project === own) || a.project.localeCompare(b.project) || a.path.localeCompare(b.path) || a.line - b.line);
	}

	// A shared token belongs to each component that draws with it, itself or through the library’s components it draws,
	// as TextField takes the label’s weight through Label. No further, as beyond are other components’ own, such as the
	// checkbox in a table’s row
	const componentTokens = componentTokensOf(join(ui, 'styles', 'components.css'), sheets, root, Object.keys(components));
	const sharedTokens = componentTokens[shared] ?? [];
	delete componentTokens[shared];
	for (const [name, strings] of drawn) {
		const classes = [strings, ...components[name].parts.map((part) => drawn.get(part) ?? [])].flat().join(' ');
		const reads = sharedTokens.filter((token) => classes.includes(`${token.name})`) || classes.includes(`${token.name},`));
		if (reads.length) componentTokens[name] = [...reads, ...(componentTokens[name] ?? [])];
	}

	return { project: own, components, colours: coloursOf(theme, sheets, root), type: typographyOf(theme, sheet, root), componentTokens };
}
