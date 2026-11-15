import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Prose } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Prose', () => {
	it('sets plain HTML in the prose class, alongside its own', async () => {
		const { container } = render(
			<Prose className="max-w-prose">
				<h2>Writing for the screen</h2>
				<p>Put the point first.</p>
			</Prose>,
		);
		const prose = container.firstElementChild;
		expect(prose?.className).toContain('prose');
		expect(prose?.className).toContain('max-w-prose');
		expect(prose?.querySelector('h2')?.textContent).toBe('Writing for the screen');
		await expectAccessible(container);
	});
});
