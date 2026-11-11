import { type ReactNode, useState } from 'react';
import { RouterProvider, parseColor } from 'react-aria-components';
import { Icon } from '@parchment/icons/react';
import {
	Button,
	Checkbox,
	CheckboxGroup,
	Chip,
	ChipGroup,
	ColorArea,
	ColorField,
	ColorPicker,
	ColorSlider,
	ColorSwatch,
	ColorSwatchPicker,
	ColorSwatchPickerItem,
	ComboBox,
	Composer,
	Dialog,
	DialogActions,
	DialogClose,
	DialogHeading,
	DialogTrigger,
	Disclosure,
	DisclosureGroup,
	DisclosureHeader,
	DisclosurePanel,
	DropZone,
	FileTrigger,
	GridList,
	GridListHeader,
	GridListItem,
	GridListSection,
	Header,
	Keyboard,
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
	NumberField,
	Popover,
	Radio,
	RadioGroup,
	SearchField,
	Select,
	Separator,
	Sheet,
	SheetTrigger,
	Slider,
	Switch,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Tag,
	TagGroup,
	TextField,
	ToastQueue,
	ToastRegion,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
	TooltipTrigger,
	isFileDropItem,
} from '../src/index.js';
import { ParchmentLogo } from './logo.js';

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

// Tools, history and zoom, as in the device tool's toolbar
function Editing({ className }: { className?: string }) {
	const [zoom, setZoom] = useState(100);
	return (
		<Toolbar aria-label="Editing" className={className}>
			<ToggleButtonGroup aria-label="Tool" defaultSelectedKeys={['select']}>
				<TooltipTrigger delay={300}>
					<ToggleButton id="select" aria-label="Select">
						<Icon name="cursorarrow" />
					</ToggleButton>
					<Tooltip>
						Select
						<Keyboard>V</Keyboard>
					</Tooltip>
				</TooltipTrigger>
				<TooltipTrigger delay={300}>
					<ToggleButton id="pan" aria-label="Pan">
						<Icon name="arrow-up-and-down-and-arrow-left-and-right" />
					</ToggleButton>
					<Tooltip>
						Pan
						<Keyboard>H</Keyboard>
					</Tooltip>
				</TooltipTrigger>
			</ToggleButtonGroup>
			<Separator />
			<TooltipTrigger delay={300}>
				<Button variant="quiet" shape="circle" aria-label="Undo">
					<Icon name="arrow-uturn-left" />
				</Button>
				<Tooltip>
					Undo
					<Keyboard>⌘Z</Keyboard>
				</Tooltip>
			</TooltipTrigger>
			<TooltipTrigger delay={300}>
				<Button variant="quiet" shape="circle" aria-label="Redo">
					<Icon name="arrow-uturn-right" />
				</Button>
				<Tooltip>
					Redo
					<Keyboard>⇧⌘Z</Keyboard>
				</Tooltip>
			</TooltipTrigger>
			<Separator />
			<MenuTrigger>
				<Button variant="quiet" aria-label={`Zoom, ${zoom}%`}>
					<span className="tabular-nums">{zoom}%</span>
				</Button>
				<Menu placement="bottom" onAction={(key) => setZoom(key === 'fit' ? 64 : Number(key))}>
					<MenuItem id="fit" textValue="Zoom to fit">
						Zoom to fit
						<Keyboard>⇧1</Keyboard>
					</MenuItem>
					<MenuSeparator />
					<MenuItem id="50">50%</MenuItem>
					<MenuItem id="100" textValue="100%">
						100%
						<Keyboard>⇧0</Keyboard>
					</MenuItem>
					<MenuItem id="200">200%</MenuItem>
				</Menu>
			</MenuTrigger>
		</Toolbar>
	);
}

function EditMenu() {
	return (
		<MenuTrigger>
			<Button variant="plain">Edit</Button>
			<Menu>
				<MenuItem textValue="Undo">
					Undo
					<Keyboard>⌘Z</Keyboard>
				</MenuItem>
				<MenuItem textValue="Redo">
					Redo
					<Keyboard>⇧⌘Z</Keyboard>
				</MenuItem>
				<MenuSeparator />
				<MenuItem textValue="Cut">
					Cut
					<Keyboard>⌘X</Keyboard>
				</MenuItem>
				<MenuItem textValue="Copy">
					Copy
					<Keyboard>⌘C</Keyboard>
				</MenuItem>
				<MenuItem textValue="Paste">
					Paste
					<Keyboard>⌘V</Keyboard>
				</MenuItem>
			</Menu>
		</MenuTrigger>
	);
}

