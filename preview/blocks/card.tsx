import { type CSSProperties, type ReactNode, useState } from 'react';
import { Button } from '../../src/index.js';
import { type Name, hex, surface } from '../brand.js';
import { Choice, ControlGroup, Playground, TextControl, pick } from '../playground.js';
import { library } from '../stories.js';
import { examples } from './examples.js';

// A card: an image area, a title and a line under it, and a button or two. The image area sits inside the card's padding
// with its corners less that padding, so the two curves stay concentric, and holds a picture or a component drawn live

export const fills = ['raised', 'quiet', 'marigold', 'slate', 'pine'] as const;
export type Fill = (typeof fills)[number];

// A brand fill re-sets the library's roles for its colour, so the text, the image area and the buttons all suit it
const brandFills: Partial<Record<Fill, [Name, Name]>> = {
	marigold: ['Marigold', 'Marigold dark'],
	slate: ['Slate', 'Pine'],
	pine: ['Pine', 'Chalk'],
};

const fillClass: Record<Fill, string> = {
	raised: 'bg-raised shadow-panel [--bleed:var(--raised-bleed)]',
	quiet: 'bg-bleed/4',
	marigold: '',
	slate: '',
	pine: '',
};

export interface CardProps {
	fill?: Fill;
	/** What the image area shows: a picture, or a component drawn live. It can't be used inside the card */
	media?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	/** One button, which fills the width, or two, which share it */
	actions?: ReactNode;
	/** Where the card goes, through its title, which stretches over the whole card */
	href?: string;
	className?: string;
}

export function Card({ fill = 'raised', media, title, description, actions, href, className }: CardProps) {
	const brand = brandFills[fill];
	const style: CSSProperties | undefined = brand ? surface(hex(brand[0]), hex(brand[1])) : undefined;
	return (
		<article style={style} className={[
				'group/card relative flex flex-col gap-3 rounded-2xl p-2 pb-3 text-ink',
				href && 'outline-offset-2 outline-ink has-[a:focus-visible]:outline-2',
				// A raised card with no buttons is pressed whole, so it answers as a raised button does: hovered, it lifts by two
				// more layers of shadow, and pressed, it sits down as its drop goes, leaving the edge. Written out, as --shadow-panel
				// is settled on the root, so the drop can't be turned off on the card
				href &&
					!actions &&
					fill === 'raised' &&
					'transition-shadow duration-150 ease-out has-[a:hover:not(:active)]:shadow-[inset_0_0_0_.5px_var(--sheen),0_0_0_.5px_var(--edge),0_1px_1px_-1px_var(--drop-raised),0_1px_3px_-1.5px_var(--drop-raised),0_2px_4px_-2px_var(--drop-raised),0_3px_6px_-3px_var(--drop-raised),0_4px_8px_-4px_var(--drop-raised)] has-[a:active]:shadow-[inset_0_0_0_.5px_var(--sheen),0_0_0_.5px_var(--edge)] motion-reduce:transition-none',
				fillClass[fill],
				className,
			].filter(Boolean).join(' ')}>
			{media && (
				// Inert, as a component in it is there to be seen, and a second set of controls in the card would only confuse
				<div
					inert
					className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[calc(var(--radius-2xl)---spacing(2))] bg-bleed/5 p-4 transition-colors duration-150 ease-out group-has-[a:hover]/card:bg-bleed/8 motion-reduce:transition-none"
				>
					{media}
				</div>
			)}
			<div className="flex flex-1 flex-col gap-0.5 px-2">
				<h3 className="text-control font-medium text-ink">
					{href ? (
						// The title is the link, so the card reads as one link named by its title, and its text can still be selected
						<a href={href} className="cursor-default outline-0 after:absolute after:inset-0 after:rounded-2xl">
							{title}
						</a>
					) : (
						title
					)}
				</h3>
				{description && <p className="line-clamp-2 text-pretty text-control text-muted">{description}</p>}
			</div>
			{actions && <div className="flex gap-2 px-1 *:flex-1">{actions}</div>}
		</article>
	);
}

const exampleNames = Object.keys(examples);
const buttonCounts = ['none', 'one', 'two'] as const;

const actionsFor = (count: (typeof buttonCounts)[number], label: string) =>
	count === 'none' ? undefined : count === 'one' ? (
		<Button variant="secondary">{label}</Button>
	) : (
		<>
			<Button variant="secondary">{label}</Button>
			<Button variant="ghost">Copy code</Button>
		</>
	);

export function CardPlayground() {
	const [fill, setFill] = useState<Fill>('raised');
	const [example, setExample] = useState('Button');
	const [hasMedia, setMedia] = useState<'example' | 'none'>('example');
	const [title, setTitle] = useState('Button');
	const [description, setDescription] = useState('Any action, with an icon at either end or just an icon');
	const [buttons, setButtons] = useState<(typeof buttonCounts)[number]>('one');
	const [label, setLabel] = useState('Open');
	const Example = examples[example];
	return (
		<Playground
			onRandom={() => {
				const next = pick(exampleNames);
				setFill(pick(fills));
				setExample(next);
				setTitle(next);
				setButtons(pick(buttonCounts));
			}}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Image area" options={['example', 'none'] as const} value={hasMedia} onChange={setMedia} />
						<Choice label="Example" options={exampleNames} value={example} onChange={setExample} isDisabled={hasMedia === 'none'} />
						<TextControl label="Title" value={title} onChange={setTitle} />
						<TextControl label="Description" value={description} onChange={setDescription} />
						<Choice label="Buttons" options={buttonCounts} value={buttons} onChange={setButtons} />
						<TextControl label="Button" value={label} onChange={setLabel} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Fill" options={fills} value={fill} onChange={setFill} />
					</ControlGroup>
				</>
			}
		>
			<Card fill={fill} media={hasMedia === 'example' ? <Example /> : undefined} title={title} description={description || undefined} actions={actionsFor(buttons, label)} className="w-72" />
		</Playground>
	);
}

// A card has room for two lines, so it takes a description's first sentence, or a summary where that's still too long
const firstSentence = (description: ReactNode) => (typeof description === 'string' ? description.split(/(?<=[a-z])\. /)[0] : description);

/** A group of the library under its name, each component in a card with itself drawn in the image area */
export const categoryId = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

export function Category({ name = 'Actions', fill = 'raised', id }: { name?: string; fill?: Fill; id?: string }) {
	const group = library.find((each) => each.name === name);
	if (!group) return null;
	const heading = `${id ?? categoryId(name)}-heading`;
	return (
		<section id={id} aria-labelledby={heading} className="flex w-full scroll-mt-25 flex-col gap-4 md:scroll-mt-18">
			<h2 id={heading} className="text-title">
				{name}
			</h2>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{group.components.map((entry) => {
					const Example = examples[entry.name];
					return (
						<Card
							key={entry.id}
							fill={fill}
							media={Example ? <Example /> : <span className="text-muted">{entry.name}</span>}
							title={entry.name}
							description={entry.summary ?? firstSentence(entry.description)}
							href={`#/ui/${entry.id}`}
						/>
					);
				})}
			</div>
		</section>
	);
}
