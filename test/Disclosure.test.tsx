import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Disclosure, DisclosureGroup, DisclosureHeader, DisclosurePanel } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const questions = (
	<DisclosureGroup>
		<Disclosure id="what">
			<DisclosureHeader>What’s a disclosure?</DisclosureHeader>
			<DisclosurePanel>A heading that shows or hides what’s under it.</DisclosurePanel>
		</Disclosure>
		<Disclosure id="several">
			<DisclosureHeader>Can several be open at once?</DisclosureHeader>
			<DisclosurePanel>Only with allowsMultipleExpanded.</DisclosurePanel>
		</Disclosure>
	</DisclosureGroup>
);

describe('Disclosure', () => {
	it('opens and closes from its header, with a click or Enter', async () => {
		const user = userEvent.setup();
		render(questions);
		const what = screen.getByRole('button', { name: 'What’s a disclosure?' });
		expect(screen.getByRole('heading', { level: 3, name: 'What’s a disclosure?' })).toBeTruthy();
		expect(what.getAttribute('aria-expanded')).toBe('false');
		await user.click(what);
		expect(what.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByRole('group', { name: 'What’s a disclosure?' }).textContent).toContain('shows or hides');
		await user.keyboard('{Enter}');
		expect(what.getAttribute('aria-expanded')).toBe('false');
	});

	it('opens one at a time in a group', async () => {
		const user = userEvent.setup();
		render(questions);
		const what = screen.getByRole('button', { name: 'What’s a disclosure?' });
		const several = screen.getByRole('button', { name: 'Can several be open at once?' });
		await user.click(what);
		await user.click(several);
		expect(what.getAttribute('aria-expanded')).toBe('false');
		expect(several.getAttribute('aria-expanded')).toBe('true');
	});

	it('has nothing for axe to flag when open', async () => {
		const user = userEvent.setup();
		const { container } = render(questions);
		await user.click(screen.getByRole('button', { name: 'What’s a disclosure?' }));
		await expectAccessible(container);
	});
});
