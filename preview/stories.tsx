import { type ReactNode, useState } from 'react';
import { RouterProvider, parseColor } from 'react-aria-components';
import { type IconSize, type IconVariant, iconNames } from '@parchment/icons';
import { Icon } from '@parchment/icons/react';
import {
	Avatar,
	Breadcrumb,
	Breadcrumbs,
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
	EmptyState,
	FileList,
	FileListItem,
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
	Meter,
	NumberField,
	Pagination,
	Popover,
	PreviewTrigger,
	ProgressBar,
	ProgressCircle,
	Radio,
	RadioGroup,
	SearchField,
	Select,
	Separator,
	Sheet,
	SheetTrigger,
	Slider,
	Status,
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
import { Article, Families, Prose, Figures, Scale, Together, Weights } from './typography.js';
import { AppIcons, BrandButtons, Cards, Crops, Curls, Lockups, OnColour, Pairings, Palette, ProjectCards, System } from './brand.js';
import { AvatarGroups, AvatarPlayground, AvatarSizes, AvatarsInText, PeopleAndOrganisations, photos } from './playgrounds/avatar.js';
import { ButtonPlayground } from './playgrounds/button.js';
import { CalendarPlayground, PickADay, TwoMonths, WeekendsUnavailable } from './playgrounds/calendar.js';
import { DateAndTime, DateFieldPlayground, DateFieldStates } from './playgrounds/date-field.js';
import { DatePickerPlayground, PickADate, PickADateAndTime, PickARange } from './playgrounds/date-picker.js';
import { CheckboxPlayground } from './playgrounds/checkbox.js';
import { ChipPlayground } from './playgrounds/chip.js';
import { ColorAreaPlayground } from './playgrounds/color-area.js';
import { ColorFieldPlayground } from './playgrounds/color-field.js';
import { ColorPickerPlayground } from './playgrounds/color-picker.js';
import { ColorSliderPlayground } from './playgrounds/color-slider.js';
import { ColorSwatchPickerPlayground } from './playgrounds/color-swatch-picker.js';
import { ComboBoxPlayground } from './playgrounds/combo-box.js';
import { ComposerPlayground } from './playgrounds/composer.js';
import { DialogPlayground } from './playgrounds/dialog.js';
import { DisclosurePlayground } from './playgrounds/disclosure.js';
import { DropZonePlayground, FileStates, UploadingFiles } from './playgrounds/drop-zone.js';
import { EmptyStatePlayground } from './playgrounds/empty-state.js';
import { FileTriggerPlayground } from './playgrounds/file-trigger.js';
import { GridListPlayground } from './playgrounds/grid-list.js';
import { KeyboardPlayground } from './playgrounds/keyboard.js';
import { LinkPlayground } from './playgrounds/link.js';
import { MenuPlayground } from './playgrounds/menu.js';
import { NavigationTreePlayground } from './playgrounds/navigation-tree.js';
import { NavigationPlayground } from './playgrounds/navigation.js';
import { BreadcrumbsPlayground } from './playgrounds/breadcrumbs.js';
import { NumberFieldPlayground } from './playgrounds/number-field.js';
import { PopoverPlayground } from './playgrounds/popover.js';
import { ProgressBarPlayground, Saving } from './playgrounds/progress-bar.js';
import { screens } from './screens/index.js';
import { PaginationPlayground, PaginationUnderTable, StatusBadges, StatusPlayground, StatusTones } from './playgrounds/status.js';
import { RadioGroupPlayground } from './playgrounds/radio-group.js';
import { SearchFieldPlayground } from './playgrounds/search-field.js';
import { SelectPlayground } from './playgrounds/select.js';
import { SheetPlayground } from './playgrounds/sheet.js';
import { SliderPlayground } from './playgrounds/slider.js';
import { SwitchPlayground } from './playgrounds/switch.js';
import { EmptyTable, InvoicesTable, LoadingMoreTable, MembersTable, TablePlayground } from './playgrounds/table.js';
import { TabsPlayground } from './playgrounds/tabs.js';
import { TagGroupPlayground } from './playgrounds/tag-group.js';
import { TextFieldPlayground } from './playgrounds/text-field.js';
import { ToastPlayground } from './playgrounds/toast.js';
import { ToggleButtonGroupPlayground } from './playgrounds/toggle-button-group.js';
import { ToolbarPlayground } from './playgrounds/toolbar.js';
import { TooltipPlayground } from './playgrounds/tooltip.js';
import { hexOf } from './palette.js';

export interface Story {
	name: string;
	render: () => ReactNode;
	/** Classes for the box it sits in, such as the layer a colour is for */
	box?: string;
}

export interface Entry {
	/** The page’s name in its address, as text-field in #/ui/text-field */
	id: string;
	name: string;
	description: ReactNode;
	/** What a component page imports. A foundation, such as colour, has none, and says how a site uses it in `usage` */
	exports?: string[];
	usage?: string;
	stories: Story[];
	/** The lead export drawn with some of its props, so the API reference can preview an option, as Button's variant set to ghost */
	sample?: (props: Record<string, unknown>) => ReactNode;
	/** For an area of loupe with nothing in it yet, shown in place of the stories */
	empty?: () => ReactNode;
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
				<Button variant="ghost" shape="full" aria-label="Undo">
					<Icon name="arrow-uturn-left" />
				</Button>
				<Tooltip>
					Undo
					<Keyboard>⌘Z</Keyboard>
				</Tooltip>
			</TooltipTrigger>
			<TooltipTrigger delay={300}>
				<Button variant="ghost" shape="full" aria-label="Redo">
					<Icon name="arrow-uturn-right" />
				</Button>
				<Tooltip>
					Redo
					<Keyboard>⇧⌘Z</Keyboard>
				</Tooltip>
			</TooltipTrigger>
			<Separator />
			<MenuTrigger>
				<Button variant="ghost" aria-label={`Zoom, ${zoom}%`}>
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
			<Button variant="secondary">Edit</Button>
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
	const [files, setFiles] = useState<File[]>([]);
	return (
		<div className="flex w-full flex-col gap-3">
			<DropZone
				label="Drop an SVG or a large PNG"
				onDrop={async (event) => setFiles(await Promise.all(event.items.filter(isFileDropItem).map((item) => item.getFile())))}
				className="w-full"
			>
				<FileTrigger acceptedFileTypes={['image/svg+xml', 'image/png']} allowsMultiple onSelect={(chosen) => setFiles([...(chosen ?? [])])}>
					<Button variant="secondary" size="small">
						Choose files
					</Button>
				</FileTrigger>
			</DropZone>
			<FileList aria-label="Chosen files">
				{files.map((file, index) => (
					<FileListItem key={index} id={index} file={file} onRemove={() => setFiles((list) => list.filter((other) => other !== file))} />
				))}
			</FileList>
		</div>
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
				<Button variant="secondary">Choose artwork</Button>
			</FileTrigger>
			<p className="font-mono text-label text-muted">{names.length > 0 ? names.join(', ') : 'Nothing chosen yet'}</p>
		</>
	);
}

// Some of Parchment’s own: linen, marigold, apricot, claret, olive and pine
const palette = ['#fbfaf9', '#f5c03c', '#f68543', '#eea3a3', '#516426', '#0c2920'];

// An artboard’s fills, as the device tool offers them: none, white, greys, cream and ink
const fills = ['#0000', '#ffffff', '#f4f5f1', '#dfe2da', '#fbf6ef', '#1f2f31'];

// One colour shared by the area and the slider, so moving the hue recolours the area
function AreaAndHue() {
	const [color, setColor] = useState(() => parseColor('#c6611f').toFormat('hsb'));
	return (
		<div className="flex w-56 flex-col gap-3">
			<ColorArea aria-label="Colour" value={color} onChange={setColor} xChannel="saturation" yChannel="brightness" />
			<ColorSlider value={color} onChange={setColor} channel="hue" />
		</div>
	);
}

// Parchment’s own, in the order of the parchment-brand board in Sketch, with the role each makes
const brand = [
	{ name: 'linen-99', role: 'panel' },
	{ name: 'linen-97', role: 'ground' },
	{ name: 'marigold-83' },
	{ name: 'apricot-73' },
	{ name: 'claret-79' },
	{ name: 'claret-36' },
	{ name: 'olive-47' },
	{ name: 'slate-86' },
	{ name: 'pine-26', role: 'ink' },
];

// Each hue’s light, mid and dark, in the order of Steve’s palette
const hues = {
	red: [87, 67, 35],
	orange: [89, 72, 41],
	yellow: [91, 76, 40],
	green: [89, 68, 46],
	teal: [88, 69, 48],
	sky: [85, 69, 37],
	blue: [82, 56, 29],
	violet: [82, 54, 27],
	pink: [87, 70, 33],
};

const greySteps = [97, 94, 90, 84, 76, 66, 56, 46, 36, 26];

// What the roles take besides the five, by hue, such as the light mode’s ground, the dark mode’s layers and danger’s reds
const derived = [
	['white', 'black'],
	['linen-99', 'linen-97', 'linen-30'],
	['cream-95', 'cream-80', 'umber-30'],
	['pine-95', 'pine-50', 'pine-35', 'pine-32', 'pine-29', 'pine-20', 'pine-16'],
	['red-81', 'red-50'],
];

function Swatch({ name, label = name, role }: { name: string; label?: string; role?: string }) {
	const hex = hexOf(name);
	return (
		<div className="flex flex-col gap-1.5 font-mono text-label">
			<ColorSwatch color={hex} className="size-13" />
			<p className="flex flex-col">
				<span>{label}</span>
				<span className="text-muted">{hex}</span>
				{role && <span className="text-muted">{role}</span>}
			</p>
		</div>
	);
}

function Hues() {
	return (
		<div className="flex flex-wrap gap-x-1.5 gap-y-6">
			{Object.entries(hues).map(([hue, steps]) => (
				<div key={hue} className="flex flex-col gap-3">
					<p className="font-mono text-label">{hue}</p>
					{steps.map((step) => (
						<Swatch key={step} name={`${hue}-${step}`} label={String(step)} />
					))}
				</div>
			))}
		</div>
	);
}

function Greys({ name }: { name: string }) {
	return (
		<div className="flex flex-wrap gap-x-1.5 gap-y-4">
			{greySteps.map((step) => (
				<Swatch key={step} name={`${name}-${step}`} label={String(step)} />
			))}
		</div>
	);
}

function Derived() {
	return (
		<div className="flex flex-wrap gap-x-6 gap-y-4">
			{derived.map((names) => (
				<div key={names[0]} className="flex flex-wrap gap-x-1.5 gap-y-4">
					{names.map((name) => (
						<Swatch key={name} name={name} />
					))}
				</div>
			))}
		</div>
	);
}

export const library: Group[] = [
	{
		name: 'Tokens',
		components: [
			{
				id: 'colour',
				name: 'Colour',
				description:
					'The palette, named by hue and lightness, so the further apart two numbers, the stronger the contrast. Components use roles made from Parchment’s own, and the hues and greys are there for designs to draw on. On the layer each grey is for, 56 and darker pass 4.5:1 for text, and 66 and darker 3:1 for a control’s edge',
				usage: 'var(--color-teal-48)',
				stories: [
					{
						name: 'Parchment’s own',
						// From the top, as only some have a role under them
						render: () => brand.map(({ name, role }) => <Swatch key={name} name={name} role={role} />),
						box: 'items-start',
					},
					{ name: 'Nine hues, each light, mid and dark', render: Hues },
					{ name: 'Sand, for the cream ground', render: () => <Greys name="sand" />, box: 'scheme-light bg-ground text-ink' },
					{ name: 'Grey, for white', render: () => <Greys name="grey" />, box: 'scheme-light bg-panel text-ink [--bleed:var(--panel-bleed)]' },
					{ name: 'Worked out for the roles', render: Derived },
				],
			},
			{
				id: 'typography',
				name: 'Typography',
				description: 'Two families and four sizes. Elza Round for everything, in normal and medium, and Auger Mono for code. Controls sit on a 20px line, and on a touch screen their text grows to 16px so a field doesn’t zoom',
				usage: 'text-body font-medium',
				stories: [
					{ name: 'The sizes, largest first', render: Scale },
					{ name: 'Two families', render: Families },
					{ name: 'Weights, as Elza Round is variable', render: Weights },
					{ name: 'Figures that line up', render: Figures },
					{ name: 'Together', render: Together, box: 'justify-center' },
					{ name: 'A post, at length', render: Article, box: 'justify-center' },
					{ name: 'Every element of prose', render: Prose, box: 'justify-center' },
				],
			},
		],
	},
	{
		name: 'Actions',
		components: [
			{
				id: 'button',
				name: 'Button',
				description: 'Any action, as primary in marigold, secondary in white, accent in slate, outline or ghost, with an icon at either end or just an icon, and rounded corners or full ones for a pill or a circle',
				exports: ['Button'],
				sample: (props) => <Button {...props}>New project</Button>,
				stories: [
					{ name: 'Build one', render: ButtonPlayground },
					{
						name: 'Primary, secondary, accent, outline and ghost',
						render: () => (
							<>
								<Button>Schedule call</Button>
								<Button variant="secondary">Send an email</Button>
								<Button variant="accent">Book a visit</Button>
								<Button variant="outline">Call back</Button>
								<Button variant="ghost">Not now</Button>
							</>
						),
					},
					{
						name: 'With an icon at the start or end',
						render: () => (
							<>
								<Button start={<Icon name="plus" />}>New project</Button>
								<Button variant="accent" end={<Icon name="arrow-right" />}>
									Continue
								</Button>
								<Button variant="secondary" start={<Icon name="envelope" />}>
									Send an email
								</Button>
								<Button variant="outline" size="small" end={<Icon name="chevron-down" />}>
									Sort by
								</Button>
							</>
						),
					},
					{
						name: 'Just an icon, rounded or full',
						render: () => (
							<>
								<Button variant="secondary" aria-label="Send">
									<Icon name="arrow-up" />
								</Button>
								<Button variant="secondary" shape="full" aria-label="Send">
									<Icon name="arrow-up" />
								</Button>
								<Button shape="full" size="small" aria-label="Send">
									<Icon name="arrow-up" />
								</Button>
								<Button variant="ghost" shape="full" size="small" aria-label="Send">
									<Icon name="arrow-up" />
								</Button>
							</>
						),
					},
					{
						name: 'Full, as a pill',
						render: () => (
							<>
								<Button shape="full" start={<Icon name="plus" />}>
									New project
								</Button>
								<Button variant="secondary" shape="full">
									Cancel
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
					{ name: 'Build one', render: ChipPlayground },
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
					{ name: 'Build one', render: ToolbarPlayground },
					{ name: 'Tools, history and zoom', render: () => <Editing /> },
					{ name: 'Floating', render: () => <Editing className="rounded-xl bg-overlay p-1 shadow-floating [--bleed:var(--overlay-bleed)]" /> },
					{
						name: 'In a column',
						render: () => (
							<Toolbar aria-label="Tools" orientation="vertical" className="rounded-xl bg-overlay p-1 shadow-floating [--bleed:var(--overlay-bleed)]">
								<Button variant="ghost" shape="full" aria-label="Select">
									<Icon name="cursorarrow" />
								</Button>
								<Button variant="ghost" shape="full" aria-label="Pan">
									<Icon name="arrow-up-and-down-and-arrow-left-and-right" />
								</Button>
								<Separator />
								<Button variant="ghost" shape="full" aria-label="Undo">
									<Icon name="arrow-uturn-left" />
								</Button>
								<Button variant="ghost" shape="full" aria-label="Redo">
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
					{ name: 'Build one', render: KeyboardPlayground },
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
								<Button variant="secondary" shape="full" aria-label="Undo">
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
					{ name: 'Build one', render: TextFieldPlayground },
					{ name: 'With a description', render: () => <TextField label="Your name" placeholder="Sam Smith" description="As you’d like Steve to say it" className="w-full" /> },
					{ name: 'Invalid', render: () => <TextField label="Email" defaultValue="sam@" isInvalid errorMessage="Enter an email address" className="w-full" /> },
					{ name: 'Multiline', render: () => <TextField label="What are you working on?" placeholder="A few lines is plenty" multiline className="w-full" /> },
					{
						name: 'Filled',
						render: () => (
							<div className="flex w-full flex-col gap-4">
								<TextField label="Your name" variant="filled" placeholder="Sam Smith" className="w-full" />
								<TextField label="Small" variant="filled" size="small" placeholder="Sam Smith" className="w-full" />
							</div>
						),
					},
				],
			},
			{
				id: 'number-field',
				name: 'Number field',
				description: 'A number, typed or stepped with the arrow keys and its buttons',
				exports: ['NumberField'],
				stories: [
					{ name: 'Build one', render: NumberFieldPlayground },
					{
						name: 'Within limits',
						render: () => <NumberField label="Width" description="In pixels, from 320 to 3840" defaultValue={1440} minValue={320} maxValue={3840} step={10} formatOptions={{ useGrouping: false }} className="w-56" />,
					},
					{
						name: 'As a percentage',
						render: () => <NumberField label="Opacity" defaultValue={0.8} minValue={0} maxValue={1} step={0.05} formatOptions={{ style: 'percent' }} className="w-56" />,
					},
					{
						name: 'Filled and small, for an inspector',
						render: () => (
							<div className="flex w-full flex-col gap-2">
								<div className="flex gap-2">
									<NumberField aria-label="Width" variant="filled" size="small" defaultValue={52} minValue={1} formatOptions={{ useGrouping: false }} className="w-28" />
									<NumberField aria-label="Height" variant="filled" size="small" defaultValue={52} minValue={1} formatOptions={{ useGrouping: false }} className="w-28" />
								</div>
								<TextField aria-label="Layer name" variant="filled" size="small" defaultValue="App icon" className="w-58" />
							</div>
						),
					},
				],
			},
			{
				id: 'search-field',
				name: 'Search field',
				description: 'Searching, with a button that clears what’s typed. Escape clears it too',
				exports: ['SearchField'],
				stories: [
					{ name: 'Build one', render: SearchFieldPlayground },
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
					{ name: 'Build one', render: SliderPlayground },
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
				stories: [
					{ name: 'Build one', render: ComposerPlayground },{ name: 'Sending', render: Sending }],
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
					{ name: 'Build one', render: CheckboxPlayground },
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
					{
						name: 'Disabled',
						render: () => (
							<div className="flex flex-col">
								<Checkbox isDisabled defaultSelected>
									Ticked
								</Checkbox>
								<Checkbox isDisabled>Not ticked</Checkbox>
								<Checkbox isDisabled isIndeterminate>
									Mixed
								</Checkbox>
							</div>
						),
					},
				],
			},
			{
				id: 'radio-group',
				name: 'Radio group',
				description: 'Choosing one option',
				exports: ['RadioGroup', 'Radio'],
				stories: [
					{ name: 'Build one', render: RadioGroupPlayground },
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
					{
						name: 'Disabled',
						render: () => (
							<RadioGroup label="Budget" defaultValue="mid" isDisabled>
								<Radio value="small">Under £5k</Radio>
								<Radio value="mid">£5–15k</Radio>
							</RadioGroup>
						),
					},
				],
			},
			{
				id: 'switch',
				name: 'Switch',
				description: 'A setting that takes effect straight away, with rounded corners or full ones for a pill. With on/off labels turned on, or where the system asks for more contrast, a | and an O say its state too',
				exports: ['Switch'],
				stories: [
					{ name: 'Build one', render: SwitchPlayground },
					{ name: 'On', render: () => <Switch defaultSelected>Send me the newsletter</Switch> },
					{
						name: 'Rounded or full',
						render: () => (
							<>
								<Switch defaultSelected>Rounded</Switch>
								<Switch shape="full" defaultSelected>
									Full
								</Switch>
							</>
						),
					},
					{
						name: 'With on/off labels',
						render: () => (
							<div data-on-off-labels className="flex flex-col">
								<Switch defaultSelected>On</Switch>
								<Switch>Off</Switch>
							</div>
						),
					},
					{
						name: 'Disabled',
						render: () => (
							<div className="flex flex-col">
								<Switch isDisabled defaultSelected>
									On
								</Switch>
								<Switch isDisabled>Off</Switch>
							</div>
						),
					},
				],
			},
			{
				id: 'toggle-button-group',
				name: 'Toggle button group',
				description: 'A few options side by side, as a segmented control. A fill slides to the one you choose',
				exports: ['ToggleButtonGroup', 'ToggleButton'],
				stories: [
					{ name: 'Build one', render: ToggleButtonGroupPlayground },
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
							<ToggleButtonGroup aria-label="Show" selectionMode="multiple" defaultSelectedKeys={['grid', 'rulers']}>
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
					{ name: 'Build one', render: SelectPlayground },
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
					{ name: 'Build one', render: ComboBoxPlayground },
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
			{
				id: 'date-field',
				name: 'Date field',
				description: 'A date or time typed a part at a time, in the order the reader’s locale writes it',
				exports: ['DateField', 'TimeField'],
				stories: [
					{ name: 'Build one', render: DateFieldPlayground },
					{ name: 'Date and time', render: DateAndTime },
					{ name: 'States', render: DateFieldStates },
				],
			},
			{
				id: 'date-picker',
				name: 'Date picker',
				description: 'A date or a range of dates, typed or picked from a calendar that opens below the field',
				exports: ['DatePicker', 'DateRangePicker'],
				stories: [
					{ name: 'Build one', render: DatePickerPlayground },
					{ name: 'A date', render: PickADate },
					{ name: 'A range', render: PickARange },
					{ name: 'A date and time, on weekdays', render: PickADateAndTime },
				],
			},
			{
				id: 'calendar',
				name: 'Calendar',
				description: 'A month of days to pick a date or a range from, on its own or in a date picker',
				exports: ['Calendar', 'RangeCalendar'],
				stories: [
					{ name: 'Build one', render: CalendarPlayground },
					{ name: 'A date', render: PickADay },
					{ name: 'Weekends unavailable', render: WeekendsUnavailable },
					{ name: 'A range across two months', render: TwoMonths },
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
					{ name: 'Build one', render: ColorPickerPlayground },
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
					{ name: 'Build one', render: ColorSwatchPickerPlayground },
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
				stories: [
					{ name: 'Build one', render: ColorAreaPlayground },{ name: 'With a hue slider', render: AreaAndHue }],
			},
			{
				id: 'color-slider',
				name: 'Colour slider',
				description: 'One channel of a colour along a track, such as its hue or opacity',
				exports: ['ColorSlider'],
				stories: [
					{ name: 'Build one', render: ColorSliderPlayground },
					{ name: 'Hue', render: () => <ColorSlider colorSpace="hsb" channel="hue" defaultValue="#c76024" className="w-64" /> },
					{ name: 'Opacity', render: () => <ColorSlider label="Opacity" channel="alpha" defaultValue="#0c2920" className="w-64" /> },
				],
			},
			{
				id: 'color-field',
				name: 'Colour field',
				description: 'A colour typed as its hex',
				exports: ['ColorField'],
				stories: [
					{ name: 'Build one', render: ColorFieldPlayground },{ name: 'Hex', render: () => <ColorField label="Theme colour" description="Browsers tint their toolbar with it" defaultValue="#0c2920" className="w-56" /> }],
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
					{ name: 'Build one', render: GridListPlayground },
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
										<Button variant="ghost" size="small">
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
				id: 'table',
				name: 'Table',
				description: 'Rows of records under sortable columns, such as customers, invoices or members, with rows to choose, open or act on',
				exports: ['Table', 'TableHeader', 'Column', 'TableBody', 'Row', 'Cell', 'RowActions', 'TableLoadMore'],
				stories: [
					{ name: 'Build one', render: TablePlayground },
					{ name: 'Members', render: MembersTable },
					{ name: 'Invoices', render: InvoicesTable },
					{ name: 'Empty', render: EmptyTable },
					{ name: 'Loading more as it scrolls', render: LoadingMoreTable },
				],
			},
			{
				id: 'tag-group',
				name: 'Tag group',
				description: 'Short labels to choose from or remove, such as sizes or filters',
				exports: ['TagGroup', 'Tag'],
				stories: [
					{ name: 'Build one', render: TagGroupPlayground },
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
			{
				id: 'avatar',
				name: 'Avatar',
				description: 'A person, round, or an organisation or project, square, as a photo or their initials on a tint. A group overlaps them and counts the rest',
				exports: ['Avatar', 'AvatarGroup'],
				stories: [
					{ name: 'Build one', render: AvatarPlayground },
					{ name: 'Sizes, with initials and with a photo', render: AvatarSizes },
					{ name: 'People and organisations', render: PeopleAndOrganisations },
					{ name: 'In a group', render: AvatarGroups },
					{ name: 'Beside text, on a 20px line', render: AvatarsInText },
				],
			},
			{
				id: 'empty-state',
				name: 'Empty state',
				description: 'Where there’s nothing to show yet: what will be here, and the first step to fill it. Its title isn’t a heading, so it sits in a list or under a page’s own',
				exports: ['EmptyState'],
				stories: [
					{ name: 'Build one', render: EmptyStatePlayground },
					{
						name: 'With a first step',
						render: () => (
							<EmptyState
								icon={<Icon name="note-text-badge-plus" />}
								title="No briefs yet"
								actions={<Button start={<Icon name="plus" />}>New brief</Button>}
								className="w-full"
							>
								A brief sets out what a project is for, so start one before the first call
							</EmptyState>
						),
					},
					{
						name: 'Just saying so',
						render: () => (
							<EmptyState title="No matches" className="w-full">
								Try fewer words, or check the spelling
							</EmptyState>
						),
					},
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
				exports: ['DropZone', 'FileTrigger', 'FileList', 'FileListItem', 'isFileDropItem'],
				stories: [
					{ name: 'Build one', render: DropZonePlayground },
					{ name: 'Dashed', render: DroppingFiles },
					{ name: 'Quiet, for a panel', render: DroppingQuietly },
					{ name: 'Uploading what’s dropped', render: UploadingFiles },
					{ name: 'Each state of a file', render: FileStates },
				],
			},
			{
				id: 'file-trigger',
				name: 'File trigger',
				description: 'Opens the file picker from the button inside it',
				exports: ['FileTrigger'],
				stories: [
					{ name: 'Build one', render: FileTriggerPlayground },{ name: 'Choosing artwork', render: ChoosingFiles }],
			},
		],
	},
	{
		name: 'Status',
		components: [
			{
				id: 'progress-bar',
				name: 'Progress bar',
				description: 'How far along something is, as a bar or a ring, or a spinner when there’s no telling. A meter shows a quantity within limits the same way',
				exports: ['ProgressBar', 'ProgressCircle', 'Meter'],
				stories: [
					{ name: 'Build one', render: ProgressBarPlayground },
					{
						name: 'With a label and value',
						render: () => (
							<div className="flex w-full max-w-md flex-col gap-6">
								<ProgressBar label="Uploading artwork" value={45} />
								<ProgressBar label="Exporting icons" value={3} maxValue={8} valueLabel="3 of 8 files" />
								<ProgressBar label="Preparing the download" isIndeterminate />
							</div>
						),
					},
					{
						name: 'In a row, without a label',
						render: () => (
							<div className="flex w-full max-w-md flex-col gap-3">
								<ProgressBar aria-label="Uploading brief.pdf" value={72} />
								<ProgressBar aria-label="Uploading fonts.zip" isIndeterminate />
							</div>
						),
					},
					{
						name: 'Spinners and rings',
						render: () => (
							<div className="flex items-center gap-6">
								<ProgressCircle aria-label="Loading" isIndeterminate />
								<ProgressCircle aria-label="Loading projects" isIndeterminate size="large" />
								<ProgressCircle aria-label="Syncing" value={30} />
								<ProgressCircle aria-label="Syncing" value={70} size="large" />
							</div>
						),
					},
					{ name: 'A button while it saves', render: Saving },
					{ name: 'A meter', render: () => <Meter label="Storage" value={7.2} maxValue={10} valueLabel="7.2 of 10 GB" className="w-full max-w-md" /> },
				],
			},
			{
				id: 'status',
				name: 'Status',
				description: 'Where something is up to, such as a lead that’s qualified or an invoice that’s overdue, as a coloured dot and a label. The colour backs up the label, so the label has to say it all',
				exports: ['Status'],
				stories: [
					{ name: 'Build one', render: StatusPlayground },
					{ name: 'Tones', render: StatusTones },
					{ name: 'With a detail', render: () => <div className="flex flex-col gap-2"><Status tone="info" detail="25 Sept">Call arranged</Status><Status tone="info" detail={<><span>4 calls</span> · <span className="text-danger">22 Sept</span></>}>Call arranged</Status></div> },
					{ name: 'As badges', render: StatusBadges },
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
					{ name: 'Build one', render: DialogPlayground },
					{
						name: 'Modal',
						render: () => (
							<DialogTrigger>
								<Button variant="secondary">Rename project</Button>
								<Modal>
									<Dialog>
										<DialogHeading>Rename project</DialogHeading>
										<DialogClose />
										<TextField label="Name" defaultValue="Loupe" autoFocus className="mt-4" />
										<DialogActions>
											<Button slot="close" variant="secondary">
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
					{ name: 'Build one', render: SheetPlayground },
					{
						name: 'From the bottom',
						render: () => (
							<SheetTrigger>
								<Button variant="secondary">Rename project</Button>
								<Sheet>
									<DialogHeading>Rename project</DialogHeading>
									<DialogClose />
									<TextField label="Name" defaultValue="Loupe" autoFocus className="mt-4" />
									<DialogActions>
										<Button slot="close" variant="secondary">
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
								<Button variant="secondary">Share</Button>
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
					{ name: 'Build one', render: PopoverPlayground },
					{
						name: 'Beside its button',
						render: () => (
							<DialogTrigger>
								<Button variant="secondary">Share</Button>
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
								<Button variant="secondary">Share</Button>
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
					{ name: 'Build one', render: MenuPlayground },
					{
						name: 'Actions',
						render: () => (
							<MenuTrigger>
								<Button variant="secondary">Project</Button>
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
								<Button variant="ghost">Sort by</Button>
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
				id: 'preview-trigger',
				name: 'Preview trigger',
				description: 'A popover on hover, focus or a long press, for a closer look at what a link points to. Unlike a tooltip, what’s in it can be used',
				exports: ['PreviewTrigger'],
				stories: [
					{
						name: 'On a link',
						render: () => (
							<p>
								Say hello to{' '}
								<PreviewTrigger>
									<Link href="#/ui/avatar">Doris</Link>
									<Popover placement="bottom start" className="flex w-64 flex-col gap-3 p-4">
										<div className="flex items-center gap-3">
											<Avatar name="Doris" src={photos[0]} size={48} />
											<div className="flex flex-col">
												<span className="font-medium">Doris</span>
												<span className="text-label text-muted">Head of naps</span>
											</div>
										</div>
										<Button variant="secondary" size="small">
											Follow
										</Button>
									</Popover>
								</PreviewTrigger>
								, the studio dog.
							</p>
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
					{ name: 'Build one', render: TooltipPlayground },
					{
						name: 'On a round icon button',
						render: () => (
							<TooltipTrigger delay={300}>
								<Button variant="secondary" shape="full" aria-label="Send">
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
								<Button variant="secondary" shape="full" aria-label="Send">
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
					{ name: 'Build one', render: ToastPlayground },
					{
						name: 'With a title',
						render: () => (
							<>
								<Button variant="secondary" onPress={() => toasts.add({ title: 'Link copied' })}>
									Copy link
								</Button>
								<ToastRegion queue={toasts} />
							</>
						),
					},
					{
						name: 'With a description',
						render: () => (
							<Button variant="secondary" onPress={() => toasts.add({ title: 'Export ready', description: 'favicon.zip is in your downloads, with all 16 files.' })}>
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
				stories: [
					{ name: 'Build one', render: NavigationPlayground },],
			},
			{
				id: 'breadcrumbs',
				name: 'Breadcrumbs',
				description: 'Where a page sits in a site, as a trail of links up to it. When the trail won’t fit, the crumbs in the middle fold into an ellipsis that opens a menu of them. The bar above this page is one',
				exports: ['Breadcrumbs', 'Breadcrumb'],
				stories: [
					{ name: 'Build one', render: BreadcrumbsPlayground },
					{
						name: 'A trail',
						render: () => (
							<Breadcrumbs>
								<Breadcrumb href="#/ui">ui</Breadcrumb>
								<Breadcrumb>Navigation</Breadcrumb>
								<Breadcrumb>Breadcrumbs</Breadcrumb>
							</Breadcrumbs>
						),
					},
					{
						name: 'Folded to fit',
						render: () => (
							<div className="w-full max-w-72">
								<Breadcrumbs>
									{['Parchment', 'Clients', 'Hartley & Webb', 'Projects', 'Brand identity', 'Logo'].map((name) => (
										<Breadcrumb key={name} href="#/ui/breadcrumbs">
											{name}
										</Breadcrumb>
									))}
								</Breadcrumbs>
							</div>
						),
					},
					{
						name: 'No more than three',
						render: () => (
							<Breadcrumbs maxVisible={3}>
								{['Parchment', 'Clients', 'Hartley & Webb', 'Projects', 'Website'].map((name) => (
									<Breadcrumb key={name} href="#/ui/breadcrumbs">
										{name}
									</Breadcrumb>
								))}
							</Breadcrumbs>
						),
					},
				],
			},
			{
				id: 'pagination',
				name: 'Pagination',
				description: 'Buttons to move between the pages of a long table or list. Pages far from the current one fold into a gap, and the row stays the same length as you move through',
				exports: ['Pagination'],
				stories: [
					{ name: 'Build one', render: PaginationPlayground },
					{ name: 'Under a table', render: PaginationUnderTable },
					{ name: 'A few pages', render: () => <Pagination page={2} count={3} onChange={() => {}} /> },
				],
			},
			{
				id: 'link',
				name: 'Link',
				description: 'A link to another page, or a place on this one',
				exports: ['Link'],
				stories: [
					{ name: 'Build one', render: LinkPlayground },
					{
						name: 'In a sentence',
						render: () => (
							<p>
								Anyone with the <Link href="#/ui/link">link</Link> can view this project.
							</p>
						),
					},
					{
						name: 'Current page',
						render: () =>
							services.map((service) => (
								<Link key={service.id} href="#/ui/link" aria-current={service.id === 'website' ? 'page' : undefined}>
									{service.name}
								</Link>
							)),
					},
					{
						name: 'Disabled',
						render: () => (
							<Link href="#/ui/link" isDisabled>
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
				stories: [
					{ name: 'Build one', render: NavigationTreePlayground },{ name: 'Current page', render: CurrentPage }],
			},
			{
				id: 'disclosure',
				name: 'Disclosure',
				description: 'A heading that shows or hides what’s under it',
				exports: ['DisclosureGroup', 'Disclosure', 'DisclosureHeader', 'DisclosurePanel'],
				stories: [
					{ name: 'Build one', render: DisclosurePlayground },
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
											<NavigationTreeItem id="select" href="#/ui/select" textValue="Select">
												<NavigationTreeItemContent>Select</NavigationTreeItemContent>
											</NavigationTreeItem>
											<NavigationTreeItem id="combo-box" href="#/ui/combo-box" textValue="Combo box">
												<NavigationTreeItemContent>Combo box</NavigationTreeItemContent>
											</NavigationTreeItem>
										</NavigationTree>
									</DisclosurePanel>
								</Disclosure>
								<Disclosure id="overlays">
									<DisclosureHeader className="px-3 font-mono text-label font-normal text-muted">Overlays</DisclosureHeader>
									<DisclosurePanel>
										<NavigationTree aria-label="Overlays">
											<NavigationTreeItem id="dialog" href="#/ui/dialog" textValue="Dialog">
												<NavigationTreeItemContent>Dialog</NavigationTreeItemContent>
											</NavigationTreeItem>
											<NavigationTreeItem id="sheet" href="#/ui/sheet" textValue="Sheet">
												<NavigationTreeItemContent>Sheet</NavigationTreeItemContent>
											</NavigationTreeItem>
											<NavigationTreeItem id="popover" href="#/ui/popover" textValue="Popover">
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
					{ name: 'Build one', render: TabsPlayground },
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

// The guides: a dotted cross through the middle of each square, light enough to sit behind the icon, and the edge of the
// icon's own canvas around it
const cross = [
	'before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-dashed before:border-bleed/12',
	'after:absolute after:inset-y-0 after:left-1/2 after:border-l after:border-dashed after:border-bleed/12',
].join(' ');

// Every icon in a set, each in a square on a grid of hairlines, with the guides to turn off. Its name shows on hover,
// and is its label for a screen reader
function Icons({ variant, size }: { variant: IconVariant; size: IconSize }) {
	const [hasGuides, setGuides] = useState(true);
	return (
		<div className="flex w-full flex-col gap-4">
			<Switch isSelected={hasGuides} onChange={setGuides}>
				Guides
			</Switch>
			<ul className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] border-t border-l border-bleed/8">
				{iconNames({ variant, size }).map((name) => (
					<li key={name} title={name} className={`relative flex aspect-square items-center justify-center border-r border-b border-bleed/8 ${hasGuides ? cross : ''}`}>
						<span className={`relative z-1 ${hasGuides ? 'outline outline-bleed/12' : ''}`}>
							<Icon name={name} variant={variant} size={size} label={name} className="block" />
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

// Pieces made from the components, each with its own page under Blocks, as #/blocks/sign-up-form
export const blocks: Entry[] = [];

// The rest of loupe beside the components. Each has its own page, and shows an empty state until there's something in it
export const areas: Entry[] = [
	{
		id: 'blocks',
		name: 'Blocks',
		description: 'Components put together into the pieces a site repeats',
		stories: [],
		empty: () => (
			<EmptyState icon={<Icon name="square-on-square" />} title="No blocks yet">
				Pieces made from the components, such as a sign-up form or a project card, go here once two or three are worth sharing
			</EmptyState>
		),
	},
	{
		id: 'screens',
		name: 'Screens',
		description: 'Whole screens built from the components alone, each filling the window, to see how they hold up together. They’re dummies, and nothing in them is saved',
		stories: [
			{
				name: 'Open one',
				render: () => (
					<ul className="flex w-full flex-col gap-2">
						{screens.map((screen) => (
							<li key={screen.id} className="flex flex-col gap-1">
								<Link href={`#/screens/${screen.id}`} className="font-medium">
									{screen.name}
								</Link>
								<p className="text-control text-muted">{screen.description}</p>
							</li>
						))}
					</ul>
				),
			},
		],
	},
	{
		id: 'icons',
		name: 'Icons',
		description: 'Solid icons, drawn in Sketch. Each is named for what it draws, not what it’s for',
		usage: "<Icon name=\"plus\" variant=\"solid\" size={16} /> from '@parchment/icons/react'",
		stories: [
			{ name: 'Solid, 16px', render: () => <Icons variant="solid" size={16} /> },
		],
	},
	// A scratch page for colours with the mark, to drop along with brand.tsx if it isn't kept
	{
		id: 'brand',
		name: 'Brand',
		description: 'Colours to try with the mark, before any of them are settled. Hover a pairing to see its contrast',
		stories: [
			{ name: 'Colours', render: Palette },
			{ name: 'As a system', render: System },
			{ name: 'As an app icon', render: AppIcons },
			{ name: 'Each hue with itself and pine', render: Pairings },
			{ name: 'Cards', render: Cards },
			{ name: 'Cropped', render: Crops },
			{ name: 'With the name', render: Lockups },
			{ name: 'Curls', render: Curls },
			{ name: 'Components on colour', render: OnColour },
			{ name: 'Buttons in each brand colour', render: BrandButtons },
			{ name: 'Cards with a button', render: ProjectCards },
		],
	},
	{
		id: 'skills',
		name: 'Skills',
		description: 'What an agent needs to know to build with loupe',
		stories: [],
		empty: () => (
			<EmptyState icon={<Icon name="books-vertical" />} title="No skills yet">
				Which component, variant and token to use, written from the code, go here, to be shipped as a plugin
			</EmptyState>
		),
	},
];
