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

export const Plus = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="M8 4v8M4 8h8" strokeLinecap="round" />
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

// Filled dots rather than strokes, so they read at 16px
export const Ellipsis = ({ className = 'size-4 shrink-0 fill-current' }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<circle cx="3.5" cy="8" r="1.25" />
		<circle cx="8" cy="8" r="1.25" />
		<circle cx="12.5" cy="8" r="1.25" />
	</svg>
);

export const MagnifyingGlass = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<circle cx="7" cy="7" r="4.25" />
		<path d="m10 10 3 3" strokeLinecap="round" />
	</svg>
);

export const ChevronLeft = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<path d="m10 4-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const CalendarGlyph = ({ className = glyph }: { className?: string }) => (
	<svg aria-hidden="true" viewBox="0 0 16 16" className={className}>
		<rect x="2.75" y="3.75" width="10.5" height="9.5" rx="2" />
		<path d="M2.75 7h10.5M5.5 2.25v2.5m5-2.5v2.5" strokeLinecap="round" />
	</svg>
);
