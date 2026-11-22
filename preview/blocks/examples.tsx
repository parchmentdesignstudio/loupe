import type { ReactNode } from 'react';
import { parseDate } from '@internationalized/date';
import { Menu as MenuList } from 'react-aria-components';
import { Icon } from '@parchment/icons/react';
import {
	Avatar,
	AvatarGroup,
	Breadcrumb,
	Breadcrumbs,
	Button,
	Calendar,
	Cell,
	Checkbox,
	Chip,
	ChipGroup,
	ColorArea,
	ColorField,
	ColorPicker,
	ColorSlider,
	ColorSwatchPicker,
	ColorSwatchPickerItem,
	Column,
	ComboBox,
	Composer,
	Message,
	MessageList,
	Suggestion,
	Suggestions,
	TextEffect,
	DateField,
	DatePicker,
	Dialog,
	DialogActions,
	DialogHeading,
	Disclosure,
	DisclosureGroup,
	DisclosureHeader,
	DisclosurePanel,
	DropZone,
	Card,
	EmptyState,
	List,
	ListItem,
	FileTrigger,
	GridList,
	GridListItem,
	Keyboard,
	Link,
	ListBoxItem,
	MenuItem,
	MenuSeparator,
	NavigationTree,
	NavigationTreeItem,
	NavigationTreeItemContent,
	NumberField,
	Pagination,
	ProgressBar,
	Radio,
	RadioGroup,
	Row,
	SearchField,
	Select,
	Slider,
	Status,
	Switch,
	Tab,
	TabList,
	TabPanel,
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
	popover,
} from '../../src/index.js';

// Each component small enough for a card's image area. They're drawn live but sit in an inert box, so nothing in them
// needs to work. The tall ones are scaled down to fit, and the overlays are drawn open, in place, with their own surfaces

/** Something taller than the image area, drawn smaller. It keeps its own size for layout, so the area centres it */
const Shrink = ({ by, children }: { by: number; children: ReactNode }) => (
	<div style={{ scale: by }} className="shrink-0">
		{children}
	</div>
);

const day = parseDate('2026-11-14');

// The library's own overlay surfaces, drawn where they'd float, as the overlays themselves only open from a trigger
const tooltip = 'rounded-lg bg-inverse px-2.5 py-1.5 text-label text-paper';
const toast = 'flex w-64 items-start gap-3 rounded-lg bg-inverse py-3 pr-2 pl-4 text-paper shadow-overlay';

