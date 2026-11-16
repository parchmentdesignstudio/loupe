import { type CSSProperties, Fragment, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Chip, Popover, PreviewTrigger, Swatch } from '../src/index.js';
import { Icon } from '@parchment/icons/react';
import { useHighlight } from '../src/shiki.js';
import type { ComponentToken, Detail } from './details.mjs';

type Sample = (props: Record<string, unknown>) => ReactNode;
type Kind = 'radius' | 'padding-x' | 'padding-y' | 'fill' | 'text' | 'type' | 'scale' | 'whole';

const cell = 'px-3 py-2.5 align-baseline first:pl-4 last:pr-4';

// What a token comes to here, as 8px rather than 0.5rem, read from the page so it follows the theme and any override
function resolved(name: string) {
	const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	if (!/rem|px|calc\(/.test(value)) return value;
	// A length, maybe a calc() such as Tailwind's spacing, worked out by the browser on an element out of sight
	const probe = document.createElement('div');
	probe.style.cssText = `position:absolute;visibility:hidden;width:var(${name})`;
	document.body.append(probe);
	const width = getComputedStyle(probe).width;
	probe.remove();
	return `${parseFloat(width)}px`;
}

type Step = { kind: 'component' | 'role' | 'palette' | 'theme' | 'function'; name: string; value: string; light?: string; dark?: string };
const stepLabels = { component: 'Component', role: 'Role', palette: 'Palette', theme: 'Theme', function: 'Tailwind' };

// What a token's value shows as. A palette colour goes by its name, as pine-26. A value too long to read in place, such
// as a shadow's light-dark() mix, goes by the token it comes from, as shadow-raised-color, with a swatch if it's a colour
function shownOf(token: ComponentToken) {
	const last = token.steps?.at(-1);
	const value = resolved(token.name);
	const palette = Boolean(token.steps?.some((step) => step.name.startsWith('--color-')));
	const long = !palette && value.includes('(') && Boolean(last);
	const shown = (palette ? last?.name.replace(/^--color-/, '') : long ? last?.name.replace(/^--/, '') : value) ?? value;
	return { shown, colour: palette || (long && CSS.supports('color', value)) };
}

// A long declaration set out as a CSS file would, a function's arguments a line each, as light-dark()'s two colours, so
// it reads without wrapping inside a name
function formatted(code: string) {
	const open = code.indexOf('(');
	if (code.length <= 48 || open === -1 || !code.endsWith(');')) return code;
	const args: string[] = [];
	let depth = 0;
	let start = open + 1;
	for (let at = start; at < code.length - 2; at++) {
		if (code[at] === '(') depth++;
		else if (code[at] === ')') depth--;
		else if (code[at] === ',' && !depth) {
			args.push(code.slice(start, at).trim());
			start = at + 1;
		}
	}
	args.push(code.slice(start, code.length - 2).trim());
	return args.length < 2 ? code : `${code.slice(0, open + 1)}\n${args.map((arg) => `\t${arg}`).join(',\n')}\n);`;
}

const readable = (value: string) => value.replace(/var\(--(?:color-)?([\w-]+)\)/g, '$1');

// How the value is reached, said beside it: 0.25rem × 2, a palette colour's oklch(), or nothing for a value set here
function derivationOf(steps: Step[]) {
	const fn = steps.find((step) => step.kind === 'function');
	if (fn) return `${steps.find((step) => step.name === '--spacing')?.value} × ${/\(([\d.]+)\)/.exec(fn.name)?.[1]}`;
	const last = steps.at(-1);
	return last ? readable(last.value) : undefined;
}

// A step as a line of CSS. Tailwind's --spacing(2) isn't a declaration, so it's a comment saying what it comes to
const lineOf = (step: Step) => (step.kind === 'function' ? `/* ${step.name} = ${step.value} */` : formatted(`${step.name}: ${step.value};`));

// CSS highlighted as Code highlights it, a line at a time. Shiki only reads a declaration inside a rule, so it's wrapped
// in one and the wrapper taken off again. Plain until Shiki has loaded
function useLines(css: string) {
	return (
		useHighlight(`a{${css}}`, { language: 'css', isInline: true })
			?.replace(/^(<span[^>]*>)a\{/, '$1')
			.replace(/\}(<\/span>)$/, '$1')
			.split('<br>') ?? css.split('\n')
	);
}

// One step in the breakdown's grid: its label, then its lines numbered on from the step before
function BreakdownStep({ step, from }: { step: Step; from: number }) {
	const lines = useLines(lineOf(step));
	return (
		<>
			<span className="col-start-2 pt-2.5 font-sans text-muted first:pt-0">{stepLabels[step.kind]}</span>
			{lines.map((line, index) => (
				<Fragment key={index}>
					<span aria-hidden className="text-right text-muted/50 tabular-nums select-none">
						{from + index}
					</span>
					<code className="min-w-0 overflow-x-auto whitespace-pre text-ink [tab-size:2]" dangerouslySetInnerHTML={{ __html: line || ' ' }} />
				</Fragment>
			))}
		</>
	);
}

// A theme value's two sides, each by its icon, a swatch for a colour
function Sides({ step, colour }: { step: Step; colour: boolean }) {
	const sides = [
		{ icon: 'sun-max', label: 'Light', value: step.light! },
		{ icon: 'moon', label: 'Dark', value: step.dark! },
	];
	return (
		<span className="ml-auto flex shrink-0 items-center gap-3 text-muted">
			{sides.map((side) => (
				<span key={side.icon} className="flex items-center gap-1.5" title={`${side.label}: ${readable(side.value)}`}>
					<Icon name={side.icon} aria-label={side.label} />
					{colour ? <Swatch color={side.value} size="small" /> : <span className="tabular-nums">{readable(side.value)}</span>}
				</span>
			))}
		</span>
	);
}

const swap = 'transition-[opacity,filter,scale] duration-250 ease-out motion-reduce:transition-opacity';
const gone = 'scale-90 opacity-0 blur-[3px] motion-reduce:scale-100 motion-reduce:blur-none';

// A token's value in place, as Paper shows it: 8px, or a colour's swatch and palette name, as a chip. Hovering or
// focusing it shows the value and how it's reached, then each step from the component's token down to the raw value
// as numbered CSS. One size throughout, with weight carrying the hierarchy
function TokenValue({ token }: { token: ComponentToken }) {
	const { shown, colour } = shownOf(token);
	const steps = [{ kind: 'component', name: token.name, value: token.value }, ...(token.steps ?? [])] as Step[];
	const last = steps.at(-1)!;
	const themed = Boolean(last.light && last.dark);
	const derivation = token.steps?.length ? derivationOf(token.steps as Step[]) : undefined;
	const starts = steps.map((_, index) => 1 + steps.slice(0, index).reduce((lines, step) => lines + lineOf(step).split('\n').length, 0));
	const [isCopied, setCopied] = useState(false);
	useEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [isCopied]);
	return (
		<PreviewTrigger>
			<Chip size="small" aria-label={`${shown}, copy ${token.name}`} className="grid font-mono" onPress={() => void navigator.clipboard.writeText(token.name).then(() => setCopied(true))}>
				{/* The value and the tick stacked, as Code's copy button swaps its icons: one blurs, fades and shrinks a
				little as the other comes in, and the value keeps its room so the chip holds its width */}
				<span className={`col-start-1 row-start-1 flex items-center gap-1 ${swap} ${isCopied ? gone : ''}`}>
					{colour && <Swatch color={`var(${token.name})`} size="small" />}
					{shown}
				</span>
				<span className={`col-start-1 row-start-1 flex items-center justify-center ${swap} ${isCopied ? '' : gone}`}>
					<Icon name="checkmark" />
				</span>
				<output className="sr-only">
					{isCopied ? `Copied ${token.name}` : ''}
				</output>
			</Chip>
			<Popover placement="end top" className="flex w-max max-w-[min(36rem,calc(100vw-2rem))] flex-col text-label leading-5">
				<div className="flex items-center gap-2 px-3 py-2.5">
					{colour && <Swatch color={`var(${token.name})`} size="small" />}
					<p className="flex min-w-0 flex-wrap items-baseline gap-x-2">
						<span className="font-semibold text-ink tabular-nums">{shown}</span>
						{!themed && derivation && derivation !== shown && <span className={`text-muted tabular-nums ${derivation.includes('(') ? 'font-mono' : ''}`}>{derivation}</span>}
					</p>
					{themed && <Sides step={last} colour={colour} />}
				</div>
				<div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 rounded-b-lg border-t border-bleed/6 bg-bleed/4 px-3 py-2.5 font-mono">
					{steps.map((step, index) => (
						<BreakdownStep key={step.name} step={step} from={starts[index]} />
					))}
				</div>
			</Popover>
		</PreviewTrigger>
	);
}

