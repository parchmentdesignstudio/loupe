import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { Link } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const settings = ['alone', 'sentence', 'list'] as const;
const destinations = ['page', 'elsewhere', 'nowhere'] as const;
const sampleLinks = ['link', 'pricing', 'our work', 'the brief', 'read more', 'Parchment', longWords];
const services = ['Brand identity', 'Website', 'Design system', 'Illustration'];

// The router keeps a page link inside the playground. Elsewhere opens a new tab, and nowhere has no href, so it's
// a span React Aria gives the link role
export function LinkPlayground() {
	const [label, setLabel] = useState('link');
	const [setting, setSetting] = useState<(typeof settings)[number]>('sentence');
	const [destination, setDestination] = useState<(typeof destinations)[number]>('page');
	const [isCurrent, setCurrent] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [followed, setFollowed] = useState<string | null>(null);

	const linkProps = {
		href: destination === 'page' ? '#pricing' : destination === 'elsewhere' ? 'https://example.com' : undefined,
		target: destination === 'elsewhere' ? '_blank' : undefined,
		'aria-current': isCurrent ? ('page' as const) : undefined,
		isDisabled,
	};

	const shuffle = () => {
		setLabel(pick(sampleLinks));
		setSetting(pick(settings));
		setDestination(pick(destinations));
		setCurrent(Math.random() < 0.25);
		setDisabled(Math.random() < 0.2);
		setFollowed(null);
	};

	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Setting" options={settings} value={setting} onChange={setSetting} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Text" value={label} onChange={setLabel} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Goes to" options={destinations} value={destination} onChange={setDestination} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Current page" value={isCurrent} onChange={setCurrent} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<RouterProvider navigate={(href) => setFollowed(href)}>
				<div className="flex max-w-sm flex-col items-center gap-4 text-center">
					{setting === 'alone' && <Link {...linkProps}>{label}</Link>}
					{setting === 'sentence' && (
						<p>
							Anyone with the <Link {...linkProps}>{label}</Link> can view this project, and leave a comment on any page of it.
						</p>
					)}
					{setting === 'list' && (
						<div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
							{services.map((service) => (
								<Link key={service} href="#service">
									{service}
								</Link>
							))}
							<Link {...linkProps}>{label}</Link>
						</div>
					)}
					{followed && <p className="font-mono text-label text-muted">Followed {followed}</p>}
				</div>
			</RouterProvider>
		</Playground>
	);
}
