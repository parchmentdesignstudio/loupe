import type { ReactNode } from 'react';
import { tv } from './tv.js';

export const card = tv({
	slots: {
		base: 'flex min-w-0 flex-col gap-(--card-gap) rounded-(--card-radius) p-(--card-padding) text-ink',
		header: 'flex min-w-0 flex-col gap-0.5',
		title: 'text-control font-(--card-title-font-weight) text-pretty',
		description: 'text-control text-pretty text-muted',
		body: 'flex min-w-0 flex-col gap-(--card-gap)',
		// Pushed to the foot, so in a row of cards that stretch to the tallest, their buttons line up whatever's above them
		actions: 'mt-auto flex flex-wrap gap-2 *:flex-1',
	},
	variants: {
		fill: {
			// White, off the page, with the panel's shadow for its edge
			raised: { base: 'bg-raised shadow-panel [--bleed:var(--raised-bleed)]' },
			// A tint of the page, for cards that sit inside something raised already
			quiet: { base: 'bg-bleed/4' },
		},
	},
	defaultVariants: { fill: 'raised' },
});

type Level = 2 | 3 | 4 | 5 | 6;

export interface CardProps {
	/** What it is, as in “Team” or “Revenue”. A heading, at headingLevel */
	title?: ReactNode;
	/** The heading's level, 3 unless the page needs another */
	headingLevel?: Level;
	/** A line under the title */
	description?: ReactNode;
	/** What it holds, such as a figure, a List or a form */
	children?: ReactNode;
	/** Buttons, at the foot, sharing its width */
	actions?: ReactNode;
	/** raised (the default) stands off the page; quiet is for cards inside something raised */
	fill?: 'raised' | 'quiet';
	className?: string;
}

/**
 * A panel that groups one thing among others like it, such as a plan, a stat or a project. Its buttons sit at the foot,
 * so a row of cards lines them up. A section on its own isn't a card, and a Table never goes in one
 */
export function Card({ title, headingLevel = 3, description, children, actions, fill, className }: CardProps) {
	const styles = card({ fill });
	const Heading = `h${headingLevel}` as const;
	return (
		<article className={styles.base({ className })}>
			{(title || description) && (
				<header className={styles.header()}>
					{title && <Heading className={styles.title()}>{title}</Heading>}
					{description && <p className={styles.description()}>{description}</p>}
				</header>
			)}
			{children && <div className={styles.body()}>{children}</div>}
			{actions && <div className={styles.actions()}>{actions}</div>}
		</article>
	);
}
