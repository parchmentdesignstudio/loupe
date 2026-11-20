import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Message, MessageList } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Message', () => {
	it('lists a conversation as a log, a person’s message at the end of the row', async () => {
		const { container } = render(
			<MessageList aria-label="Conversation">
				<Message from="user">What can I make with leeks?</Message>
				<Message from="assistant">
					<p>A leek and potato soup</p>
				</Message>
			</MessageList>,
		);
		const log = screen.getByRole('log', { name: 'Conversation' });
		expect(log.children).toHaveLength(2);
		expect(screen.getByText('What can I make with leeks?').className).toContain('self-end');
		expect(screen.getByText('A leek and potato soup').parentElement?.className).not.toContain('self-end');
		await expectAccessible(container);
	});
});
