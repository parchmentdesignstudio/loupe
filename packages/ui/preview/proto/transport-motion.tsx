// PROTOTYPE: icon motion. mcknny's transport moves, now @parchment/icons/motion, each in a ghost button
import { useRef } from 'react';
import { type MotionIconName, motionNames, playMotion } from '@parchment/icons/motion';
import { MotionIcon } from '@parchment/icons/react';
import { Button } from '../../src/index.js';

export const transportKinds = motionNames;

/** A moving icon in a ghost button, which plays as the pointer comes onto it, or when it's pressed */
export function TransportButton({ kind }: { kind: MotionIconName }) {
	const icon = useRef<SVGSVGElement>(null);
	return (
		<Button variant="ghost" shape="full" aria-label={kind} onHoverStart={() => playMotion(icon.current)} onPress={() => playMotion(icon.current)}>
			<MotionIcon ref={icon} name={kind} className="block size-4" />
		</Button>
	);
}
