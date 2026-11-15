import { type ReactNode, useEffect, useState } from 'react';
import { Button } from './Button.js';
import { Tooltip, TooltipTrigger } from './Tooltip.js';
import { tv } from './tv.js';

export const code = tv({
	slots: {
		base: 'relative flex flex-col overflow-hidden rounded-xl text-code-text shadow-[0_0_0_.5px_var(--edge)] [--bleed:var(--panel-bleed)]',
		// The title, what's changed and Copy, on a line of their own above the code, as an editor's tab bar has them.
		// The ground under the block shows through it, lightened in the light, and as it is in the dark, where the code is a
		// step lighter, as a button is. The code casts the line between them, so it sits a little above the bar
		bar: 'flex items-center gap-3 bg-[light-dark(color-mix(in_oklab,var(--color-white)_40%,transparent),transparent)] py-1 ps-4 pe-1 text-control font-medium',
		title: 'min-w-0 flex-1 truncate',
		// A path's folders, quieter than its file
		folder: 'font-normal text-code-comment',
		changes: 'flex gap-1.5 font-mono text-label tabular-nums',
		// Shiki's <pre>, or a plain one before it's highlighted, laid out the same, so nothing moves when it is. Its own
		// background goes, for the block's. Line numbers, from Loupe's transformer, sit in a column that stays as the lines scroll
		body: [
			// The ground is the code's alone, so the bar's shade is over whatever's behind the block
			'bg-code-ground',
			'[&_pre]:m-0 [&_pre]:max-h-[24lh] [&_pre]:overflow-auto [&_pre]:overscroll-contain [&_pre]:bg-transparent! [&_pre]:py-3 [&_pre]:font-mono [&_pre]:text-label/5 [&_pre]:[tab-size:2]',
			'[&_code]:flex [&_code]:min-w-max [&_code]:flex-col',
			'[&_.line]:relative [&_.line]:min-h-[1lh] [&_.line]:px-4',
			'[&_code[data-line-numbers]]:grid [&_code[data-line-numbers]]:min-w-0 [&_code[data-line-numbers]]:grid-cols-[auto_1fr]',
			// Above the lines, which are positioned for their + and − signs, so would scroll over it otherwise
			'[&_[data-line-numbers-col]]:sticky [&_[data-line-numbers-col]]:left-0 [&_[data-line-numbers-col]]:z-1 [&_[data-line-numbers-col]]:flex [&_[data-line-numbers-col]]:flex-col [&_[data-line-numbers-col]]:bg-code-ground [&_[data-line-numbers-col]]:text-end [&_[data-line-numbers-col]]:text-code-comment [&_[data-line-numbers-col]]:select-none',
			// On each number rather than the column, so a marked line's tint runs under its number too. The gap after it is
			// the number's too, rather than the line's, so it stays as the lines scroll under it
			'[&_[data-line-number]]:relative [&_[data-line-number]]:ps-4 [&_[data-line-number]]:pe-4',
			'[&_[data-line-numbers-content]]:flex [&_[data-line-numbers-content]]:flex-col [&_[data-line-numbers-content]_.line]:ps-0',
			// Marked lines, from @shikijs/transformers, and their numbers, which take the same classes. A warning is
			// highlighted as well, so it's marked as one, and an error is marked as a removal
			'[&_.highlighted:not(.error)]:bg-code-mark [&_[data-line-number].highlighted:not(.error)]:text-code-mark-edge',
			'[&_.diff.add]:bg-code-add [&_[data-line-number].add]:text-code-add-edge',
			'[&_:is(.diff.remove,.error)]:bg-code-remove [&_[data-line-number]:is(.remove,.error)]:text-code-remove-edge',
			// A removed line's stripes, under its number too, so it reads apart from an added one by more than its colour.
			// Fixed to the page, so they run on unbroken from the number to the line, and from one line to the next
			'[&_:is(.line,[data-line-number]):is(.diff.remove,.error)]:bg-[repeating-linear-gradient(-45deg,color-mix(in_oklch,var(--color-code-remove-edge)_8%,transparent)_0_1px,transparent_1px_3px)] [&_:is(.line,[data-line-number]):is(.diff.remove,.error)]:bg-fixed',
			// A bar down the changed line's edge, or its number's with numbers: solid for an addition, and for a removal its
			// fine stripes in the edge colour on a paler red, so it reads as one bar, striped up close
			"[&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:absolute [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:inset-y-0 [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:start-0 [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:w-0.75 [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.diff,.error)]:before:content-['']",
			'[&_:is(code:not([data-line-numbers])_.line,[data-line-number]).add]:before:bg-code-add-edge [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.remove,.error)]:before:bg-[repeating-linear-gradient(-45deg,var(--color-code-remove-edge)_0_1px,color-mix(in_oklch,var(--color-code-remove-edge)_35%,light-dark(white,var(--color-code-ground)))_1px_3px)] [&_:is(code:not([data-line-numbers])_.line,[data-line-number]):is(.remove,.error)]:before:bg-fixed',
			'[&_.highlighted-word]:-mx-0.5 [&_.highlighted-word]:rounded-sm [&_.highlighted-word]:bg-code-mark [&_.highlighted-word]:px-0.5',
			// A word marked on a changed line, as what changed in it, takes the line's tint again over the line's own
			'[&_.diff.add_.highlighted-word]:bg-code-add [&_:is(.diff.remove,.error)_.highlighted-word]:bg-code-remove',
			// With lines in focus, the rest fade back until the block's hovered
			'[&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:opacity-40 [&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:blur-[1px] [&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:transition-[opacity,filter] motion-reduce:[&_pre.has-focused_:is(.line,[data-line-number]):not(.focused)]:transition-none',
			'[&_pre.has-focused:hover_:is(.line,[data-line-number]):not(.focused)]:opacity-100 [&_pre.has-focused:hover_:is(.line,[data-line-number]):not(.focused)]:blur-none',
		].join(' '),
		plain: 'px-4 whitespace-pre',
		// Copy, without a title to sit beside, in a column of its own beside the code, so the code scrolls short of it
		// rather than under it. Set as the code is, with Copy centred on a line's height, so it's level with the first line
		aside: 'flex shrink-0 bg-code-ground py-3 ps-2 pe-1.5 font-mono text-label/5',
		line: 'flex h-[1lh] items-center',
	},
	variants: {
		hasBar: { true: { body: 'relative shadow-[0_-.5px_var(--edge),0_-1px_3px_-1.5px_var(--drop-raised)]' }, false: { base: 'flex-row', body: 'min-w-0 flex-1' } },
	},
});

