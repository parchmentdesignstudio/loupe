import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Swatch } from '../src/index.js';

describe('Swatch', () => {
	it('paints any CSS colour over the checkerboard', () => {
		const { container } = render(<Swatch color="var(--color-primary)" />);
		const swatch = container.firstElementChild as HTMLElement;
		expect(swatch.style.backgroundImage).toContain('linear-gradient(var(--color-primary), var(--color-primary))');
		expect(swatch.style.backgroundImage).toContain('repeating-conic-gradient');
	});

	it('is hidden from screen readers unless it has a label', () => {
		const { container } = render(
			<>
				<Swatch color="red" />
				<Swatch color="var(--color-primary)" label="Marigold" />
			</>,
		);
		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
		expect(screen.getByRole('img', { name: 'Marigold' }).getAttribute('aria-hidden')).toBeNull();
	});

	it('comes in four sizes, large unless set', () => {
		const { container } = render(
			<>
				<Swatch color="red" />
				<Swatch color="red" size="small" />
				<Swatch color="red" size="field" />
			</>,
		);
		const [large, small, field] = [...container.children].map((swatch) => swatch.className.split(' '));
		expect(large).toContain('size-8');
		expect(small).toContain('size-3');
		expect(field).toContain('size-4');
	});

	it('is an empty frame without a colour', () => {
		const { container } = render(<Swatch size="field" />);
		expect((container.firstElementChild as HTMLElement).style.backgroundImage).toBe('');
	});

	it('gives its colour to the lighter line inside its edge, which an empty frame goes without', () => {
		const { container } = render(
			<>
				<Swatch color="var(--color-primary)" />
				<Swatch />
			</>,
		);
		const [coloured, empty] = [...container.children] as HTMLElement[];
		expect(coloured.style.getPropertyValue('--swatch-color')).toBe('var(--color-primary)');
		expect(empty.style.getPropertyValue('--swatch-color')).toBe('');
	});
});
