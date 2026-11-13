import { Button } from './Button.js';
import { ChevronLeft, ChevronRight } from './glyphs.js';

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * The pages to show a button for, with 'gap' where some are left out. The first and last always show, with `siblings`
 * either side of the current one, and the list is always the same length, so the buttons don't shift as you move through
 */
export function pageRange(page: number, count: number, siblings = 1): (number | 'gap')[] {
	// The first, the last, the current, its siblings and a gap each side
	const slots = siblings * 2 + 5;
	if (count <= slots) return range(1, count);
	const current = Math.min(Math.max(page, 1), count);
	const start = Math.max(current - siblings, 1);
	const end = Math.min(current + siblings, count);
	// A gap stands for at least two pages, as a single one may as well be shown
	if (start <= 3) return [...range(1, slots - 2), 'gap', count];
	if (end >= count - 2) return [1, 'gap', ...range(count - slots + 3, count)];
	return [1, 'gap', ...range(start, end), 'gap', count];
}

const glyph = 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] rtl:-scale-x-100';

export interface PaginationProps {
	/** The current page, from 1 */
	page: number;
	/** How many pages there are */
	count: number;
	onChange: (page: number) => void;
	/** How many pages show either side of the current one, 1 by default */
	siblings?: number;
	/** Names the navigation, “Pages” by default */
	'aria-label'?: string;
	className?: string;
}

/** Buttons to move between the pages of a long list or table, with the pages far from the current one folded into a gap */
export function Pagination({ page, count, onChange, siblings, 'aria-label': label = 'Pages', className }: PaginationProps) {
	if (count < 1) return null;
	return (
		<nav aria-label={label} className={className}>
			<ul className="flex items-center gap-1">
				<li>
					<Button variant="ghost" size="small" shape="square" aria-label="Previous page" isDisabled={page <= 1} onPress={() => onChange(page - 1)}>
						<ChevronLeft className={glyph} />
					</Button>
				</li>
				{pageRange(page, count, siblings).map((item, index) =>
					item === 'gap' ? (
						<li key={`gap-${index}`} aria-hidden className="min-w-7 text-center text-control text-muted">
							…
						</li>
					) : item === page ? (
						// The current page isn't a button, as there's nowhere for it to go
						<li key={item} aria-current="page" className="min-w-7 rounded-lg bg-bleed/8 px-1.5 py-1 text-center text-control font-medium tabular-nums">
							<span className="sr-only">Page </span>
							{item}
						</li>
					) : (
						<li key={item}>
							<Button variant="ghost" size="small" shape="square" aria-label={`Page ${item}`} className="min-w-7 tabular-nums" onPress={() => onChange(item)}>
								{item}
							</Button>
						</li>
					),
				)}
				<li>
					<Button variant="ghost" size="small" shape="square" aria-label="Next page" isDisabled={page >= count} onPress={() => onChange(page + 1)}>
						<ChevronRight className={glyph} />
					</Button>
				</li>
			</ul>
		</nav>
	);
}
