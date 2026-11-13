import { useState } from 'react';
import { Avatar, AvatarGroup, type AvatarShape, type AvatarSize, type AvatarStatus } from '../../src/index.js';
import { Choice, ControlGroup, NumberControl, Playground, SwitchControl, TextControl, pick } from '../playground.js';
import doris from '../assets/doris.jpg';

// Stand-in photos, bundled rather than fetched so the preview works offline: Doris, a real photo cropped to her head,
// then drawn heads and shoulders on a backdrop, one of them nearly white to show the image's edge, and a logo for an
// organisation
const portrait = (backdrop: string, skin: string, top: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${backdrop}"/><ellipse cx="32" cy="66" rx="24" ry="18" fill="${top}"/><circle cx="32" cy="28" r="12" fill="${skin}"/></svg>`,
	)}`;
export const photos = [doris, portrait('#c9d8d2', '#c58f6b', '#2f4a40'), portrait('#f4d9b8', '#8a5a3c', '#7a2e2a'), portrait('#fbfbfa', '#e7c3a5', '#d9dde3'), portrait('#3c4a68', '#f0c9a8', '#e0a34a')];
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
	const [photo, setPhoto] = useState(photos[0]);
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
		setPhoto(pick(photos));
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
				<AvatarGroup size={Number(size) as AvatarSize} shape={shape} max={max || undefined}>
					{[name, ...people.filter((person) => person !== name)].slice(0, count).map((person, index) => (
						<Avatar key={person} name={person} src={index === 0 ? src : index % 3 === 1 ? photos[index % photos.length] : undefined} status={index === 0 && status !== 'none' ? (status as AvatarStatus) : undefined} />
					))}
				</AvatarGroup>
			) : (
				<Avatar name={name} src={src} size={Number(size) as AvatarSize} shape={shape} status={status === 'none' ? undefined : status} />
			)}
		</Playground>
	);
}

const allSizes = [20, 24, 32, 48, 64] as const;

export function AvatarSizes() {
	return (
		<div className="flex flex-col gap-4">
			{[undefined, photos[0]].map((src) => (
				<div key={src ?? 'initials'} className="flex items-end gap-3">
					{allSizes.map((size) => (
						<Avatar key={size} name="Sam Smith" src={src} size={size} status={src ? 'online' : undefined} />
					))}
				</div>
			))}
		</div>
	);
}

const organisations = ['Parchment', 'Field Notes', 'Atlas', 'Halcyon', 'Ember Studio'];

export function PeopleAndOrganisations() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				{people.slice(0, 6).map((person, index) => (
					<Avatar key={person} name={person} size={48} src={index % 3 === 2 ? photos[index % photos.length] : undefined} />
				))}
			</div>
			<div className="flex items-center gap-2">
				{organisations.map((name) => (
					<Avatar key={name} name={name} size={48} shape="square" />
				))}
				<Avatar name="Parchment" size={48} shape="square" src={logo} />
			</div>
		</div>
	);
}

export function AvatarGroups() {
	return (
		<div className="flex flex-col items-start gap-4">
			<AvatarGroup max={5}>
				{people.slice(0, 9).map((person, index) => (
					<Avatar key={person} name={person} src={index % 2 ? photos[index % photos.length] : undefined} />
				))}
			</AvatarGroup>
			<AvatarGroup size={24} max={4}>
				{people.slice(0, 12).map((person) => (
					<Avatar key={person} name={person} />
				))}
			</AvatarGroup>
			<AvatarGroup size={32} shape="square">
				{organisations.map((name) => (
					<Avatar key={name} name={name} />
				))}
			</AvatarGroup>
			{/* On a raised card, the rings take the card's colour */}
			<div className="flex items-center gap-3 rounded-xl bg-raised p-3 shadow-panel [--avatar-ring:var(--color-raised)] [--bleed:var(--raised-bleed)]">
				<AvatarGroup max={4} size={24}>
					{people.slice(3, 10).map((person) => (
						<Avatar key={person} name={person} />
					))}
				</AvatarGroup>
				<span className="text-control text-muted">7 people editing</span>
			</div>
		</div>
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
				Assigned to <Avatar name="Jo Bloggs" size={20} src={photos[1]} aria-hidden="true" /> Jo Bloggs and <Avatar name="Parchment" size={20} shape="square" src={logo} aria-hidden="true" /> Parchment, due Friday
			</p>
		</div>
	);
}
