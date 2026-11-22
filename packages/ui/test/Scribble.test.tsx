import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Scribble } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Scribble', () => {
	it('is hidden from screen readers, and drawn in the text’s colour', () => {
		const { container } = render(<Scribble />);
		const svg = container.querySelector('svg');
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		expect(svg?.querySelector('path')?.getAttribute('stroke')).toBe('currentColor');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<p>
				<Scribble /> Thinking
			</p>,
		);
		await expectAccessible(container);
	});
});
