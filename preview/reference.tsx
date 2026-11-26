import { type ReactNode, useId } from 'react';
import { Focusable } from 'react-aria-components';
import details from 'virtual:details';
import { Popover, PreviewTrigger } from '../src/index.js';
import type { Detail, Prop, Use } from './details.mjs';
import { Aria, Header, Part, Source, groupBy } from './inspector.js';
import type { Entry } from './stories.js';
import { samples } from './samples.js';
import { CopyChip, Tokens } from './tokens.js';

type Sample = (props: Record<string, unknown>) => ReactNode;

const documented = (detail?: Detail): detail is Detail => detail?.kind === 'component' && Boolean(detail.props?.length || detail.rest?.length);

/** Whether a page has exports to list, for the contents beside it */
export const hasReference = (entry?: Entry) => entry?.exports?.some((name) => details.components[name]) ?? false;

const chip = 'rounded-md bg-bleed/8 px-1.5 py-0.5 font-mono text-label text-ink';

// Text with a dotted underline rather than a chip, as a term with a definition behind it, so it reads as something to hover
const previewable = 'cursor-default rounded-xs font-mono text-label text-ink underline decoration-bleed/40 decoration-dotted decoration-1 underline-offset-4 outline-offset-2 outline-ink transition-[text-decoration-color] duration-150 hover:decoration-ink focus-visible:outline-2 motion-reduce:transition-none';

// A number as the prop takes it, as Avatar's size of 32, rather than the text it's listed as
const valueOf = (option: string) => (/^-?\d+(?:\.\d+)?$/.test(option) ? Number(option) : option);

// An option, and with a sample, the component drawn with it on hover, focus or a long press. A button, so it can be
// tabbed to and a screen reader says it opens something. Focusable lends it the trigger's handlers
function Option({ prop, value, sample }: { prop: string; value: string; sample?: Sample }) {
	if (!sample) return <code className={chip}>{value}</code>;
	return (
		<PreviewTrigger>
			<Focusable>
				<button type="button" aria-label={`${prop} ${value}, preview`} className={previewable}>
					{value}
				</button>
			</Focusable>
			<Popover placement="top" showArrow className="p-4">
				{sample({ [prop]: valueOf(value) })}
			</Popover>
		</PreviewTrigger>
	);
}

function Type({ prop, sample }: { prop: Prop; sample?: Sample }) {
	if (prop.options)
		return (
			<span className={sample ? 'flex flex-wrap gap-x-3 gap-y-1' : 'flex flex-wrap gap-1'}>
				{prop.options.map((option) => (
					<Option key={option} prop={prop.name} value={option} sample={sample} />
				))}
			</span>
		);
	return prop.type ? <code className="font-mono text-label text-muted">{prop.type}</code> : <span className="text-muted">–</span>;
}

const cell = 'px-3 py-2.5 align-baseline first:pl-4 last:pr-4';

function Table({ detail, sample }: { detail: Detail; sample?: Sample }) {
	const props = detail.props ?? [];
	return (
		// Wider than a phone, so it scrolls on its own rather than the page
		<div className="overflow-x-auto overflow-y-hidden rounded-lg border border-bleed/8">
			<table className="w-full min-w-[36rem] border-collapse text-left text-label">
				<thead className="bg-bleed/4 text-muted">
					<tr>
						<th scope="col" className={`${cell} w-[22%] font-medium`}>
							Prop
						</th>
						<th scope="col" className={`${cell} w-[30%] font-medium`}>
							Type
						</th>
						<th scope="col" className={`${cell} w-[14%] font-medium`}>
							Default
						</th>
						<th scope="col" className={`${cell} font-medium`}>
							Description
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-bleed/6 border-t border-bleed/6">
					{props.map((prop) => (
						<tr key={prop.name}>
							<th scope="row" className={`${cell} font-normal`}>
								<code className="font-mono font-medium">{prop.name}</code>
								{prop.required && <span className="block text-muted">Required</span>}
							</th>
							<td className={cell}>
								<Type prop={prop} sample={sample} />
							</td>
							<td className={cell}>{prop.default ? <code className="font-mono">{prop.default.replace(/^'(.*)'$/, '$1')}</code> : <span className="text-muted">–</span>}</td>
							<td className={`${cell} text-muted`}>
								{prop.doc}
								{prop.from && <span className="block">From React Aria’s {prop.from}</span>}
							</td>
						</tr>
					))}
				</tbody>
				{detail.rest && detail.rest.length > 0 && (
					<tfoot className="border-t border-bleed/6 bg-bleed/4 text-muted">
						{detail.rest.map((rest) => (
							<tr key={rest.aria ?? rest.react}>
								<td colSpan={4} className={`${cell} text-muted`}>
									{props.length > 0 && 'And '}
									{rest.aria ? (
										<>
											React Aria’s <Aria name={rest.aria} /> props
										</>
									) : rest.react === 'HTMLAttributes' ? (
										'HTML attributes'
									) : (
										`React’s ${rest.react}`
									)}
								</td>
							</tr>
						))}
					</tfoot>
				)}
			</table>
		</div>
	);
}

