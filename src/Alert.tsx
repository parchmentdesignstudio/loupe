import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from './Button.js';
import { Cross, DangerGlyph, InfoGlyph, SuccessGlyph, WarningGlyph } from './glyphs.js';
import type { StatusTone } from './Status.js';
import { tv } from './tv.js';

export type AlertTone = StatusTone;

// Each tone sets Status's hue as --alert, for the fill, and --alert-icon, a dark step of it in the light and a pale one
// in the dark, so the icon stands out at 3:1 from the fill or the ground in both. The text stays ink, or muted, as a
// status's does, so it reads the same in every tone and theme
export const alert = tv({
	slots: {
		base: 'flex items-start gap-3 text-body text-ink',
		// On the text's first line, as an icon in a button is
		icon: 'flex shrink-0 text-(--alert-icon) *:my-[calc((1lh-1rem)/2)]',
		content: 'flex min-w-0 flex-1 flex-col gap-0.5 wrap-break-word',
		title: 'font-medium text-pretty',
		description: 'text-pretty *:not-first:mt-2',
		actions: 'mt-2.5 flex flex-wrap gap-2',
		// A 28px button on the 20px line, centred on it
		dismiss: '-my-1 shrink-0',
	},
	variants: {
		tone: {
			neutral: { base: '[--alert-icon:light-dark(var(--color-sand-46),var(--color-sand-84))] [--alert:var(--color-sand-66)]' },
			info: { base: '[--alert-icon:light-dark(var(--color-blue-56),var(--color-blue-82))] [--alert:var(--color-blue-56)]' },
			success: { base: '[--alert-icon:light-dark(var(--color-green-46),var(--color-green-89))] [--alert:var(--color-green-68)]' },
			warning: { base: '[--alert-icon:light-dark(var(--color-yellow-40),var(--color-yellow-91))] [--alert:var(--color-yellow-76)]' },
			danger: { base: '[--alert-icon:light-dark(var(--color-red-50),var(--color-red-81))] [--alert:var(--color-red-67)]' },
		},
		// An alert is a box tinted in the tone, edged a little deeper, to draw the eye. A notice is a line in the flow,
		// with no box: the icon in the tone and muted text, for something worth knowing that needn't stop anyone
		variant: {
			alert: {
				base: 'rounded-lg bg-[color-mix(in_oklab,var(--alert)_12%,transparent)] py-3 ps-3 pe-3 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--alert)_20%,transparent)]',
			},
			notice: {
				description: 'text-muted',
			},
		},
		hasDismiss: {
			true: '',
		},
	},
	compoundVariants: [
		// The button's own padding stands in for the box's, so its cross sits as far in as the icon
		{ variant: 'alert', hasDismiss: true, class: { base: 'pe-2' } },
	],
	defaultVariants: { tone: 'info', variant: 'alert' },
});

const icons: Record<AlertTone, () => ReactNode> = {
	neutral: () => <InfoGlyph />,
	info: () => <InfoGlyph />,
	success: () => <SuccessGlyph />,
	warning: () => <WarningGlyph />,
	danger: () => <DangerGlyph />,
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
	/** The alert’s colour and icon. They only back up the words, so the title or text has to say it’s a warning */
	tone?: AlertTone;
	/** An alert, tinted to draw the eye, or a notice, a quieter line in the flow */
	variant?: 'alert' | 'notice';
	/** A line in medium above the text. It isn’t a heading, so it sits in a form or a card under their own */
	title?: ReactNode;
	/** In place of the tone’s icon, or null for none */
	icon?: ReactNode;
	/** Buttons or links under the text, such as small secondary buttons */
	actions?: ReactNode;
	/** Shows a button that closes it, and calls back when it’s pressed. Take the alert away then, and move focus on */
	onDismiss?: () => void;
	/** The dismiss button’s name, read out in place of “Dismiss” */
	dismissLabel?: string;
	children?: ReactNode;
}

/**
 * Something to know about a page or a part of it: a tinted alert to draw the eye, or a quieter notice. It's on the page
 * when it loads, so it isn't announced. One that appears after something happens, such as a failed save, wants
 * role="alert" if it can't wait, or role="status" if it can, on an element that's already there before its text
 * changes, or a toast
 */
export function Alert({ tone = 'info', variant, title, icon, actions, onDismiss, dismissLabel = 'Dismiss', className, children, ...props }: AlertProps) {
	const styles = alert({ tone, variant, hasDismiss: onDismiss != null });
	const shown = icon === undefined ? icons[tone]() : icon;
	return (
		<div {...props} className={styles.base({ className })}>
			{shown != null && shown !== false && (
				<span className={styles.icon()} aria-hidden="true">
					{shown}
				</span>
			)}
			<div className={styles.content()}>
				{title != null && <p className={styles.title()}>{title}</p>}
				{children != null && <div className={styles.description()}>{children}</div>}
				{actions != null && <div className={styles.actions()}>{actions}</div>}
			</div>
			{onDismiss && (
				<Button variant="ghost" shape="full" size="small" aria-label={dismissLabel} onPress={onDismiss} className={styles.dismiss()}>
					<Cross />
				</Button>
			)}
		</div>
	);
}
