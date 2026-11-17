import { describe, expect, it } from 'vitest';
import { parseAnyColor } from '../src/index.js';

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

	it('says whether alpha was given', () => {
		expect(parseAnyColor('#c76024')?.hasAlpha).toBe(false);
		expect(parseAnyColor('oklch(0.6 0.15 40 / 0.4)')?.hasAlpha).toBe(true);
	});

	it('is null for what isn’t a colour', () => {
		for (const text of ['', 'blurple', '#12', 'rgb(1, 2)', 'oklch(a b c)', 'color(rec2020 1 0 0)']) expect(parseAnyColor(text)).toBeNull();
	});
});
