#!/usr/bin/env node
// Fails on a token more than one hop from its value, so editing one means finding it rather than following it. A
// token is set to a value: a literal, or tokens that are themselves literals, such as a role that picks two palette
// colours. A role never reads another role, and a palette colour never reads another palette colour
//
//   node packages/ui/lint/tokens.mjs
//
// Two kinds of variable don't count as a hop, as they're context rather than a chain:
// - What a layer or component sets for what sits on it, such as --bleed or a button's --edge. These are listed below,
//   and each is held to the rule where it's set on :root. A variable no stylesheet sets is one a component sets
// - A role a shadow reads for a colour, such as --shadow-invalid's --color-danger, as a shadow is a recipe
// - A component's own token read with a role as its fallback, var(--button-primary-fill, var(--color-primary)), which
//   is the place to edit it. Those listed in @media not all are documentation, so they're skipped
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const styles = join(import.meta.dirname, '../styles');
const sheets = readdirSync(styles, { recursive: true })
	.filter((name) => name.endsWith('.css'))
	.map((name) => join(styles, name));

// Set by a layer or component for what's drawn on it, and read where it's used: the layers' bleed, the parts each
// shadow is built from, and an overlay's side
const context = /^--(?:bleed|edge|fine-edge|sheen|toplight|glow|shade|shell-toplight|shell-glow|shadow-[a-z]+-color|code-ground|enter-[xy]|tw-.+)$/;

/** Every custom property each sheet sets, by name, with where. Comments and @media not all blocks are left out */
const tokens = new Map();
for (const file of sheets) {
	let css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
	css = css.replace(/@media not all\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, (block) => block.replace(/[^\n]/g, ' '));
	for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
		const line = css.slice(0, match.index).split('\n').length;
		const list = tokens.get(match[1]) ?? [];
		list.push({ value: match[2].trim(), at: `${relative(process.cwd(), file)}:${line}` });
		tokens.set(match[1], list);
	}
}

// The variables a value reads, except a fallback inside var(--a, var(--b)), which is read only when --a isn't set
function reads(value) {
	const out = [];
	for (const match of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
		const before = value.slice(0, match.index);
		if (/var\(\s*--[\w-]+\s*,\s*$/.test(before)) continue;
		out.push(match[1]);
	}
	return out;
}

// How far a token is from its value, through anything that isn't context: 0 for a literal, 1 for a role on the palette
const memo = new Map();
function hops(name, path = []) {
	if (memo.has(name)) return memo.get(name);
	if (path.includes(name) || !tokens.has(name)) return { count: 0, chain: [name] };
	let deepest = { count: 0, chain: [name] };
	for (const { value } of tokens.get(name))
		for (const read of reads(value)) {
			if (context.test(read)) continue;
			// A shadow is a recipe, so it takes its colours from the roles and the parts as a component would
			if (/^--(?:inset-)?shadow-/.test(name) && read.startsWith('--color-')) continue;
			const next = hops(read, [...path, name]);
			if (next.count + 1 > deepest.count) deepest = { count: next.count + 1, chain: [name, ...next.chain] };
		}
	memo.set(name, deepest);
	return deepest;
}

let count = 0;
for (const [name, list] of tokens) {
	const { count: depth, chain } = hops(name);
	if (depth <= 1) continue;
	count++;
	console.log(`${list[0].at} ${name} is ${depth} hops from its value: ${chain.join(' → ')}`);
}
if (count) {
	console.log(`\n${count} ${count === 1 ? 'token' : 'tokens'} to set straight to a value`);
	process.exit(1);
}
console.log(`Every token in ${sheets.length} sheets is a hop or less from its value`);