export type CodeTheme = 'loupe' | 'iamsteve' | 'mcknny';

/**
 * The code without Shiki's [!code ++] style notes, as Shiki shows it, for Copy and for the code before it's highlighted.
 * A comment left empty goes with them, and so does a line that was only that comment. A note inside a line stays, as
 * Shiki leaves it
 */
export function withoutNotes(source: string) {
	return source
		.split('\n')
		.flatMap((line) => {
			// Shiki only reads a note in a comment that ends its line
			if (!/\[!code [^\]]+\]\s*(?:\*\/\}|\*\/|-->)?\s*$/.test(line)) return [line];
			const rest = line
				.replace(/\s*\[!code [^\]]+\]/g, '')
				.replace(/\s*(?:\/\/|#|--)\s*$/, '')
				.replace(/\s*(?:\/\*\s*\*\/|<!--\s*-->|\{\/\*\s*\*\/\})\s*$/, '');
			return rest.trim() ? [rest] : [];
		})
		.join('\n');
}

export interface CodeProps {
	/** The code as text, shown as it is until there's html, and what Copy copies */
	code: string;
	/**
	 * The code highlighted, as Shiki's HTML in Loupe's theme: highlight or useHighlight from @parchment/ui/shiki in the
	 * browser, or the same theme and transformers in a site's own build
	 */
	html?: string;
	/** A file name or caption, on a bar above the code */
	title?: ReactNode;
	/** Whose colours, as Loupe's own or one of Parchment's sites'. A page can set them all with data-code-theme */
	theme?: CodeTheme;
	/** Copy, which copies the code. On unless turned off */
	isCopyable?: boolean;
	/**
	 * Copy as an icon, such as square-on-square from @parchment/icons, with its name in a tooltip, rather than as the
	 * word. copiedIcon takes its place once it's copied, such as checkmark
	 */
	copyIcon?: ReactNode;
	copiedIcon?: ReactNode;
	className?: string;
}

// How many lines a diff removes and adds, from Shiki's marks on them
const changesIn = (html = '') => ({ removed: html.match(/class="line diff remove\b/g)?.length ?? 0, added: html.match(/class="line diff add\b/g)?.length ?? 0 });

/** A block of code, highlighted, with a title, what a diff changes, and Copy. Long code scrolls inside it, both ways */
export function Code({ code: text, html, title, theme, isCopyable = true, copyIcon, copiedIcon, className }: CodeProps) {
	const { base, bar, title: name, folder, changes, body, plain, aside, line } = code({ hasBar: title != null });
	const [isCopied, setCopied] = useState(false);
	useEffect(() => {
		if (!isCopied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [isCopied]);
	const label = isCopied ? 'Copied' : 'Copy';
	const onCopy = () => void navigator.clipboard.writeText(withoutNotes(text)).then(() => setCopied(true));
	const copy =
		isCopyable &&
		(copyIcon ? (
			<TooltipTrigger>
				<Button variant="ghost" size="small" aria-label={label} onPress={onCopy}>
					{isCopied ? (copiedIcon ?? copyIcon) : copyIcon}
				</Button>
				<Tooltip>{label}</Tooltip>
			</TooltipTrigger>
		) : (
			<Button variant="ghost" size="small" onPress={onCopy}>
				{label}
			</Button>
		));
	const { removed, added } = changesIn(html);
	const folders = typeof title === 'string' ? title.split('/') : [];
	const file = folders.pop();
	return (
		<figure data-code-theme={theme === 'loupe' ? undefined : theme} className={base({ className })}>
			{title != null ? (
				<figcaption className={bar()}>
					<span className={name()}>
						{file == null
							? title
							: folders.map((each, i) => (
									<span key={i} className={folder()}>
										{each} /{' '}
									</span>
								))}
						{file}
					</span>
					{(removed > 0 || added > 0) && (
						<span className={changes()}>
							<span className="sr-only">
								{removed} {removed === 1 ? 'line' : 'lines'} removed, {added} added
							</span>
							<span aria-hidden className="text-code-remove-edge">
								−{removed}
							</span>
							<span aria-hidden className="text-code-add-edge">
								+{added}
							</span>
						</span>
					)}
					{copy}
				</figcaption>
			) : null}
			{html ? (
				// Shiki's own markup, made from the code by Shiki, so there's nothing in it the code didn't put there
				<div className={body()} dangerouslySetInnerHTML={{ __html: html }} />
			) : (
				<div className={body()}>
					<pre>
						<code className={plain()}>{withoutNotes(text).replace(/\n$/, '')}</code>
					</pre>
				</div>
			)}
			{title == null && copy && (
				<div className={aside()}>
					<div className={line()}>{copy}</div>
				</div>
			)}
		</figure>
	);
}
