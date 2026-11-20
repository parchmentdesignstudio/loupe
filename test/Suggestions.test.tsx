import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Suggestion, Suggestions } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Suggestions', () => {
	it('groups questions, each a button named by its question', async () => {
		const onPress = vi.fn();
		const { container } = render(
			<Suggestions aria-label="Suggested questions">
				<Suggestion onPress={onPress}>What’s in season now?</Suggestion>
				<Suggestion>Plan a week of lunches</Suggestion>
			</Suggestions>,
		);
		expect(screen.getByRole('group', { name: 'Suggested questions' })).toBeTruthy();
		await userEvent.setup().click(screen.getByRole('button', { name: 'What’s in season now?' }));
		expect(onPress).toHaveBeenCalledOnce();
		await expectAccessible(container);
	});

	it('makes follow-ups plain', () => {
		render(
			<Suggestions aria-label="Follow-up questions" variant="follow-up">
				<Suggestion>Could it be vegan?</Suggestion>
			</Suggestions>,
		);
		expect(screen.getByRole('button', { name: 'Could it be vegan?' }).className).toContain('text-muted');
	});
});
