import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button, Keyboard, Menu, MenuItem, MenuSeparator, MenuTrigger, Separator, ToggleButton, ToggleButtonGroup, Toolbar, Tooltip, TooltipTrigger } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const editing = (
	<Toolbar aria-label="Editing">
		<ToggleButtonGroup aria-label="Tool" defaultSelectedKeys={['select']}>
			<ToggleButton id="select">Select</ToggleButton>
			<ToggleButton id="pan">Pan</ToggleButton>
		</ToggleButtonGroup>
		<Separator />
		<Button variant="quiet">Undo</Button>
		<Button variant="quiet">Redo</Button>
	</Toolbar>
);

describe('Toolbar', () => {
	it('is one Tab stop, with the arrow keys through every control in it', async () => {
		const user = userEvent.setup();
		render(
			<>
				{editing}
				<button type="button">After</button>
			</>,
		);
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Select' }));
		await user.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Pan' }));
		await user.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Undo' }));
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
	});

	it('stands a Separator upright in a row, and leaves one elsewhere flat', () => {
		render(
			<>
				{editing}
				<Separator />
			</>,
		);
		const [inToolbar, onItsOwn] = screen.getAllByRole('separator');
		expect(inToolbar.getAttribute('aria-orientation')).toBe('vertical');
		expect(onItsOwn.tagName).toBe('HR');
		expect(onItsOwn.getAttribute('aria-orientation')).toBeNull();
	});

	it('lays a Separator flat across a column', () => {
		render(
			<Toolbar aria-label="Tools" orientation="vertical">
				<Button variant="quiet">Select</Button>
				<Separator />
				<Button variant="quiet">Pan</Button>
			</Toolbar>,
		);
		expect(screen.getByRole('toolbar').getAttribute('aria-orientation')).toBe('vertical');
		expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBeNull();
	});

	it('keeps the separators in a menu it opens flat', async () => {
		const user = userEvent.setup();
		render(
			<Toolbar aria-label="Canvas">
				<MenuTrigger>
					<Button variant="quiet">Zoom</Button>
					<Menu>
						<MenuItem>Zoom to fit</MenuItem>
						<MenuSeparator />
						<MenuItem>100%</MenuItem>
					</Menu>
				</MenuTrigger>
			</Toolbar>,
		);
		await user.click(screen.getByRole('button', { name: 'Zoom' }));
		const separator = screen.getByRole('menu').querySelector('[role="separator"]');
		expect(separator).not.toBeNull();
		expect(separator?.getAttribute('aria-orientation')).toBeNull();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(editing);
		await expectAccessible(container);
	});
});

describe('Keyboard', () => {
	it('describes a menu item, and stays out of its name', async () => {
		const user = userEvent.setup();
		render(
			<MenuTrigger>
				<Button>Edit</Button>
				<Menu>
					<MenuItem textValue="Undo">
						Undo
						<Keyboard>⌘Z</Keyboard>
					</MenuItem>
				</Menu>
			</MenuTrigger>,
		);
		await user.click(screen.getByRole('button', { name: 'Edit' }));
		expect(screen.getByRole('menuitem', { name: 'Undo', description: '⌘Z' })).toBeTruthy();
	});

	it('reads as part of a tooltip', async () => {
		const user = userEvent.setup();
		render(
			<TooltipTrigger>
				<Button shape="circle" aria-label="Undo">
					<svg aria-hidden="true" />
				</Button>
				<Tooltip>
					Undo
					<Keyboard>⌘Z</Keyboard>
				</Tooltip>
			</TooltipTrigger>,
		);
		await user.tab();
		const tooltip = await screen.findByRole('tooltip');
		expect(tooltip.querySelector('kbd')?.getAttribute('aria-hidden')).toBeNull();
		expect(screen.getByRole('button', { name: 'Undo', description: /^Undo\s*⌘Z$/ })).toBeTruthy();
	});
});
