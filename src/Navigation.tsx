import { type HTMLAttributes, useCallback, useRef, useState } from 'react';
import { Button } from './Button.js';
import { Sheet, SheetTrigger } from './Sheet.js';
import { tv } from './tv.js';

const navigation = tv({
	base: 'flex flex-col gap-6 max-md:hidden md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:overflow-y-auto md:border-r md:border-bleed/8 md:px-3 md:py-6',
});

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
	/** Names the navigation, and labels the button that opens it on phones */
	'aria-label': string;
	/**
	 * Whether it shows its own button on phones, in a row above the page. Set it false to put a button of the page's own
	 * somewhere tidier, such as its top bar, and open the sheet with isOpen and onOpenChange
	 */
	hasTrigger?: boolean;
	/** Whether the sheet is open on phones, to open it from a button of the page's own */
	isOpen?: boolean;
	onOpenChange?: (isOpen: boolean) => void;
}

/** A page’s navigation: a column beside the page on wider screens, and a sheet behind a button on phones */
export function Navigation({ className, children, hasTrigger = true, isOpen: givenOpen, onOpenChange, ...props }: NavigationProps) {
	const [ownOpen, setOwnOpen] = useState(false);
	const isOpen = givenOpen ?? ownOpen;
	const setOpen = (next: boolean) => {
		setOwnOpen(next);
		onOpenChange?.(next);
	};
	// The listener below is added once, so it reads the latest setOpen, and with it the page's onOpenChange, from here
	const latest = useRef(setOpen);
	latest.current = setOpen;

	// Choosing a link in the sheet closes it, to show its page. It listens on the nav rather than each
	// link, and the links already take the keyboard, so it isn't an onClick
	const closeOnLink = useCallback((nav: HTMLElement | null) => {
		if (!nav) return;
		const close = (event: Event) => {
			if ((event.target as Element).closest('a[href]')) latest.current(false);
		};
		nav.addEventListener('click', close);
		return () => nav.removeEventListener('click', close);
	}, []);

	const content = (
		<nav {...props} ref={closeOnLink} className="flex flex-col gap-6">
			{children}
		</nav>
	);
	const sheet = (
		<Sheet position="start" aria-label={props['aria-label']}>
			{content}
		</Sheet>
	);

	return (
		<>
			<nav {...props} className={navigation({ className })}>
				{children}
			</nav>
			{hasTrigger ? (
				<div className="px-4 pt-4 md:hidden">
					<SheetTrigger isOpen={isOpen} onOpenChange={setOpen}>
						<Button variant="secondary">{props['aria-label']}</Button>
						{sheet}
					</SheetTrigger>
				</div>
			) : (
				<Sheet isOpen={isOpen} onOpenChange={setOpen} position="start" aria-label={props['aria-label']}>
					{content}
				</Sheet>
			)}
		</>
	);
}
