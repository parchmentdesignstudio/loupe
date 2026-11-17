import { Icon } from '@parchment/icons/react';
import type { ReactNode } from 'react';
import {
	Alert,
	Aside,
	Avatar,
	AvatarGroup,
	Button,
	Cell,
	Checkbox,
	Chip,
	Code,
	ColorField,
	ComboBox,
	Composer,
	DateField,
	DatePicker,
	Column,
	Disclosure,
	DisclosureGroup,
	DisclosureHeader,
	DisclosurePanel,
	DropZone,
	FileList,
	FileListItem,
	GridList,
	GridListItem,
	Keyboard,
	Link,
	ListBoxItem,
	NumberField,
	Pagination,
	ProgressCircle,
	Quote,
	Radio,
	RadioGroup,
	Row,
	SearchField,
	Select,
	Slider,
	Status,
	Swatch,
	Switch,
	Tab,
	TabList,
	Table,
	TableBody,
	TableHeader,
	Tabs,
	Tag,
	TagGroup,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
} from '../src/index.js';
import { photo } from './playgrounds/avatar.js';

type Sample = (props: Record<string, unknown>) => ReactNode;

const people = [
	{ name: 'Doris Hart', src: photo },
	{ name: 'Sam Okafor' },
	{ name: 'Ada Lin' },
];

// A small table, for the props that change how a table or its columns sit
const table = ({ table: own, column, cell }: { table?: Record<string, unknown>; column?: Record<string, unknown>; cell?: Record<string, unknown> }) => (
	<Table aria-label="Invoices" className="w-64" {...own}>
		<TableHeader>
			<Column id="client" isRowHeader>
				Client
			</Column>
			<Column id="total" {...column}>
				Total
			</Column>
		</TableHeader>
		<TableBody>
			<Row id="halcyon">
				<Cell>Halcyon</Cell>
				<Cell {...cell}>£1,240</Cell>
			</Row>
			<Row id="fernway">
				<Cell>Fernway</Cell>
				<Cell {...cell}>£86</Cell>
			</Row>
		</TableBody>
	</Table>
);

// Two tabs, for the tokens on a tab and on the row that holds them
const tabs = (props: Record<string, unknown>) => (
	<Tabs defaultSelectedKey="overview">
		<TabList aria-label="Project" {...props}>
			<Tab id="overview">Overview</Tab>
			<Tab id="activity">Activity</Tab>
		</TabList>
	</Tabs>
);

/**
 * Each component drawn with some of its props, by its name, so the API reference can preview an option on hover, as
 * Button's variant set to ghost. Small, and as it would be used, so one option reads against another. A component that
 * only shows in place, such as a modal or a menu's item, has none
 */
