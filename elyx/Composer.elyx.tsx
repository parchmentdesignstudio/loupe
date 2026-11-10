import { Composer as UiComposer } from '../lib/Composer.js';

const ArrowUp = () => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-none stroke-current stroke-[1.5]">
		<path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export function Composer({ label = 'Your message', placeholder = 'Tell me what you’re working on' }: { label?: string; placeholder?: string }) {
	return <UiComposer label={label} placeholder={placeholder} submitIcon={<ArrowUp />} onSubmit={() => {}} className="w-96" />;
}
