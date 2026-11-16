import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Prose, Quote } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Quote', () => {
	it('sets the words in a blockquote, and who said it in a caption', async () => {
		const { container } = render(
			<Quote cite="Mara Lindqvist" detail="Founder, Halden Studio">
				<p>We thought we needed a website. It turned out we needed a better way to answer the phone.</p>
			</Quote>,
		);
		const figure = screen.getByRole('figure');
		expect(figure.className).toContain('quote');
		expect(figure.querySelector('blockquote')?.textContent).toBe('We thought we needed a website. It turned out we needed a better way to answer the phone.');
		expect(figure.querySelector('figcaption cite')?.textContent).toBe('Mara Lindqvist');
		expect(figure.querySelector('figcaption')?.textContent).toBe('Mara LindqvistFounder, Halden Studio');
		await expectAccessible(container);
	});

	it('leaves the caption out when no one is named', () => {
		const { container } = render(<Quote>Good design is as little design as possible</Quote>);
		expect(container.querySelector('figcaption')).toBeNull();
	});

	it('hides a testimonial’s photo, as the name beside it says who it is', async () => {
		const { container } = render(
			<Quote variant="testimonial" cite="Sam Okafor" detail="Head of product, Fernway" avatar="sam.jpg">
				Parchment turned a vague idea into a brand we’re proud to put our name to
			</Quote>,
		);
		expect(screen.queryByRole('img')).toBeNull();
		expect(container.querySelector('figcaption [aria-hidden="true"]')).not.toBeNull();
		await expectAccessible(container);
	});

	it('only has the avatar in a testimonial', () => {
		const { container } = render(
			<Quote cite="Sam Okafor" avatar="sam.jpg">
				Parchment turned a vague idea into a brand
			</Quote>,
		);
		expect(container.querySelector('img')).toBeNull();
	});

	it('sits in prose', async () => {
		const { container } = render(
			<Prose>
				<p>What they said stuck with us.</p>
				<Quote cite="Mara Lindqvist">It turned out we needed a better way to answer the phone</Quote>
			</Prose>,
		);
		expect(container.querySelector('.prose > figure.quote')).not.toBeNull();
		await expectAccessible(container);
	});
});
