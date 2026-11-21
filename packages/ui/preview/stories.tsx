import { type ReactNode, useState } from 'react';
import { Button as AriaButton, RouterProvider, parseColor } from 'react-aria-components';
import { type IconName, type IconSize, type IconVariant, iconNames } from '@parchment/icons';
import { byCategory } from './icon-categories.js';
// PROTOTYPE: icon motion
import { IconMotionPrototype } from './proto/icon-motion.js';
import { Icon } from '@parchment/icons/react';
import {
	Avatar,
	Button,
	ColorArea,
	ColorField,
	ColorSlider,
	ColorSwatch,
	ColorSwatchPicker,
	ColorSwatchPickerItem,
	Swatch,
	Composer,
	EmptyState,
	FileTrigger,
	GridList,
	GridListItem,
	Keyboard,
	Link,
	Menu,
	MenuItem,
	MenuSeparator,
	MenuTrigger,
	NavigationTree,
	NavigationTreeHeader,
	NavigationTreeItem,
	NavigationTreeItemContent,
	NavigationTreeSection,
	Meter,
	Popover,
	PreviewTrigger,
	SearchField,
	Separator,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
	TooltipTrigger,
} from '../src/index.js';
import { ParchmentLogo } from './logo.js';
import { Article, Families, Figures, Scale, Together, Weights, Writing } from './typography.js';
import { AppIcons, BrandButtons, Cards, Crops, Curls, Lockups, OnColour, Pairings, Palette, ProjectCards, System } from './brand.js';
import { AlertPlayground, EveryTone, NoticeInForm } from './playgrounds/alert.js';
import { AsidePlayground, AsidesInProse } from './playgrounds/aside.js';
import { AvatarPlayground, AvatarsInText, photo } from './playgrounds/avatar.js';
import { ButtonPlayground } from './playgrounds/button.js';
import { CardPlayground, Category } from './blocks/card.js';
import { ChatPlayground, ClaudeChatPlayground } from './blocks/chat.js';
import { CalendarPlayground } from './playgrounds/calendar.js';
import { DateFieldPlayground } from './playgrounds/date-field.js';
import { DatePickerPlayground } from './playgrounds/date-picker.js';
import { CheckboxPlayground } from './playgrounds/checkbox.js';
import { ChipPlayground } from './playgrounds/chip.js';
import { ColorAreaPlayground } from './playgrounds/color-area.js';
import { ColorFieldPlayground } from './playgrounds/color-field.js';
import { ColorPickerPlayground } from './playgrounds/color-picker.js';
import { ColorSliderPlayground } from './playgrounds/color-slider.js';
import { ColorSwatchPickerPlayground } from './playgrounds/color-swatch-picker.js';
import { ComboBoxPlayground } from './playgrounds/combo-box.js';
import { ComposerPlayground } from './playgrounds/composer.js';
import { TextEffectPlayground, Thinking } from './playgrounds/text-effect.js';
import { MessagePlayground } from './playgrounds/message.js';
import { SuggestionsPlayground } from './playgrounds/suggestions.js';
import { DialogPlayground } from './playgrounds/dialog.js';
import { DisclosurePlayground } from './playgrounds/disclosure.js';
import { DropZonePlayground, FileStates } from './playgrounds/drop-zone.js';
import { EmptyStatePlayground } from './playgrounds/empty-state.js';
import { FileTriggerPlayground } from './playgrounds/file-trigger.js';
import { GridListPlayground } from './playgrounds/grid-list.js';
import { KeyboardPlayground } from './playgrounds/keyboard.js';
import { CodePlayground } from './playgrounds/code.js';
import { LinkPlayground } from './playgrounds/link.js';
import { MenuPlayground } from './playgrounds/menu.js';
import { NavigationTreePlayground } from './playgrounds/navigation-tree.js';
import { NavigationPlayground } from './playgrounds/navigation.js';
import { BreadcrumbsPlayground } from './playgrounds/breadcrumbs.js';
import { NumberFieldPlayground } from './playgrounds/number-field.js';
import { PopoverPlayground } from './playgrounds/popover.js';
import { ProgressBarPlayground, Saving } from './playgrounds/progress-bar.js';
import { QuoteInProse, QuotePlayground, Testimonials } from './playgrounds/quote.js';
import { screens } from './screens/index.js';
import { PaginationPlayground, PaginationUnderTable, StatusPlayground } from './playgrounds/status.js';
import { RadioGroupPlayground } from './playgrounds/radio-group.js';
import { SearchFieldPlayground } from './playgrounds/search-field.js';
import { SelectPlayground } from './playgrounds/select.js';
import { DrawerPlayground } from './playgrounds/drawer.js';
import { SliderPlayground } from './playgrounds/slider.js';
import { SwitchPlayground } from './playgrounds/switch.js';
import { EmptyTable, LoadingMoreTable, TablePlayground } from './playgrounds/table.js';
import { TabsPlayground } from './playgrounds/tabs.js';
import { TagGroupPlayground } from './playgrounds/tag-group.js';
import { TextFieldPlayground } from './playgrounds/text-field.js';
import { ToastPlayground } from './playgrounds/toast.js';
import { ToggleButtonGroupPlayground } from './playgrounds/toggle-button-group.js';
import { ToolbarPlayground } from './playgrounds/toolbar.js';
import { TooltipPlayground } from './playgrounds/tooltip.js';
import { hexOf } from './palette.js';
import { skillStories } from './skills.js';

