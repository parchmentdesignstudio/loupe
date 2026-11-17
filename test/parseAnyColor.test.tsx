import { describe, expect, it } from 'vitest';
import { formatOklch, parseAnyColor } from '../src/index.js';

const hex = (text: string) => parseAnyColor(text)?.color.toString('hexa');

describe('parseAnyColor', () => {
	it('reads hex with or without its #, short or long, with or without alpha', () => {
		expect(hex('#c76024')).toBe('#C76024FF');
		expect(hex('c76024')).toBe('#C76024FF');
		expect(hex('#fff')).toBe('#FFFFFFFF');
		expect(hex('#c7602480')).toBe('#C7602480');
	});

	it('reads names and transparent', () => {
		expect(hex('rebeccapurple')).toBe('#663399FF');
		expect(hex('Transparent')).toBe('#00000000');
	});

	it('reads rgb and hsl in comma and modern syntax', () => {
		expect(hex('rgb(199, 96, 36)')).toBe('#C76024FF');
		expect(hex('rgba(199, 96, 36, 0.5)')).toBe('#C7602480');
		expect(hex('rgb(199 96 36 / 50%)')).toBe('#C7602480');
		expect(hex('hsl(22, 69%, 46%)')).toBe(hex('hsl(22deg 69% 46%)'));
		expect(hex('hsl(0 100% 50%)')).toBe('#FF0000FF');
		expect(hex('hwb(0 0% 0%)')).toBe('#FF0000FF');
	});

	it('reads oklch, oklab, lab, lch and color()', () => {
		expect(hex('oklch(0.628 0.2577 29.23)')).toBe('#FF0000FF');
		expect(hex('oklab(0.628 0.2249 0.1258)')).toBe('#FF0000FF');
		expect(hex('oklch(62.8% 0.2577 29.23 / 0.5)')).toBe('#FF000080');
		expect(hex('lab(54.29 80.8 69.89)')).toBe('#FF0000FF');
		expect(hex('lch(54.29 106.84 40.85)')).toBe('#FF0000FF');
		expect(hex('color(srgb 1 0 0)')).toBe('#FF0000FF');
		expect(hex('color(display-p3 0.9176 0.2003 0.1386)')).toBe('#FF0000FF');
	});

	it('brings a colour outside sRGB in by chroma, keeping its lightness and hue', () => {
		const vivid = parseAnyColor('color(display-p3 0 1 0)')?.color.toFormat('rgb');
		expect(vivid?.getChannelValue('green')).toBeGreaterThan(230);
		expect(vivid?.getChannelValue('red')).toBeLessThan(80);
		expect(hex('oklch(0.7 0.4 145)')).toMatch(/^#[0-9A-F]{6}FF$/);
	});

	it('keeps the oklch exactly, even outside sRGB', () => {
		expect(formatOklch(parseAnyColor('oklch(0.7 0.3 145 / 0.5)')!.oklch, 0.5)).toBe('oklch(70% 0.3 145 / 0.5)');
		expect(parseAnyColor('oklch(0.7 0.3 145)')?.isInSrgb).toBe(false);
		expect(parseAnyColor('#c76024')?.isInSrgb).toBe(true);
		expect(formatOklch(parseAnyColor('#808080')!.oklch)).toMatch(/^oklch\(59\.\d+% 0 0\)$/);
	});

	it('says whether alpha was given', () => {
		expect(parseAnyColor('#c76024')?.hasAlpha).toBe(false);
		expect(parseAnyColor('oklch(0.6 0.15 40 / 0.4)')?.hasAlpha).toBe(true);
	});

	it('brings a colour a hair outside sRGB in as CSS does, by clipping it', () => {
		expect(hex('oklch(45.22% 0.3131 264.12)')).toBe('#0100FFFF');
		for (const text of ['#0000ff', '#0100ff', '#0001ff', '#0201ff']) expect(hex(formatOklch(parseAnyColor(text)!.oklch))).toBe(hex(text));
	});

	it('is null for what isn’t a colour', () => {
		for (const text of ['', 'blurple', '#12', 'rgb(1, 2)', 'oklch(a b c)', 'color(rec2020 1 0 0)']) expect(parseAnyColor(text)).toBeNull();
	});

	it('is null, rather than throwing, for a name an object has and a number too big to use', () => {
		for (const text of ['constructor', '__proto__', 'toString', 'oklch(0.5 1e999 0)', 'hsl(1e999 50% 50%)']) expect(parseAnyColor(text)).toBeNull();
	});

	it('clamps what CSS clamps as it parses, so the oklch it gives back is the same colour', () => {
		expect(hex('rgb(300 0 0)')).toBe('#FF0000FF');
		expect(hex('rgb(-50 0 0)')).toBe('#000000FF');
		expect(hex('rgb(1e999 0 0)')).toBe('#FF0000FF');
		expect(hex('hsl(0 -50% 50%)')).toBe('#808080FF');
		expect(hex('hsl(0 100% 150%)')).toBe('#FFFFFFFF');
		expect(hex('hwb(0 -20% 0%)')).toBe('#FF0000FF');
		expect(hex('oklch(0.5 -0.1 30)')).toBe(hex('oklch(0.5 0 30)'));
		expect(parseAnyColor('oklch(-19.91% 0.0817 209.23)')?.oklch.l).toBe(0);
		expect(hex('lab(150 0 0)')).toBe('#FFFFFFFF');
		const huge = parseAnyColor('hsl(0 5e130% 50%)')!;
		expect(huge.color.toString('hex')).toBe('#FF0000');
		expect(hex(formatOklch(huge.oklch))).toBe('#FF0000FF');
	});
});
