import { Tab, TabList, TabPanel, Tabs as UiTabs } from '../lib/Tabs.js';

export function Tabs({ first = 'Overview', second = 'Activity', third = 'Settings', selected = 'first', body = 'The project at a glance.' }: { first?: string; second?: string; third?: string; selected?: 'first' | 'second' | 'third'; body?: string }) {
	return (
		<UiTabs selectedKey={selected} className="w-80">
			<TabList aria-label="Project">
				<Tab id="first">{first}</Tab>
				<Tab id="second">{second}</Tab>
				<Tab id="third">{third}</Tab>
			</TabList>
			<TabPanel id={selected}>{body}</TabPanel>
		</UiTabs>
	);
}
