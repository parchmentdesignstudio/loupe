import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NumberField } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('NumberField', () => {
	it('steps with the arrow keys and its buttons, within its limits', async () => {
		const user = userEvent.setup();
		render(<NumberField label="Width" defaultValue={10} maxValue={12} />);
		// The steppers are labelled with the field's label too, so pick out the input
		const field = screen.getAllByLabelText('Width').find((element) => element instanceof HTMLInputElement) as HTMLInputElement;
		await user.click(field);
		await user.keyboard('{ArrowUp}');
		expect(field.value).toBe('11');
		const increase = screen.getByRole('button', { name: /increase/i });
		await user.click(increase);
		expect(field.value).toBe('12');
		await user.click(increase);
		expect(field.value).toBe('12');
		await user.click(screen.getByRole('button', { name: /decrease/i }));
		expect(field.value).toBe('11');
	});

	it('shows a percentage from formatOptions', () => {
		render(<NumberField label="Opacity" defaultValue={0.8} formatOptions={{ style: 'percent' }} />);
		expect((screen.getAllByLabelText('Opacity').find((element) => element instanceof HTMLInputElement) as HTMLInputElement).value).toBe('80%');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(<NumberField label="Width" description="In pixels" defaultValue={1440} />);
		await expectAccessible(container);
	});
});
