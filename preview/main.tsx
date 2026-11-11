import { StrictMode, useEffect, useRef, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigation, NavigationTree, NavigationTreeHeader, NavigationTreeItem, NavigationTreeItemContent, NavigationTreeSection } from '../src/index.js';
import { ParchmentLogo } from './logo.js';
import { type Entry, library } from './stories.js';

const entries = library.flatMap((group) => group.components);

// All components leaves out the foundations, such as colour, which export nothing
const components = entries.filter((entry) => entry.exports);

const subscribe = (onChange: () => void) => {
	window.addEventListener('hashchange', onChange);
	return () => window.removeEventListener('hashchange', onChange);
};

const useAddress = () => useSyncExternalStore(subscribe, () => window.location.hash.replace(/^#\/?/, ''));

function Sidebar({ current }: { current: string }) {
	return (
		<Navigation aria-label="Components">
			<p className="flex items-center gap-1.5 px-3 font-medium">
				<ParchmentLogo size={16} />
				loupe/ui
			</p>
			<NavigationTree aria-label="Components" selectedRoute={`#/${current}`}>
				<NavigationTreeItem id="all" href="#/" textValue="All components">
					<NavigationTreeItemContent>All components</NavigationTreeItemContent>
				</NavigationTreeItem>
				{library.map((group) => (
					<NavigationTreeSection key={group.name} id={group.name}>
						<NavigationTreeHeader>{group.name}</NavigationTreeHeader>
						{group.components.map((entry) => (
							<NavigationTreeItem key={entry.id} id={entry.id} href={`#/${entry.id}`} textValue={entry.name}>
								<NavigationTreeItemContent>{entry.name}</NavigationTreeItemContent>
							</NavigationTreeItem>
						))}
					</NavigationTreeSection>
				))}
			</NavigationTree>
		</Navigation>
	);
}

function Stories({ entry, heading: Heading }: { entry: Entry; heading: 'h2' | 'h3' }) {
	return entry.stories.map((story) => (
		<section key={story.name} className="flex flex-col gap-3">
			<Heading className="font-mono text-label text-muted">{story.name}</Heading>
			<div className={['flex flex-wrap items-center gap-3 rounded-lg border border-bleed/8 p-6', story.box].filter(Boolean).join(' ')}>
				<story.render />
			</div>
		</section>
	));
}

function ComponentPage({ entry }: { entry: Entry }) {
	return (
		<>
			<header className="flex flex-col gap-2">
				<h1 className="text-title font-medium">{entry.name}</h1>
				<p className="text-muted">{entry.description}</p>
				<code className="font-mono text-label text-muted">{entry.exports ? `import { ${entry.exports.join(', ')} } from '@parchment/ui'` : entry.usage}</code>
			</header>
			<Stories entry={entry} heading="h2" />
		</>
	);
}

function Overview() {
	return (
		<>
			<header className="flex flex-col gap-2">
				<h1 className="flex items-center gap-1.5 text-title font-medium">
					<ParchmentLogo size={24} />
					loupe/ui
				</h1>
				<p className="text-muted">Each component in its states. Tab through to see the focus rings.</p>
			</header>
			{components.map((entry) => (
				<section key={entry.id} className="flex flex-col gap-6">
					<h2 className="text-title font-medium">{entry.name}</h2>
					<Stories entry={entry} heading="h3" />
				</section>
			))}
		</>
	);
}

function Preview() {
	const address = useAddress();
	const entry = entries.find((item) => item.id === address);
	const shown = useRef(address);

	useEffect(() => {
		document.title = entry ? `${entry.name} · loupe/ui` : 'loupe/ui';
	}, [entry]);

	useEffect(() => {
		if (shown.current === address) return;
		shown.current = address;
		window.scrollTo(0, 0);
	}, [address]);

	return (
		<div className="font-sans text-body text-ink md:flex">
			<Sidebar current={entry ? entry.id : ''} />
			<main className="min-w-0 flex-1 px-4 py-10 md:px-10">
				<div className="mx-auto flex max-w-[40rem] flex-col gap-10">{entry ? <ComponentPage entry={entry} /> : <Overview />}</div>
			</main>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Preview />
	</StrictMode>,
);