export interface Story {
	name: string;
	render: () => ReactNode;
	/** Classes for the box it sits in, such as the layer a colour is for */
	box?: string;
	/** A ground of its own, such as the layer a colour is for. It's drawn as a padded, rounded area in place of the line above */
	ground?: string;
}

export interface Entry {
	/** The page’s name in its address, as text-field in #/ui/text-field */
	id: string;
	name: string;
	description: ReactNode;
	/** A line short enough for a card, where the description's first sentence runs longer than two lines */
	summary?: string;
	/** What a component page imports. A foundation, such as colour, has none, and says how a site uses it in `usage` */
	exports?: string[];
	usage?: string;
	stories: Story[];
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

function Sending() {
	const [sent, setSent] = useState<string[]>([]);
	return (
		<>
			<Composer aria-label="Your message" placeholder="Tell me what you’re working on" submitIcon={<Icon name="arrow-up" />} onSubmit={(message) => setSent((list) => [...list, message])} className="w-full" />
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

const icons = [
	{ id: 'favicon-16', name: 'Favicon', size: '16 × 16', preview: 'size-8', mark: 16 },
	{ id: 'favicon-32', name: 'Favicon', size: '32 × 32', preview: 'size-12', mark: 16 },
	{ id: 'apple-touch', name: 'Apple touch icon', size: '180 × 180', preview: 'size-24', mark: 24 },
	{ id: 'android', name: 'Android', size: '512 × 512', preview: 'size-32', mark: 24 },
] as const;

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

// A palette colour that copies its custom property when pressed, with its name and value in the tooltip. Square, at the
// width of its column, as in Tailwind's palette
function CopySwatch({ name }: { name: string }) {
	const hex = hexOf(name);
	const [isCopied, setCopied] = useState(false);
	return (
		<TooltipTrigger delay={300} shouldCloseOnPress={false} onOpenChange={(isOpen) => !isOpen && setCopied(false)}>
			<AriaButton
				aria-label={`${name}, ${hex}, copy --color-${name}`}
				onPress={() => void navigator.clipboard.writeText(`--color-${name}`).then(() => setCopied(true))}
				className="block w-full cursor-default rounded-md outline-offset-2 outline-ink focus-visible:outline-2"
			>
				<ColorSwatch color={hex} className="aspect-square size-auto w-full rounded-md" />
			</AriaButton>
			<Tooltip className="font-mono">{isCopied ? 'Copied' : `${name} ${hex}`}</Tooltip>
		</TooltipTrigger>
	);
}

// A row of swatches under a name, in a grid shared with the rows above and below, so the columns line up
function PaletteRow({ label, names }: { label: string; names: string[] }) {
	return (
		<div className="col-span-full grid grid-cols-subgrid items-center">
			<p className="pr-1.5 text-label font-medium">{label}</p>
			{names.map((name) => (
				<CopySwatch key={name} name={name} />
			))}
		</div>
	);
}

// The hues across and light, mid and dark down, as each hue's steps are its own
function Hues() {
	const entries = Object.entries(hues);
	return (
		<div className="grid w-full grid-cols-[auto_repeat(9,minmax(0,1fr))] gap-x-1.5 gap-y-1.5">
			<div className="col-span-full grid grid-cols-subgrid text-center text-label font-medium text-muted">
				<span />
				{entries.map(([hue]) => (
					<span key={hue} className="truncate">
						{hue}
					</span>
				))}
			</div>
			{(['Light', 'Mid', 'Dark'] as const).map((label, index) => (
				<PaletteRow key={label} label={label} names={entries.map(([hue, steps]) => `${hue}-${steps[index]}`)} />
			))}
		</div>
	);
}

// The steps across, over one row of swatches
function Greys({ name }: { name: string }) {
	return (
		<div className="grid w-full grid-cols-[auto_repeat(10,minmax(0,1fr))] gap-x-1.5 gap-y-1.5">
			<div className="col-span-full grid grid-cols-subgrid text-center text-label font-medium text-muted">
				<span />
				{greySteps.map((step) => (
					<span key={step}>{step}</span>
				))}
			</div>
			<PaletteRow label={name} names={greySteps.map((step) => `${name}-${step}`)} />
		</div>
	);
}

// A swatch with its name under it, split at the step so a long hue such as marigold still fits its column
function NamedSwatch({ name, role }: { name: string; role?: string }) {
	const [hue, step] = name.split('-');
	return (
		<div className="flex min-w-0 flex-col gap-1.5 text-center text-label">
			<CopySwatch name={name} />
			<p className="flex min-w-0 flex-col">
				<span className="truncate">{hue}</span>
				{step && <span className="text-muted">{step}</span>}
				{role && <span className="text-muted">{role}</span>}
			</p>
		</div>
	);
}

// Parchment's own in a row, with the role each makes
function Brand() {
	return (
		<div className="grid w-full grid-cols-[repeat(9,minmax(0,1fr))] gap-x-1.5">
			{brand.map(({ name, role }) => (
				<NamedSwatch key={name} name={name} role={role} />
			))}
		</div>
	);
}

// A row for each set the roles take, in columns shared across the rows
function Derived() {
	return (
		<div className="grid w-full grid-cols-[repeat(10,minmax(0,1fr))] gap-x-1.5 gap-y-4">
			{derived.map((names) => (
				<div key={names[0]} className="col-span-full grid grid-cols-subgrid">
					{names.map((name) => (
						<NamedSwatch key={name} name={name} />
					))}
				</div>
			))}
		</div>
	);
}

const groups: Group[] = [
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
						render: Brand,
					},
					{ name: 'Nine hues, each light, mid and dark', render: Hues },
					{ name: 'Sand, for the cream ground', render: () => <Greys name="sand" />, ground: 'scheme-light bg-ground text-ink' },
					{ name: 'Grey, for white', render: () => <Greys name="grey" />, ground: 'scheme-light bg-white text-ink outline-1 -outline-offset-1 outline-bleed/8 [--bleed:var(--panel-bleed)]' },
					{ name: 'Worked out for the roles', render: Derived },
				],
			},
			{
				id: 'text-effect',
				name: 'Text effect',
				description: 'Text that changes with an effect. Ray crosses it as a band of light split into colours, wiping what it said for what it says now, and loops while something is being worked on. With reduced motion, the text just changes',
				exports: ['TextEffect'],
				stories: [
					{ name: 'Build one', render: TextEffectPlayground },
					{ name: 'While it thinks', render: Thinking },
				],
			},
			{
				id: 'typography',
				name: 'Typography',
				description: 'Two families and four sizes. Elza Round for everything, in normal and medium with bold titles, and Auger Mono for code. Controls sit on a 20px line, and on a touch screen their text grows to 16px so a field doesn’t zoom',
				usage: 'text-body font-medium',
				stories: [
					{ name: 'The sizes, largest first', render: Scale },
					{ name: 'Two families', render: Families },
					{ name: 'Weights, as Elza Round is variable', render: Weights },
					{ name: 'Figures that line up', render: Figures },
					{ name: 'Together', render: Together, box: 'justify-center' },
					{ name: 'A post, at length', render: Article, box: 'justify-center' },
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
				description: 'Any action, as primary in marigold, secondary in white, quiet in slate, outline or ghost, with an icon at either end or just an icon, and rounded corners or full ones for a pill or a circle',
				summary: 'Any action, in marigold, white or slate, outline or ghost, with or without an icon',
				exports: ['Button'],
				stories: [
					{ name: 'Build one', render: ButtonPlayground },
				],
			},
			{
				id: 'chip',
				name: 'Chip',
				description: 'Suggestions to tap',
				exports: ['Chip', 'ChipGroup'],
				stories: [
					{ name: 'Build one', render: ChipPlayground },
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
				],
			},
			{
				id: 'keyboard',
				name: 'Keyboard',
				description: 'A keyboard shortcut, in a sentence, a tooltip or at the end of a menu item',
				exports: ['Keyboard'],
				stories: [
					{ name: 'Build one', render: KeyboardPlayground },
				],
			},
			{
				id: 'code',
				name: 'Code',
				description: 'A block of code, highlighted by Shiki in Loupe’s theme, with a title and Copy. Its colours are tokens, so a site can restyle it, and iamsteve’s and mcknny’s come with it',
				exports: ['Code'],
				stories: [
					{ name: 'Build one', render: CodePlayground },
				],
			},
			{
				id: 'prose',
				name: 'Prose',
				description: 'Writing at length as plain HTML, such as a post from Markdown or a CMS, set in Loupe’s type with no classes inside. Every line height and space in it is a multiple of 4px, so each block starts and ends on Loupe’s grid. A site without React, such as one in Astro, puts the prose class from tokens.css on what holds it',
				exports: ['Prose'],
				stories: [
					{ name: 'Every element of prose', render: () => <Writing />, box: 'justify-center' },
					{ name: 'On the 4px grid', render: () => <Writing showRhythm />, box: 'justify-center' },
				],
			},
			{
				id: 'quote',
				name: 'Quote',
				description: 'Someone else’s words, set apart in Livory’s italic with who said it under them, as a figure. Its rules are prose’s blockquote’s, so a quote looks the same written either way. A testimonial sets them from the start edge, with the person’s photo beside their name',
				summary: 'Someone else’s words, as a pull quote or a testimonial',
				exports: ['Quote'],
				stories: [
					{ name: 'Build one', render: QuotePlayground },
					{ name: 'A pull quote in prose', render: QuoteInProse, box: 'justify-center' },
					{ name: 'Testimonials side by side', render: Testimonials, box: 'items-start' },
				],
			},
			{
				id: 'aside',
				name: 'Aside',
				description: 'The writer’s own voice beside the main text. A signpost says what’s coming or what the reader needs first, behind the accent’s rule, and an afterthought is a tangent in muted italic, to read or skip. In prose the rule hangs in the margin, so the text lines up with the paragraphs',
				summary: 'The writer’s signpost or afterthought beside the main text',
				exports: ['Aside'],
				stories: [
					{ name: 'Build one', render: AsidePlayground },
					{ name: 'A signpost and an afterthought in a post', render: AsidesInProse, box: 'justify-center' },
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
						Text, or several lines with <code className="font-mono text-label">isMultiline</code>
					</>
				),
				exports: ['TextField'],
				stories: [
					{ name: 'Build one', render: TextFieldPlayground },
				],
			},
			{
				id: 'number-field',
				name: 'Number field',
				description: 'A number, typed or stepped with the arrow keys and its buttons',
				exports: ['NumberField'],
				stories: [
					{ name: 'Build one', render: NumberFieldPlayground },
				],
			},
			{
				id: 'search-field',
				name: 'Search field',
				description: 'Searching, with a button that clears what’s typed. Escape clears it too',
				exports: ['SearchField'],
				stories: [
					{ name: 'Build one', render: SearchFieldPlayground },
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
				],
			},
			{
				id: 'composer',
				name: 'Composer',
				description: 'A message field with its send button',
				exports: ['Composer'],
				stories: [
					{ name: 'Build one', render: ComposerPlayground },
					{ name: 'Sending', render: Sending },
				],
			},
			{
				id: 'message',
				name: 'Message',
				description: 'One message in a conversation. A person’s sits in a tinted bubble at the end of the row, and a reply is plain text across it. In a MessageList, a screen reader reads each out as it arrives',
				exports: ['Message', 'MessageList'],
				stories: [{ name: 'Build one', render: MessagePlayground }],
			},
			{
				id: 'suggestions',
				name: 'Suggestions',
				description: 'Questions to press: raised starters for what to ask first, or plain follow-ups after a reply. Each fades in after the last, and a ray crosses a question as it changes',
				exports: ['Suggestions', 'Suggestion'],
				stories: [{ name: 'Build one', render: SuggestionsPlayground }],
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
				],
			},
			{
				id: 'radio-group',
				name: 'Radio group',
				description: 'Choosing one option',
				exports: ['RadioGroup', 'Radio'],
				stories: [
					{ name: 'Build one', render: RadioGroupPlayground },
				],
			},
			{
				id: 'switch',
				name: 'Switch',
				description: 'A setting that takes effect straight away, with rounded corners or full ones for a pill. With on/off labels turned on, or where the system asks for more contrast, a | and an O say its state too',
				summary: 'A setting that takes effect straight away',
				exports: ['Switch'],
				stories: [
					{ name: 'Build one', render: SwitchPlayground },
					{
						name: 'With on/off labels',
						render: () => (
							<div data-on-off-labels className="flex flex-col">
								<Switch defaultSelected>On</Switch>
								<Switch>Off</Switch>
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
				],
			},
			{
				id: 'combo-box',
				name: 'Combo box',
				description: 'Typing to filter a list of options',
				exports: ['ComboBox', 'ListBoxItem'],
				stories: [
					{ name: 'Build one', render: ComboBoxPlayground },
				],
			},
			{
				id: 'date-field',
				name: 'Date field',
				description: 'A date or time typed a part at a time, in the order the reader’s locale writes it',
				exports: ['DateField', 'TimeField'],
				stories: [
					{ name: 'Build one', render: DateFieldPlayground },
				],
			},
			{
				id: 'date-picker',
				name: 'Date picker',
				description: 'A date or a range of dates, typed or picked from a calendar that opens below the field',
				summary: 'A date or a range, typed or picked from a calendar below the field',
				exports: ['DatePicker', 'DateRangePicker'],
				stories: [
					{ name: 'Build one', render: DatePickerPlayground },
				],
			},
			{
				id: 'calendar',
				name: 'Calendar',
				description: 'A month of days to pick a date or a range from, on its own or in a date picker',
				exports: ['Calendar', 'RangeCalendar'],
				stories: [
					{ name: 'Build one', render: CalendarPlayground },
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
				summary: 'A colour as a swatch and its hex, opening an area, a hue slider and a field',
				exports: ['ColorPicker'],
				stories: [
					{ name: 'Build one', render: ColorPickerPlayground },
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
				],
			},
			{
				id: 'color-field',
				name: 'Colour field',
				description: 'A colour pasted or typed in any CSS format, with its opacity beside it',
				exports: ['ColorField', 'parseAnyColor'],
				stories: [
					{ name: 'Build one', render: ColorFieldPlayground },
					{ name: 'Paste any colour', render: () => <ColorField label="Fill" description="Paste oklch(), rgb(), a name or hex" defaultValue="oklch(0.6 0.16 45 / 0.8)" className="w-64" /> },
					{ name: 'Without opacity', render: () => <ColorField label="Theme colour" description="Browsers tint their toolbar with it" defaultValue="#0c2920" hasOpacity={false} className="w-56" /> },
				],
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
				summary: 'Rows of records under sortable columns, to choose, open or act on',
				exports: ['Table', 'TableHeader', 'Column', 'TableBody', 'Row', 'Cell', 'RowActions', 'TableLoadMoreItem'],
				stories: [
					{ name: 'Build one', render: TablePlayground },
					{ name: 'Empty', render: EmptyTable },
					{ name: 'Loading more as it scrolls', render: LoadingMoreTable },
				],
			},
			{
				id: 'swatch',
				name: 'Swatch',
				description: 'A colour as a square, from any CSS colour or token, such as var(--color-primary), in a line of text, a list or on its own. ColorSwatch is the one for a colour React Aria picks',
				summary: 'A colour as a square, from any CSS colour or token',
				exports: ['Swatch'],
				stories: [
					{
						name: 'Four sizes',
						render: () => (
							<div className="flex items-end gap-4">
								{(['small', 'field', 'medium', 'large'] as const).map((size) => (
									<Swatch key={size} color="var(--color-primary)" size={size} label={`Marigold, ${size}`} />
								))}
							</div>
						),
					},
					{
						name: 'From tokens, following the theme',
						render: () => (
							<ul className="flex flex-col gap-2 text-control">
								{['primary', 'quiet', 'ink', 'muted', 'paper', 'danger'].map((name) => (
									<li key={name} className="flex items-center gap-2">
										<Swatch color={`var(--color-${name})`} size="medium" />
										<code className="font-mono text-label">--color-{name}</code>
									</li>
								))}
							</ul>
						),
					},
					{
						name: 'In a line of text, and see-through',
						render: () => (
							<p className="max-w-[36ch] text-pretty">
								Buttons lead with marigold <Swatch color="var(--color-primary)" size="small" /> and a selection tints with olive at 24%{' '}
								<Swatch color="color-mix(in oklab, var(--color-olive-91) 24%, transparent)" size="small" />, over the checkerboard.
							</p>
						),
					},
					{
						name: 'Empty, before there’s a colour',
						render: () => (
							<div className="flex items-center gap-4">
								<Swatch size="field" label="No colour yet" />
								<Swatch color="var(--color-primary)" size="field" label="Marigold" />
							</div>
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
					{ name: 'Build one', render: TagGroupPlayground },
				],
			},
			{
				id: 'avatar',
				name: 'Avatar',
				description: 'A person, round, or an organisation or project, square, as a photo or their initials on a tint. A group overlaps them and counts the rest',
				summary: 'A person, organisation or project, as a photo or their initials',
				exports: ['Avatar', 'AvatarGroup'],
				stories: [
					{ name: 'Build one', render: AvatarPlayground },
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
				id: 'alert',
				name: 'Alert',
				description: 'Something to know about a page or part of it: an alert, tinted in its tone to draw the eye, or a notice, a quieter line in the flow. The colour and icon back up the words, so the words have to say it all. It’s there when the page loads, so it isn’t announced: give one that appears later role="alert" or role="status"',
				summary: 'Something to know, as a tinted alert or a quieter notice',
				exports: ['Alert'],
				stories: [
					{ name: 'Build one', render: AlertPlayground },
					{ name: 'Every tone', render: EveryTone },
					{ name: 'Long text, actions and a dismiss button', render: NoticeInForm },
				],
			},
			{
				id: 'progress-bar',
				name: 'Progress bar',
				description: 'How far along something is, as a bar or a ring, or a spinner when there’s no telling. A meter shows a quantity within limits the same way',
				exports: ['ProgressBar', 'ProgressCircle', 'Meter'],
				stories: [
					{ name: 'Build one', render: ProgressBarPlayground },
					{ name: 'A button while it saves', render: Saving },
					{ name: 'A meter', render: () => <Meter label="Storage" value={7.2} maxValue={10} valueLabel="7.2 of 10 GB" className="w-full max-w-md" /> },
				],
			},
			{
				id: 'status',
				name: 'Status',
				description: 'Where something is up to, such as a lead that’s qualified or an invoice that’s overdue, as a coloured dot and a label. The colour backs up the label, so the label has to say it all',
				summary: 'Where something is up to, as a coloured dot and a label',
				exports: ['Status'],
				stories: [
					{ name: 'Build one', render: StatusPlayground },
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
				],
			},
			{
				id: 'drawer',
				name: 'Drawer',
				description: 'A panel that slides in from an edge of the screen, and swipes back out',
				exports: ['DrawerTrigger', 'Drawer'],
				stories: [
					{ name: 'Build one', render: DrawerPlayground },
				],
			},
			{
				id: 'popover',
				name: 'Popover',
				description: 'A dialog beside what opened it',
				exports: ['DialogTrigger', 'Popover', 'Dialog', 'DialogHeading'],
				stories: [
					{ name: 'Build one', render: PopoverPlayground },
				],
			},
			{
				id: 'menu',
				name: 'Menu',
				description: 'Actions in a list that opens',
				exports: ['MenuTrigger', 'Menu', 'MenuItem', 'MenuSection', 'MenuSeparator'],
				stories: [
					{ name: 'Build one', render: MenuPlayground },
				],
			},
			{
				id: 'preview-trigger',
				name: 'Preview trigger',
				description: 'A popover on hover, focus or a long press, for a closer look at what a link points to. Unlike a tooltip, what’s in it can be used',
				summary: 'A popover on hover, focus or a long press, for a closer look at a link',
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
											<Avatar name="Doris" src={photo} size={48} />
											<div className="flex flex-col">
												<span className="font-medium">Doris</span>
												<span className="text-label text-muted">Head of naps, Rothbury</span>
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
				],
			},
			{
				id: 'toast',
				name: 'Toast',
				description: 'A short message at the bottom of the screen, such as an export finishing, that closes itself',
				summary: 'A short message at the bottom of the screen that closes itself',
				exports: ['ToastQueue', 'ToastRegion', 'Toast'],
				stories: [
					{ name: 'Build one', render: ToastPlayground },
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
				description: 'A page’s navigation: a column beside the page on wider screens, and a drawer behind a button on phones. This sidebar is one, so narrow the window to see its drawer',
				summary: 'A page’s navigation, a sidebar on wide screens and a drawer on phones',
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
				],
			},
			{
				id: 'link',
				name: 'Link',
				description: 'A link to another page, or a place on this one',
				exports: ['Link'],
				stories: [
					{ name: 'Build one', render: LinkPlayground },
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
				],
			},
			{
				id: 'tabs',
				name: 'Tabs',
				description: 'Panels of content, one shown at a time, picked from a row of tabs. A bar slides to the one you pick',
				exports: ['Tabs', 'TabList', 'Tab', 'TabPanel'],
				stories: [
					{ name: 'Build one', render: TabsPlayground },
				],
			},
		],
	},
];

// Grouped by what you're building rather than by kind of control, so a form's pieces are all in one place. The groups
// go in the order you'd build in, and each one's pages A to Z
const regrouped: Record<string, string[]> = {
	Foundations: ['Colour', 'Prose', 'Text effect', 'Typography'],
	Actions: ['Button', 'Chip', 'File trigger', 'Keyboard', 'Toggle button group', 'Toolbar'],
	Forms: ['Calendar', 'Checkbox', 'Colour area', 'Colour field', 'Colour picker', 'Colour slider', 'Colour swatch picker', 'Combo box', 'Date field', 'Date picker', 'Drop zone', 'Number field', 'Radio group', 'Search field', 'Select', 'Slider', 'Switch', 'Text field'],
	Data: ['Avatar', 'Code', 'Grid list', 'Swatch', 'Table', 'Tag group'],
	Feedback: ['Alert', 'Empty state', 'Progress bar', 'Status', 'Toast'],
	Writing: ['Aside', 'Quote'],
	Conversation: ['Composer', 'Message', 'Suggestions'],
	Overlays: ['Dialog', 'Menu', 'Popover', 'Preview trigger', 'Drawer', 'Tooltip'],
	Navigation: ['Breadcrumbs', 'Disclosure', 'Link', 'Navigation', 'Navigation tree', 'Pagination', 'Tabs'],
};
const entries = new Map(groups.flatMap((group) => group.components).map((entry) => [entry.name, entry]));
export const library: Group[] = Object.entries(regrouped).map(([name, names]) => ({
	name,
	components: names.map((entry) => {
		const found = entries.get(entry);
		if (!found) throw new Error(`No page called ${entry}`);
		return found;
	}),
}));
if (entries.size !== library.reduce((count, group) => count + group.components.length, 0)) throw new Error('A page is in no group');

// The guides: a dotted cross through the middle of each square, light enough to sit behind the icon, and the edge of the
// icon's own canvas around it
const cross = [
	'before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-dashed before:border-bleed/12',
	'after:absolute after:inset-y-0 after:left-1/2 after:border-l after:border-dashed after:border-bleed/12',
].join(' ');

// What the icons can be looked at in. Each is drawn at one size and scaled here, so 12px shows how it holds up small,
// and 32px and 48px show its details
const previewSizes = [12, 16, 24, 32, 48] as const;
type PreviewSize = (typeof previewSizes)[number];

// Every icon in a set, each in a square on a grid of hairlines, with the guides to turn off. The icons are in groups by
// what they draw, or in one grid in the same order, so a family such as the train and its carriages stays together.
// Its name shows on hover, and is its label for a screen reader
function Icons({ variant, size }: { variant: IconVariant; size: IconSize }) {
	const [hasGuides, setGuides] = useState(true);
	const [isGrouped, setGrouped] = useState(true);
	const [shown, setShown] = useState<PreviewSize>(size);
	const categories = byCategory(iconNames({ variant, size }));
	// The squares grow with the icons, so a 48px one keeps room around it
	const grid = (names: IconName[]) => (
		<ul className="grid border-t border-l border-bleed/8" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(48, shown * 2.5)}px, 1fr))` }}>
			{names.map((name) => (
				<li key={name} title={name} className={`relative flex aspect-square items-center justify-center border-r border-b border-bleed/8 ${hasGuides ? cross : ''}`}>
					<span className={`relative z-1 ${hasGuides ? 'outline outline-bleed/12' : ''}`}>
						<Icon name={name} variant={variant} size={size} label={name} className="block" style={{ width: shown, height: shown }} />
					</span>
				</li>
			))}
		</ul>
	);
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				<ToggleButtonGroup aria-label="Size" size="small" selectedKeys={[String(shown)]} onSelectionChange={(keys) => setShown(Number([...keys][0]) as PreviewSize)}>
					{previewSizes.map((each) => (
						<ToggleButton key={each} id={String(each)}>
							{each}px
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				<Switch isSelected={isGrouped} onChange={setGrouped}>
					By category
				</Switch>
				<Switch isSelected={hasGuides} onChange={setGuides}>
					Guides
				</Switch>
			</div>
			{isGrouped
				? categories.map(([category, names]) => (
						<section key={category} aria-labelledby={`icons-${category.toLowerCase().replaceAll(' ', '-')}`} className="flex flex-col gap-3">
							<h3 id={`icons-${category.toLowerCase().replaceAll(' ', '-')}`} className="text-control font-medium">
								{category} <span className="font-normal text-muted tabular-nums">{names.length}</span>
							</h3>
							{grid(names)}
						</section>
					))
				: grid(categories.flatMap(([, names]) => names))}
		</div>
	);
}

// Pieces made from the components, each with its own page under Blocks, as #/blocks/sign-up-form
export const blocks: Entry[] = [
	{
		id: 'card',
		name: 'Card',
		description: 'An image area, a title and a line under it, and a button or two, on a raised, quiet or brand fill. The image area’s corners are the card’s less its padding, so they stay concentric, and it can hold a component drawn live',
		stories: [
			{ name: 'Build one', render: CardPlayground },
			{ name: 'A category', render: () => <Category name="Actions" /> },
			{ name: 'A category, on pine', render: () => <Category name="Actions" fill="pine" /> },
		],
	},
	{
		id: 'chat',
		name: 'Chat',
		description: 'A conversation in a drawer that pushes the page aside, so what’s asked about stays in view. It opens on suggested questions, thinks with a ray over the word, and offers follow-ups after each reply, with Composer at the foot. With Claude, while the preview runs locally, it answers with views drawn from Loupe’s blocks',
		stories: [
			{ name: 'Build one', render: ChatPlayground },
			{ name: 'With Claude', render: ClaudeChatPlayground },
		],
	},
];

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
			{ name: 'Solid, drawn at 16px', render: () => <Icons variant="solid" size={16} /> },
			// PROTOTYPE: icon motion, see proto/icon-motion.tsx
			{ name: 'Motion, a prototype', render: IconMotionPrototype },
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
		description: 'What an agent needs to know to build with loupe: which component to use over its alternative, which variant applies where, and which tokens are allowed. It’s skills/loupe in the ui package, to be shipped as a plugin',
		stories: skillStories,
	},
];
