// PROTOTYPE: icon motion. Throwaway, to settle how mcknny's transport moves sit at 16px (transport-motion.tsx).
// The sidebar's move is decided and lives on the settings toggle in main.tsx.
// Delete this file and its story in stories.tsx once the numbers are decided
import { useState } from 'react';
import { ControlGroup, Playground, SwitchControl } from '../playground.js';
import { TransportButton, transportKinds } from './transport-motion.js';

export function IconMotionPrototype() {
	const [isLarge, setLarge] = useState(true);
	return (
		<Playground
			controls={
				<ControlGroup label="Preview">
					<SwitchControl label="Also at 3×" value={isLarge} onChange={setLarge} />
				</ControlGroup>
			}
		>
			<div className="flex flex-col items-center gap-10">
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
