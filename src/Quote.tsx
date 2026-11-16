import type { HTMLAttributes, ReactNode } from 'react';
import { Avatar } from './Avatar.js';
import { tv } from './tv.js';

// The quote class is in tokens.css, beside prose's blockquote, which it shares its rules with. A testimonial starts from
// it and sets the words smaller and from the start edge, with the person under them, as utilities win over the class.
// No before: utilities here: each sets content to Tailwind's empty one, which wipes out the opening mark
export const quote = tv({
	slots: {
		base: 'quote',
		words: '',
		caption: '',
		person: 'block',
	},
	variants: {
		variant: {
			quote: '',
			testimonial: {
				base: 'text-start text-[length:1.25rem] leading-[1.3] text-pretty',
				caption: 'flex items-center gap-3',
				person: 'flex min-w-0 flex-col',
			},
		},
	},
	defaultVariants: { variant: 'quote' },
});

export interface QuoteProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/** What they said, as text or paragraphs. The opening mark is drawn for it, so leave the quote marks off */
	children: ReactNode;
	/** Who said it */
	cite?: ReactNode;
	/** Who they are, such as their role and company, under their name */
	detail?: ReactNode;
	/** A quote set apart in the writing, or a testimonial, with the person beside a photo */
	variant?: 'quote' | 'testimonial';
	/** A photo of them, for a testimonial. Their initials show until it loads, from the cite when it's text */
	avatar?: string;
}

/** Someone else’s words, set apart in Livory’s italic, with who said it under them. A testimonial puts their photo beside their name */
export function Quote({ children, cite, detail, variant, avatar, className, ...props }: QuoteProps) {
	const styles = quote({ variant });
	const hasCaption = cite != null || detail != null;
	return (
		<figure {...props} className={styles.base({ className })}>
			<blockquote className={styles.words()}>{children}</blockquote>
			{hasCaption && (
				<figcaption className={styles.caption()}>
					{/* Hidden, as the name beside it says who it is */}
					{variant === 'testimonial' && avatar != null && <Avatar name={typeof cite === 'string' ? cite : ''} src={avatar} size={48} aria-hidden />}
					<span className={styles.person()}>
						{cite != null && <cite>{cite}</cite>}
						{detail != null && <span>{detail}</span>}
					</span>
				</figcaption>
			)}
		</figure>
	);
}
