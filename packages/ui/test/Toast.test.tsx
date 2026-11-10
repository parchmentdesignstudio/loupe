import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastQueue, ToastRegion } from '../src/index.js';
import { expectAccessible } from './accessible.js';

afterEach(() => {
	vi.useRealTimers();
});

describe('Toast', () => {
	it('shows a toast with its description, and closes from its button', async () => {
		const user = userEvent.setup();
		const queue = new ToastQueue();
		render(<ToastRegion queue={queue} />);
		act(() => {
			queue.add({ title: 'Export ready', description: 'favicon.zip is in your downloads' });
		});
		const toast = screen.getByRole('alertdialog', { name: 'Export ready' });
		expect(toast.textContent).toContain('favicon.zip is in your downloads');
		await user.click(screen.getByRole('button', { name: /close/i }));
		// It stays a moment to animate away
		expect(toast.dataset.exiting).toBe('true');
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
	});

	it('closes itself after five seconds, even when asked for less', () => {
		vi.useFakeTimers();
		const queue = new ToastQueue();
		render(<ToastRegion queue={queue} />);
		act(() => {
			queue.add({ title: 'Link copied' }, { timeout: 1000 });
		});
		act(() => vi.advanceTimersByTime(4999));
		expect(screen.getByRole('alertdialog', { name: 'Link copied' }).dataset.exiting).toBeUndefined();
		act(() => vi.advanceTimersByTime(1));
		expect(screen.getByRole('alertdialog', { name: 'Link copied' }).dataset.exiting).toBe('true');
		act(() => vi.advanceTimersByTime(150));
		expect(screen.queryByRole('alertdialog')).toBeNull();
	});

	it('stays until it’s closed with a timeout of 0', () => {
		vi.useFakeTimers();
		const queue = new ToastQueue();
		render(<ToastRegion queue={queue} />);
		act(() => {
			queue.add({ title: 'Upload paused' }, { timeout: 0 });
		});
		act(() => vi.advanceTimersByTime(60_000));
		expect(screen.getByRole('alertdialog', { name: 'Upload paused' })).toBeTruthy();
	});

	it('shows three at a time, newest first', () => {
		const queue = new ToastQueue();
		render(<ToastRegion queue={queue} />);
		act(() => {
			for (const title of ['One', 'Two', 'Three', 'Four']) queue.add({ title });
		});
		expect(screen.getAllByRole('alertdialog').map((toast) => toast.textContent)).toEqual(['Four', 'Three', 'Two']);
	});

	it('has nothing for axe to flag', async () => {
		const queue = new ToastQueue();
		render(<ToastRegion queue={queue} />);
		act(() => {
			queue.add({ title: 'Export ready', description: 'favicon.zip is in your downloads' });
		});
		await expectAccessible(screen.getByRole('region'));
	});
});
