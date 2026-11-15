// PROTOTYPE: icon motion. Throwaway, to settle how sidebar-left moves before its parts are drawn in Sketch, and how
// mcknny's transport moves sit at 16px (transport-motion.tsx).
// Delete this file and its story in stories.tsx once the numbers are decided
import { type CSSProperties, useMemo, useState } from 'react';
import { Button, Slider } from '../../src/index.js';
import { ControlGroup, Playground, SwitchControl } from '../playground.js';
import { TransportButton, transportKinds } from './transport-motion.js';

// sidebar-left split by hand into the window's frame and its main pane. The pane runs under the frame's right edge so
// no seam shows, and it scales from there, so its left edge is what moves: 7.5 open, 5 closed, as sidebar-left-closed
const frame = 'M3,2 L13,2 C13.552,2 14,2.448 14,3 L14,13 C14,13.552 13.552,14 13,14 L3,14 C2.448,14 2,13.552 2,13 L2,3 C2,2.448 2.448,2 3,2 Z M3.5,3.5 L3.5,12.5 L12.5,12.5 L12.5,3.5 Z';
const anchor = 13;
const edges = { open: 7.5, closed: 5 };

/** A damped spring from 0 to 1 as a CSS linear() easing. Bounce 0 settles without passing its end, and more passes it further */
function spring(bounce: number, samples = 60) {
	const damping = 1 - bounce;
	const stiffness = 10;
	const points = Array.from({ length: samples + 1 }, (_, i) => {
		const t = i / samples;
		if (i === samples) return 1;
		if (damping >= 1) return 1 - (1 + stiffness * t) * Math.exp(-stiffness * t);
		const ringing = stiffness * Math.sqrt(1 - damping * damping);
		return 1 - Math.exp(-damping * stiffness * t) * (Math.cos(ringing * t) + ((damping * stiffness) / ringing) * Math.sin(ringing * t));
	});
	return `linear(${points.map((point) => Number(point.toFixed(4))).join(', ')})`;
}

type Phase = 'rest' | 'hover' | 'press' | 'release';

interface Tuning {
	hover: number;
	press: number;
	duration: number;
	bounce: number;
}

function SidebarIcon({ edge, phase, tuning }: { edge: number; phase: Phase; tuning: Tuning }) {
	const easing = useMemo(() => spring(tuning.bounce), [tuning.bounce]);
	// Into hover or a press it answers at once, and out of them it springs, so letting go is what snaps it in
	const transition = phase === 'hover' || phase === 'press' ? 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' : `transform ${tuning.duration}ms ${easing}`;
	const style: CSSProperties = {
		transformBox: 'view-box',
		transformOrigin: `${anchor}px 8px`,
		transform: `scaleX(${(anchor - edge) / (anchor - edges.open)})`,
		transition,
	};
	return (
		<svg aria-hidden="true" viewBox="0 0 16 16" className="block size-4 fill-current">
			<path d={frame} fillRule="evenodd" />
			<rect x={edges.open} y={3.5} width={anchor - edges.open} height={9} style={style} className="motion-reduce:transition-none!" />
		</svg>
	);
}

function SidebarToggle({ variant, tuning }: { variant: 'ghost' | 'secondary'; tuning: Tuning }) {
	const [isOpen, setOpen] = useState(true);
	const [phase, setPhase] = useState<Phase>('rest');
	const rest = isOpen ? edges.open : edges.closed;
	// Hover and a press lean the pane towards where a click takes it
	const toward = isOpen ? -1 : 1;
	const edge = rest + toward * (phase === 'press' ? tuning.press : phase === 'hover' ? tuning.hover : 0);
	return (
		<Button
			variant={variant}
			shape="full"
			aria-label={isOpen ? 'Hide sidebar' : 'Show sidebar'}
			onHoverChange={(isHovering) => setPhase((now) => (now === 'press' ? now : isHovering ? 'hover' : 'release'))}
			onPressStart={() => setPhase('press')}
			onPressEnd={() => setPhase('release')}
			onPress={() => setOpen((open) => !open)}
		>
			<SidebarIcon edge={edge} phase={phase} tuning={tuning} />
		</Button>
	);
}

export function IconMotionPrototype() {
	const [hover, setHover] = useState(0.75);
	const [press, setPress] = useState(1.5);
	const [duration, setDuration] = useState(500);
	const [bounce, setBounce] = useState(0.3);
	const [isLarge, setLarge] = useState(true);
	const tuning = { hover, press, duration, bounce };
	return (
		<Playground
			controls={
				<>
					<ControlGroup label="Motion">
						<Slider label="Hover, px" value={hover} onChange={setHover} minValue={0} maxValue={2} step={0.25} />
						<Slider label="Press, px" value={press} onChange={setPress} minValue={0} maxValue={2.5} step={0.25} />
						<Slider label="Spring, ms" value={duration} onChange={setDuration} minValue={200} maxValue={1000} step={50} />
						<Slider label="Bounce" value={bounce} onChange={setBounce} minValue={0} maxValue={0.6} step={0.05} />
					</ControlGroup>
					<ControlGroup label="Preview">
						<SwitchControl label="Also at 3×" value={isLarge} onChange={setLarge} />
					</ControlGroup>
				</>
			}
		>
			<div className="flex flex-col items-center gap-10">
				<div className="flex items-center gap-8">
					<SidebarToggle variant="ghost" tuning={tuning} />
					<SidebarToggle variant="secondary" tuning={tuning} />
					{isLarge && (
						<div className="flex gap-8 [zoom:3]">
							<SidebarToggle variant="ghost" tuning={tuning} />
							<SidebarToggle variant="secondary" tuning={tuning} />
						</div>
					)}
				</div>
				<div className="flex flex-wrap justify-center gap-1">
					{transportKinds.map((kind) => (
						<TransportButton key={kind} kind={kind} />
					))}
				</div>
				{isLarge && (
					<div className="flex flex-wrap justify-center gap-1 [zoom:3]">
						{transportKinds.map((kind) => (
							<TransportButton key={kind} kind={kind} />
						))}
					</div>
				)}
			</div>
		</Playground>
	);
}
