import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button, DialogHeading, Drawer, DrawerTrigger, TextField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

function Rename() {
	return (
		<DrawerTrigger>
			<Button>Rename project</Button>
			<Drawer>
				<DialogHeading>Rename project</DialogHeading>
				<TextField label="Name" defaultValue="Loupe" autoFocus />
			</Drawer>
		</DrawerTrigger>
	);
}

describe('Drawer', () => {
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

function Chat({ wide = true }: { wide?: boolean }) {
	return (
		<div>
			<DrawerTrigger>
				<Button>Chat</Button>
				<Drawer mode="push" aria-label="Chat">
					<DialogHeading>Chat</DialogHeading>
					<TextField label="Message" />
					<Button variant="secondary">Attach</Button>
				</Drawer>
			</DrawerTrigger>
			<p>{wide ? 'Wide' : 'Narrow'}</p>
		</div>
	);
}

// The window is wide enough to push from md, or not
const widen = (isWide: boolean) =>
	vi.spyOn(window, 'matchMedia').mockImplementation(
		(media: string) =>
			({ matches: String(media).includes('min-width') ? isWide : false, media, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as unknown as MediaQueryList,
	);

describe('Drawer that pushes', () => {
	beforeEach(() => widen(true));
	afterEach(() => vi.restoreAllMocks());

	it('opens beside the page from its button, which shows it expanded, and leaves the page usable', async () => {
		const user = userEvent.setup();
		render(<Chat />);
		const button = screen.getByRole('button', { name: 'Chat' });
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(screen.getByRole('complementary', { hidden: true }).hasAttribute('inert')).toBe(true);
		await user.click(button);
		expect(button.getAttribute('aria-expanded')).toBe('true');
		const aside = screen.getByRole('complementary', { name: 'Chat' });
		expect(aside.hasAttribute('inert')).toBe(false);
		screen.getByRole('dialog', { name: 'Chat' });
		// Not a modal, so the page around it isn't hidden
		screen.getByText('Wide');
	});

	it('closes on Escape, giving focus back to its button', async () => {
		const user = userEvent.setup();
		render(<Chat />);
		const button = screen.getByRole('button', { name: 'Chat' });
		await user.click(button);
		await user.click(screen.getByRole('textbox', { name: 'Message' }));
		await user.keyboard('{Escape}');
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(button);
	});

	it('stays open when a button inside it is pressed', async () => {
		const user = userEvent.setup();
		render(<Chat />);
		const button = screen.getByRole('button', { name: 'Chat' });
		await user.click(button);
		await user.click(screen.getByRole('button', { name: 'Attach' }));
		expect(button.getAttribute('aria-expanded')).toBe('true');
	});

	it('closes from its button too', async () => {
		const user = userEvent.setup();
		render(<Chat />);
		const button = screen.getByRole('button', { name: 'Chat' });
		await user.click(button);
		await user.click(button);
		expect(button.getAttribute('aria-expanded')).toBe('false');
	});

	it('opens over the page instead, where the window is narrower than pushFrom', async () => {
		widen(false);
		const user = userEvent.setup();
		render(<Chat wide={false} />);
		await user.click(screen.getByRole('button', { name: 'Chat' }));
		expect(screen.queryByRole('complementary')).toBeNull();
		screen.getByRole('dialog', { name: 'Chat' });
	});
});
