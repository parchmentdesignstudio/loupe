import { ListBoxItem } from '../lib/ListBox.js';
import { Select as UiSelect } from '../lib/Select.js';

const services = [
	{ id: 'identity', name: 'Brand identity' },
	{ id: 'website', name: 'Website' },
	{ id: 'design-system', name: 'Design system' },
	{ id: 'illustration', name: 'Illustration' },
];

export function Select({ label = 'Service', placeholder = 'Choose a service', selected = '', isDisabled = false }: { label?: string; placeholder?: string; selected?: '' | 'identity' | 'website' | 'design-system' | 'illustration'; isDisabled?: boolean }) {
	return (
		<UiSelect label={label} placeholder={placeholder} items={services} selectedKey={selected || null} isDisabled={isDisabled} className="w-72">
			{(item) => <ListBoxItem>{item.name}</ListBoxItem>}
		</UiSelect>
	);
}
