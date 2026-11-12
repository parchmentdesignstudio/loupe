import type { ReactNode } from 'react';
import { tv } from './tv.js';

export const emptyState = tv({
	slots: {
		base: 'flex flex-col items-center gap-4 px-6 py-12 text-center',
		// A raised tile, like a secondary button, so the icon reads as the thing that'll be here
		icon: 'flex size-10 items-center justify-center rounded-xl bg-raised text-muted shadow-raised',
		text: 'flex max-w-[36ch] flex-col gap-1',
		title: 'font-medium text-ink',
		description: 'text-pretty text-muted',
		actions: 'mt-1 flex flex-wrap justify-center gap-2',
	},
});

export interface EmptyStateProps {
	/** An icon for what will be here, shown on a tile above the title */
	icon?: ReactNode;
	/** What's missing, as in “No blocks yet” */
	title: ReactNode;
	/** What will be here, or how to add the first one */
	children?: ReactNode;
	/** Buttons or links for the first step */
	actions?: ReactNode;
	className?: string;
}

/** Where there's nothing to show yet: what will be here, and the first step to fill it. The title isn't a heading, so it fits in a list or under a page's own */
export function EmptyState({ icon, title, children, actions, className }: EmptyStateProps) {
	const { base, icon: tile, text, title: name, description, actions: row } = emptyState();
	return (
		<div className={base({ className })}>
			{icon && (
				<div className={tile()} aria-hidden="true">
					{icon}
				</div>
			)}
			<div className={text()}>
				<p className={name()}>{title}</p>
				{children && <p className={description()}>{children}</p>}
			</div>
			{actions && <div className={row()}>{actions}</div>}
		</div>
	);
}
