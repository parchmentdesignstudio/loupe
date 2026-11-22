import { useEffect, useRef } from 'react';
import { tv } from './tv.js';

// A pen writing loops, for while something's on its way. It writes as a hand does: a pen slows round tight curves and
// speeds along straighter strokes, its speed following the curve's radius to the power of a third (the two-thirds
// power law of drawing movements), and it eases in as it touches down and out as it lifts. Each pass erases the loops
// before, then writes the next, taking turns between a few so no two passes are quite the same

// Each is the same three loops, drawn a little differently
const LOOPS = [
	'M2 13c3 0 6-9 3.5-9s-2 9 1.5 9c4 0 6-6 3.5-6s-2.5 6 2 6c3 0 5.5-8 3-8s-1.5 8 2.5 7.5c1.5 0 2.5-1 3.5-2',
	'M2 13c3 0 5.5-7 3.5-7s-2 7 1.5 7c4 0 6.5-9.5 3.5-9.5s-2.5 9.5 2 9.5c3 0 5-6 3-6s-1.5 6 2.5 5.5c1.5 0 2.5-1 3.5-2',
	'M2 13c3 0 6-8 3.5-8s-2 8 1.5 8c4 0 5.5-6.5 3.5-6.5s-2.5 6.5 2 6.5c3 0 6-9 3-9s-1.5 9 2.5 8.5c1.5 0 2.5-1 3.5-2',
];
// A pass, in milliseconds, and the share of it spent writing, after erasing the one before
const PASS = 1600;
const WRITING = 0.55;
// Radii beyond these, in the path's units, change the pen's speed no further
const TIGHTEST = 0.5;
const LOOSEST = 12;
// The share of the path to ease in and out over
const TOUCH = 0.06;
// The ink's width, in the path's units
const NIB = 1.5;
const SAMPLES = 400;

interface Ink {
	/** Where the pen is, as a share of the path, some share of the way through writing it */
	at: (moment: number) => number;
	/** The ink between two shares of the path, as a filled shape */
	between: (from: number, to: number) => string;
}

// Measured once a path, off screen, as the scribble being drawn may not be on the page yet
const inks = new Map<string, Ink | null>();

function measure(d: string): Ink | null {
	if (inks.has(d)) return inks.get(d) ?? null;
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('d', d);
	svg.append(path);
	document.body.append(svg);
	// Without layout, as in a test, there's nothing to measure, and the loops are drawn as a still line
	const total = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0;
	const points = total ? Array.from({ length: SAMPLES + 1 }, (_, index) => path.getPointAtLength((index / SAMPLES) * total)) : [];
	svg.remove();
	if (!total) {
		inks.set(d, null);
		return null;
	}

	// How long the pen takes over each step: slower where the curve is tight
	const times = [0];
	for (let index = 1; index <= SAMPLES; index++) {
		const [a, b, c] = [points[Math.max(0, index - 2)], points[index - 1], points[index]];
		const turn = Math.abs((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x));
		const sides = Math.hypot(b.x - a.x, b.y - a.y) * Math.hypot(c.x - b.x, c.y - b.y) * Math.hypot(c.x - a.x, c.y - a.y);
		const radius = Math.min(LOOSEST, Math.max(TIGHTEST, turn > 0 ? sides / (2 * turn) : LOOSEST));
		const along = index / SAMPLES;
		const ease = Math.min(1, along / TOUCH, (1 - along) / TOUCH);
		const speed = Math.cbrt(radius) * (0.35 + 0.65 * ease * ease * (3 - 2 * ease));
		times.push(times[index - 1] + 1 / speed);
	}

	// Filled rather than stroked, so only ink the pen has reached shows, even where the loops cross
	const half = NIB / 2;
	const left: string[] = [];
	const right: string[] = [];
	points.forEach((point, index) => {
		const before = points[Math.max(0, index - 1)];
		const after = points[Math.min(SAMPLES, index + 1)];
		const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
		const [x, y] = [(after.x - before.x) / length, (after.y - before.y) / length];
		left.push(`${(point.x - y * half).toFixed(2)} ${(point.y + x * half).toFixed(2)}`);
		right.push(`${(point.x + y * half).toFixed(2)} ${(point.y - x * half).toFixed(2)}`);
	});
	// A round end, as a pen leaves, from one edge of the ink to the other
	const cap = `A${half} ${half} 0 0 0 `;

	const ink: Ink = {
		at(moment) {
			const time = moment * times[SAMPLES];
			let index = 1;
			while (index < SAMPLES && times[index] < time) index++;
			const before = times[index - 1];
			return (index - 1 + (time - before) / (times[index] - before || 1)) / SAMPLES;
		},
		between(from, to) {
			const [first, last] = [Math.floor(from * SAMPLES), Math.ceil(to * SAMPLES)];
			if (last - first < 1) return '';
			return `M${left.slice(first, last + 1).join('L')}${cap}${right[last]}L${right.slice(first, last).reverse().join('L')}${cap}${left[first]}Z`;
		},
	};
	inks.set(d, ink);
	return ink;
}

export const scribble = tv({ base: 'h-(--scribble-height) w-(--scribble-width) shrink-0' });

export interface ScribbleProps {
	/** Called as each pass after the first begins, as the pen lifts, so the words beside it can change with it */
	onPass?: () => void;
	className?: string;
}

/**
 * A pen writing loops, for while something's on its way, such as an answer. Its colour is the text's. It's hidden from
 * screen readers, so put words beside it that say what's happening. With reduced motion, the loops are written and
 * stay still
 */
export function Scribble({ onPass, className }: ScribbleProps) {
	const ink = useRef<SVGPathElement>(null);
	const passed = useRef(onPass);
	passed.current = onPass;

	useEffect(() => {
		const path = ink.current;
		const loops = LOOPS.map(measure).filter((loop): loop is Ink => loop !== null);
		if (!path || loops.length === 0) return;
		// From here it's ink, filled rather than stroked
		path.setAttribute('fill', 'currentColor');
		path.setAttribute('stroke', 'none');
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			path.setAttribute('d', loops[0].between(0, 1));
			return;
		}

		let frame = 0;
		let start = 0;
		let current = 0;
		const step = (now: number) => {
			start ||= now;
			const time = now - start;
			const pass = Math.floor(time / PASS);
			if (pass > current) {
				current = pass;
				passed.current?.();
			}
			const phase = (time % PASS) / PASS;
			const erasing = 1 - WRITING;
			const writing = loops[pass % loops.length];
			const written = loops[(pass + loops.length - 1) % loops.length];
			// The first pass writes across all of it, with nothing to erase
			let d: string;
			if (pass === 0) d = writing.between(0, writing.at(phase));
			else if (phase < erasing) d = written.between(written.at(phase / erasing), 1);
			else d = writing.between(0, writing.at((phase - erasing) / WRITING));
			path.setAttribute('d', d);
			frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<svg viewBox="0 0 23 16" aria-hidden="true" className={scribble({ className })}>
			<path ref={ink} d={LOOPS[0]} fill="none" stroke="currentColor" strokeWidth={NIB} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