// What a token sets, from its name
const kindOf = (name: string): Kind =>
	/radius/.test(name) ? 'radius' : /padding-x/.test(name) ? 'padding-x' : /padding-y/.test(name) ? 'padding-y' : /fill|background|shadow/.test(name) ? 'fill' : /-text$|color/.test(name) ? 'text' : /font|weight/.test(name) ? 'type' : /scale/.test(name) ? 'scale' : 'whole';

// The props a token belongs to, from its name: --button-danger-fill draws a danger button, --button-small-padding-x a small one
function propsFor(token: ComponentToken, detail: Detail) {
	const props: Record<string, unknown> = {};
	for (const prop of detail.props ?? []) for (const option of prop.options ?? []) if (token.name.includes(`-${option}-`)) props[prop.name] = option;
	return props;
}

const zoom = 2;

// The inspector's colours, as a browser's: content blue, padding green, the parts' outlines pink
const side = (value: string) => (parseFloat(value) || 0) * zoom;
const colours = { content: 'var(--color-blue-56)', padding: 'var(--color-green-46)', guide: 'var(--color-pink-56)' };
const line = (opacity: number) => ({ position: 'absolute', border: `1px solid color-mix(in oklab, ${colours.guide} ${opacity}%, transparent)` }) as const;
const hatchOf = (colour: string, strength: number) => `repeating-linear-gradient(-45deg, color-mix(in oklab, ${colour} ${strength}%, transparent) 0 1.5px, color-mix(in oklab, ${colour} ${strength / 3}%, transparent) 1.5px 5px)`;

interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
}
interface Part extends Rect {
	padding: [number, number, number, number];
}
// The component and each part inside it, such as its icon and its label, on the stage
interface Measure {
	root: Part & { radius: number };
	parts: Part[];
}

function measure(stage: HTMLElement, root: HTMLElement): Measure {
	// From inside the stage's border, where the overlay starts
	const outer = stage.getBoundingClientRect();
	const [x, y] = [outer.left + stage.clientLeft, outer.top + stage.clientTop];
	const at = (rect: DOMRect): Rect => ({ left: rect.left - x, top: rect.top - y, width: rect.width, height: rect.height });
	// The computed padding is the element's own, before the stage's zoom, which its box already has
	const partOf = (element: Element): Part => {
		const style = getComputedStyle(element);
		return { ...at(element.getBoundingClientRect()), padding: [side(style.paddingTop), side(style.paddingRight), side(style.paddingBottom), side(style.paddingLeft)] };
	};
	const parts: Part[] = [];
	const walk = (element: Element) => {
		const box = element.getBoundingClientRect();
		if (!box.width || !box.height) return;
		const children = [...element.children];
		if (element !== root && (!children.length || element instanceof SVGElement)) return void parts.push(partOf(element));
		for (const child of children) walk(child);
	};
	walk(root);
	return { root: { ...partOf(root), radius: (parseFloat(getComputedStyle(root).borderTopLeftRadius) || 0) * zoom }, parts };
}

