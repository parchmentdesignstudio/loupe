import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import details from 'virtual:details';
import { Avatar, Button, Link, Switch, TextField } from '../src/index.js';

// What a size comes to in pixels where it's shown, so a touch screen's 16px control text shows as 16px
function useMeasure<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [measure, setMeasure] = useState<{ size: string; line: string }>();
	useLayoutEffect(() => {
		if (!ref.current) return;
		const { fontSize, lineHeight } = getComputedStyle(ref.current);
		setMeasure({ size: fontSize, line: lineHeight === 'normal' ? 'normal' : `${Math.round(parseFloat(lineHeight) * 10) / 10}px` });
	}, []);
	return [ref, measure] as const;
}

const uses: Record<string, string> = {
	title: 'A page or a dialog’s heading',
	body: 'Reading, such as a description or a message',
	control: 'Buttons, fields, options, tabs and menus',
	label: 'What names or notes something, such as a field’s description, a table’s cells or a section’s heading',
};

// Written out, as Tailwind only finds whole class names
const classes: Record<string, string> = { title: 'text-title font-medium', body: 'text-body', control: 'text-control', label: 'text-label' };
const faces: Record<string, string> = { sans: 'font-sans', mono: 'font-mono' };

const samples: Record<string, string> = {
	title: 'Quarterly review',
	body: 'Send the proposal to the client by Friday, with the revised costs and the new timeline',
	control: 'Save changes',
	label: 'Last edited 2 hours ago',
};

function Size({ name }: { name: string }) {
	const [ref, measure] = useMeasure<HTMLParagraphElement>();
	return (
		<div className="grid gap-x-6 gap-y-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr]">
			<div className="flex flex-col gap-0.5 text-label">
				<code className="font-mono text-ink">text-{name}</code>
				<span className="text-muted tabular-nums">{measure ? `${measure.size} on ${measure.line}` : ' '}</span>
			</div>
			<div className="flex min-w-0 flex-col gap-1">
				<p ref={ref} className={`${classes[name] ?? ''} text-pretty text-ink`}>
					{samples[name]}
				</p>
				<p className="text-label text-muted">{uses[name]}</p>
			</div>
		</div>
	);
}

/** Each size, largest first, measured as it's shown */
export function Scale() {
	const sizes = details.type.sizes.toSorted((a, b) => parseFloat(b.size ?? '0') - parseFloat(a.size ?? '0'));
	return <div className="flex w-full flex-col divide-y divide-bleed/8">{sizes.map(({ name }) => <Size key={name} name={name} />)}</div>;
}

const families: Record<string, { name: string; role: string }> = {
	sans: { name: 'Elza Round', role: 'Everything, in 400 and 500' },
	mono: { name: 'Auger Mono', role: 'Code, tokens and file names' },
};

/** Each family, its alphabet and figures */
export function Families() {
	return (
		<div className="grid w-full gap-6 sm:grid-cols-2">
			{details.type.families.map(({ name }) => (
				<div key={name} className={`flex flex-col gap-3 ${faces[name] ?? ''}`}>
					<span className="text-[2.5rem] leading-none text-ink">Aa</span>
					<div className="flex flex-col gap-0.5 font-sans text-label">
						<span className="font-medium text-ink">{families[name]?.name ?? name}</span>
						<span className="text-muted">{families[name]?.role}</span>
					</div>
					<p className="text-control break-all text-muted">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 £€$%&amp;@?!</p>
				</div>
			))}
		</div>
	);
}

const weights = [300, 400, 500, 600, 700, 800];
const inUse = new Set([400, 500]);

/** Elza Round's range, as it's variable, with the two the library uses */
export function Weights() {
	return (
		<div className="flex w-full flex-col divide-y divide-bleed/8">
			{weights.map((weight) => (
				<div key={weight} className="flex items-baseline gap-6 py-2 first:pt-0 last:pb-0">
					<span className="w-8 shrink-0 font-mono text-label text-muted tabular-nums">{weight}</span>
					<span className={`min-w-0 flex-1 truncate text-body ${inUse.has(weight) ? 'text-ink' : 'text-muted'}`} style={{ fontWeight: weight }}>
						Send the proposal by Friday
					</span>
					{inUse.has(weight) && <span className="text-label text-muted">{weight === 400 ? 'Normal' : 'Medium'}</span>}
				</div>
			))}
		</div>
	);
}

const amounts = ['£9.00', '£167.38', '£1,111.11', '£563.33', '£88.19'];

