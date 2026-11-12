import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup, avatarTint, initials } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('initials', () => {
	it('takes the first letters of the first and last words', () => {
		expect(initials('Sam Smith')).toBe('SS');
		expect(initials('ada lovelace')).toBe('AL');
		expect(initials('Mary Jane van der Berg')).toBe('MB');
		expect(initials('  Sam    Smith  ')).toBe('SS');
		expect(initials('Zoë Ørsted')).toBe('ZØ');
		expect(initials('(Sam) “Smith”')).toBe('SS');
	});

	it('takes one letter for one word, or when asked', () => {
		expect(initials('Cher')).toBe('C');
		expect(initials('Sam Smith', { max: 1 })).toBe('S');
	});

	it('keeps an emoji whole, on its own', () => {
		expect(initials('👩🏽‍💻 Sam')).toBe('👩🏽‍💻');
		expect(initials('🦊')).toBe('🦊');
		expect(initials('Sam 🦊')).toBe('S');
	});

	it('handles names in other scripts', () => {
		expect(initials('Олена Коваль')).toBe('ОК');
		expect(initials('王小明')).toBe('王');
		expect(initials('山田 太郎')).toBe('山');
		expect(initials('김민수')).toBe('김');
		expect(initials('Ἀθηνᾶ Παλλάς')).toBe('ἈΠ');
	});

	it('is empty with nothing to go on', () => {
		expect(initials('')).toBe('');
		expect(initials('   ')).toBe('');
		expect(initials('— —')).toBe('');
	});
});

describe('Avatar', () => {
	it('is named by its name, with its status after it', () => {
		render(
			<>
				<Avatar name="Sam Smith" />
				<Avatar name="Alex Lee" status="away" />
				<Avatar name="Jo Bloggs" status="busy" statusLabel="in a meeting" />
			</>,
		);
		expect(screen.getByRole('img', { name: 'Sam Smith' }).textContent).toBe('SS');
		expect(screen.getByRole('img', { name: 'Alex Lee, away' })).toBeTruthy();
		expect(screen.getByRole('img', { name: 'Jo Bloggs, in a meeting' })).toBeTruthy();
	});

	it('gives a name the same tint every time', () => {
		expect(avatarTint('Sam Smith')).toBe(avatarTint(' sam smith '));
		expect(avatarTint('Sam Smith')).toMatch(/^var\(--color-/);
	});

	it('shows the initials until the image loads, and keeps them if it fails', () => {
		const { rerender } = render(<Avatar name="Sam Smith" src="/sam.jpg" />);
		const avatar = screen.getByRole('img', { name: 'Sam Smith' });
		const image = avatar.querySelector('img')!;
		expect(image.className).toContain('opacity-0');
		fireEvent.load(image);
		expect(image.className).toContain('opacity-100');

		rerender(<Avatar name="Sam Smith" src="/broken.jpg" />);
		fireEvent.error(avatar.querySelector('img')!);
		expect(avatar.querySelector('img')).toBeNull();
		expect(avatar.textContent).toBe('SS');

		rerender(<Avatar name="Sam Smith" src="/sam.jpg" />);
		expect(avatar.querySelector('img')).not.toBeNull();
	});
});

describe('AvatarGroup', () => {
	const people = ['Sam Smith', 'Alex Lee', 'Jo Bloggs', 'Ana Silva', 'Kai Chen', 'Lin Wu'];

	it('shows them all, named by who’s in it', () => {
		render(
			<AvatarGroup>
				{people.slice(0, 3).map((name) => (
					<Avatar key={name} name={name} />
				))}
			</AvatarGroup>,
		);
		const group = screen.getByRole('group', { name: 'Sam Smith, Alex Lee and Jo Bloggs' });
		expect(within(group).getAllByRole('img')).toHaveLength(3);
	});

	it('past its max, ends with a count of the rest', () => {
		render(
			<AvatarGroup max={4}>
				{people.map((name) => (
					<Avatar key={name} name={name} />
				))}
			</AvatarGroup>,
		);
		const group = screen.getByRole('group', { name: 'Sam Smith, Alex Lee, Jo Bloggs and 3 others' });
		const avatars = within(group).getAllByRole('img');
		expect(avatars).toHaveLength(4);
		expect(avatars.at(-1)!.textContent).toBe('+3');
		expect(avatars.at(-1)!.getAttribute('aria-label')).toBe('3 others');
	});

	it('shows everyone when they fit, and takes an aria-label', () => {
		render(
			<AvatarGroup max={3} aria-label="Who’s editing">
				{people.slice(0, 3).map((name) => (
					<Avatar key={name} name={name} />
				))}
			</AvatarGroup>,
		);
		const group = screen.getByRole('group', { name: 'Who’s editing' });
		expect(within(group).getAllByRole('img')).toHaveLength(3);
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<div>
				<Avatar name="Sam Smith" src="/sam.jpg" status="online" />
				<Avatar name="Parchment" shape="square" size={48} />
				<AvatarGroup max={3} size={24}>
					{people.map((name) => (
						<Avatar key={name} name={name} />
					))}
				</AvatarGroup>
			</div>,
		);
		await expectAccessible(container);
	});
});
