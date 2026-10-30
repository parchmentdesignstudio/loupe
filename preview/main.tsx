import { type ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Chip, ChipGroup, Composer, TextField } from '../src/index.js';

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
