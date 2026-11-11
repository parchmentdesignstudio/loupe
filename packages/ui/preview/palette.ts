/// <reference types="vite/client" />
import tokens from '../tokens.css?raw';

// The palette’s hexes, read from tokens.css so the colour page shows what the CSS sets. The sums are the ones
// scripts/elyx-tokens.mjs uses, so a hex here is the hex Elyx has
const channel = (x: number) => Math.round(Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)) * 255);

function hex(l: number, c: number, h: number) {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const lms = [l + 0.3963377774 * a + 0.2158037573 * b, l - 0.1055613458 * a - 0.0638541728 * b, l - 0.0894841775 * a - 1.291485548 * b].map((x) => x ** 3);
	const rgb = [
		4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
		-1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
		-0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
	];
	return `#${rgb.map((x) => channel(x).toString(16).padStart(2, '0')).join('')}`;
}

const number = (part: string) => (part.endsWith('%') ? parseFloat(part) / 100 : parseFloat(part));

const palette = new Map(
	[...tokens.matchAll(/--color-([\w-]+):\s*oklch\(([^)]*)\);/g)].map(([, name, value]) => {
		const [l, c, h] = value.trim().split(/\s+/).map(number);
		return [name, hex(l, c, h)];
	}),
);

/** A palette colour’s hex, such as #0c2920 for pine-26 */
export function hexOf(name: string) {
	const value = palette.get(name);
	if (!value) throw new Error(`--color-${name} isn’t in tokens.css`);
	return value;
}