function Sending() {
	const [sent, setSent] = useState<string[]>([]);
	return (
		<>
			<Composer label="Your message" placeholder="Tell me what you’re working on" submitIcon={<Icon name="arrow-up" />} onSubmit={(message) => setSent((list) => [...list, message])} className="w-full" />
			{sent.length > 0 && <p className="font-mono text-label">Sent: {sent.join(', ')}</p>}
		</>
	);
}

function FindingTypefaces() {
	const [search, setSearch] = useState('');
	const found = typefaces.filter((typeface) => typeface.name.toLowerCase().includes(search.trim().toLowerCase()));
	return (
		<div className="flex w-full flex-col gap-4">
			<SearchField label="Typeface" placeholder="Search typefaces" value={search} onChange={setSearch} />
			{found.length > 0 ? (
				<ul aria-label="Typefaces found" className="grid grid-cols-2 gap-x-6 gap-y-1.5">
					{found.map((typeface) => (
						<li key={typeface.id}>{typeface.name}</li>
					))}
				</ul>
			) : (
				<p className="text-muted">No typeface matches “{search.trim()}”</p>
			)}
		</div>
	);
}

// One queue for the preview, so its toasts stack in one place
const toasts = new ToastQueue();

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

const projects = [
	{ id: 'parchment', name: 'Parchment', detail: 'Studio site' },
	{ id: 'loupe', name: 'Loupe', detail: 'Icons and components' },
	{ id: 'favicon', name: 'Favicon', detail: 'A tool' },
];

const outputs = [
	{
		id: 'browser',
		name: 'Browser',
		items: [
			{ id: 'favicon-16', name: 'Favicon', size: '16 × 16' },
			{ id: 'favicon-32', name: 'Favicon', size: '32 × 32' },
		],
	},
	{
		id: 'home-screen',
		name: 'Home screen',
		items: [
			{ id: 'apple-touch', name: 'Apple touch icon', size: '180 × 180' },
			{ id: 'android', name: 'Android', size: '192 × 192' },
			{ id: 'android-large', name: 'Android', size: '512 × 512' },
		],
	},
];

const artwork = ['favicon.svg', 'favicon-16.svg', 'apple-touch-icon.png', 'og-image.png'].map((name) => ({ id: name, name }));

const icons = [
	{ id: 'favicon-16', name: 'Favicon', size: '16 × 16', preview: 'size-8', mark: 16 },
	{ id: 'favicon-32', name: 'Favicon', size: '32 × 32', preview: 'size-12', mark: 16 },
	{ id: 'apple-touch', name: 'Apple touch icon', size: '180 × 180', preview: 'size-24', mark: 24 },
	{ id: 'android', name: 'Android', size: '512 × 512', preview: 'size-32', mark: 24 },
] as const;

// The mark on paper, as a tile's preview
const Preview = () => (
	<span aria-hidden="true" className="flex aspect-square items-center justify-center bg-paper">
		<ParchmentLogo size={24} />
	</span>
);

function RemovingTags() {
	const [names, setNames] = useState(['Fraunces', 'Literata', 'Newsreader', 'Work Sans']);
	return (
		<TagGroup
			label="Typefaces to compare"
			description="Remove one with its cross, or with Backspace"
			items={names.map((name) => ({ id: name, name }))}
			onRemove={(keys) => setNames((list) => list.filter((name) => !keys.has(name)))}
			renderEmptyState={() => 'None left to compare'}
		>
			{(item) => <Tag>{item.name}</Tag>}
		</TagGroup>
	);
}

function DroppingFiles() {
	const [names, setNames] = useState<string[]>([]);
	return (
		<DropZone
			label="Drop an SVG or a large PNG"
			onDrop={(event) => setNames(event.items.filter(isFileDropItem).map((item) => item.name))}
			className="w-full"
		>
			<FileTrigger acceptedFileTypes={['image/svg+xml', 'image/png']} allowsMultiple onSelect={(files) => setNames([...(files ?? [])].map((file) => file.name))}>
				<Button variant="plain" size="small">
					Choose files
				</Button>
			</FileTrigger>
			{names.length > 0 && <p className="font-mono text-ink">{names.join(', ')}</p>}
		</DropZone>
	);
}

