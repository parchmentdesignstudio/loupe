import { NavigationTree as UiNavigationTree, NavigationTreeHeader, NavigationTreeItem, NavigationTreeItemContent, NavigationTreeSection } from '../lib/NavigationTree.js';

const services = [
	{ id: 'identity', name: 'Brand identity' },
	{ id: 'website', name: 'Website' },
	{ id: 'design-system', name: 'Design system' },
	{ id: 'illustration', name: 'Illustration' },
];

export function NavigationTree({ heading = 'Services', current = 'website' }: { heading?: string; current?: 'identity' | 'website' | 'design-system' | 'illustration' }) {
	return (
		<UiNavigationTree aria-label={heading} selectedRoute={`#${current}`} className="w-60">
			<NavigationTreeSection id="services">
				<NavigationTreeHeader>{heading}</NavigationTreeHeader>
				{services.map((service) => (
					<NavigationTreeItem key={service.id} id={service.id} href={`#${service.id}`} textValue={service.name}>
						<NavigationTreeItemContent>{service.name}</NavigationTreeItemContent>
					</NavigationTreeItem>
				))}
			</NavigationTreeSection>
		</UiNavigationTree>
	);
}
