import { useState } from 'react';
import { Button, Scribble, TextEffect } from '../../src/index.js';

const words = ['Nudging pixels', 'Drawing rectangles', 'Setting type', 'Kerning'];

/** While an answer's on its way: the pen writes, and the word beside it changes under the ray as each pass begins */
export function WaitingForAnAnswer() {
	const [index, setIndex] = useState(0);
	return (
		<p className="flex items-center gap-2 text-body text-muted">
			<Scribble onPass={() => setIndex((at) => (at + 1) % words.length)} />
			<TextEffect variant="ray">{`${words[index]}…`}</TextEffect>
		</p>
	);
}

/** On its own, beside words that say what's happening, as it's hidden from screen readers */
export function OnItsOwn() {
	const [isWaiting, setWaiting] = useState(true);
	return (
		<div className="flex flex-col items-start gap-4">
			<p className="flex items-center gap-2 text-body text-muted">
				{isWaiting ? <Scribble /> : null}
				{isWaiting ? 'Loading leads' : 'Found 24 leads'}
			</p>
			<Button variant="secondary" size="small" onPress={() => setWaiting(!isWaiting)}>
				{isWaiting ? 'Finish' : 'Load again'}
			</Button>
		</div>
	);
}