function Column({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-label text-muted">{label}</span>
			<div className={`flex flex-col items-end text-control text-ink ${className ?? ''}`}>{children}</div>
		</div>
	);
}

/** Proportional figures beside tabular ones, which line up in a column */
export function Figures() {
	return (
		<div className="flex gap-12">
			<Column label="Proportional">
				{amounts.map((amount) => (
					<span key={amount}>{amount}</span>
				))}
			</Column>
			<Column label="tabular-nums" className="tabular-nums">
				{amounts.map((amount) => (
					<span key={amount}>{amount}</span>
				))}
			</Column>
		</div>
	);
}

/** The sizes together, as a settings panel has them */
export function Together() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<header className="flex flex-col gap-2">
				<h3 className="text-title font-medium text-balance text-ink">Notifications</h3>
				<p className="text-pretty text-muted">Choose what reaches you and how often, so the important things stand out from the rest</p>
			</header>
			<section className="flex flex-col gap-3">
				<h4 className="text-label font-medium text-ink">Email</h4>
				<Switch defaultSelected>When someone mentions me</Switch>
				<Switch>A weekly summary</Switch>
			</section>
			<TextField label="Send them to" description="We’ll only use this for notifications" defaultValue="team@example.com" />
			<div className="flex items-center justify-between gap-3">
				<code className="font-mono text-label text-muted">settings/notifications.tsx</code>
				<Button variant="secondary">Save changes</Button>
			</div>
		</div>
	);
}

/** Body text at length, as a post on a blog: a heading, a byline, paragraphs, a subheading, a list, a quote and code */
export function Article() {
	return (
		<article className="flex w-full max-w-[36rem] flex-col gap-6 text-body text-ink">
			<header className="flex flex-col gap-4">
				<p className="text-label text-muted">Process</p>
				<h3 className="text-title font-medium text-balance">Why we write the brief last</h3>
				<p className="text-pretty text-muted">A brief written on day one describes the project we imagined. One written after the first fortnight describes the one we’re actually building.</p>
				<div className="flex items-center gap-3">
					<Avatar name="Parchment" shape="square" size={32} />
					<div className="flex flex-col text-label">
						<span className="font-medium">The Parchment team</span>
						<span className="text-muted tabular-nums">12 November 2026 · 4 minute read</span>
					</div>
				</div>
			</header>
			<div className="flex flex-col gap-4 text-pretty">
				<p>
					Most projects start with a document. Someone gathers what the client said in the first meeting, adds a budget and a deadline, and calls it the brief. It feels like progress, and for a week or two it is. Then the first designs go round, and the conversation changes.
				</p>
				<p>
					What people ask for and what they need are rarely the same thing. A request for “a new homepage” turns out to be about leads that never get a reply. A request for “something more modern” turns out to be about a sales team that’s embarrassed to send the link. You only find that out by making something and watching how people react to it.
				</p>
				<h4 className="mt-4 font-medium">What we do instead</h4>
				<p>We still write things down from the start, but we call them notes, not a brief. For the first fortnight we:</p>
				<ul className="flex list-disc flex-col gap-1.5 ps-5 marker:text-muted">
					<li>sketch three rough directions, each a day’s work at most</li>
					<li>put them in front of the people who’ll use the result, not only the people paying for it</li>
					<li>write down every question we couldn’t answer, and who could</li>
				</ul>
				<p>
					By the end, the notes have become something closer to a brief: shorter, more specific, and full of things nobody knew at the start. It’s the document we wish we’d had on day one, and the only honest way to get it is to wait.
				</p>
				<blockquote className="my-2 border-s-2 border-bleed/16 ps-4 text-muted">
					<p>“We thought we needed a website. It turned out we needed a better way to answer the phone.”</p>
				</blockquote>
				<p>
					On the code side the same idea holds. We keep tokens such as <code className="rounded-sm bg-bleed/8 px-1 py-0.5 font-mono text-[0.875em]">text-body</code> loose until the first screens are real, then settle them. You can read more about how we name them on the <Link href="#/ui/colour">colour page</Link>.
				</p>
			</div>
		</article>
	);
}

