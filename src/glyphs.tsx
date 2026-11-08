// The small marks inside controls, drawn here so the package needs nothing else. Each is
// hidden from screen readers, as the control around it carries the meaning
const glyph = 'size-4 shrink-0 fill-none stroke-current stroke-[1.5]';

export const Check = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const Dash = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="M4 8h8" strokeLinecap="round" />
	</svg>
);

export const ChevronDown = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const ChevronRight = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const Cross = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="m4.5 4.5 7 7m0-7-7 7" strokeLinecap="round" />
	</svg>
);
