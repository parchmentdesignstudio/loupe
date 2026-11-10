import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, DropZone, FileTrigger, isFileDropItem } from '../src/index.js';
import { expectAccessible } from './accessible.js';

// jsdom has no DataTransfer, so a drag carries this stand-in, shaped as React Aria reads it
function dataTransferWith(file: File) {
	return { types: ['Files'], items: [{ kind: 'file', type: file.type, getAsFile: () => file }], effectAllowed: 'all', dropEffect: 'none', getData: () => '' };
}

describe('DropZone', () => {
	it('shows it takes files as they’re dragged over, and hands them over on the drop', async () => {
		const onDrop = vi.fn();
		const { container } = render(<DropZone label="Drop artwork" onDrop={onDrop} />);
		const zone = container.firstElementChild as HTMLElement;
		const dataTransfer = dataTransferWith(new File(['<svg/>'], 'mark.svg', { type: 'image/svg+xml' }));
		fireEvent.dragEnter(zone, { dataTransfer });
		expect(zone.hasAttribute('data-drop-target')).toBe(true);
		fireEvent.drop(zone, { dataTransfer });
		expect(zone.hasAttribute('data-drop-target')).toBe(false);
		const [{ items }] = onDrop.mock.calls[0];
		const files = items.filter(isFileDropItem);
		expect(files.map((item: { name: string }) => item.name)).toEqual(['mark.svg']);
		expect((await files[0].getFile()).name).toBe('mark.svg');
	});

	it('labels its drop button, so files can be pasted onto it from the keyboard', () => {
		render(<DropZone label="Drop artwork" />);
		expect(screen.getByRole('button', { name: /Drop artwork/ })).toBeTruthy();
	});

	it('opens the file picker from a FileTrigger inside, and hands over what’s chosen', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const { container } = render(
			<DropZone label="Drop artwork">
				<FileTrigger acceptedFileTypes={['image/svg+xml']} onSelect={onSelect}>
					<Button variant="plain">Choose files</Button>
				</FileTrigger>
			</DropZone>,
		);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		expect(input.accept).toBe('image/svg+xml');
		const click = vi.spyOn(input, 'click');
		await user.click(screen.getByRole('button', { name: 'Choose files' }));
		expect(click).toHaveBeenCalled();
		fireEvent.change(input, { target: { files: [new File(['<svg/>'], 'mark.svg', { type: 'image/svg+xml' })] } });
		expect(onSelect.mock.calls[0][0][0].name).toBe('mark.svg');
	});

	it('has nothing for axe to flag', async () => {
		const { container } = render(
			<>
				<DropZone label="Drop artwork">
					<FileTrigger>
						<Button variant="plain">Choose files</Button>
					</FileTrigger>
				</DropZone>
				<DropZone variant="quiet" aria-label="Drop artwork onto the canvas">
					<p>The canvas</p>
				</DropZone>
			</>,
		);
		await expectAccessible(container);
	});
});