// What it's made from, on one line under its name: React Aria's parts, its own, and style functions from other files
function Makeup({ detail }: { detail: Detail }) {
	const facts = [
		detail.kind === 'class' && detail.rest?.[0]?.aria && (
			<span key="extends">
				Extends React Aria’s <Aria name={detail.rest[0].aria} />
			</span>
		),
		detail.kind !== 'aria' && detail.aria?.length ? (
			<span key="aria">
				Built on {detail.aria.map((name, index) => (
					<span key={name}>
						{index > 0 && ', '}
						<Aria name={name} />
					</span>
				))}
			</span>
		) : null,
		detail.parts?.length ? (
			<span key="parts">
				Contains {detail.parts.map((name, index) => (
					<span key={name}>
						{index > 0 && ', '}
						<Part name={name} />
					</span>
				))}
			</span>
		) : null,
		detail.styles?.length ? (
			<span key="styles">
				Styled by {detail.styles.map((name, index) => {
					const styles = details.components[name];
					return (
						<span key={name}>
							{index > 0 && ', '}
							{styles ? <Source place={styles.place}>{name}()</Source> : <code className="font-mono">{name}()</code>}
						</span>
					);
				})}
			</span>
		) : null,
	].filter(Boolean);
	if (!facts.length) return null;
	return <p className="flex flex-wrap gap-x-4 gap-y-1 text-label text-muted">{facts}</p>;
}

// The theme's own tokens it reaches for, beside the ones it sets for itself, a row for each kind
const kinds = [
	{ kind: 'colours', name: 'Colours', variable: '--color-', prefix: '' },
	{ kind: 'text', name: 'Text', variable: '--text-', prefix: 'text-' },
	{ kind: 'fonts', name: 'Fonts', variable: '--typeface-', prefix: 'font-(family-name:--typeface-', suffix: ')' },
	{ kind: 'shadows', name: 'Shadows', variable: '--shadow-', prefix: 'shadow-' },
	{ kind: 'corners', name: 'Corners', variable: '--radius-', prefix: 'rounded-' },
	{ kind: 'animations', name: 'Animations', variable: '--animate-', prefix: 'animate-' },
] as const;

function Theme({ tokens }: { tokens: NonNullable<Detail['tokens']> }) {
	return (
		<div className="flex flex-col gap-2 text-label">
			<p className="text-muted">From the theme</p>
			<dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2">
				{kinds.map(({ kind, name, variable, prefix, ...rest }) =>
					tokens[kind]?.length ? (
						<div key={kind} className="col-span-2 grid grid-cols-subgrid items-baseline">
							<dt className="text-muted">{name}</dt>
							<dd className="flex flex-wrap gap-1.5">
								{tokens[kind].map((token) => (
									<CopyChip key={token} name={prefix + token + ('suffix' in rest ? rest.suffix : '')} property={variable + token} colour={kind === 'colours' ? details.colours[token]?.value : undefined} />
								))}
							</dd>
						</div>
					) : null,
				)}
			</dl>
		</div>
	);
}

type Placed = Use & { via?: string };

// Where it’s used, and where its style function is outside its file, as ColorField uses TextField’s input()
function usesOf(detail: Detail): Placed[] {
	const own = details.project;
	return [
		...detail.uses,
		...(detail.styles ?? []).flatMap((style) => (details.components[style]?.uses ?? []).filter((use) => use.file !== detail.place.file).map((use) => ({ ...use, via: style }))),
	].toSorted((a, b) => Number(a.project === own) - Number(b.project === own) || a.project.localeCompare(b.project) || a.path.localeCompare(b.path) || a.line - b.line);
}

