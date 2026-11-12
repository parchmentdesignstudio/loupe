import { useEffect, useState } from 'react';
import { Button, DropZone, FileList, FileListItem, FileTrigger, isFileDropItem } from '../../src/index.js';
import { Choice, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';
import { type Accepts, accepts } from './files.js';

export interface Upload {
	id: string;
	name: string;
	size: number;
	file?: File;
	thumbnail?: string;
	status?: 'uploading' | 'done' | 'failed';
	progress?: number;
	errorMessage?: string;
	/** Whether the simulated upload fails the first time round */
	willFail?: boolean;
}

// Artwork for the seeded images, as there's no file behind them to draw from
const art = (from: string, to: string) =>
	`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="36" height="36" fill="url(#g)"/><circle cx="24" cy="12" r="5" fill="#fffc"/><path d="M0 36 13 19l9 10 5-5 9 12z" fill="#0003"/></svg>`)}`;

let count = 0;
const nextId = () => `upload-${++count}`;

const listed = (name: string, size: number, thumbnail?: string): Upload => ({ id: nextId(), name, size, thumbnail });

// Files already listed, before dropping any: a few, some very long names, images beside documents, and many
const seeds = {
	none: () => [],
	few: () => [listed('favicon.svg', 1840, art('#ceeea7', '#566861')), listed('apple-touch-icon.png', 24_310, art('#f5ebe6', '#c76024')), listed('brief.pdf', 482_000)],
	long: () => [
		listed(`${longWords.toLowerCase().replaceAll(' ', '-').replace(',', '')}.svg`, 9_200, art('#fffdf8', '#c76024')),
		listed('quarterly-report-for-the-board-with-appendices-final-final-v3.pdf', 18_400_000),
		listed('apple-touch-icon-180x180.png', 31_000, art('#0c2920', '#ceeea7')),
	],
	mixed: () => [
		listed('hero-photograph.jpg', 3_480_000, art('#c76024', '#0c2920')),
		listed('contract.docx', 64_200),
		listed('moodboard.png', 7_920_000, art('#ceeea7', '#f5ebe6')),
		listed('fonts.zip', 212_000_000),
		listed('notes.txt', 412),
	],
	many: () =>
		Array.from({ length: 14 }, (_, index) =>
			index % 3 === 0 ? listed(`screen-${String(index + 1).padStart(2, '0')}.png`, 120_000 + index * 91_337, art(pick(['#ceeea7', '#f5ebe6', '#c76024']), '#566861')) : listed(`chapter-${index + 1}.pdf`, 40_000 + index * 3_120_000),
		),
} satisfies Record<string, () => Upload[]>;
type Seed = keyof typeof seeds;

const reasons = ['The connection dropped', 'It’s over the 20 MB limit', 'The server didn’t answer in time, so nothing was saved'];

/**
 * Uploads that pretend: each ticks up at its own pace, and with failures on, about one in three stops partway with an
 * error, then goes through when retried
 */
export function useUploads(initial: Upload[] = [], { failures = true }: { failures?: boolean } = {}) {
	const [uploads, setUploads] = useState<Upload[]>(initial);
	const isRunning = uploads.some((upload) => upload.status === 'uploading');
	useEffect(() => {
		if (!isRunning) return;
		const timer = setInterval(() => {
			setUploads((list) =>
				list.map((upload) => {
					if (upload.status !== 'uploading') return upload;
					// Big files go slower, and no file takes forever
					const step = Math.max(2, 18 - Math.log10(upload.size + 1) * 2) * (0.5 + Math.random());
					const progress = Math.min(100, (upload.progress ?? 0) + step);
					if (upload.willFail && progress > 55) return { ...upload, status: 'failed', progress: undefined, errorMessage: pick(reasons) };
					return progress >= 100 ? { ...upload, status: 'done', progress: undefined } : { ...upload, progress };
				}),
			);
		}, 240);
		return () => clearInterval(timer);
	}, [isRunning]);
	const start = (upload: Upload): Upload => ({ ...upload, status: 'uploading', progress: 0, errorMessage: undefined, willFail: failures && Math.random() < 0.34 });
	return {
		uploads,
		/** Lists files and starts each uploading, or replaces what's there when `replace` is set */
		add: (files: File[], replace = false) => {
			const added = files.map((file) => start({ id: nextId(), name: file.name, size: file.size, file }));
			setUploads((list) => (replace ? added : [...list, ...added]));
		},
		set: setUploads,
		/** Uploads what's listed, from the start */
		uploadAll: () => setUploads((list) => list.map(start)),
		retry: (id: string) => setUploads((list) => list.map((upload) => (upload.id === id ? { ...start(upload), willFail: false } : upload))),
		remove: (id: string) => setUploads((list) => list.filter((upload) => upload.id !== id)),
	};
}

export function DropZonePlayground() {
	const [variant, setVariant] = useState<'dashed' | 'quiet'>('dashed');
	const [label, setLabel] = useState('Drop an SVG or a large PNG');
	const [hasTrigger, setTrigger] = useState(true);
	const [accepted, setAccepted] = useState<Accepts>('images');
	const [isMultiple, setMultiple] = useState(true);
	const [isDisabled, setDisabled] = useState(false);
	const [width, setWidth] = useState<'narrow' | 'wide'>('wide');
	const [seed, setSeed] = useState<Seed>('none');
	const [failures, setFailures] = useState(true);
	const { uploads, add, set, uploadAll, retry, remove } = useUploads([], { failures });
	const isQuiet = variant === 'quiet';
	const types = accepts[accepted];
	const take = (files: File[]) => add(isMultiple ? files : files.slice(0, 1), !isMultiple);
	const choose = (next: Seed) => {
		setSeed(next);
		set(seeds[next]());
	};
	const shuffle = () => {
		setVariant(Math.random() < 0.3 ? 'quiet' : 'dashed');
		setLabel(pick(['Drop an SVG or a large PNG', 'Drop files here', 'Drop artwork', 'Drop a PDF of the brief, or anything else you’d like us to see before the call']));
		setTrigger(Math.random() < 0.7);
		setAccepted(pick(Object.keys(accepts) as Accepts[]));
		setMultiple(Math.random() < 0.6);
		setWidth(pick(['narrow', 'wide'] as const));
		const next = pick(Object.keys(seeds) as Seed[]);
		setSeed(next);
		// Some still listed, some mid-upload, some done or failed
		set(
			seeds[next]().map((upload) => {
				const roll = Math.random();
				if (roll < 0.25) return upload;
				if (roll < 0.5) return { ...upload, status: 'uploading', progress: Math.random() < 0.2 ? undefined : Math.round(Math.random() * 90) };
				if (roll < 0.8) return { ...upload, status: 'done' };
				return { ...upload, status: 'failed', errorMessage: pick(reasons) };
			}),
		);
	};
	return (
		<Playground
			onRandom={shuffle}
			box="items-start"
			controls={
				<>
					<Choice label="Variant" options={['dashed', 'quiet'] as const} value={variant} onChange={setVariant} />
					<TextControl label={isQuiet ? 'Label, read out' : 'Label'} value={label} onChange={setLabel} />
					<SwitchControl label="File trigger" value={hasTrigger} onChange={setTrigger} />
					<Choice label="Accepts" options={Object.keys(accepts) as Accepts[]} value={accepted} onChange={setAccepted} />
					<SwitchControl label="Several at once" value={isMultiple} onChange={setMultiple} />
					<Choice label="Files shown" options={Object.keys(seeds) as Seed[]} value={seed} onChange={choose} />
					<SwitchControl label="Some uploads fail" value={failures} onChange={setFailures} />
					<Choice label="Width" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />
					<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
				</>
			}
		>
			<div className={['flex flex-col gap-3', width === 'narrow' ? 'w-full max-w-60' : 'w-full'].join(' ')}>
				<DropZone
					variant={variant}
					label={isQuiet ? undefined : label}
					aria-label={isQuiet ? label : undefined}
					isDisabled={isDisabled}
					acceptedFileTypes={types && [...types]}
					onDrop={async (event) => take(await Promise.all(event.items.filter(isFileDropItem).map((item) => item.getFile())))}
					className={['w-full', isQuiet && 'flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center'].filter(Boolean).join(' ')}
				>
					{isQuiet && <p className="font-medium">{label}</p>}
					{hasTrigger && (
						<FileTrigger allowsMultiple={isMultiple} onSelect={(files) => take([...(files ?? [])])}>
							<Button variant="secondary" size="small">
								{isMultiple ? 'Choose files' : 'Choose a file'}
							</Button>
						</FileTrigger>
					)}
				</DropZone>
				<FileList aria-label="Uploads" items={uploads}>
					{(upload) => (
						<FileListItem
							id={upload.id}
							file={upload.file}
							name={upload.name}
							size={upload.size}
							thumbnail={upload.thumbnail}
							status={upload.status}
							progress={upload.progress}
							errorMessage={upload.errorMessage}
							onRetry={() => retry(upload.id)}
							onRemove={() => remove(upload.id)}
						/>
					)}
				</FileList>
				{uploads.length > 0 && uploads.every((upload) => upload.status == null) && (
					<Button variant="primary" onPress={uploadAll} className="self-start">
						Upload {uploads.length === 1 ? 'it' : `all ${uploads.length}`}
					</Button>
				)}
			</div>
		</Playground>
	);
}

/** The pattern a site follows: the zone and its trigger add files, and the list under it shows how each is going */
export function UploadingFiles() {
	const { uploads, add, retry, remove } = useUploads([
		{ ...listed('hero-photograph.jpg', 3_480_000, art('#c76024', '#0c2920')), status: 'done' },
		{ ...listed('quarterly-report-for-the-board-with-appendices-final.pdf', 18_400_000), status: 'uploading', progress: 38 },
		{ ...listed('fonts.zip', 212_000_000), status: 'failed', errorMessage: 'It’s over the 20 MB limit' },
	]);
	return (
		<div className="flex w-full flex-col gap-3">
			<DropZone label="Drop files to upload" onDrop={async (event) => add(await Promise.all(event.items.filter(isFileDropItem).map((item) => item.getFile())))} className="w-full">
				<FileTrigger allowsMultiple onSelect={(files) => add([...(files ?? [])])}>
					<Button variant="secondary" size="small">
						Choose files
					</Button>
				</FileTrigger>
			</DropZone>
			<FileList aria-label="Uploads" items={uploads}>
				{(upload) => (
					<FileListItem
						id={upload.id}
						file={upload.file}
						name={upload.name}
						size={upload.size}
						thumbnail={upload.thumbnail}
						status={upload.status}
						progress={upload.progress}
						errorMessage={upload.errorMessage}
						onRetry={() => retry(upload.id)}
						onRemove={() => remove(upload.id)}
					/>
				)}
			</FileList>
		</div>
	);
}

/** Each state a row can be in, held still */
export function FileStates() {
	return (
		<FileList aria-label="Attachments" className="w-full">
			<FileListItem id="listed" name="brief.pdf" size={482_000} onRemove={() => {}} />
			<FileListItem id="image" name="moodboard.png" size={7_920_000} thumbnail={art('#ceeea7', '#566861')} onRemove={() => {}} />
			<FileListItem id="uploading" name="contract.docx" size={64_200} status="uploading" progress={45} onRemove={() => {}} />
			<FileListItem id="waiting" name="fonts.zip" size={212_000_000} status="uploading" onRemove={() => {}} />
			<FileListItem id="done" name="hero-photograph.jpg" size={3_480_000} thumbnail={art('#c76024', '#0c2920')} status="done" onRemove={() => {}} />
			<FileListItem id="failed" name="a-very-long-file-name-for-the-quarterly-report-final.pdf" size={18_400_000} status="failed" errorMessage="The connection dropped" onRetry={() => {}} onRemove={() => {}} />
		</FileList>
	);
}
