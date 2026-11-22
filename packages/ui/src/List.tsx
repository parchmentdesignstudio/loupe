import { createContext, type ReactNode, useContext } from 'react';
import { tv } from './tv.js';

export const list = tv({
	base: 'flex min-w-0 flex-col',
	variants: {
		variant: {
			// A hairline between each, for rows to scan, such as an account's details
			divided: '',
			// No lines and less space, for short points, such as what a plan includes
			plain: 'gap-(--list-plain-gap)',
		},
	},
	defaultVariants: { variant: 'divided' },
});

export const listItem = tv({
	slots: {
		base: 'flex min-w-0 items-start gap-(--list-item-gap) text-control',
		// On the first line's 20px, so it stays beside the title when the description wraps
		icon: 'flex h-5 shrink-0 items-center text-(color:--list-icon,var(--color-muted)) *:size-4',
		body: 'flex min-w-0 flex-1 flex-col',
		title: 'text-pretty text-ink',
		description: 'text-label text-pretty text-muted',
		end: 'shrink-0 text-end text-ink tabular-nums',
	},
	variants: {
		variant: {
			divided: { base: 'border-t border-bleed/8 py-(--list-divided-padding-y) first:border-t-0 first:pt-0 last:pb-0' },
			plain: {},
		},
	},
});

type Variant = 'divided' | 'plain';
const ListVariant = createContext<Variant>('divided');

export interface ListProps {
	/** divided (the default) has a hairline between rows; plain has none, for short points */
	variant?: Variant;
	/** Names the list for a screen reader, where nothing on the page does */
	'aria-label'?: string;
	/** ListItems */
	children: ReactNode;
	className?: string;
}

/**
 * Things to read, one under another, such as what a plan includes or an account's details. Nothing in it is picked or
 * pressed: items to open or act on are a GridList, and records with fields to compare are a Table
 */
export function List({ variant = 'divided', children, className, ...props }: ListProps) {
	return (
		<ListVariant.Provider value={variant}>
			<ul {...props} className={list({ variant, className })}>
				{children}
			</ul>
		</ListVariant.Provider>
	);
}

export interface ListItemProps {
	/** An icon before it, such as a tick for what a plan includes */
	icon?: ReactNode;
	/** A line under it */
	description?: ReactNode;
	/** A value at the end, such as an amount or a Status */
	end?: ReactNode;
	/** What it says */
	children: ReactNode;
	className?: string;
}

/** One row of a List: what it says, a line under it, and an icon before or a value after */
export function ListItem({ icon, description, end, children, className }: ListItemProps) {
	const styles = listItem({ variant: useContext(ListVariant) });
	return (
		<li className={styles.base({ className })}>
			{icon && (
				<span className={styles.icon()} aria-hidden="true">
					{icon}
				</span>
			)}
			<span className={styles.body()}>
				<span className={styles.title()}>{children}</span>
				{description && <span className={styles.description()}>{description}</span>}
			</span>
			{end && <span className={styles.end()}>{end}</span>}
		</li>
	);
}
