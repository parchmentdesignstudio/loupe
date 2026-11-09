import { type ReactNode, useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import {
	Button,
	Checkbox,
	CheckboxGroup,
	Chip,
	ChipGroup,
	ComboBox,
	Composer,
	Dialog,
	DialogActions,
	DialogClose,
	DialogHeading,
	DialogTrigger,
	Header,
	Link,
	ListBoxItem,
	ListBoxSection,
	Menu,
	MenuItem,
	MenuSection,
	MenuSeparator,
	MenuTrigger,
	Modal,
	NavigationTree,
	NavigationTreeHeader,
	NavigationTreeItem,
	NavigationTreeItemContent,
	NavigationTreeSection,
	Popover,
	Radio,
	RadioGroup,
	Select,
	Sheet,
	SheetTrigger,
	Switch,
	TextField,
	Tooltip,
	TooltipTrigger,
} from '../src/index.js';

export interface Story {
	name: string;
	render: () => ReactNode;
}

export interface Entry {
	/** The page’s address, as in #/text-field */
	id: string;
	name: string;
	description: ReactNode;
	exports: string[];
	stories: Story[];
}

export interface Group {
	name: string;
	components: Entry[];
}

const services = [
	{ id: 'identity', name: 'Brand identity' },
	{ id: 'website', name: 'Website' },
	{ id: 'design-system', name: 'Design system' },
	{ id: 'illustration', name: 'Illustration' },
];

const typefaces = ['Field Gothic', 'Fraunces', 'IBM Plex Sans', 'Instrument Serif', 'Literata', 'Newsreader', 'Nimbus Sans', 'Public Sans', 'Source Serif 4', 'Work Sans'].map((name) => ({ id: name, name }));

const ArrowUp = () => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-none stroke-current stroke-[1.5]">
		<path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

function Sending() {
	const [sent, setSent] = useState<string[]>([]);
	return (
		<>
			<Composer label="Your message" placeholder="Tell me what you’re working on" submitIcon={<ArrowUp />} onSubmit={(message) => setSent((list) => [...list, message])} className="w-full" />
			{sent.length > 0 && <p className="font-mono text-label">Sent: {sent.join(', ')}</p>}
		</>
	);
}

// The router keeps each click inside the story, moving the current page rather than leaving the preview
function CurrentPage() {
	const [route, setRoute] = useState('#website');
	return (
		<RouterProvider navigate={(href) => setRoute(href)}>
			<NavigationTree aria-label="Services" selectedRoute={route} className="w-60">
				<NavigationTreeSection id="services">
					<NavigationTreeHeader>Services</NavigationTreeHeader>
					{services.map((service) => (
						<NavigationTreeItem key={service.id} id={service.id} href={`#${service.id}`} textValue={service.name}>
							<NavigationTreeItemContent>{service.name}</NavigationTreeItemContent>
						</NavigationTreeItem>
					))}
				</NavigationTreeSection>
			</NavigationTree>
		</RouterProvider>
	);
}

export const library: Group[] = [
	{
		name: 'Actions',
		components: [
			{
				id: 'button',
				name: 'Button',
				description: 'Any action, as solid, plain or quiet, and a circle for an icon',
				exports: ['Button'],
				stories: [
					{
						name: 'Solid, plain and quiet',
						render: () => (
							<>
								<Button>Schedule call</Button>
								<Button variant="plain">Send an email</Button>
								<Button variant="quiet">Not now</Button>
							</>
						),
					},
					{
						name: 'Circle',
						render: () => (
							<>
								<Button variant="plain" shape="circle" aria-label="Send">
									<ArrowUp />
								</Button>
								<Button shape="circle" size="small" aria-label="Send">
									<ArrowUp />
								</Button>
								<Button variant="quiet" shape="circle" size="small" aria-label="Send">
									<ArrowUp />
								</Button>
							</>
						),
					},
					{ name: 'Disabled', render: () => <Button isDisabled>Disabled</Button> },
				],
			},
			{
				id: 'chip',
				name: 'Chip',
				description: 'Suggestions to tap',
				exports: ['Chip', 'ChipGroup'],
				stories: [
					{
						name: 'In a group',
						render: () => (
							<ChipGroup aria-label="Or start with">
								<Chip>A new website</Chip>
								<Chip>Rework my site</Chip>
								<Chip>Not sure yet</Chip>
							</ChipGroup>
						),
					},
				],
			},
		],
	},
	{
		name: 'Fields',
		components: [
			{
				id: 'text-field',
				name: 'Text field',
				description: (
					<>
						Text, or several lines with <code className="font-mono text-label">multiline</code>
					</>
				),
				exports: ['TextField'],
				stories: [
					{ name: 'With a description', render: () => <TextField label="Your name" placeholder="Sam Smith" description="As you’d like Steve to say it" className="w-full" /> },
					{ name: 'Invalid', render: () => <TextField label="Email" defaultValue="sam@" isInvalid errorMessage="Enter an email address" className="w-full" /> },
					{ name: 'Multiline', render: () => <TextField label="What are you working on?" placeholder="A few lines is plenty" multiline className="w-full" /> },
				],
			},
			{
				id: 'composer',
				name: 'Composer',
				description: 'A message field with its send button',
				exports: ['Composer'],
				stories: [{ name: 'Sending', render: Sending }],
			},
		],
	},
	{
		name: 'Choices',
		components: [
			{
				id: 'checkbox',
				name: 'Checkbox',
				description: 'Ticking any number of options',
				exports: ['Checkbox', 'CheckboxGroup'],
				stories: [
					{
						name: 'In a group',
						render: () => (
							<CheckboxGroup label="What do you need?" defaultValue={['website']}>
								{services.map((service) => (
									<Checkbox key={service.id} value={service.id}>
										{service.name}
									</Checkbox>
								))}
							</CheckboxGroup>
						),
					},
					{ name: 'Indeterminate', render: () => <Checkbox isIndeterminate>All services</Checkbox> },
					{ name: 'Invalid', render: () => <Checkbox isInvalid>I’ve read the terms</Checkbox> },
				],
			},
			{
				id: 'radio-group',
				name: 'Radio group',
				description: 'Choosing one option',
				exports: ['RadioGroup', 'Radio'],
				stories: [
					{
						name: 'With a disabled option',
						render: () => (
							<RadioGroup label="Budget" defaultValue="mid">
								<Radio value="small">Under £5k</Radio>
								<Radio value="mid">£5–15k</Radio>
								<Radio value="large">Over £15k</Radio>
								<Radio value="unsure" isDisabled>
									Not sure yet
								</Radio>
							</RadioGroup>
						),
					},
				],
			},
			{
				id: 'switch',
				name: 'Switch',
				description: 'A setting that takes effect straight away',
				exports: ['Switch'],
				stories: [
					{ name: 'On', render: () => <Switch defaultSelected>Send me the newsletter</Switch> },
					{ name: 'Disabled', render: () => <Switch isDisabled>Disabled</Switch> },
				],
			},
		],
	},
	{
		name: 'Pickers',
		components: [
			{
				id: 'select',
				name: 'Select',
				description: 'Choosing one option from a list that opens',
				exports: ['Select', 'ListBoxItem', 'ListBoxSection'],
				stories: [
					{
						name: 'Options',
						render: () => (
							<Select label="Service" placeholder="Choose a service" items={services} className="w-full">
								{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
							</Select>
						),
					},
					{
						name: 'Under headings',
						render: () => (
							<Select label="Timing" placeholder="When do you want to start?" className="w-full">
								<ListBoxSection>
									<Header>Soon</Header>
									<ListBoxItem id="now">Straight away</ListBoxItem>
									<ListBoxItem id="month">Within a month</ListBoxItem>
								</ListBoxSection>
								<ListBoxSection>
									<Header>Later</Header>
									<ListBoxItem id="quarter">Next quarter</ListBoxItem>
									<ListBoxItem id="unsure">Not sure yet</ListBoxItem>
								</ListBoxSection>
							</Select>
						),
					},
				],
			},
			{
				id: 'combo-box',
				name: 'Combo box',
				description: 'Typing to filter a list of options',
				exports: ['ComboBox', 'ListBoxItem'],
				stories: [
					{
						name: 'Filtering',
						render: () => (
							<ComboBox label="Typeface" placeholder="Search typefaces" defaultItems={typefaces} className="w-full">
								{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
							</ComboBox>
						),
					},
				],
			},
		],
	},
	{
		name: 'Overlays',
		components: [
			{
				id: 'dialog',
				name: 'Dialog',
				description: 'A dialog over the page',
				exports: ['DialogTrigger', 'Modal', 'Dialog', 'DialogHeading', 'DialogActions', 'DialogClose'],
				stories: [
					{
						name: 'Modal',
						render: () => (
							<DialogTrigger>
								<Button variant="plain">Rename project</Button>
								<Modal>
									<Dialog>
										<DialogHeading>Rename project</DialogHeading>
										<DialogClose />
										<TextField label="Name" defaultValue="Loupe" autoFocus className="mt-4" />
										<DialogActions>
											<Button slot="close" variant="plain">
												Cancel
											</Button>
											<Button slot="close">Save</Button>
										</DialogActions>
									</Dialog>
								</Modal>
							</DialogTrigger>
						),
					},
				],
			},
			{
				id: 'sheet',
				name: 'Sheet',
				description: 'A panel that slides in from an edge of the screen, and swipes back out',
				exports: ['SheetTrigger', 'Sheet'],
				stories: [
					{
						name: 'From the bottom',
						render: () => (
							<SheetTrigger>
								<Button variant="plain">Rename project</Button>
								<Sheet>
									<DialogHeading>Rename project</DialogHeading>
									<DialogClose />
									<TextField label="Name" defaultValue="Loupe" autoFocus className="mt-4" />
									<DialogActions>
										<Button slot="close" variant="plain">
											Cancel
										</Button>
										<Button slot="close">Save</Button>
									</DialogActions>
								</Sheet>
							</SheetTrigger>
						),
					},
					{
						name: 'From the start edge',
						render: () => (
							<SheetTrigger>
								<Button variant="plain">Share</Button>
								<Sheet position="start">
									<DialogHeading className="text-body">Share link</DialogHeading>
									<DialogClose />
									<p className="mt-1 text-label text-muted">Anyone with the link can view this project.</p>
								</Sheet>
							</SheetTrigger>
						),
					},
				],
			},
			{
				id: 'popover',
				name: 'Popover',
				description: 'A dialog beside what opened it',
				exports: ['DialogTrigger', 'Popover', 'Dialog', 'DialogHeading'],
				stories: [
					{
						name: 'With an arrow',
						render: () => (
							<DialogTrigger>
								<Button variant="plain">Share</Button>
								<Popover showArrow className="w-64">
									<Dialog>
										<DialogHeading className="text-body">Share link</DialogHeading>
										<p className="mt-1 text-label text-muted">Anyone with the link can view this project.</p>
									</Dialog>
								</Popover>
							</DialogTrigger>
						),
					},
				],
			},
			{
				id: 'menu',
				name: 'Menu',
				description: 'Actions in a list that opens',
				exports: ['MenuTrigger', 'Menu', 'MenuItem', 'MenuSection', 'MenuSeparator'],
				stories: [
					{
						name: 'Actions',
						render: () => (
							<MenuTrigger>
								<Button variant="plain">Project</Button>
								<Menu>
									<MenuSection>
										<Header>Project</Header>
										<MenuItem>Rename</MenuItem>
										<MenuItem>Duplicate</MenuItem>
										<MenuItem isDisabled>Move</MenuItem>
									</MenuSection>
									<MenuSeparator />
									<MenuItem variant="danger">Delete</MenuItem>
								</Menu>
							</MenuTrigger>
						),
					},
					{
						name: 'Single selection',
						render: () => (
							<MenuTrigger>
								<Button variant="quiet">Sort by</Button>
								<Menu selectionMode="single" defaultSelectedKeys={['updated']}>
									<MenuItem id="name">Name</MenuItem>
									<MenuItem id="updated">Last updated</MenuItem>
									<MenuItem id="created">Created</MenuItem>
								</Menu>
							</MenuTrigger>
						),
					},
				],
			},
			{
				id: 'tooltip',
				name: 'Tooltip',
				description: 'A short label for a control, on hover and keyboard focus',
				exports: ['TooltipTrigger', 'Tooltip'],
				stories: [
					{
						name: 'On a circle button',
						render: () => (
							<TooltipTrigger delay={300}>
								<Button variant="plain" shape="circle" aria-label="Send">
									<ArrowUp />
								</Button>
								<Tooltip>Send message</Tooltip>
							</TooltipTrigger>
						),
					},
				],
			},
		],
	},
	{
		name: 'Navigation',
		components: [
			{
				id: 'navigation',
				name: 'Navigation',
				description: 'A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones. This sidebar is one, so narrow the window to see its sheet',
				exports: ['Navigation'],
				stories: [],
			},
			{
				id: 'link',
				name: 'Link',
				description: 'A link to another page, or a place on this one',
				exports: ['Link'],
				stories: [
					{
						name: 'In a sentence',
						render: () => (
							<p>
								Anyone with the <Link href="#/link">link</Link> can view this project.
							</p>
						),
					},
					{
						name: 'Current page',
						render: () =>
							services.map((service) => (
								<Link key={service.id} href="#/link" aria-current={service.id === 'website' ? 'page' : undefined}>
									{service.name}
								</Link>
							)),
					},
					{
						name: 'Disabled',
						render: () => (
							<Link href="#/link" isDisabled>
								Disabled
							</Link>
						),
					},
				],
			},
			{
				id: 'navigation-tree',
				name: 'Navigation tree',
				description: 'Links to the pages of a site or tool, in sections, with the current page marked',
				exports: ['NavigationTree', 'NavigationTreeSection', 'NavigationTreeHeader', 'NavigationTreeItem', 'NavigationTreeItemContent'],
				stories: [{ name: 'Current page', render: CurrentPage }],
			},
		],
	},
];