// The token drawn over the component as a browser's inspector draws an element: a hairline round each part, such as its
// icon and label, another inside it for the part's own padding, and what the token sets picked out, with its value beside
function Overlay({ token, measured }: { token: ComponentToken; measured: Measure }) {
	const kind = kindOf(token.name);
	const { root, parts } = measured;
	const { left, top, width, height, padding: [pt, pr, pb, pl], radius } = root;
	const value = shownOf(token).shown;
	const gap = 4;
	// What wraps the whole component stands a little further off, so a clear line shows between it and the edge
	const clear = gap + 2;
	const strong = (style: CSSProperties) => <div className="absolute" style={{ background: hatchOf(colours.padding, 55), ...style }} />;
	const outline = (rect: Rect, style?: CSSProperties, off = 2) => <div className="absolute rounded-xs" style={{ border: `1.5px dashed ${colours.content}`, left: rect.left - off, top: rect.top - off, width: rect.width + off * 2, height: rect.height + off * 2, ...style }} />;
	// The parts together, as the label and its icon, and the text on its own
	const union = parts.reduce<Rect | undefined>((all, part) => {
		if (!all) return part;
		const [l, t] = [Math.min(all.left, part.left), Math.min(all.top, part.top)];
		return { left: l, top: t, width: Math.max(all.left + all.width, part.left + part.width) - l, height: Math.max(all.top + all.height, part.top + part.height) - t };
	}, undefined) ?? { left: left + pl, top: top + pt, width: width - pl - pr, height: height - pt - pb };
	const text = parts.filter((part) => part.padding.some(Boolean)).at(-1) ?? union;
	let picked: ReactNode;
	let tag: CSSProperties = { left: left + width + gap + 8, top: top + height / 2 - 10 };
	let tagColour = colours.content;
	if (kind === 'padding-x') {
		picked = <>{strong({ left, top, width: pl, height })}{strong({ left: left + width - pr, top, width: pr, height })}</>;
		tag = { left: left + pl / 2, top: top + height + 8, translate: '-50% 0' };
		tagColour = colours.padding;
	} else if (kind === 'padding-y') {
		picked = <>{strong({ left, top, width, height: pt })}{strong({ left, top: top + height - pb, width, height: pb })}</>;
		tag = { left: left + width + gap + 8, top: top + pt / 2 - 10 };
		tagColour = colours.padding;
	} else if (kind === 'radius') {
		// Quarter arcs just outside each corner, concentric with it, so they trace the curve without covering it
		const arc = radius + clear;
		picked = (['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'] as const).map((corner) => {
			const [v, h] = corner.match(/[A-Z][a-z]+/g) as [string, string];
			return (
				<div
					key={corner}
					className="absolute"
					style={{
						width: arc,
						height: arc,
						top: v === 'Top' ? top - clear : top + height + clear - arc,
						left: h === 'Left' ? left - clear : left + width + clear - arc,
						[`border${v}`]: `2px solid ${colours.content}`,
						[`border${h}`]: `2px solid ${colours.content}`,
						[`border${corner}Radius`]: arc,
					}}
				/>
			);
		});
	} else if (kind === 'fill') picked = <div className="absolute" style={{ border: `2px solid ${colours.content}`, left: left - clear, top: top - clear, width: width + clear * 2, height: height + clear * 2, borderRadius: radius + clear }} />;
	else if (kind === 'text' || kind === 'type') picked = outline(text);
	else if (kind === 'scale')
		picked = (
			<>
				{outline(union, { opacity: 0.5 })}
				{outline(union, { borderStyle: 'solid', scale: value })}
			</>
		);
	else picked = outline(root, { borderRadius: radius + 4 }, 4);
	return (
		<div aria-hidden className="pointer-events-none absolute inset-0">
			{parts.map((part, index) => {
				const [ppt, ppr, ppb, ppl] = part.padding;
				return (
					<div key={index}>
						<div style={{ ...line(80), left: part.left, top: part.top, width: part.width, height: part.height }} />
						{part.padding.some(Boolean) && <div style={{ ...line(45), left: part.left + ppl, top: part.top + ppt, width: part.width - ppl - ppr, height: part.height - ppt - ppb }} />}
					</div>
				);
			})}
			{picked}
			<span className="absolute rounded-sm px-1 font-mono text-label whitespace-nowrap text-white" style={{ ...tag, background: tagColour }}>
				{value}
			</span>
		</div>
	);
}

// The tokens as a :root block to paste into a site's own CSS and change. Tailwind's --spacing(2) goes as the calc() it
// stands for, so it works in CSS Tailwind doesn't read
const cssOf = (tokens: ComponentToken[]) => {
	const groups = new Map<string, string[]>();
	for (const token of tokens) {
		const value = token.steps?.[0]?.kind === 'function' ? token.steps[0].value : token.value;
		groups.set(token.group, [...(groups.get(token.group) ?? []), `\t${token.name}: ${value};`]);
	}
	return `:root {\n${[...groups].map(([group, lines]) => `\t/* ${group} */\n${lines.join('\n')}`).join('\n\n')}\n}\n`;
};

