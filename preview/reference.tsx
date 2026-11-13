import { useId } from 'react';
import { Focusable } from 'react-aria-components';
import details from 'virtual:details';
import { Popover, PreviewTrigger } from '../src/index.js';
import type { Detail, Prop } from './details.mjs';
import { Aria } from './inspector.js';
import type { Entry } from './stories.js';

const documented = (detail?: Detail): detail is Detail => detail?.kind === 'component' && Boolean(detail.props?.length || detail.rest?.length);

/** Whether a page has props to list, for the contents beside it */
export const hasReference = (entry?: Entry) => entry?.exports?.some((name) => documented(details.components[name])) ?? false;

const chip = 'rounded-md bg-bleed/8 px-1.5 py-0.5 font-mono text-label text-ink';

// An option, and with a sample, the component drawn with it on hover, focus or a long press. A button, so it can be
// tabbed to and a screen reader says it opens something. Focusable lends it the trigger's handlers
function Option({ prop, value, sample }: { prop: string; value: string; sample?: Entry['sample'] }) {
	if (!sample) return <code className={chip}>'{value}'</code>;
	return (
		<PreviewTrigger>
			<Focusable>
				<button type="button" aria-label={`${prop} '${value}', preview`} className={`${chip} cursor-default outline-offset-2 outline-ink hover:bg-bleed/12 focus-visible:outline-2`}>
					'{value}'
				</button>
			</Focusable>
			<Popover placement="top" showArrow className="p-4">
				{sample({ [prop]: value })}
			</Popover>
		</PreviewTrigger>
	);
}

function Type({ prop, sample }: { prop: Prop; sample?: Entry['sample'] }) {
	if (prop.options)
		return (
			<span className="flex flex-wrap gap-1">
				{prop.options.map((option) => (
					<Option key={option} prop={prop.name} value={option} sample={sample} />
				))}
			</span>
		);
	return prop.type ? <code className="font-mono text-label text-muted">{prop.type}</code> : <span className="text-muted">–</span>;
}

const cell = 'px-3 py-2.5 align-top first:pl-4 last:pr-4';

function Table({ detail, sample }: { detail: Detail; sample?: Entry['sample'] }) {
	const props = detail.props ?? [];
	return (
		// Wider than a phone, so it scrolls on its own rather than the page
		<div className="overflow-x-auto rounded-lg border border-bleed/8">
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
				<tbody className="divide-y divide-bleed/8 border-t border-bleed/8">
					{props.map((prop) => (
						<tr key={prop.name}>
							<th scope="row" className={`${cell} font-normal`}>
								<code className="font-mono font-medium">{prop.name}</code>
								{prop.required && <span className="block text-muted">Required</span>}
							</th>
							<td className={cell}>
								<Type prop={prop} sample={sample} />
							</td>
							<td className={cell}>{prop.default ? <code className="font-mono">{prop.default}</code> : <span className="text-muted">–</span>}</td>
							<td className={`${cell} text-muted`}>
								{prop.doc}
								{prop.from && <span className="block">From React Aria’s {prop.from}</span>}
							</td>
						</tr>
					))}
					{detail.rest?.map((rest) => (
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
				</tbody>
			</table>
		</div>
	);
}

/** Each export's props as a table, under the stories. Hovering an option shows it, where the page gives a sample */
export function Reference({ entry }: { entry: Entry }) {
	const heading = useId();
	const shown = (entry.exports ?? []).map((name) => details.components[name]).filter(documented);
	if (!shown.length) return null;
	return (
		<section id="api" aria-labelledby={heading} className="flex scroll-mt-25 flex-col gap-6 md:scroll-mt-18">
			<h2 id={heading} className="font-medium">
				API reference
			</h2>
			{shown.map((detail) => (
				<section key={detail.name} className="flex flex-col gap-3">
					<h3 className="font-mono text-control font-medium">{detail.name}</h3>
					{detail.doc && <p className="text-label text-muted">{detail.doc}</p>}
					<Table detail={detail} sample={detail.name === entry.exports?.[0] ? entry.sample : undefined} />
				</section>
			))}
		</section>
	);
}