/** Plain HTML as .prose in preview.css styles it, as many elements as a page of writing is likely to use */
export function Prose() {
	return (
		<div className="prose w-full max-w-[36rem]">
			<h1>A guide to the studio handbook</h1>
			<p>
				This handbook covers how we plan, design and ship work. It’s <em>a living document</em>, so if something here doesn’t match how we work, <strong>change it</strong>. Start with the{' '}
				<a href="#/ui/colour">colour tokens</a> if you’re new, or read on for the rest.
			</p>
			<p>
				<small>Last reviewed on <time dateTime="2026-11-12">12 November 2026</time>. Version 2.4.</small>
			</p>

			<h2>Writing for the screen</h2>
			<p>
				Keep sentences short and put the point first. A <dfn>standfirst</dfn> is the sentence under a heading that tells someone whether to keep reading. We write in British English, so it’s <i>colour</i> and <i>organise</i>, and we spell out{' '}
				<abbr title="Web Content Accessibility Guidelines">WCAG</abbr> the first time it appears.
			</p>
			<p>
				Edits are tracked in the draft: we <del>always</del> <ins>usually</ins> send copy for review before it goes live. Words that matter for search are <mark>highlighted</mark> in the brief, and old prices are <s>£1,200</s> struck through rather than removed.
			</p>
			<p>
				Footnotes use superscript, as in the 2nd round of review<sup>1</sup>, and chemistry or maths uses subscript, as in H<sub>2</sub>O or x<sub>n</sub>. A variable in a formula is set as <var>width</var> × <var>height</var>. As the <cite>Style guide</cite> puts it, <q>if it reads like a manual, rewrite it</q>.
			</p>

			<h3>Lists</h3>
			<p>An unordered list, for things in no particular order:</p>
			<ul>
				<li>a brief, written after the first fortnight</li>
				<li>
					three rough directions, each with
					<ul>
						<li>a sketch</li>
						<li>a sentence on why</li>
					</ul>
				</li>
				<li>a list of open questions</li>
			</ul>
			<p>An ordered list, for steps:</p>
			<ol>
				<li>Agree the scope and the budget</li>
				<li>Share a first direction within a week</li>
				<li>Review, revise and sign off</li>
			</ol>

			<h3>Terms</h3>
			<dl>
				<dt>Ground</dt>
				<dd>The layer everything sits on, the darkest in the dark</dd>
				<dt>Panel</dt>
				<dd>A card or sidebar, one step above the ground</dd>
				<dt>Raised</dt>
				<dd>Controls, such as a field or a checked box</dd>
			</dl>

			<h2>Code</h2>
			<p>
				Inline code reads as <code>text-body</code>, and keys as <kbd>⌘</kbd> <kbd>K</kbd> to search. A program’s output reads as <samp>Build finished in 2.4s</samp>. A block of code:
			</p>
			<pre>
				<code>{`import { Button } from '@parchment/ui'

export function Save() {
  return <Button>Save changes</Button>
}`}</code>
			</pre>

			<h2>Quotes and figures</h2>
			<blockquote>
				<p>We thought we needed a website. It turned out we needed a better way to answer the phone.</p>
				<footer>A client, on the first fortnight</footer>
			</blockquote>
			<figure>
				<div className="aspect-[3/1] bg-linear-to-br from-marigold-83 to-green-68" />
				<figcaption>Figure 1. The brand’s marigold, warming into green</figcaption>
			</figure>

			<h3>A table</h3>
			<table>
				<caption>Hours by stage, for a typical site</caption>
				<thead>
					<tr>
						<th scope="col">Stage</th>
						<th scope="col">Weeks</th>
						<th scope="col" className="text-end">
							Hours
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Discovery</td>
						<td>2</td>
						<td className="text-end">32</td>
					</tr>
					<tr>
						<td>Design</td>
						<td>4</td>
						<td className="text-end">96</td>
					</tr>
					<tr>
						<td>Build</td>
						<td>6</td>
						<td className="text-end">144</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td>Total</td>
						<td>12</td>
						<td className="text-end">272</td>
					</tr>
				</tfoot>
			</table>

			<h4>Smaller headings</h4>
			<p>A fourth-level heading sits on the label size, as do the fifth and sixth.</p>
			<h5>A fifth-level heading</h5>
			<p>Rarely needed, but here for completeness.</p>
			<h6>A sixth-level heading</h6>
			<p>Muted, as the least of them.</p>

			<details>
				<summary>Why don’t we use a seventh heading?</summary>
				<p>HTML stops at six, and by the fourth most pages are better split in two.</p>
			</details>

			<hr />

			<address>
				The studio, 4 Mill Lane
				<br />
				Leeds LS1 4AB
			</address>
			<p>
				<small>
					<sup>1</sup> Rounds after the second are billed by the hour.
				</small>
			</p>
		</div>
	);
}