// Each file it's used in, grouped by project, with the lines, each of which opens the file there
function Uses({ uses }: { uses: Placed[] }) {
	if (!uses.length) return <p className="text-label text-muted">Nowhere yet</p>;
	return (
		<div className="overflow-x-auto overflow-y-hidden rounded-lg border border-bleed/8">
			<table className="w-full border-collapse text-left text-label">
				<thead className="bg-bleed/4 text-muted">
					<tr>
						<th scope="col" className={`${cell} font-medium`}>
							File
						</th>
						<th scope="col" className={`${cell} w-full font-medium`}>
							Lines
						</th>
					</tr>
				</thead>
				{groupBy(uses, (use) => use.project).map(([project, inProject]) => (
					<tbody key={project} className="divide-y divide-bleed/6 border-t border-bleed/6">
						<tr className="border-b-0">
							<th scope="rowgroup" colSpan={2} className={`${cell} pt-4 pb-1 font-medium text-muted`}>
								{project}
							</th>
						</tr>
						{groupBy(inProject, (use) => use.path).map(([path, inFile]) => (
							<tr key={path}>
								<td className={`${cell} whitespace-nowrap`}>
									<Source place={inFile[0]} label={`Open ${path}`} isStrong>
										{path}
									</Source>
								</td>
								<td className={cell}>
									<span className="flex flex-wrap gap-x-3 gap-y-1">
										{inFile.map((use) => (
											<Source key={`${use.line}:${use.column}`} place={use} label={`${path}, line ${use.line}`}>
												{use.line}
												{use.via && ` via ${use.via}()`}
											</Source>
										))}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				))}
			</table>
		</div>
	);
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function Export({ detail }: { detail: Detail }) {
	const tokens = details.componentTokens[detail.name];
	const theme = detail.tokens && Object.keys(detail.tokens).length > 0 ? detail.tokens : undefined;
	const uses = usesOf(detail);
	const noun = detail.name.replace(/(?<!^)([A-Z])/g, ' $1').toLowerCase();
	// Tokens another name starts, such as --field-radius on a text field, are shared with the components that read them
	const own = `--${noun.replaceAll(' ', '-')}-`;
	const sharedBy = [...new Set(tokens?.filter((token) => !token.name.startsWith(own)).map((token) => /^--([a-z]+)-/.exec(token.name)?.[1]) ?? [])].filter(Boolean);
	return (
		<section className="flex flex-col gap-3">
			<Header name={detail.name} place={detail.place}>
				{detail.kind === 'aria' ? (
					<>
						React Aria’s <Aria name={detail.name} />, passed on as it is
					</>
				) : (
					detail.doc
				)}
			</Header>
			<Makeup detail={detail} />
			{documented(detail) && <Table detail={detail} sample={samples[detail.name]} />}
			{detail.states?.length ? (
				<p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-label">
					<span className="text-muted">States to style</span>
					{detail.states.map((state) => (
						<code key={state} className={chip}>
							{state}
						</code>
					))}
				</p>
			) : null}
			{(tokens || theme) && (
				<>
					<header className="mt-3 flex flex-col gap-1">
						<h4 className="font-medium">Tokens</h4>
						{tokens && (
							<p className="text-label text-muted">
								Set one on <code className={chip}>:root</code> in a site’s own CSS to restyle every {noun}, or on an element to restyle the ones inside it.
								{sharedBy.map((family) => (
									<span key={family}>
										{' '}
										The <code className={chip}>--{family}-</code> ones are shared, so they restyle every {family} too.
									</span>
								))}
							</p>
						)}
					</header>
					{tokens && <Tokens tokens={tokens} detail={detail} sample={samples[detail.name]} />}
					{theme && <Theme tokens={theme} />}
				</>
			)}
			<header className="mt-3 flex items-baseline gap-2">
				<h4 className="font-medium">Used in</h4>
				{uses.length > 0 && <span className="text-label text-muted">{plural(uses.length, 'place', 'places')}</span>}
			</header>
			<Uses uses={uses} />
		</section>
	);
}

/** Each export as the code has it, under the stories: what it's made from, its props, its tokens, and where it's used */
export function Reference({ entry }: { entry: Entry }) {
	const heading = useId();
	const shown = (entry.exports ?? []).map((name) => details.components[name]).filter((detail): detail is Detail => Boolean(detail));
	if (!shown.length) return null;
	return (
		<section id="api" aria-labelledby={heading} className="flex scroll-mt-25 flex-col gap-10 md:scroll-mt-18">
			<h2 id={heading} className="font-medium">
				API reference
			</h2>
			{shown.map((detail) => (
				<Export key={detail.name} detail={detail} />
			))}
		</section>
	);
}
