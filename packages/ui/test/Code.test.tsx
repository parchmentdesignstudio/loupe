import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Code } from '../src/index.js';
import { highlight } from '../src/shiki.js';
import { expectAccessible } from './accessible.js';

describe('Code', () => {
	it('shows the code as text until it is highlighted, under its title', async () => {
		const { container } = render(<Code code={'const a = 1;\n'} title="a.ts" />);
		expect(container.querySelector('figcaption')?.textContent).toContain('a.ts');
		expect(container.querySelector('pre')?.textContent).toBe('const a = 1;');
		await expectAccessible(container);
	});

	it('copies the code, and says so', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
		render(<Code code="pnpm add shiki" />);
		await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
		expect(writeText).toHaveBeenCalledWith('pnpm add shiki');
		expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy();
	});

	it('takes another site’s colours by name', () => {
		const { container } = render(<Code code="a" theme="iamsteve" isCopyable={false} />);
		expect(container.querySelector('figure')?.dataset.codeTheme).toBe('iamsteve');
		expect(screen.queryByRole('button')).toBeNull();
	});
});

describe('highlight', () => {
	it('colours code with the role tokens', async () => {
		const html = await highlight('const a = "b";', { language: 'ts' });
		expect(html).toContain('var(--color-code-keyword)');
		expect(html).toContain('var(--color-code-string)');
	});

	it('reads Tailwind’s @theme and bare custom properties as CSS', async () => {
		const theme = await highlight('@theme {\n\t--color-a: red;\n}', { language: 'css' });
		expect(theme).toContain('@theme');
		expect(theme).toContain('var(--color-code-type)');
		const bare = await highlight('--size: 4px;', { language: 'css' });
		expect(bare).not.toContain(':root');
		expect(bare).toContain('var(--color-code-constant)');
	});

	it('numbers the lines from where it’s told', async () => {
		const html = await highlight('a\nb', { language: 'text', lineNumbers: 9 });
		const numbers = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('[data-line-number]')].map((each) => each.textContent);
		expect(numbers).toEqual(['9', '10']);
	});
});
