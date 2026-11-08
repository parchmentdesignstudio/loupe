import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComboBox, ListBoxItem, Select } from '../src/index.js';
import { expectAccessible } from './accessible.js';

const services = [
	{ id: 'identity', name: 'Brand identity' },
	{ id: 'website', name: 'Website' },
	{ id: 'type', name: 'Typeface' },
];

describe('Select', () => {
	it('opens its list and picks an option with the keyboard', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<Select label="Service" placeholder="Choose a service" items={services} onChange={onChange}>
				{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
			</Select>,
		);
		const button = screen.getByRole('button', { name: /Service/ });
		expect(button.textContent).toContain('Choose a service');
		await user.tab();
		await user.keyboard('{ArrowDown}');
		const listbox = await screen.findByRole('listbox');
		expect(within(listbox).getAllByRole('option')).toHaveLength(3);
		await user.keyboard('{ArrowDown}{Enter}');
		expect(onChange).toHaveBeenLastCalledWith('website');
		expect(button.textContent).toContain('Website');
	});

	it('shows its error to screen readers', () => {
		render(
			<Select label="Service" items={services} isInvalid errorMessage="Choose a service">
				{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
			</Select>,
		);
		expect(screen.getByText('Choose a service')).toBeTruthy();
	});
});

describe('ComboBox', () => {
	it('filters its options as you type', async () => {
		const user = userEvent.setup();
		render(
			<ComboBox label="Service" defaultItems={services}>
				{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
			</ComboBox>,
		);
		await user.type(screen.getByRole('combobox', { name: 'Service' }), 'type');
		const listbox = await screen.findByRole('listbox');
		expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['Typeface']);
	});
});

describe('Pickers', () => {
	it('have nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<Select label="Service" items={services} description="The main thing you need">
					{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
				</Select>
				<ComboBox label="Typeface" defaultItems={services}>
					{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
				</ComboBox>
			</>,
		);
		await expectAccessible(container);
	});
});
