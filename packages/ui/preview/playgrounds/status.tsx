import { useState } from 'react';
import { Pagination, Status, type StatusTone } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const satisfies readonly StatusTone[];
const samples: [StatusTone, string][] = [
	['info', 'Call arranged'],
	['success', 'Qualified'],
	['warning', 'Pending'],
	['danger', 'Unsuccessful'],
	['neutral', 'Draft'],
	['info', 'Referred'],
];

export function StatusPlayground() {
	const [tone, setTone] = useState<StatusTone>('info');
	const [variant, setVariant] = useState<'dot' | 'badge'>('dot');
	const [label, setLabel] = useState('Call arranged');
	const [detail, setDetail] = useState('25 Sept');
	const [isOverdue, setOverdue] = useState(false);
	const [width, setWidth] = useState<'narrow' | 'wide'>('wide');
	const shuffle = () => {
		const [nextTone, nextLabel] = pick(samples);
		setTone(nextTone);
		setLabel(Math.random() < 0.15 ? longWords : nextLabel);
		setVariant(Math.random() < 0.3 ? 'badge' : 'dot');
		setDetail(pick(['', '25 Sept', '4 calls', 'Tomorrow, 10am']));
		setOverdue(Math.random() < 0.3);
		setWidth(pick(['narrow', 'wide'] as const));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Room" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Label" value={label} onChange={setLabel} />
						<TextControl label="Detail" value={detail} onChange={setDetail} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Tone" options={tones} value={tone} onChange={setTone} />
						<Choice label="Variant" options={['dot', 'badge'] as const} value={variant} onChange={setVariant} />
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

export function StatusTones() {
	return (
		<div className="flex flex-col gap-2">
			{samples.slice(0, 5).map(([tone, label]) => (
				<Status key={tone} tone={tone}>
					{label}
				</Status>
			))}
		</div>
	);
}

export function StatusBadges() {
	return samples.slice(0, 5).map(([tone, label]) => (
		<Status key={tone} tone={tone} variant="badge">
			{label}
		</Status>
	));
}

export function PaginationPlayground() {
	const [count, setCount] = useState(8);
	const [page, setPage] = useState(1);
	const [siblings, setSiblings] = useState(1);
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
