import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, Card } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Card', () => {
	it('heads itself with its title, and holds its buttons at the foot', () => {
		render(
			<Card title="Team" description="For small teams" actions={<Button>Start free trial</Button>}>
				£12 a month
			</Card>,
		);
		expect(screen.getByRole('heading', { level: 3, name: 'Team' })).toBeTruthy();
		const foot = screen.getByRole('button', { name: 'Start free trial' }).parentElement;
		expect(foot?.className).toContain('mt-auto');
		expect(foot?.parentElement?.lastElementChild).toBe(foot);
	});

	it('takes another heading level, and leaves out what it isn’t given', () => {
		const { container } = render(<Card title="Revenue" headingLevel={4} />);
		expect(screen.getByRole('heading', { level: 4 })).toBeTruthy();
		expect(container.querySelector('article')?.children).toHaveLength(1);
	});

	it('is raised unless it’s quiet', () => {
		const { container, rerender } = render(<Card title="Raised" />);
		expect(container.querySelector('article')?.className).toContain('bg-raised');
		rerender(<Card title="Quiet" fill="quiet" />);
		expect(container.querySelector('article')?.className).not.toContain('bg-raised');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<Card title="Business" description="For organisations" actions={<Button variant="secondary">Talk to sales</Button>}>
				£24 a month
			</Card>,
		);
		await expectAccessible(container);
	});
});
