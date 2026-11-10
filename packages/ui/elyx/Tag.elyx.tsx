import { Tag as UiTag, TagGroup } from '../lib/TagGroup.js';

const names = ['Fraunces', 'Literata', 'Newsreader', 'Work Sans'];

export function Tags({ label = 'Typefaces to compare', description = '', count = 4 }: { label?: string; description?: string; count?: number }) {
	return (
		<TagGroup label={label} description={description || undefined} items={names.slice(0, count).map((name) => ({ id: name, name }))}>
			{(item) => <UiTag>{item.name}</UiTag>}
		</TagGroup>
	);
}
