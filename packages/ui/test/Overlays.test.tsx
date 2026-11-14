import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Dialog, DialogActions, DialogClose, DialogHeading, DialogTrigger, Menu, MenuItem, MenuTrigger, Modal, Popover, Tooltip, TooltipTrigger } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function RenameDialog() {
	return (
		<DialogTrigger>
			<Button>Rename</Button>
			<Modal>
				<Dialog>
					<DialogHeading>Rename project</DialogHeading>
					<DialogClose />
					<DialogActions>
						<Button slot="close" variant="secondary">
							Cancel
						</Button>
					</DialogActions>
				</Dialog>
			</Modal>
		</DialogTrigger>
	);
}

describe('Modal', () => {
	it('opens named by its heading, and Escape closes it', async () => {
		const user = userEvent.setup();
		render(<RenameDialog />);
		await user.click(screen.getByRole('button', { name: 'Rename' }));
		expect(screen.getByRole('dialog', { name: 'Rename project' })).toBeTruthy();
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('closes from its close button', async () => {
		const user = userEvent.setup();
		render(<RenameDialog />);
		await user.click(screen.getByRole('button', { name: 'Rename' }));
		await user.click(screen.getByRole('button', { name: 'Close' }));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('has nothing for axe to flag', async () => {
		const user = userEvent.setup();
		render(<RenameDialog />);
		await user.click(screen.getByRole('button', { name: 'Rename' }));
		await expectAccessible(screen.getByRole('dialog'));
	});
});

describe('Popover', () => {
	it('opens a dialog beside its button', async () => {
		const user = userEvent.setup();
		render(
			<DialogTrigger>
				<Button>Share</Button>
				<Popover showArrow>
					<Dialog aria-label="Share link">Anyone with the link can view</Dialog>
				</Popover>
			</DialogTrigger>,
		);
		await user.click(screen.getByRole('button', { name: 'Share' }));
		expect(screen.getByRole('dialog', { name: 'Share link' })).toBeTruthy();
	});
});

describe('Menu', () => {
	it('runs an action picked with the keyboard', async () => {
		const user = userEvent.setup();
		const onAction = vi.fn();
		render(
			<MenuTrigger>
				<Button>Project</Button>
				<Menu onAction={onAction}>
					<MenuItem id="rename">Rename</MenuItem>
					<MenuItem id="delete" variant="danger">
						Delete
					</MenuItem>
				</Menu>
			</MenuTrigger>,
		);
		await user.tab();
		await user.keyboard('{Enter}');
		expect(screen.getAllByRole('menuitem')).toHaveLength(2);
		await user.keyboard('{ArrowDown}{Enter}');
		expect(onAction.mock.lastCall?.[0]).toBe('delete');
		expect(screen.queryByRole('menu')).toBeNull();
	});
});

const sendTooltip = (showArrow?: boolean) => (
	<TooltipTrigger>
		<Button shape="full" aria-label="Send">
			<svg aria-hidden="true" />
		</Button>
		<Tooltip showArrow={showArrow}>Send message</Tooltip>
	</TooltipTrigger>
);

describe('Tooltip', () => {
	it('shows for keyboard focus and describes its control', async () => {
		const user = userEvent.setup();
		render(
			<TooltipTrigger>
				<Button shape="full" aria-label="Send">
					<svg aria-hidden="true" />
				</Button>
				<Tooltip>Send message</Tooltip>
			</TooltipTrigger>,
		);
		await user.tab();
		const tooltip = await screen.findByRole('tooltip');
		expect(tooltip.textContent).toContain('Send message');
		expect(screen.getByRole('button').getAttribute('aria-describedby')).toBe(tooltip.id);
	});

	it('points at its control only with showArrow', async () => {
		const user = userEvent.setup();
		const { rerender } = render(sendTooltip());
		await user.tab();
		expect((await screen.findByRole('tooltip')).querySelector('svg')).toBeNull();
		rerender(sendTooltip(true));
		expect(screen.getByRole('tooltip').querySelector('svg')).not.toBeNull();
	});
});