function DroppingQuietly() {
	const [names, setNames] = useState<string[]>([]);
	return (
		<DropZone
			variant="quiet"
			aria-label="Drop artwork"
			onDrop={(event) => setNames(event.items.filter(isFileDropItem).map((item) => item.name))}
			className="flex min-h-40 w-full flex-col items-center justify-center gap-1 p-6 text-center"
		>
			<p className="font-medium">A panel that takes files</p>
			<p className="text-label text-muted">{names.length > 0 ? names.join(', ') : 'Drag a file over it, and an outline shows it’ll take it'}</p>
		</DropZone>
	);
}

function ChoosingFiles() {
	const [names, setNames] = useState<string[]>([]);
	return (
		<>
			<FileTrigger acceptedFileTypes={['image/svg+xml', 'image/png']} allowsMultiple onSelect={(files) => setNames([...(files ?? [])].map((file) => file.name))}>
				<Button variant="plain">Choose artwork</Button>
			</FileTrigger>
			<p className="font-mono text-label text-muted">{names.length > 0 ? names.join(', ') : 'Nothing chosen yet'}</p>
		</>
	);
}

// Parchment’s cream, blush, lime and rust, then muted and ink
const palette = ['#fffdf8', '#f5ebe6', '#ceeea7', '#c76024', '#566861', '#0c2920'];

// An artboard’s fills, as the device tool offers them: none, white, greys, cream and ink
const fills = ['#0000', '#ffffff', '#f4f5f1', '#dfe2da', '#fbf6ef', '#1f2f31'];

// One colour shared by the area and the slider, so moving the hue recolours the area
function AreaAndHue() {
	const [color, setColor] = useState(() => parseColor('#c76024').toFormat('hsb'));
	return (
		<div className="flex w-56 flex-col gap-3">
			<ColorArea aria-label="Colour" value={color} onChange={setColor} xChannel="saturation" yChannel="brightness" />
			<ColorSlider value={color} onChange={setColor} channel="hue" />
		</div>
	);
}

