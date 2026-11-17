import { useState } from 'react';
import { Pagination, Status, type StatusTone } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, TextControl, longWords, pick, useRemembered } from '../playground.js';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const satisfies readonly StatusTone[];
const variants = ['dot', 'badge'] as const;
const widths = ['narrow', 'wide'] as const;
const samples: [StatusTone, string][] = [
	['info', 'Call arranged'],
	['success', 'Qualified'],
	['warning', 'Pending'],
	['danger', 'Unsuccessful'],
	['neutral', 'Draft'],
	['info', 'Referred'],
];

export function StatusPlayground() {
	const [tone, setTone] = useRemembered<StatusTone>('tone', 'info', tones);
	const [variant, setVariant] = useRemembered('variant', 'dot', variants);
	const [label, setLabel] = useRemembered('label', 'Call arranged');
	const [detail, setDetail] = useRemembered('detail', '25 Sept');
	const [isOverdue, setOverdue] = useRemembered('isOverdue', false);
	const [width, setWidth] = useRemembered('width', 'wide', widths);
	const shuffle = () => {
		const [nextTone, nextLabel] = pick(samples);
		setTone(nextTone);
		setLabel(Math.random() < 0.15 ? longWords : nextLabel);
		setVariant(Math.random() < 0.3 ? 'badge' : 'dot');
		setDetail(pick(['', '25 Sept', '4 calls', 'Tomorrow, 10am']));
		setOverdue(Math.random() < 0.3);
		setWidth(pick(widths));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Room" options={widths} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<TextControl label="Detail" value={detail} onChange={setDetail} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Tone" options={tones} value={tone} onChange={setTone} />
						<Choice label="Variant" options={variants} value={variant} onChange={setVariant} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Detail overdue" value={isOverdue} onChange={setOverdue} />
					</ControlGroup>
				</>
			}
		>
			<div className={width === 'narrow' ? 'w-40' : 'max-w-full'}>
				<Status tone={tone} variant={variant} detail={detail ? <span className={isOverdue ? 'text-danger' : undefined}>{detail}</span> : undefined}>
					{label}
				</Status>
			</div>
		</Playground>
	);
}

export function PaginationPlayground() {
	const [count, setCount] = useRemembered('count', 8, (stored) => stored >= 1 && stored <= 999);
	const [page, setPage] = useRemembered('page', 1, (stored) => stored >= 1 && stored <= count);
	const [siblings, setSiblings] = useRemembered('siblings', 1, (stored) => stored >= 0 && stored <= 3);
	const shuffle = () => {
		const next = pick([1, 3, 7, 8, 20, 120]);
		setCount(next);
		setPage(1 + Math.floor(Math.random() * next));
		setSiblings(pick([0, 1, 1, 2]));
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Behaviour">
						<NumberControl label="Pages" value={count} onChange={(next) => (setCount(next), setPage(Math.min(page, next)))} minValue={1} maxValue={999} />
						<NumberControl label="Page" value={page} onChange={setPage} minValue={1} maxValue={count} />
						<NumberControl label="Either side" value={siblings} onChange={setSiblings} minValue={0} maxValue={3} />
					</ControlGroup>
				</>
			}
		>
			<Pagination page={page} count={count} siblings={siblings} onChange={setPage} />
		</Playground>
	);
}

/** Under a table, with how many rows are showing on the left */
export function PaginationUnderTable() {
	const [page, setPage] = useState(1);
	const total = 190;
	const size = 25;
	return (
		<div className="flex w-full items-center justify-between gap-4">
			<p className="text-control text-muted tabular-nums">
				Showing {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}
			</p>
			<Pagination page={page} count={Math.ceil(total / size)} onChange={setPage} />
		</div>
	);
}
