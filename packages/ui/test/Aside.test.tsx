import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Aside, Prose } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Aside', () => {
	it('is an aside, not a quote, alongside its own classes', async () => {
		const { container } = render(<Aside className="max-w-prose">I assume you’re comfortable setting up Tailwind for your project</Aside>);
		const aside = container.firstElementChild;
		expect(aside?.tagName).toBe('ASIDE');
		expect(aside?.className).toContain('max-w-prose');
		expect(container.querySelector('blockquote')).toBeNull();
		await expectAccessible(container);
	});

	it('sets an afterthought apart from a signpost', () => {
		const { container } = render(
			<>
				<Aside>Signpost</Aside>
				<Aside variant="afterthought">Afterthought</Aside>
			</>,
		);
		const [signpost, afterthought] = container.querySelectorAll('aside');
		expect(signpost.className).toContain('border-accent');
		expect(afterthought.className).toContain('italic');
		expect(afterthought.className).toContain('text-muted');
	});

	it('sits in prose, with paragraphs inside', async () => {
		const { container } = render(
			<Prose>
				<p>Grid does the hard part.</p>
				<Aside variant="afterthought">
					<p>Behind a proxy, you may only need port 80.</p>
					<p>The proxy handles HTTPS for you.</p>
				</Aside>
			</Prose>,
		);
		expect(container.querySelectorAll('aside p')).toHaveLength(2);
		await expectAccessible(container);
	});
});