export const library: Group[] = [
	{
		name: 'Actions',
		components: [
			{
				id: 'button',
				name: 'Button',
				description: 'Any action, as solid in the accent, void in ink, plain or quiet, and a circle for an icon',
				exports: ['Button'],
				stories: [
					{
						name: 'Solid, void, plain and quiet',
						render: () => (
							<>
								<Button>Schedule call</Button>
								<Button variant="void">Book a visit</Button>
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
									<Icon name="arrow-up" />
								</Button>
								<Button shape="circle" size="small" aria-label="Send">
									<Icon name="arrow-up" />
								</Button>
								<Button variant="quiet" shape="circle" size="small" aria-label="Send">
									<Icon name="arrow-up" />
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
			{
				id: 'toolbar',
				name: 'Toolbar',
				description: 'Controls in a row, such as an editor’s tools. It’s one Tab stop, with the arrow keys between its controls, and a Separator stands upright in it',
				exports: ['Toolbar', 'Separator'],
				stories: [
					{ name: 'Tools, history and zoom', render: () => <Editing /> },
					{ name: 'Floating', render: () => <Editing className="rounded-xl bg-overlay p-1 shadow-floating [--bleed:var(--overlay-bleed)]" /> },
					{
						name: 'In a column',
						render: () => (
							<Toolbar aria-label="Tools" orientation="vertical" className="rounded-xl bg-overlay p-1 shadow-floating [--bleed:var(--overlay-bleed)]">
								<Button variant="quiet" shape="circle" aria-label="Select">
									<Icon name="cursorarrow" />
								</Button>
								<Button variant="quiet" shape="circle" aria-label="Pan">
									<Icon name="arrow-up-and-down-and-arrow-left-and-right" />
								</Button>
								<Separator />
								<Button variant="quiet" shape="circle" aria-label="Undo">
									<Icon name="arrow-uturn-left" />
								</Button>
								<Button variant="quiet" shape="circle" aria-label="Redo">
									<Icon name="arrow-uturn-right" />
								</Button>
							</Toolbar>
						),
					},
				],
			},
			{
				id: 'keyboard',
				name: 'Keyboard',
				description: 'A keyboard shortcut, in a sentence, a tooltip or at the end of a menu item',
				exports: ['Keyboard'],
				stories: [
					{
						name: 'In a sentence',
						render: () => (
							<p>
								Hold <Keyboard>Space</Keyboard> and drag to move around the canvas.
							</p>
						),
					},
					{
						name: 'In a tooltip',
						render: () => (
							<TooltipTrigger delay={300}>
								<Button variant="plain" shape="circle" aria-label="Undo">
									<Icon name="arrow-uturn-left" />
								</Button>
								<Tooltip>
									Undo
									<Keyboard>⌘Z</Keyboard>
								</Tooltip>
							</TooltipTrigger>
						),
					},
					{ name: 'In a menu', render: EditMenu },
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
				id: 'number-field',
				name: 'Number field',
				description: 'A number, typed or stepped with the arrow keys and its buttons',
				exports: ['NumberField'],
				stories: [
					{
						name: 'Within limits',
						render: () => <NumberField label="Width" description="In pixels, from 320 to 3840" defaultValue={1440} minValue={320} maxValue={3840} step={10} formatOptions={{ useGrouping: false }} className="w-56" />,
					},
					{
						name: 'As a percentage',
						render: () => <NumberField label="Opacity" defaultValue={0.8} minValue={0} maxValue={1} step={0.05} formatOptions={{ style: 'percent' }} className="w-56" />,
					},
				],
			},
			{
				id: 'search-field',
				name: 'Search field',
				description: 'Searching, with a button that clears what’s typed. Escape clears it too',
				exports: ['SearchField'],
				stories: [
					{ name: 'Without a label', render: () => <SearchField aria-label="Search projects" placeholder="Search projects" className="w-64" /> },
					{ name: 'Filtering a list', render: FindingTypefaces },
				],
			},
			{
				id: 'slider',
				name: 'Slider',
				description: 'A number between two limits, dragged or moved with the arrow keys. Two values make a range',
				exports: ['Slider'],
				stories: [
					{
						name: 'As a percentage',
						render: () => <Slider label="Padding" defaultValue={0.12} minValue={0} maxValue={0.4} step={0.01} formatOptions={{ style: 'percent' }} className="w-64" />,
					},
					{
						name: 'A range',
						render: () => (
							<Slider
								label="Budget"
								defaultValue={[5000, 15000]}
								minValue={0}
								maxValue={30000}
								step={500}
								thumbLabels={['Minimum', 'Maximum']}
								formatOptions={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
								className="w-64"
							/>
						),
					},
					{
						name: 'Vertical',
						render: () => <Slider label="Size" orientation="vertical" defaultValue={1} minValue={0.1} maxValue={1.5} step={0.01} formatOptions={{ style: 'percent' }} className="h-48" />,
					},
					{
						name: 'Disabled',
						render: () => <Slider label="Size" defaultValue={1} minValue={0.1} maxValue={1.5} step={0.01} formatOptions={{ style: 'percent' }} isDisabled className="w-64" />,
					},
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
			{
				id: 'toggle-button-group',
				name: 'Toggle button group',
				description: 'A few options side by side, as a segmented control. A fill slides to the one you choose',
				exports: ['ToggleButtonGroup', 'ToggleButton'],
				stories: [
					{
						name: 'One choice',
						render: () => (
							<ToggleButtonGroup aria-label="View" defaultSelectedKeys={['week']}>
								<ToggleButton id="day">Day</ToggleButton>
								<ToggleButton id="week">Week</ToggleButton>
								<ToggleButton id="month">Month</ToggleButton>
							</ToggleButtonGroup>
						),
					},
					{
						name: 'Small',
						render: () => (
							<ToggleButtonGroup aria-label="Device" size="small" defaultSelectedKeys={['phone']}>
								<ToggleButton id="phone">Phone</ToggleButton>
								<ToggleButton id="tablet">Tablet</ToggleButton>
								<ToggleButton id="desktop">Desktop</ToggleButton>
							</ToggleButtonGroup>
						),
					},
					{
						name: 'Several at once',
						render: () => (
							<ToggleButtonGroup aria-label="Show" selectionMode="multiple" defaultSelectedKeys={['grid']}>
								<ToggleButton id="grid">Grid</ToggleButton>
								<ToggleButton id="rulers">Rulers</ToggleButton>
								<ToggleButton id="guides">Guides</ToggleButton>
							</ToggleButtonGroup>
						),
					},
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
		name: 'Colour',
		components: [
			{
				id: 'color-picker',
				name: 'Colour picker',
				description: 'A colour, shown as a swatch and its hex, that opens an area, a hue slider and a hex field',
				exports: ['ColorPicker'],
				stories: [
					{
						name: 'Side by side',
						render: () => (
							<div className="grid w-full max-w-sm grid-cols-2 gap-2.5">
								<ColorPicker label="Background" defaultValue="#fffdf8" />
								<ColorPicker label="Theme" defaultValue="#0c2920" />
							</div>
						),
					},
				],
			},
			{
				id: 'color-swatch-picker',
				name: 'Colour swatch picker',
				description: 'A colour picked from a few set ones',
				exports: ['ColorSwatchPicker', 'ColorSwatchPickerItem', 'ColorSwatch'],
				stories: [
					{
						name: 'Parchment’s palette',
						render: () => (
							<ColorSwatchPicker aria-label="Colour" defaultValue="#c76024">
								{palette.map((color) => (
									<ColorSwatchPickerItem key={color} color={color} />
								))}
							</ColorSwatchPicker>
						),
					},
					{
						name: 'With none',
						render: () => (
							<ColorSwatchPicker aria-label="Fill" defaultValue="#0000">
								{fills.map((color) => (
									<ColorSwatchPickerItem key={color} color={color} />
								))}
							</ColorSwatchPicker>
						),
					},
					{
						name: 'A swatch on its own',
						render: () => palette.map((color) => <ColorSwatch key={color} color={color} />),
					},
				],
			},
			{
				id: 'color-area',
				name: 'Colour area',
				description: 'Two channels of a colour at once, such as saturation across and brightness up',
				exports: ['ColorArea'],
				stories: [{ name: 'With a hue slider', render: AreaAndHue }],
			},
			{
				id: 'color-slider',
				name: 'Colour slider',
				description: 'One channel of a colour along a track, such as its hue or opacity',
				exports: ['ColorSlider'],
				stories: [
					{ name: 'Hue', render: () => <ColorSlider colorSpace="hsb" channel="hue" defaultValue="#c76024" className="w-64" /> },
					{ name: 'Opacity', render: () => <ColorSlider label="Opacity" channel="alpha" defaultValue="#0c2920" className="w-64" /> },
				],
			},
			{
				id: 'color-field',
				name: 'Colour field',
				description: 'A colour typed as its hex',
				exports: ['ColorField'],
				stories: [{ name: 'Hex', render: () => <ColorField label="Theme colour" description="Browsers tint their toolbar with it" defaultValue="#0c2920" className="w-56" /> }],
			},
		],
	},
	{
		name: 'Collections',
		components: [
			{
				id: 'grid-list',
				name: 'Grid list',
				description: 'Items to choose or act on, as rows or as tiles, which can hold buttons of their own',
				exports: ['GridList', 'GridListItem', 'GridListSection', 'GridListHeader'],
				stories: [
					{
						name: 'Rows',
						render: () => (
							<GridList aria-label="Projects" items={projects} selectionMode="single" defaultSelectedKeys={['parchment']} className="w-full max-w-sm">
								{(project) => (
									<GridListItem textValue={project.name}>
										<span className="flex min-w-0 flex-1 flex-col">
											<span className="font-medium">{project.name}</span>
											<span className="text-label text-muted">{project.detail}</span>
										</span>
										<Button variant="quiet" size="small">
											Open
										</Button>
									</GridListItem>
								)}
							</GridList>
						),
					},
					{
						name: 'Tiles, under headings',
						render: () => (
							<GridList aria-label="Outputs" layout="grid" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['apple-touch']} className="w-full">
								{outputs.map((group) => (
									<GridListSection key={group.id} id={group.id}>
										<GridListHeader>{group.name}</GridListHeader>
										{group.items.map((output) => (
											<GridListItem key={output.id} id={output.id} textValue={`${output.name}, ${output.size}`}>
												<Preview />
												<span className="flex flex-col">
													<span className="font-medium">{output.name}</span>
													<span className="font-mono text-label text-muted">{output.size}</span>
												</span>
											</GridListItem>
										))}
									</GridListSection>
								))}
							</GridList>
						),
					},
					{
						name: 'Several at once',
						render: () => (
							<GridList aria-label="Artwork to export" layout="grid" items={artwork} selectionMode="multiple" defaultSelectedKeys={['favicon.svg', 'og-image.png']} className="w-full">
								{(file) => (
									<GridListItem textValue={file.name}>
										<Preview />
										<span className="truncate font-mono text-label">{file.name}</span>
									</GridListItem>
								)}
							</GridList>
						),
					},
					{
						name: 'Mixed sizes, in a row that wraps',
						render: () => (
							<GridList aria-label="Icons" layout="grid" items={icons} selectionMode="single" disallowEmptySelection defaultSelectedKeys={['apple-touch']} className="flex w-full flex-wrap items-end">
								{(icon) => (
									<GridListItem textValue={`${icon.name}, ${icon.size}`}>
										<span aria-hidden="true" className={`flex items-center justify-center bg-paper ${icon.preview}`}>
											<ParchmentLogo size={icon.mark} />
										</span>
										<span className="font-mono text-label text-muted">{icon.size}</span>
									</GridListItem>
								)}
							</GridList>
						),
					},
				],
			},
			{
				id: 'tag-group',
				name: 'Tag group',
				description: 'Short labels to choose from or remove, such as sizes or filters',
				exports: ['TagGroup', 'Tag'],
				stories: [
					{
						name: 'Choosing',
						render: () => (
							<TagGroup label="Sizes" selectionMode="multiple" defaultSelectedKeys={['32', '180']}>
								{['16', '32', '48', '180', '192', '512'].map((size) => (
									<Tag key={size} id={size} className="font-mono">
										{size}
									</Tag>
								))}
							</TagGroup>
						),
					},
					{ name: 'Removing', render: RemovingTags },
				],
			},
		],
	},
	{
		name: 'Files',
		components: [
			{
				id: 'drop-zone',
				name: 'Drop zone',
				description: 'Somewhere to drop files, or paste them, with a file trigger to choose them instead',
				exports: ['DropZone', 'FileTrigger', 'isFileDropItem'],
				stories: [
					{ name: 'Dashed', render: DroppingFiles },
					{ name: 'Quiet, for a panel', render: DroppingQuietly },
				],
			},
			{
				id: 'file-trigger',
				name: 'File trigger',
				description: 'Opens the file picker from the button inside it',
				exports: ['FileTrigger'],
				stories: [{ name: 'Choosing artwork', render: ChoosingFiles }],
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
						name: 'Beside its button',
						render: () => (
							<DialogTrigger>
								<Button variant="plain">Share</Button>
								<Popover className="w-64">
									<Dialog>
										<DialogHeading className="text-body">Share link</DialogHeading>
										<p className="mt-1 text-label text-muted">Anyone with the link can view this project.</p>
									</Dialog>
								</Popover>
							</DialogTrigger>
						),
					},
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
					{ name: 'With shortcuts', render: EditMenu },
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
									<Icon name="arrow-up" />
								</Button>
								<Tooltip>Send message</Tooltip>
							</TooltipTrigger>
						),
					},
					{
						name: 'With an arrow',
						render: () => (
							<TooltipTrigger delay={300}>
								<Button variant="plain" shape="circle" aria-label="Send">
									<Icon name="arrow-up" />
								</Button>
								<Tooltip showArrow>Send message</Tooltip>
							</TooltipTrigger>
						),
					},
				],
			},
			{
				id: 'toast',
				name: 'Toast',
				description: 'A short message at the bottom of the screen, such as an export finishing, that closes itself',
				exports: ['ToastQueue', 'ToastRegion', 'Toast'],
				stories: [
					{
						name: 'With a title',
						render: () => (
							<>
								<Button variant="plain" onPress={() => toasts.add({ title: 'Link copied' })}>
									Copy link
								</Button>
								<ToastRegion queue={toasts} />
							</>
						),
					},
					{
						name: 'With a description',
						render: () => (
							<Button variant="plain" onPress={() => toasts.add({ title: 'Export ready', description: 'favicon.zip is in your downloads, with all 16 files.' })}>
								Export
							</Button>
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
			{
				id: 'disclosure',
				name: 'Disclosure',
				description: 'A heading that shows or hides what’s under it',
				exports: ['DisclosureGroup', 'Disclosure', 'DisclosureHeader', 'DisclosurePanel'],
				stories: [
					{
						name: 'Medium, in a group',
						render: () => (
							<DisclosureGroup defaultExpandedKeys={['what']}>
								<Disclosure id="what">
									<DisclosureHeader>What’s a disclosure?</DisclosureHeader>
									<DisclosurePanel>A heading that shows or hides what’s under it, such as an answer under its question.</DisclosurePanel>
								</Disclosure>
								<Disclosure id="several">
									<DisclosureHeader>Can several be open at once?</DisclosureHeader>
									<DisclosurePanel>In a group, opening one closes the others, unless the group has allowsMultipleExpanded.</DisclosurePanel>
								</Disclosure>
								<Disclosure id="motion">
									<DisclosureHeader>Does it animate?</DisclosureHeader>
									<DisclosurePanel>Its panel grows to fit what’s in it, and opens at once when reduced motion is on.</DisclosurePanel>
								</Disclosure>
							</DisclosureGroup>
						),
					},
					{
						name: 'Small, as navigation',
						render: () => (
							<DisclosureGroup size="small" allowsMultipleExpanded defaultExpandedKeys={['overlays']} className="w-56">
								<Disclosure id="pickers">
									<DisclosureHeader className="px-3 font-mono text-label font-normal text-muted">Pickers</DisclosureHeader>
									<DisclosurePanel>
										<NavigationTree aria-label="Pickers">
											<NavigationTreeItem id="select" href="#/select" textValue="Select">
												<NavigationTreeItemContent>Select</NavigationTreeItemContent>
											</NavigationTreeItem>
											<NavigationTreeItem id="combo-box" href="#/combo-box" textValue="Combo box">
												<NavigationTreeItemContent>Combo box</NavigationTreeItemContent>
											</NavigationTreeItem>
										</NavigationTree>
									</DisclosurePanel>
								</Disclosure>
								<Disclosure id="overlays">
									<DisclosureHeader className="px-3 font-mono text-label font-normal text-muted">Overlays</DisclosureHeader>
									<DisclosurePanel>
										<NavigationTree aria-label="Overlays">
											<NavigationTreeItem id="dialog" href="#/dialog" textValue="Dialog">
												<NavigationTreeItemContent>Dialog</NavigationTreeItemContent>
											</NavigationTreeItem>
											<NavigationTreeItem id="sheet" href="#/sheet" textValue="Sheet">
												<NavigationTreeItemContent>Sheet</NavigationTreeItemContent>
											</NavigationTreeItem>
											<NavigationTreeItem id="popover" href="#/popover" textValue="Popover">
												<NavigationTreeItemContent>Popover</NavigationTreeItemContent>
											</NavigationTreeItem>
										</NavigationTree>
									</DisclosurePanel>
								</Disclosure>
							</DisclosureGroup>
						),
					},
					{
						name: 'Small, over a description',
						render: () => (
							<Disclosure size="small" className="max-w-sm">
								<DisclosureHeader>What happens to my files?</DisclosureHeader>
								<DisclosurePanel>
									<p className="text-muted">They stay in your browser, and nothing is uploaded.</p>
								</DisclosurePanel>
							</Disclosure>
						),
					},
				],
			},
			{
				id: 'tabs',
				name: 'Tabs',
				description: 'Panels of content, one shown at a time, picked from a row of tabs. A bar slides to the one you pick',
				exports: ['Tabs', 'TabList', 'Tab', 'TabPanel'],
				stories: [
					{
						name: 'In a row',
						render: () => (
							<Tabs defaultSelectedKey="type" className="w-full">
								<TabList aria-label="Project">
									<Tab id="brief">Brief</Tab>
									<Tab id="type">Type</Tab>
									<Tab id="colour">Colour</Tab>
									<Tab id="files">Files</Tab>
								</TabList>
								<TabPanel id="brief">A studio site that shows the work first, then the people behind it.</TabPanel>
								<TabPanel id="type">Elza Round for text, with Auger Mono for small labels.</TabPanel>
								<TabPanel id="colour">Ink on a cream ground, with white for anything you can press.</TabPanel>
								<TabPanel id="files">The Sketch library, its exports and the type kit, in one shared folder.</TabPanel>
							</Tabs>
						),
					},
					{
						name: 'In a column',
						render: () => (
							<Tabs orientation="vertical" defaultSelectedKey="website" className="w-full">
								<TabList aria-label="Services">
									{services.map((service) => (
										<Tab key={service.id} id={service.id}>
											{service.name}
										</Tab>
									))}
								</TabList>
								<TabPanel id="identity">A name, a mark, and the colours and type to carry them.</TabPanel>
								<TabPanel id="website">Designed and built together, so the details make it to the browser.</TabPanel>
								<TabPanel id="design-system">Components in code, with the guidance for using them beside each one.</TabPanel>
								<TabPanel id="illustration">Drawn to sit with the type and the layout around it.</TabPanel>
							</Tabs>
						),
					},
				],
			},
		],
	},
];
