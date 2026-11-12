import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileList, FileListItem } from '../src/index.js';
import { expectAccessible } from './accessible.js';

describe('FileList', () => {
	it('shows each file’s name and size, in the locale’s units', () => {
		render(
			<FileList aria-label="Uploads">
				<FileListItem id="brief" name="brief.pdf" size={482_000} />
				<FileListItem id="photo" file={new File([new Uint8Array(2_400_000)], 'hero.jpg', { type: 'image/jpeg' })} />
			</FileList>,
		);
		const [brief, photo] = screen.getAllByRole('row');
		expect(within(brief).getByText('brief.pdf', { selector: '.sr-only' })).toBeTruthy();
		expect(within(brief).getByText('482 kB')).toBeTruthy();
		expect(within(photo).getByText('hero.jpg', { selector: '.sr-only' })).toBeTruthy();
		expect(within(photo).getByText('2.4 MB')).toBeTruthy();
	});

	it('renders nothing with no files', () => {
		const { container } = render(<FileList aria-label="Uploads" items={[]}>{() => <FileListItem name="never.pdf" />}</FileList>);
		expect(container.innerHTML).toBe('');
	});

	it('removes a file from its button, reached with the arrow keys', async () => {
		const user = userEvent.setup();
		const onRemove = vi.fn();
		render(
			<FileList aria-label="Uploads">
				<FileListItem id="brief" name="brief.pdf" size={482_000} onRemove={onRemove} />
			</FileList>,
		);
		await user.tab();
		await user.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove brief.pdf' }));
		await user.keyboard('{Enter}');
		expect(onRemove).toHaveBeenCalledOnce();
	});

	it('shows an upload’s progress', () => {
		render(
			<FileList aria-label="Uploads">
				<FileListItem id="brief" name="brief.pdf" status="uploading" progress={45} />
				<FileListItem id="fonts" name="fonts.zip" status="uploading" />
			</FileList>,
		);
		const bar = screen.getByRole('progressbar', { name: 'Uploading brief.pdf' });
		expect(bar.getAttribute('aria-valuenow')).toBe('45');
		expect(screen.getByRole('progressbar', { name: 'Uploading fonts.zip' }).hasAttribute('aria-valuenow')).toBe(false);
	});

	it('says why an upload failed, and tries again', async () => {
		const user = userEvent.setup();
		const onRetry = vi.fn();
		render(
			<FileList aria-label="Uploads">
				<FileListItem id="brief" name="brief.pdf" status="failed" errorMessage="The connection dropped" onRetry={onRetry} />
				<FileListItem id="photo" name="hero.jpg" status="done" />
			</FileList>,
		);
		expect(screen.getByText('The connection dropped')).toBeTruthy();
		await user.click(screen.getByRole('button', { name: 'Retry brief.pdf' }));
		expect(onRetry).toHaveBeenCalledOnce();
		expect(within(screen.getAllByRole('row')[1]).getByText('Uploaded')).toBeTruthy();
	});

	it('shows an image file’s own picture, and lets it go when the row goes', () => {
		const create = vi.fn(() => 'blob:hero');
		const revoke = vi.fn();
		Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
		const file = new File(['x'], 'hero.jpg', { type: 'image/jpeg' });
		const { container, unmount } = render(
			<FileList aria-label="Uploads">
				<FileListItem id="photo" file={file} />
			</FileList>,
		);
		expect(container.querySelector('img')?.getAttribute('src')).toBe('blob:hero');
		unmount();
		expect(revoke).toHaveBeenCalledWith('blob:hero');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<FileList aria-label="Uploads">
				<FileListItem id="listed" name="brief.pdf" size={482_000} onRemove={() => {}} />
				<FileListItem id="uploading" name="contract.docx" status="uploading" progress={45} onRemove={() => {}} />
				<FileListItem id="done" name="hero.jpg" thumbnail="data:image/gif;base64,R0lGODlhAQABAAAAACw=" status="done" onRemove={() => {}} />
				<FileListItem id="failed" name="fonts.zip" status="failed" errorMessage="It’s over the 20 MB limit" onRetry={() => {}} onRemove={() => {}} />
			</FileList>,
		);
		await expectAccessible(container);
	});
});
