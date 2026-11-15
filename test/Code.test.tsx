import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { withoutNotes } from '../src/Code.js';
import { Code } from '../src/index.js';
import { codeToHtml } from 'shiki';
import { codeTheme, highlight, transformerLineNumbers } from '../src/shiki.js';
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

	it('shows a path’s folders apart from its file, and what a diff changes', async () => {
		const html = await highlight('a // [!code --]\nb // [!code ++]\nc // [!code ++]', { language: 'js' });
		const { container } = render(<Code code="a" html={html} title="src/lib/a.ts" isCopyable={false} />);
		const caption = container.querySelector('figcaption');
		expect(caption?.textContent).toContain('src / lib / a.ts');
		expect(screen.getByText('1 line removed, 2 added')).toBeTruthy();
		expect(caption?.textContent).toContain('−1+2');
		await expectAccessible(container);
	});

	it('copies with an icon, named in a tooltip, and swaps it once copied', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
		render(<Code code="a" title="a.ts" copyIcon={<svg data-testid="copy" />} copiedIcon={<svg data-testid="copied" />} />);
		await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
		expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy();
		expect(screen.getByTestId('copied')).toBeTruthy();
	});

	it('takes another site’s colours by name', () => {
		const { container } = render(<Code code="a" theme="iamsteve" isCopyable={false} />);
		expect(container.querySelector('figure')?.dataset.codeTheme).toBe('iamsteve');
		expect(screen.queryByRole('button')).toBeNull();
	});
});

describe('withoutNotes', () => {
	it('drops Shiki’s notes that end a line, the comments they leave empty, and lines that were only a note', () => {
		const code = ['a(); // [!code ++]', 'b(); // keep [!code --]', '// [!code highlight:2]', 'c { color: red } /* [!code focus] */', '<p>{/* [!code error] */}</p>', '<b /> {/* [!code ++] */}'].join('\n');
		expect(withoutNotes(code)).toBe(['a();', 'b(); // keep', 'c { color: red }', '<p>{/* [!code error] */}</p>', '<b />'].join('\n'));
	});
});

describe('highlight', () => {
	it('colours code with the role tokens', async () => {
		const html = await highlight('const a = "b";', { language: 'ts' });
		expect(html).toContain('var(--color-code-keyword)');
		expect(html).toContain('var(--color-code-string)');
	});

	it('highlights a line inline, as spans without a <pre>', async () => {
		const html = await highlight("import { a } from 'b'", { isInline: true });
		expect(html).not.toContain('<pre');
		expect(html).toContain('var(--color-code-keyword)');
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

	it('marks a line’s number as its line is marked, such as highlighted', async () => {
		const html = await codeToHtml('a\nb\nc', {
			lang: 'text',
			theme: codeTheme,
			meta: { __raw: 'showLineNumbers' },
			transformers: [
				transformerLineNumbers(),
				{
					line(node, line) {
						if (line === 2) this.addClassToHast(node, 'highlighted');
					},
				},
			],
		});
		const page = new DOMParser().parseFromString(html, 'text/html');
		expect([...page.querySelectorAll('[data-line-number].highlighted')].map((each) => each.textContent)).toEqual(['2']);
	});

	it('marks lines from the meta and from notes in the code, and their numbers with them', async () => {
		const html = await highlight('a\nb // [!code ++]\nc // [!code --]\nd', { language: 'js', lineNumbers: true, meta: '{1}' });
		const page = new DOMParser().parseFromString(html, 'text/html');
		const marked = (selector: string) => [...page.querySelectorAll(`[data-line-number]${selector}`)].map((each) => each.textContent);
		expect(marked('.highlighted')).toEqual(['1']);
		expect(marked('.add')).toEqual(['2']);
		expect(marked('.remove')).toEqual(['3']);
		expect(page.body.textContent).not.toContain('[!code');
	});
});
