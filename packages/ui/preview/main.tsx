import { type ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
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
	ListBoxItem,
	ListBoxSection,
	Menu,
	MenuItem,
	MenuSection,
	MenuSeparator,
	MenuTrigger,
	Modal,
	Popover,
	Radio,
	RadioGroup,
	Select,
	Switch,
	TextField,
	Tooltip,
	TooltipTrigger,
} from '../src/index.js';

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

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="flex flex-col gap-4">
		<h2 className="font-mono text-label">{title}</h2>
		<div className="flex flex-wrap items-center gap-3">{children}</div>
	</section>
);

function Preview() {
	const [sent, setSent] = useState<string[]>([]);
	return (
		<main className="mx-auto flex min-h-dvh max-w-[34rem] flex-col gap-12 px-4 py-10 font-sans text-body text-ink">
			<header className="flex flex-col gap-2">
				<h1 className="text-title font-medium">Parchment UI</h1>
				<p className="text-muted">Each component in its states. Tab through to see the focus rings.</p>
			</header>

			<Section title="Button">
				<Button>Schedule call</Button>
				<Button variant="plain">Send an email</Button>
				<Button variant="quiet">Not now</Button>
				<Button isDisabled>Disabled</Button>
				<Button variant="plain" shape="circle" aria-label="Send">
					<ArrowUp />
				</Button>
				<Button shape="circle" size="small" aria-label="Send">
					<ArrowUp />
				</Button>
				<Button variant="quiet" shape="circle" size="small" aria-label="Send">
					<ArrowUp />
				</Button>
			</Section>

			<Section title="Chip">
				<ChipGroup aria-label="Or start with">
					<Chip>A new website</Chip>
					<Chip>Rework my site</Chip>
					<Chip>Not sure yet</Chip>
				</ChipGroup>
			</Section>

			<Section title="Text field">
				<TextField label="Your name" placeholder="Sam Smith" description="As you’d like Steve to say it" className="w-full" />
				<TextField label="Email" defaultValue="sam@" isInvalid errorMessage="Enter an email address" className="w-full" />
				<TextField label="What are you working on?" placeholder="A few lines is plenty" multiline className="w-full" />
			</Section>

			<Section title="Checkbox, radio and switch">
				<div className="grid w-full gap-8 sm:grid-cols-2">
					<CheckboxGroup label="What do you need?" defaultValue={['website']}>
						{services.map((service) => (
							<Checkbox key={service.id} value={service.id}>
								{service.name}
							</Checkbox>
						))}
					</CheckboxGroup>
					<RadioGroup label="Budget" defaultValue="mid">
						<Radio value="small">Under £5k</Radio>
						<Radio value="mid">£5–15k</Radio>
						<Radio value="large">Over £15k</Radio>
						<Radio value="unsure" isDisabled>
							Not sure yet
						</Radio>
					</RadioGroup>
					<div className="flex flex-col">
						<Checkbox isIndeterminate>All services</Checkbox>
						<Checkbox isInvalid>I’ve read the terms</Checkbox>
					</div>
					<div className="flex flex-col">
						<Switch defaultSelected>Send me the newsletter</Switch>
						<Switch isDisabled>Disabled</Switch>
					</div>
				</div>
			</Section>

			<Section title="Select and combo box">
				<Select label="Service" placeholder="Choose a service" items={services} className="w-full">
					{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
				</Select>
				<Select label="Timing" placeholder="When do you want to start?" className="w-full">
					<ListBoxSection title="Soon">
						<ListBoxItem id="now">Straight away</ListBoxItem>
						<ListBoxItem id="month">Within a month</ListBoxItem>
					</ListBoxSection>
					<ListBoxSection title="Later">
						<ListBoxItem id="quarter">Next quarter</ListBoxItem>
						<ListBoxItem id="unsure">Not sure yet</ListBoxItem>
					</ListBoxSection>
				</Select>
				<ComboBox label="Typeface" placeholder="Search typefaces" defaultItems={typefaces} className="w-full">
					{(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
				</ComboBox>
			</Section>

			<Section title="Dialog, popover, menu and tooltip">
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
				<DialogTrigger>
					<Button variant="plain">Share</Button>
					<Popover showArrow className="w-64">
						<Dialog>
							<DialogHeading className="text-body">Share link</DialogHeading>
							<p className="mt-1 text-label text-muted">Anyone with the link can view this project.</p>
						</Dialog>
					</Popover>
				</DialogTrigger>
				<MenuTrigger>
					<Button variant="plain">Project</Button>
					<Menu>
						<MenuSection title="Project">
							<MenuItem>Rename</MenuItem>
							<MenuItem>Duplicate</MenuItem>
							<MenuItem isDisabled>Move</MenuItem>
						</MenuSection>
						<MenuSeparator />
						<MenuItem variant="danger">Delete</MenuItem>
					</Menu>
				</MenuTrigger>
				<MenuTrigger>
					<Button variant="quiet">Sort by</Button>
					<Menu selectionMode="single" defaultSelectedKeys={['updated']}>
						<MenuItem id="name">Name</MenuItem>
						<MenuItem id="updated">Last updated</MenuItem>
						<MenuItem id="created">Created</MenuItem>
					</Menu>
				</MenuTrigger>
				<TooltipTrigger delay={300}>
					<Button variant="plain" shape="circle" aria-label="Send">
						<ArrowUp />
					</Button>
					<Tooltip>Send message</Tooltip>
				</TooltipTrigger>
			</Section>

			<Section title="Composer">
				<Composer label="Your message" placeholder="Tell me what you’re working on" submitIcon={<ArrowUp />} onSubmit={(message) => setSent((list) => [...list, message])} className="w-full" />
				{sent.length > 0 && <p className="font-mono text-label">Sent: {sent.join(', ')}</p>}
			</Section>
		</main>
	);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Preview />
	</StrictMode>,
);
