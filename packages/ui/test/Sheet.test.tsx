import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button, DialogHeading, Sheet, SheetTrigger, TextField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function Rename() {
	return (
		<SheetTrigger>
			<Button>Rename project</Button>
			<Sheet>
				<DialogHeading>Rename project</DialogHeading>
				<TextField label="Name" defaultValue="Loupe" autoFocus />
			</Sheet>
		</SheetTrigger>
	);
}

describe('Sheet', () => {
	it('opens from its button as a dialog named by its heading, with focus in its first field', async () => {
		const user = userEvent.setup();
		render(<Rename />);
		await user.click(screen.getByRole('button', { name: 'Rename project' }));
		screen.getByRole('dialog', { name: 'Rename project' });
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }));
	});

	it('has nothing for axe to flag when open', async () => {
		const user = userEvent.setup();
		render(<Rename />);
		await user.click(screen.getByRole('button', { name: 'Rename project' }));
		await expectAccessible(screen.getByRole('dialog'));
	});
});
