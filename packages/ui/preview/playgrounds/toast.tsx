import { useMemo, useState } from 'react';
import { Button, ToastQueue, ToastRegion } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const descriptions = ['none', 'short', 'long'] as const;
const timeouts = ['5s', '10s', 'stays'] as const;
const timeoutOf = { '5s': 5000, '10s': 10000, stays: 0 };
const titles = ['Link copied', 'Export ready', 'Project renamed', 'Changes saved', 'Invite sent'];
const shortDescription = 'favicon.zip is in your downloads, with all 16 files.';

// Its own queue and region, made again when the number shown at once changes
export function ToastPlayground() {
	const [title, setTitle] = useState('Export ready');
	const [description, setDescription] = useState<(typeof descriptions)[number]>('short');
	const [closeAfter, setCloseAfter] = useState<(typeof timeouts)[number]>('5s');
	const [hasAction, setHasAction] = useState(false);
	const [burst, setBurst] = useState(1);
	const [maxVisible, setMaxVisible] = useState(3);
	const queue = useMemo(() => new ToastQueue({ maxVisibleToasts: maxVisible }), [maxVisible]);
	const shuffle = () => {
		setTitle(Math.random() < 0.2 ? longWords : pick(titles));
		setDescription(pick(descriptions));
		setCloseAfter(pick(timeouts));
		setHasAction(Math.random() < 0.3);
	};
	const show = () => {
		const text = description === 'long' ? longWords : description === 'short' ? shortDescription : undefined;
		for (let index = 0; index < burst; index++) {
			const action = hasAction ? { label: 'Undo', onAction: () => {} } : undefined;
			queue.add({ title: burst > 1 ? `${title} ${index + 1}` : title, description: text, action }, { timeout: timeoutOf[closeAfter] });
		}
	};
	return (
		<Playground
			onRandom={shuffle}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Title" value={title} onChange={setTitle} />
						<Choice label="Description" options={descriptions} value={description} onChange={setDescription} />
						<SwitchControl label="Undo action" value={hasAction} onChange={setHasAction} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<Choice label="Closes after" options={timeouts} value={closeAfter} onChange={setCloseAfter} />
						<NumberControl label="Toasts per press" value={burst} onChange={setBurst} minValue={1} maxValue={10} />
						<NumberControl label="Shown at once" value={maxVisible} onChange={setMaxVisible} minValue={1} maxValue={6} />
					</ControlGroup>
				</>
			}
		>
			<div className="flex flex-wrap items-center justify-center gap-2">
				<Button variant="secondary" onPress={show}>
					Show toast
				</Button>
				<Button variant="ghost" onPress={() => queue.clear()}>
					Clear all
				</Button>
			</div>
			<ToastRegion queue={queue} />
		</Playground>
	);
}