export const samples: Partial<Record<string, Sample>> = {
	Alert: (props) => (
		<Alert title="Your card expires soon" className="w-64" {...props}>
			Update it by 31 December
		</Alert>
	),
	Aside: (props) => (
		<Aside className="w-64" {...props}>
			I assume you’re comfortable setting up Tailwind
		</Aside>
	),
	Avatar: (props) => <Avatar name={people[0].name} src={people[0].src} {...props} />,
	AvatarGroup: (props) => (
		<AvatarGroup {...props}>
			{people.map((person) => (
				<Avatar key={person.name} name={person.name} src={person.src} />
			))}
		</AvatarGroup>
	),
	Button: (props) => <Button {...props}>New project</Button>,
	Cell: (props) => table({ column: props, cell: props }),
	Checkbox: (props) => (
		<Checkbox defaultSelected {...props}>
			Email me a receipt
		</Checkbox>
	),
	Chip: (props) => <Chip {...props}>Sounds good</Chip>,
	Code: (props) => <Code code="pnpm add shiki" isCopyable={false} className="w-56" {...props} />,
	ColorField: (props) => <ColorField label="Accent" defaultValue="#c76024" className="w-40" {...props} />,
	Column: (props) => table({ column: props, cell: props }),
	ComboBox: (props) => (
		<ComboBox label="Country" placeholder="Pick one" className="w-48" {...props}>
			<ListBoxItem id="nz">New Zealand</ListBoxItem>
			<ListBoxItem id="uk">United Kingdom</ListBoxItem>
		</ComboBox>
	),
	Composer: (props) => <Composer aria-label="Message" placeholder="Write a reply" submitLabel="Send" submitIcon={<Icon name="arrow-up" />} onSubmit={() => {}} className="w-72" {...props} />,
	DateField: (props) => <DateField label="Due" className="w-40" {...props} />,
	DatePicker: (props) => <DatePicker label="Due" className="w-48" {...props} />,
	Disclosure: (props) => (
		<Disclosure className="w-56" defaultExpanded {...props}>
			<DisclosureHeader>Delivery</DisclosureHeader>
			<DisclosurePanel>Sent within two working days</DisclosurePanel>
		</Disclosure>
	),
	DisclosureGroup: (props) => (
		<DisclosureGroup className="w-56" defaultExpandedKeys={['delivery']} {...props}>
			<Disclosure id="delivery">
				<DisclosureHeader>Delivery</DisclosureHeader>
				<DisclosurePanel>Sent within two working days</DisclosurePanel>
			</Disclosure>
			<Disclosure id="returns">
				<DisclosureHeader>Returns</DisclosureHeader>
				<DisclosurePanel>Free for 30 days</DisclosurePanel>
			</Disclosure>
		</DisclosureGroup>
	),
	DropZone: (props) => <DropZone label="Drop files here" className="w-56" {...props} />,
	FileListItem: (props) => (
		<FileList aria-label="Uploads" className="w-64">
			<FileListItem id="brief" name="brief.pdf" size={482_000} progress={45} errorMessage="The connection dropped" {...props} />
		</FileList>
	),
	GridList: (props) => (
		<GridList aria-label="Projects" selectionMode="single" defaultSelectedKeys={['parchment']} className="w-56" {...props}>
			<GridListItem id="parchment">Parchment</GridListItem>
			<GridListItem id="loupe">Loupe</GridListItem>
			<GridListItem id="iamsteve">iamsteve</GridListItem>
		</GridList>
	),
	Keyboard: (props) => <Keyboard {...props}>⌘K</Keyboard>,
	Link: (props) => (
		<Link href="#" {...props}>
			Read the guide
		</Link>
	),
	NumberField: (props) => <NumberField label="Guests" defaultValue={2} className="w-40" {...props} />,
	Pagination: (props) => <Pagination page={2} count={5} onChange={() => {}} {...props} />,
	ProgressCircle: (props) => <ProgressCircle aria-label="Uploading" value={64} {...props} />,
	Quote: (props) => (
		<Quote cite={people[0].name} detail="Founder, Rothbury" avatar={people[0].src} className="w-72" {...props}>
			It turned out we needed a better way to answer the phone
		</Quote>
	),
	Radio: (props) => (
		<RadioGroup aria-label="Delivery" defaultValue="standard">
			<Radio value="standard" {...props}>
				Standard
			</Radio>
		</RadioGroup>
	),
	SearchField: (props) => <SearchField aria-label="Search" placeholder="Search projects" className="w-48" {...props} />,
	Select: (props) => (
		<Select label="Plan" defaultSelectedKey="studio" className="w-48" {...props}>
			<ListBoxItem id="solo">Solo</ListBoxItem>
			<ListBoxItem id="studio">Studio</ListBoxItem>
		</Select>
	),
	Slider: (props) => <Slider label="Volume" defaultValue={60} className="w-40" {...props} />,
	Status: (props) => <Status {...props}>In review</Status>,
	Swatch: (props) => <Swatch color="var(--color-primary)" {...props} />,
	Switch: (props) => (
		<Switch defaultSelected {...props}>
			Notifications
		</Switch>
	),
	Tab: (props) => tabs(props),
	TabList: (props) => tabs(props),
	Table: (props) => table({ table: props }),
	Tag: (props) => (
		<TagGroup aria-label="Topics" selectionMode="single" defaultSelectedKeys={['design']}>
			<Tag id="design" {...props}>
				Design
			</Tag>
			<Tag id="code" {...props}>
				Code
			</Tag>
		</TagGroup>
	),
	TextField: (props) => <TextField label="Project name" placeholder="New project" className="w-48" {...props} />,
	ToggleButtonGroup: (props) => (
		<ToggleButtonGroup aria-label="View" defaultSelectedKeys={['grid']} {...props}>
			<ToggleButton id="grid">Grid</ToggleButton>
			<ToggleButton id="list">List</ToggleButton>
		</ToggleButtonGroup>
	),
	Toolbar: (props) => (
		<Toolbar aria-label="Edit" {...props}>
			<Button variant="ghost">Cut</Button>
			<Button variant="ghost">Copy</Button>
			<Button variant="ghost">Paste</Button>
		</Toolbar>
	),
};