function CopyTokens({ tokens }: { tokens: ComponentToken[] }) {
	const [isCopied, setCopied] = useState(false);
	useEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [isCopied]);
	return (
		<Button variant="ghost" size="small" onPress={() => void navigator.clipboard.writeText(cssOf(tokens)).then(() => setCopied(true))}>
			{isCopied ? 'Copied' : 'Copy tokens'}
		</Button>
	);
}

/** A component's own tokens, grouped under their headings, each with its value. Hovering or focusing a row draws what it
 * sets on the component's sample above, which stays in sight while the rows scroll */
export function Tokens({ tokens, detail, sample }: { tokens: ComponentToken[]; detail: Detail; sample?: Sample }) {
	const [active, setActive] = useState<ComponentToken>();
	const [measured, setMeasured] = useState<Measure>();
	const stage = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const root = stage.current?.firstElementChild?.firstElementChild;
		setMeasured(stage.current && root instanceof HTMLElement ? measure(stage.current, root) : undefined);
		// active isn't read, but each change re-renders the sample with its props, so its parts are measured again
		// oxlint-disable-next-line react/exhaustive-deps
	}, [active]);
	// With an icon at the start where the component takes one, so the gap and the label's own padding show
	const icon = detail.props?.some((prop) => prop.name === 'start') ? { start: <Icon name="plus" /> } : {};
	const groups = new Map<string, ComponentToken[]>();
	for (const token of tokens) groups.set(token.group, [...(groups.get(token.group) ?? []), token]);
	return (
		<div className="flex flex-col gap-3">
			{sample && (
				// The Build one sample again, larger, staying in sight while the rows scroll under it
				<div ref={stage} className="sticky top-18 z-10 grid h-40 place-items-center overflow-hidden rounded-lg border border-bleed/8 bg-paper bg-[radial-gradient(var(--dot)_1px,transparent_1px)] bg-size-[12px_12px] [--dot:color-mix(in_oklab,var(--color-ink)_10%,transparent)]">
					<div style={{ zoom }} inert>
						{sample({ ...icon, ...(active ? propsFor(active, detail) : {}) })}
					</div>
					{active && measured && <Overlay token={active} measured={measured} />}
					<div className="absolute top-2 right-2">
						<CopyTokens tokens={tokens} />
					</div>
				</div>
			)}
			{!sample && (
				<div className="flex justify-end">
					<CopyTokens tokens={tokens} />
				</div>
			)}
			{/* Clipped, not scrolled, as the last chip's 44px hit area reaches past the bottom */}
			<div className="overflow-clip rounded-lg border border-bleed/8">
				<table className="w-full border-collapse text-left text-label">
					<thead className="bg-bleed/4 text-muted">
						<tr>
							<th scope="col" className={`${cell} font-medium`}>
								Token
							</th>
							<th scope="col" className={`${cell} w-full font-medium`}>
								Value
							</th>
						</tr>
					</thead>
					{[...groups].map(([group, rows]) => (
						<tbody key={group} className="divide-y divide-bleed/6 border-t border-bleed/6">
							{/* No line under the label, so it heads the rows below rather than sitting apart from them */}
							<tr className="border-b-0">
								<th scope="rowgroup" colSpan={2} className={`${cell} pt-4 pb-1 font-medium text-muted`}>
									{group}
								</th>
							</tr>
							{rows.map((token) => (
								<tr key={token.name} onMouseEnter={() => setActive(token)} onFocus={() => setActive(token)} className={active?.name === token.name ? '*:bg-bleed/3' : undefined}>
									<th scope="row" className={`${cell} font-normal whitespace-nowrap`}>
										<code className="font-mono font-medium">{token.name}</code>
										{token.doc && <span className="sr-only">, {token.doc}</span>}
									</th>
									<td className={`${cell} whitespace-nowrap`}>
										<TokenValue token={token} />
									</td>
								</tr>
							))}
						</tbody>
					))}
				</table>
			</div>
		</div>
	);
}