export const examples: Record<string, () => ReactNode> = {
	// Foundations
	Colour: () => (
		<div className="flex gap-1.5">
			{['#0c2920', '#f5c03c', '#f68543', '#eea3a3', '#516426', '#bdd6d6'].map((color) => (
				<span key={color} style={{ background: color }} className="size-8 rounded-md inset-ring inset-ring-bleed/8" />
			))}
		</div>
	),
	Typography: () => (
		<span className="flex items-baseline gap-3">
			{/* loupe-lint-ignore: a specimen, set larger than any text in use */}
			<span className="text-[3.5rem] leading-none font-medium">Aa</span>
			<span className="font-mono text-title text-muted">Aa</span>
		</span>
	),

	// Actions
	Button: () => <Button variant="primary" start={<Icon name="plus" />}>New project</Button>,
	Chip: () => (
		<ChipGroup aria-label="Start with" className="flex flex-wrap justify-center gap-2">
			<Chip>A logo</Chip>
			<Chip>A website</Chip>
		</ChipGroup>
	),
	'File trigger': () => (
		<FileTrigger>
			<Button variant="secondary" start={<Icon name="paperclip" />}>
				Attach files
			</Button>
		</FileTrigger>
	),
	Keyboard: () => (
		<span className="flex items-center gap-2 text-muted">
			Search <Keyboard>⌘K</Keyboard>
		</span>
	),
	'Toggle button group': () => (
		<ToggleButtonGroup aria-label="Alignment" defaultSelectedKeys={['left']}>
			<ToggleButton id="left" aria-label="Left">
				<Icon name="text-alignleft" />
			</ToggleButton>
			<ToggleButton id="centre" aria-label="Centre">
				<Icon name="text-aligncenter" />
			</ToggleButton>
			<ToggleButton id="right" aria-label="Right">
				<Icon name="text-alignright" />
			</ToggleButton>
		</ToggleButtonGroup>
	),
	Toolbar: () => (
		<Toolbar aria-label="Tools">
			<Button variant="ghost" size="small" aria-label="Select">
				<Icon name="cursorarrow" />
			</Button>
			<Button variant="ghost" size="small" aria-label="Draw">
				<Icon name="scribble" />
			</Button>
			<Button variant="ghost" size="small" aria-label="Frame">
				<Icon name="frame" />
			</Button>
			<Button variant="ghost" size="small" aria-label="Text">
				<Icon name="font" />
			</Button>
		</Toolbar>
	),

	// Forms
	Calendar: () => (
		<Shrink by={0.6}>
			<Calendar aria-label="Date" defaultValue={day} />
		</Shrink>
	),
	Checkbox: () => (
		<div className="flex flex-col gap-1">
			<Checkbox defaultSelected>Send me updates</Checkbox>
			<Checkbox>Keep me signed in</Checkbox>
		</div>
	),
	'Colour area': () => (
		<ColorArea aria-label="Colour" defaultValue="hsb(150, 70%, 50%)" xChannel="saturation" yChannel="brightness" className="w-32" />
	),
	'Colour field': () => <ColorField label="Theme colour" defaultValue="oklch(27% 0.04 168)" className="w-56" />,
	'Colour picker': () => <ColorPicker label="Background" defaultValue="#f5c03c" className="w-48" />,
	'Colour slider': () => <ColorSlider label="Hue" defaultValue="hsl(150, 70%, 40%)" channel="hue" className="w-48" />,
	'Colour swatch picker': () => (
		<ColorSwatchPicker aria-label="Swatches" defaultValue="#f5c03c">
			{['#0c2920', '#f5c03c', '#f68543', '#eea3a3', '#516426'].map((color) => (
				<ColorSwatchPickerItem key={color} color={color} />
			))}
		</ColorSwatchPicker>
	),
	'Combo box': () => (
		<ComboBox label="Typeface" defaultInputValue="Literata" className="w-48">
			<ListBoxItem id="literata">Literata</ListBoxItem>
		</ComboBox>
	),
	Composer: () => <Composer aria-label="Your message" submitIcon={<Icon name="arrow-up" />} onSubmit={() => {}} className="w-56" />,
	Message: () => (
		<MessageList aria-label="Conversation" className="w-56">
			<Message from="user">What can I make with leeks?</Message>
			<Message from="assistant">A leek and potato soup, in about 40 minutes</Message>
		</MessageList>
	),
	Suggestions: () => (
		<Suggestions aria-label="Suggested questions" className="w-56">
			<Suggestion>What’s in season now?</Suggestion>
			<Suggestion>Plan a week of lunches</Suggestion>
		</Suggestions>
	),
	'Text effect': () => (
		<TextEffect variant="ray" loop className="text-title">
			Thinking
		</TextEffect>
	),
	'Date field': () => <DateField label="Deadline" defaultValue={day} />,
	'Date picker': () => <DatePicker label="Launch date" defaultValue={day} />,
	'Drop zone': () => (
		<DropZone label="Drop files to upload" className="w-56">
			<Button variant="secondary" size="small">
				Choose files
			</Button>
		</DropZone>
	),
	'Number field': () => <NumberField label="Columns" defaultValue={12} className="w-32" />,
	'Radio group': () => (
		<RadioGroup label="Plan" defaultValue="monthly">
			<Radio value="monthly">Monthly</Radio>
			<Radio value="yearly">Yearly</Radio>
		</RadioGroup>
	),
	'Search field': () => <SearchField aria-label="Search" placeholder="Search typefaces" className="w-52" />,
	Select: () => (
		<Select label="Service" defaultSelectedKey="website" className="w-48">
			<ListBoxItem id="website">Website</ListBoxItem>
		</Select>
	),
	Slider: () => <Slider label="Opacity" defaultValue={64} formatOptions={{ style: 'percent', maximumFractionDigits: 0 }} maxValue={100} className="w-48" />,
	Switch: () => <Switch defaultSelected>Notifications</Switch>,
	'Text field': () => <TextField label="Name" defaultValue="Loupe" className="w-48" />,

	// Data
	Avatar: () => (
		<AvatarGroup size={48}>
			<Avatar name="Doris Hart" />
			<Avatar name="Ade Okafor" />
			<Avatar name="Mia Chen" />
		</AvatarGroup>
	),
	'Grid list': () => (
		<GridList aria-label="Projects" selectionMode="single" defaultSelectedKeys={['parchment']} className="w-52">
			<GridListItem id="parchment" textValue="Parchment">
				Parchment
			</GridListItem>
			<GridListItem id="loupe" textValue="Loupe">
				Loupe
			</GridListItem>
		</GridList>
	),
	Table: () => (
		<Shrink by={0.8}>
			<Table aria-label="Invoices" className="w-64">
				<TableHeader>
					<Column isRowHeader>Client</Column>
					<Column>Due</Column>
				</TableHeader>
				<TableBody>
					<Row>
						<Cell>Fern & Co</Cell>
						<Cell>12 Dec</Cell>
					</Row>
					<Row>
						<Cell>Northlight</Cell>
						<Cell>19 Dec</Cell>
					</Row>
				</TableBody>
			</Table>
		</Shrink>
	),
	'Tag group': () => (
		<TagGroup aria-label="Typefaces" className="w-56">
			<Tag>Fraunces</Tag>
			<Tag>Literata</Tag>
			<Tag>Work Sans</Tag>
		</TagGroup>
	),

	List: () => (
		<List className="w-48">
			<ListItem end="£144.00">Team plan</ListItem>
			<ListItem end="£12.00">Next invoice</ListItem>
			<ListItem end="1 Dec">Renews</ListItem>
		</List>
	),
	Card: () => (
		<Shrink by={0.8}>
			<Card title="Team" actions={<Button variant="secondary">Start trial</Button>} className="w-44">
				<p className="text-title">£12</p>
			</Card>
		</Shrink>
	),

	// Feedback
	'Empty state': () => (
		<Shrink by={0.8}>
			<EmptyState icon={<Icon name="square-on-square" />} title="No projects yet" />
		</Shrink>
	),
	'Progress bar': () => <ProgressBar label="Uploading" value={64} className="w-48" />,
	Status: () => (
		<div className="flex flex-col items-start gap-2">
			<Status tone="success">Paid</Status>
			<Status tone="warning">Due soon</Status>
		</div>
	),
	Toast: () => (
		<div className={toast}>
			<span className="flex-1 text-body font-medium">Project saved</span>
		</div>
	),

	// Overlays
	Dialog: () => (
		<Shrink by={0.75}>
			<Dialog aria-label="Rename project" className={popover({ className: 'w-64 p-4' })}>
				<DialogHeading>Rename project</DialogHeading>
				<DialogActions>
					<Button variant="secondary">Cancel</Button>
					<Button variant="primary">Save</Button>
				</DialogActions>
			</Dialog>
		</Shrink>
	),
	Menu: () => (
		// The library's Menu sits in its own popover, which only opens from a trigger, so the list is drawn in a surface of its own
		<div className={popover({ className: 'w-44' })}>
			<MenuList aria-label="Project" className="p-1 outline-0">
				<MenuItem>Rename</MenuItem>
				<MenuItem>Duplicate</MenuItem>
				<MenuSeparator />
				<MenuItem variant="danger">Delete</MenuItem>
			</MenuList>
		</div>
	),
	Popover: () => (
		<div className="flex flex-col items-center gap-2">
			<div className={popover({ className: 'px-4 py-3 text-label' })}>Anyone with the link can view</div>
			<Button variant="secondary" size="small">
				Share
			</Button>
		</div>
	),
	'Preview trigger': () => (
		<div className="flex flex-col items-center gap-2">
			<div className={popover({ className: 'flex size-16 items-center justify-center' })}>
				<Avatar name="Doris Hart" size={48} />
			</div>
			<Link href="#">Doris</Link>
		</div>
	),
	Drawer: () => (
		<div className="flex h-28 w-48 flex-col justify-end overflow-hidden rounded-lg bg-bleed/8">
			<div className={popover({ className: 'rounded-b-none px-4 pt-2 pb-4' })}>
				<div className="mx-auto mb-3 h-1 w-8 rounded-full bg-bleed/16" />
				<p className="text-label font-medium">Share project</p>
			</div>
		</div>
	),
	Tooltip: () => (
		<div className="flex flex-col items-center gap-2">
			<span className={tooltip}>
				Send message <Keyboard variant="plain" className="ms-2">↵</Keyboard>
			</span>
			<Button variant="secondary" shape="full" aria-label="Send">
				<Icon name="arrow-up" />
			</Button>
		</div>
	),

	// Navigation
	Breadcrumbs: () => (
		<Breadcrumbs className="w-56 flex-none">
			<Breadcrumb href="#">Projects</Breadcrumb>
			<Breadcrumb href="#">Parchment</Breadcrumb>
			<Breadcrumb>Brand</Breadcrumb>
		</Breadcrumbs>
	),
	Disclosure: () => (
		<DisclosureGroup defaultExpandedKeys={['scope']} className="w-56">
			<Disclosure id="scope">
				<DisclosureHeader>What’s included</DisclosureHeader>
				<DisclosurePanel>Design, build and a month of changes</DisclosurePanel>
			</Disclosure>
			<Disclosure id="time">
				<DisclosureHeader>How long it takes</DisclosureHeader>
				<DisclosurePanel>Six weeks</DisclosurePanel>
			</Disclosure>
		</DisclosureGroup>
	),
	Link: () => (
		<p className="max-w-52 text-center text-muted">
			Read the <Link href="#">brief</Link> before the call
		</p>
	),
	Navigation: () => (
		<div className="flex h-36 w-52 overflow-hidden rounded-lg bg-bleed/4 p-2">
			<NavTree />
		</div>
	),
	'Navigation tree': () => (
		<div className="w-48">
			<NavTree />
		</div>
	),
	Pagination: () => (
		<Shrink by={0.8}>
			<Pagination page={2} count={8} onChange={() => {}} />
		</Shrink>
	),
	Tabs: () => (
		<Tabs defaultSelectedKey="overview" className="w-56">
			<TabList aria-label="Project">
				<Tab id="overview">Overview</Tab>
				<Tab id="files">Files</Tab>
			</TabList>
			<TabPanel id="overview" className="pt-3 text-label text-muted">
				Six weeks, from brief to launch
			</TabPanel>
			<TabPanel id="files" />
		</Tabs>
	),
};

function NavTree() {
	return (
		<NavigationTree aria-label="Pages" selectedRoute="#website">
			{['Brand identity', 'Website', 'Design system'].map((name) => {
				const id = name.toLowerCase().replace(' ', '-');
				return (
					<NavigationTreeItem key={id} id={id} href={`#${id}`} textValue={name}>
						<NavigationTreeItemContent>{name}</NavigationTreeItemContent>
					</NavigationTreeItem>
				);
			})}
		</NavigationTree>
	);
}
