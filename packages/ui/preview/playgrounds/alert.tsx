import { useState } from 'react';
import { Alert, type AlertTone, Button } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, longWords, pick } from '../playground.js';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const satisfies readonly AlertTone[];
const samples: Record<AlertTone, { title: string; text: string }> = {
	neutral: { title: 'This project is archived', text: 'It’s read only. Restore it to make changes or invite people.' },
	info: { title: 'A new version of the brand kit is ready', text: 'The logo files and colour tokens were updated on 12 November.' },
	success: { title: 'Invoice sent to Halden Studio', text: 'They’ll get a reminder if it isn’t paid by 30 November.' },
	warning: { title: 'Your card expires on 31 December', text: 'Update it before then, or the studio plan stops renewing.' },
	danger: { title: 'The invoice couldn’t be sent', text: 'The client’s email address bounced. Check it and try again.' },
};
const long = 'Two leads from the October campaign haven’t been contacted, and one of them asked for a call back before the end of the week. Assign them to someone in the studio, or archive them if they’re no longer a good fit, so they stop showing in the weekly summary.';

export function AlertPlayground() {
	const [tone, setTone] = useState<AlertTone>('warning');
	const [variant, setVariant] = useState<'alert' | 'notice'>('alert');
	const [title, setTitle] = useState(samples.warning.title);
	const [text, setText] = useState(samples.warning.text);
	const [hasActions, setHasActions] = useState(false);
	const [isDismissable, setDismissable] = useState(false);
	const [width, setWidth] = useState<'narrow' | 'wide'>('wide');
	const shuffle = () => {
		const next = pick(tones);
		setTone(next);
		setVariant(Math.random() < 0.35 ? 'notice' : 'alert');
		setTitle(Math.random() < 0.2 ? '' : Math.random() < 0.1 ? longWords : samples[next].title);
		setText(Math.random() < 0.2 ? long : samples[next].text);
		setHasActions(Math.random() < 0.3);
		setDismissable(Math.random() < 0.4);
		setWidth(pick(['narrow', 'wide'] as const));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<TextControl label="Title" value={title} onChange={setTitle} />
						<TextControl label="Text" value={text} onChange={setText} />
						<SwitchControl label="Actions" value={hasActions} onChange={setHasActions} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Tone" options={tones} value={tone} onChange={setTone} />
						<Choice label="Variant" options={['alert', 'notice'] as const} value={variant} onChange={setVariant} />
					</ControlGroup>
					<ControlGroup label="Behaviour">
						<SwitchControl label="Dismissable" value={isDismissable} onChange={setDismissable} />
					</ControlGroup>
				</>
			}
		>
			<Alert
				tone={tone}
				variant={variant}
				title={title || undefined}
				actions={
					hasActions ? (
						<>
							<Button variant="secondary" size="small">
								Review
							</Button>
							<Button variant="ghost" size="small">
								Not now
							</Button>
						</>
					) : undefined
				}
				onDismiss={isDismissable ? () => {} : undefined}
				className={width === 'narrow' ? 'w-full max-w-xs' : 'w-full max-w-[36rem]'}
			>
				{text || undefined}
			</Alert>
		</Playground>
	);
}

/** Every tone, as an alert and as a notice */
export function EveryTone() {
	return (
		<div className="grid w-full max-w-[36rem] gap-3">
			{tones.map((tone) => (
				<Alert key={tone} tone={tone} title={samples[tone].title}>
					{samples[tone].text}
				</Alert>
			))}
			<div className="mt-6 grid gap-4">
				{tones.map((tone) => (
					<Alert key={tone} tone={tone} variant="notice">
						{samples[tone].text}
					</Alert>
				))}
			</div>
		</div>
	);
}

/** A notice that says something worth knowing without stopping anyone, and an alert with long text, an action and a dismiss button */
export function NoticeInForm() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<Alert variant="notice" tone="neutral" title="Changes save as you type">
				Everyone on the project sees them straight away.
			</Alert>
			<Alert tone="danger" title="The invoice couldn’t be sent" onDismiss={() => {}} actions={<Button variant="secondary" size="small">Edit email address</Button>}>
				Halden Studio’s billing address, accounts@halden-studio.co.uk, bounced twice this morning. Check it with Mara before sending again, or download the invoice and email it from your own account so it still goes out before the end of the month.
			</Alert>
		</div>
	);
}
