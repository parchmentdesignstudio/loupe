import axe from 'axe-core';
import { expect } from 'vitest';

/** Runs axe over what's rendered, failing with each rule broken and where. Contrast needs a real browser, so it's left out */
export async function expectAccessible(container: Element) {
	const { violations } = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
	expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.html).join(', ')}`)).toEqual([]);
}
