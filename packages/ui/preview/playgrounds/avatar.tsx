import { useState } from 'react';
import { Avatar, AvatarGroup, type AvatarShape, type AvatarSize, type AvatarStatus } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, TextControl, pick } from '../playground.js';
import doris from '../assets/doris.jpg';

// Bundled rather than fetched so the preview works offline: Doris, a real photo cropped to her head, and a logo for an
// organisation. Everyone else shows their initials
export const photo = doris;
export const logo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0c2920"/><path d="M20 44V20h14a8 8 0 0 1 0 16H26" fill="none" stroke="#f5c03c" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>')}`;
// A path that's never there, to see the initials stay put when an image fails
const broken = '/no-such-photo.jpg';

export const names = {
	person: 'Sam Smith',
	long: 'Maria Fernanda de los Ángeles García-Villalobos',
	single: 'Cher',
	emoji: '🦊 Fox',
	'non-Latin': 'Олена Коваль',
	CJK: '王小明',
} as const;
type NameKind = keyof typeof names;

export const people = ['Sam Smith', 'Alex Lee', 'Jo Bloggs', 'Ana Silva', 'Kai Chen', 'Lin Wu', 'Priya Patel', 'Tom Hughes', 'Ola Nowak', 'Femi Ade', 'Rosa Díaz', 'Yuki Sato', 'Ben Cole', 'Ivy Tran', 'Noor Ali', 'Max Weber', 'Eva Lind', 'Raj Rao', 'Zoe Hart', 'Leo Park'];

const sizes = ['20', '24', '32', '48', '64'] as const;
const images = ['off', 'on', 'broken'] as const;
const statuses = ['none', 'online', 'away', 'busy'] as const;

export function AvatarPlayground() {
	const [kind, setKind] = useState<NameKind>('person');
	const [name, setName] = useState<string>(names.person);
	const [image, setImage] = useState<(typeof images)[number]>('off');
		const [size, setSize] = useState<(typeof sizes)[number]>('48');
	const [shape, setShape] = useState<AvatarShape>('circle');
	const [status, setStatus] = useState<(typeof statuses)[number]>('none');
	const [isGroup, setGroup] = useState(false);
	const [count, setCount] = useState(6);
	const [max, setMax] = useState(4);
	const chooseKind = (next: NameKind) => {
		setKind(next);
		setName(names[next]);
	};
	const src = image === 'on' ? (shape === 'square' ? logo : photo) : image === 'broken' ? broken : undefined;
	const shuffle = () => {
		chooseKind(pick(Object.keys(names) as NameKind[]));
		setImage(pick(images));
		setSize(pick(sizes));
		setShape(Math.random() < 0.3 ? 'square' : 'circle');
		setStatus(pick(statuses));
		setGroup(Math.random() < 0.4);
		setCount(1 + Math.floor(Math.random() * 20));
		setMax(Math.floor(Math.random() * 8));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={
				<>
					<SwitchControl label="In a group" value={isGroup} onChange={setGroup} />
					{isGroup && (
						<>
							<NumberControl label="People" value={count} onChange={setCount} minValue={1} maxValue={people.length} />
							<NumberControl label="Max, 0 for none" value={max} onChange={setMax} minValue={0} maxValue={20} />
						</>
					)}
				</>
			}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Name" options={Object.keys(names) as NameKind[]} value={kind} onChange={chooseKind} />
						<TextControl label="Name, as typed" value={name} onChange={setName} />
						<Choice label="Image" options={images} value={image} onChange={setImage} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Size" options={sizes} value={size} onChange={setSize} />
						<Choice label="Shape" options={['circle', 'square'] as const} value={shape} onChange={setShape} />
					</ControlGroup>
					<ControlGroup label="State">
						<Choice label="Status" options={statuses} value={status} onChange={setStatus} />
					</ControlGroup>
				</>
			}
		>
			{isGroup ? (
				<AvatarGroup size={Number(size) as AvatarSize} shape={shape} maxVisible={max || undefined}>
					{[name, ...people.filter((person) => person !== name)].slice(0, count).map((person, index) => (
						<Avatar key={person} name={person} src={index === 0 ? src : undefined} status={index === 0 && status !== 'none' ? (status as AvatarStatus) : undefined} />
					))}
				</AvatarGroup>
			) : (
				<Avatar name={name} src={src} size={Number(size) as AvatarSize} shape={shape} status={status === 'none' ? undefined : status} />
			)}
		</Playground>
	);
}

export function AvatarsInText() {
	return (
		<div className="flex w-full max-w-md flex-col gap-3 text-control">
			{[
				['Sam Smith', 'commented on the brief', 'online'],
				['Alex Lee', 'moved “Wordmark” to review', 'away'],
				['Maria Fernanda de los Ángeles García-Villalobos', 'joined the project', undefined],
			].map(([person, action, status]) => (
				<p key={person} className="flex min-w-0 items-center gap-2">
					<Avatar name={person!} size={20} status={status as AvatarStatus | undefined} aria-hidden="true" />
					<span className="min-w-0 truncate">
						<span className="font-medium">{person}</span> <span className="text-muted">{action}</span>
					</span>
				</p>
			))}
			<p className="leading-5">
				Assigned to <Avatar name="Doris Hart" size={20} src={photo} aria-hidden="true" /> Doris Hart and <Avatar name="Parchment" size={20} shape="square" src={logo} aria-hidden="true" /> Parchment, due Friday
			</p>
		</div>
	);
}
