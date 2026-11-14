import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, Meter, ProgressBar, ProgressCircle } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('ProgressBar', () => {
	it('shows how far along it is, as a percentage or a value of its own', () => {
		render(
			<>
				<ProgressBar label="Uploading artwork" value={45} />
				<ProgressBar label="Exporting icons" value={3} maxValue={8} valueLabel="3 of 8 files" />
			</>,
		);
		const [upload, exporting] = screen.getAllByRole('progressbar');
		expect(upload.getAttribute('aria-valuenow')).toBe('45');
		expect(screen.getByText('45%')).toBeTruthy();
		expect(exporting.getAttribute('aria-valuetext')).toBe('3 of 8 files');
		expect(screen.getByRole('progressbar', { name: 'Exporting icons' })).toBe(exporting);
	});

	it('has no value while there’s no telling', () => {
		render(<ProgressBar aria-label="Preparing" isIndeterminate />);
		const bar = screen.getByRole('progressbar', { name: 'Preparing' });
		expect(bar.hasAttribute('aria-valuenow')).toBe(false);
		expect(bar.textContent).toBe('');
	});

	it('spins in a pending button, which keeps its name and can’t be pressed', () => {
		render(
			<Button isPending onPress={() => {}}>
				Save changes
			</Button>,
		);
		const button = screen.getByRole('button', { name: /Save changes/ });
		expect(button.getAttribute('aria-disabled')).toBe('true');
		expect(button.querySelector('[role=progressbar]')).toBeTruthy();
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<ProgressBar label="Uploading artwork" value={45} />
				<ProgressBar aria-label="Uploading brief.pdf" isIndeterminate />
				<ProgressCircle aria-label="Loading" isIndeterminate />
				<ProgressCircle aria-label="Syncing" value={30} size="large" />
				<Meter label="Storage" value={7.2} maxValue={10} valueLabel="7.2 of 10 GB" />
				<Button isPending>Save changes</Button>
			</>,
		);
		await expectAccessible(container);
	});
});
