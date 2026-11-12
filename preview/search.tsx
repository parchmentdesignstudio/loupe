import { useEffect } from 'react';
import { Autocomplete, useFilter } from 'react-aria-components';
import { Icon } from '@parchment/icons/react';
import { Button, Dialog, ListBox, ListBoxItem, Modal, SearchField } from '../src/index.js';
import { href } from './routes.js';
import { areas, blocks, library } from './stories.js';

const pages = [
	{ id: '#/ui', name: 'All components', group: 'Loupe' },
	...areas.map((area) => ({ id: href(area), name: area.name, group: 'Loupe' })),
	...blocks.map((entry) => ({ id: href(entry), name: entry.name, group: 'Blocks' })),
	...library.flatMap((group) => group.components.map((entry) => ({ id: href(entry), name: entry.name, group: group.name }))),
];

/** Opens the search, with a press or ⌘K */
export function SearchButton({ onPress }: { onPress: () => void }) {
	return (
		<Button variant="ghost" shape="circle" size="small" aria-label="Search" onPress={onPress}>
			<Icon name="magnifyingglass" />
		</Button>
	);
}

/** Finds a page by name: type to narrow the list, the arrow keys to move through it, and Enter to go */
export function Search({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }) {
	const { contains } = useFilter({ sensitivity: 'base' });

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				onOpenChange(true);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onOpenChange]);

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="items-start pt-[12vh]">
			<Dialog aria-label="Search" className="flex max-h-[min(28rem,70vh)] flex-col gap-2 p-3">
				{({ close }) => (
					<Autocomplete filter={contains}>
						<SearchField aria-label="Search" placeholder="Search components" autoFocus />
						<ListBox
							aria-label="Pages"
							items={pages}
							onAction={(id) => {
								window.location.hash = String(id);
								close();
							}}
							renderEmptyState={() => <p className="px-3 py-1.5 text-control text-muted">Nothing called that</p>}
							className="-mx-1 -mb-1 min-h-0 flex-1"
						>
							{(page) => (
								<ListBoxItem id={page.id} textValue={page.name}>
									{page.name}
									<span className="ms-auto text-label text-muted">{page.group}</span>
								</ListBoxItem>
							)}
						</ListBox>
					</Autocomplete>
				)}
			</Dialog>
		</Modal>
	);
}
