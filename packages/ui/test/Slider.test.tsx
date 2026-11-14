import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('Slider', () => {
	it('moves with the arrow keys, within its limits, and shows its value', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Slider label="Padding" defaultValue={0.38} minValue={0} maxValue={0.4} step={0.01} formatOptions={{ style: 'percent' }} onChange={onChange} />);
		const slider = screen.getByRole('slider', { name: 'Padding' });
		expect(screen.getByText('38%')).toBeTruthy();
		await user.tab();
		expect(document.activeElement).toBe(slider);
		await user.keyboard('{ArrowRight}');
		expect(screen.getByText('39%')).toBeTruthy();
		await user.keyboard('{ArrowRight}{ArrowRight}');
		expect(screen.getByText('40%')).toBeTruthy();
		expect(onChange).toHaveBeenLastCalledWith(0.4);
		await user.keyboard('{Home}');
		expect(screen.getByText('0%')).toBeTruthy();
	});

	it('makes a range with a thumb for each end', async () => {
		const user = userEvent.setup();
		render(<Slider label="Budget" defaultValue={[5, 15]} minValue={0} maxValue={30} thumbLabels={['Minimum', 'Maximum']} />);
		const [minimum, maximum] = screen.getAllByRole('slider');
		expect(minimum.getAttribute('aria-label')).toBe('Minimum');
		expect(maximum.getAttribute('aria-label')).toBe('Maximum');
		expect(screen.getByText('5 – 15')).toBeTruthy();
		await user.tab();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByText('6 – 15')).toBeTruthy();
	});

	it('describes its thumb with its description', () => {
		render(<Slider label="Size" description="Of the layer, against the canvas" defaultValue={1} minValue={0.1} maxValue={1.5} step={0.01} />);
		const description = screen.getByText('Of the layer, against the canvas');
		expect(screen.getByRole('slider').getAttribute('aria-describedby')).toContain(description.id);
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<Slider label="Padding" defaultValue={0.12} minValue={0} maxValue={0.4} step={0.01} formatOptions={{ style: 'percent' }} />
				<Slider label="Budget" defaultValue={[5, 15]} minValue={0} maxValue={30} thumbLabels={['Minimum', 'Maximum']} />
				<Slider label="Size" defaultValue={1} isDisabled />
			</>,
		);
		await expectAccessible(container);
	});
});
