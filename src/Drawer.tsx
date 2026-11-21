import { useContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Dialog, type DialogProps, OverlayTriggerStateContext, Sheet, SheetBackdrop, SheetContent, SheetOverlay, type SheetOverlayProps } from 'react-aria-components';
import { Overlay } from 'react-aria';
import { composeClassName, tv } from './tv.js';

export { SheetTrigger as DrawerTrigger } from 'react-aria-components';

// A drawer is React Aria's Sheet, which moves by scrolling. Its fill is --drawer-surface, for what's in it to take, such
// as a bar that's the drawer's colour a little see-through. The backdrop’s fade and the step back of a drawer under
// another are keyframes in styles/theme.css, which it plays in time with the swipe. Overscroll padding sits outside
// the drawer’s size, hence box-content. What it holds is a column, so DialogActions can sit at its foot, with the
// dialog's padding kept between them and what's above
const drawer = tv({
	slots: {
		backdrop: 'data-[stack-index=0]:bg-(--drawer-backdrop,var(--color-scrim))',
		panel: 'z-1 box-content overflow-clip rounded-(--drawer-radius) bg-(--drawer-surface) [--drawer-surface:var(--drawer-fill,var(--color-overlay))] [--bleed:var(--overlay-bleed)] text-ink shadow-overlay [--shadow-overlay-color:var(--drawer-shadow)] outline-0 will-change-transform transform-[perspective(1000px)] forced-colors:bg-[Canvas]',
		content: 'relative box-border flex h-full flex-col overflow-hidden p-(--dialog-padding) pb-[calc(var(--dialog-padding)_+_var(--sheet-scroll-padding-y))] outline-0 group-data-expanded/drawer:overflow-auto [&>:has(+[data-dialog-actions])]:mb-(--dialog-padding) *:data-dialog-actions:mt-auto',
	},
	variants: {
		position: {
			bottom: { panel: 'max-h-[calc(100%_-_2rem)] w-[calc(100%_-_1rem)] max-w-2xl origin-[center_-150px]' },
			top: { panel: 'max-h-[calc(100%_-_2rem)] w-[calc(100%_-_1rem)] max-w-2xl origin-[center_150px]' },
			center: { panel: 'max-h-[calc(100%_-_2rem)] w-[calc(100%_-_1rem)] max-w-2xl origin-[center_-150px]' },
			left: { panel: 'h-[calc(100%_-_1rem)] w-72 origin-[150px_center]' },
			right: { panel: 'h-[calc(100%_-_1rem)] w-72 origin-[-150px_center]' },
		},
	},
});

// A pushing drawer takes room in the page's row, at its start or end. What it holds keeps its full width, so it never
// rewraps itself. With reflow continuous, its width opens from 0, which moves the page over as it goes, and what it
// holds is pinned to its outer edge, so it slides in with that edge. With reflow once, its room is taken or given back
// the moment it opens or closes, so the page rewraps a single time, and the panel slides over on its own. What's marked
// data-drawer-follows glides from where it was to where the rewrap put it, in time with the panel, so the two move as
// one rather than the page jumping. The panel's box is clipped, so as it slides it never sticks out past the page.
// 350ms, as it's a large thing to move: long enough to follow, short enough not to wait on
const duration = 350;
const easing = 'cubic-bezier(.32,.72,0,1)';
// Where each element marked to follow a pushing drawer sits now
const where = () => new Map([...document.querySelectorAll<HTMLElement>('[data-drawer-follows]')].map((element) => [element, element.getBoundingClientRect()]));
const ease = 'duration-350 ease-[cubic-bezier(.32,.72,0,1)] motion-reduce:transition-none';
const pushDrawer = tv({
	slots: {
		aside: 'relative h-full shrink-0',
		panel: 'h-full w-(--drawer-push-width) overflow-hidden',
		sheet: 'h-full border-bleed/8 bg-(--drawer-surface) [--drawer-surface:var(--drawer-push-fill,var(--color-ground))] [--bleed:var(--ground-bleed)]',
		content: 'relative box-border flex h-full flex-col overflow-auto p-(--dialog-padding) outline-0 [&>:has(+[data-dialog-actions])]:mb-(--dialog-padding) *:data-dialog-actions:mt-auto',
	},
	variants: {
		reflow: {
			continuous: { aside: `flex overflow-hidden transition-[width] ${ease}`, panel: 'shrink-0' },
			once: { panel: 'pointer-events-none absolute inset-y-0', sheet: `pointer-events-auto transition-[translate] ${ease}` },
		},
		position: {
			start: { sheet: 'border-e' },
			end: { sheet: 'border-s' },
		},
		isOpen: {
			true: { aside: 'w-(--drawer-push-width)' },
			false: { aside: 'w-0' },
		},
	},
	compoundVariants: [
		{ reflow: 'continuous', position: 'start', class: { aside: 'justify-end' } },
		{ reflow: 'continuous', position: 'end', class: { aside: 'justify-start' } },
		{ reflow: 'once', position: 'start', class: { panel: 'start-0' } },
		{ reflow: 'once', position: 'end', class: { panel: 'end-0' } },
		{ reflow: 'once', position: 'start', isOpen: false, class: { sheet: '-translate-x-full rtl:translate-x-full' } },
		{ reflow: 'once', position: 'end', isOpen: false, class: { sheet: 'translate-x-full rtl:-translate-x-full' } },
	],
});

// Tailwind's breakpoints, which a pushing drawer becomes an overlay below
const breakpoints = { md: '48rem', lg: '64rem', xl: '80rem' } as const;

const useMatches = (query: string) =>
	useSyncExternalStore(
		(onChange) => {
			const list = matchMedia(query);
			list.addEventListener('change', onChange);
			return () => list.removeEventListener('change', onChange);
		},
		() => matchMedia(query).matches,
		() => true,
	);

export interface DrawerProps extends Omit<SheetOverlayProps, 'children'> {
	/** Names the drawer for screen readers, when there’s no DialogHeading inside */
	'aria-label'?: string;
	children?: DialogProps['children'];
	/**
	 * Overlay slides over the page and dims it. Push sits in the page's own row, at its start or end, and moves the page
	 * over as it opens, without covering it or keeping focus in. Below pushFrom it's an overlay, as there isn't the room
	 */
	mode?: 'overlay' | 'push';
	/** The window width a pushing drawer pushes from. Below it, it's an overlay */
	pushFrom?: keyof typeof breakpoints;
	/**
	 * How the page beside a pushing drawer rewraps. Once, it rewraps a single time as the drawer slides over, which suits
	 * text, and what's marked data-drawer-follows glides to its new place with the drawer. Continuous, it's squeezed as
	 * the drawer opens, rewrapping all the way, which suits a page of little text
	 */
	reflow?: 'once' | 'continuous';
}

/**
 * A panel that slides in from an edge of the screen, opened by the Button beside it in a DrawerTrigger. Over the page,
 * it swipes back out. Pushing the page aside, the Button closes it again, as does Escape
 */
export function Drawer({ mode = 'overlay', pushFrom = 'md', reflow, ...props }: DrawerProps) {
	const isWide = useMatches(`(min-width: ${breakpoints[pushFrom]})`);
	if (mode === 'push' && isWide) return <PushDrawer {...props} reflow={reflow} />;
	return <OverlayDrawer {...props} position={mode === 'push' ? (props.position === 'start' || props.position === 'left' ? 'start' : 'end') : props.position} />;
}

function OverlayDrawer({ children, 'aria-label': label, ...props }: Omit<DrawerProps, 'mode' | 'pushFrom' | 'reflow'>) {
	const slots = drawer();
	return (
		<SheetOverlay {...props} className={composeClassName(props.className, 'group/drawer z-50')}>
			<SheetBackdrop className={slots.backdrop()} swipeAnimation="drawer-backdrop" swipeAnimationRange={props.snapPoints ? { start: props.snapPoints.length - 1 } : undefined} />
			<Sheet overscrollPadding stackAnimation="drawer-scale-back" className={({ position }) => drawer({ position }).panel()}>
				<SheetContent aria-label={label} className={slots.content()}>
					{children}
				</SheetContent>
			</Sheet>
		</SheetOverlay>
	);
}

function PushDrawer({ children, 'aria-label': label, isOpen: givenOpen, defaultOpen = false, onOpenChange, position = 'end', reflow = 'once', className }: Omit<DrawerProps, 'mode' | 'pushFrom'>) {
	// In a DrawerTrigger, it shares the trigger's open state, so its Button toggles it and is marked expanded. Otherwise
	// it's open as isOpen says, or as it was last left
	const trigger = useContext(OverlayTriggerStateContext);
	const [ownOpen, setOwnOpen] = useState(defaultOpen);
	const isOwn = givenOpen != null || trigger == null;
	const isOpen = isOwn ? (givenOpen ?? ownOpen) : trigger.isOpen;
	const setOpen = (next: boolean) => {
		if (isOwn) {
			setOwnOpen(next);
			onOpenChange?.(next);
		} else trigger.setOpen(next);
	};
	const side = position === 'start' || position === 'left' ? 'start' : 'end';

	// With reflow once, where what follows sits is measured as isOpen changes, while the page is still as it was, and
	// once the room is taken or given back, what moved is sent back to where it was and glides on. A glide cut short by
	// another toggle goes on from wherever it had got to
	const [followed, setFollowed] = useState<{ isOpen: boolean; from?: Map<HTMLElement, DOMRect> }>({ isOpen });
	if (followed.isOpen !== isOpen) setFollowed({ isOpen, from: reflow === 'once' ? where() : undefined });
	useLayoutEffect(() => {
		if (!followed.from || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		for (const [element, from] of followed.from) {
			if (!element.isConnected || typeof element.animate !== 'function') continue;
			for (const animation of element.getAnimations()) if (animation.id === 'drawer-follows') animation.cancel();
			const to = element.getBoundingClientRect();
			const x = from.left - to.left;
			const y = from.top - to.top;
			if (x || y) element.animate({ translate: [`${x}px ${y}px`, '0 0'] }, { duration, easing, id: 'drawer-follows' });
		}
	}, [followed]);
	const slots = pushDrawer({ position: side, isOpen, reflow });

	// What it holds stays until it has slid shut, then goes, so the dialog in it takes focus afresh each time it opens.
	// What slides is the aside, or with reflow once the panel. With reduced motion there's no slide to wait for
	const aside = useRef<HTMLElement>(null);
	const sheet = useRef<HTMLDivElement>(null);
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [isMounted, setMounted] = useState(isOpen);
	if (isOpen && !isMounted) setMounted(true);
	const opener = useRef<Element | null>(null);
	useLayoutEffect(() => {
		const element = aside.current;
		if (!element) return;
		if (isOpen) {
			opener.current = document.activeElement;
			return;
		}
		// Focus goes back to what opened it, before inert would drop it on the page
		if (element.contains(document.activeElement) && opener.current instanceof HTMLElement) opener.current.focus();
		const slider = reflow === 'once' ? sheet.current : element;
		if (!slider) return setMounted(false);
		const { transitionProperty, transitionDuration } = getComputedStyle(slider);
		if (transitionProperty === 'none' || !transitionDuration || transitionDuration === '0s') setMounted(false);
	}, [isOpen, reflow]);

	// Escape closes it from anywhere inside. It's listened for on the aside, as the dialog takes no key handlers
	const close = useRef(() => setOpen(false));
	useLayoutEffect(() => {
		close.current = () => setOpen(false);
	});
	useLayoutEffect(() => {
		const element = aside.current;
		if (!element) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.stopPropagation();
			close.current();
		};
		element.addEventListener('keydown', onKeyDown);
		return () => element.removeEventListener('keydown', onKeyDown);
	}, []);

	return (
		<aside
			ref={aside}
			inert={!isOpen}
			aria-label={label}
			onTransitionEnd={(event) => event.target === (reflow === 'once' ? sheet.current : event.currentTarget) && !isOpen && setMounted(false)}
			className={slots.aside({ className: typeof className === 'string' ? className : undefined })}
		>
			<div className={slots.panel()}>
				<div
					ref={(element) => {
						sheet.current = element;
						setContainer(element);
					}}
					className={slots.sheet()}
				>
					{/* In a DrawerTrigger, every button inside would also toggle the drawer, as the trigger's press handling reaches
					    down to them. An Overlay stops it there, as it does for React Aria's own overlays. Its focus handling is
					    left off, as a pushing drawer doesn't keep focus in */}
					{isMounted && container && (
						<Overlay portalContainer={container} disableFocusManagement>
							<OverlayTriggerStateContext.Provider value={{ isOpen, setOpen, open: () => setOpen(true), close: () => setOpen(false), toggle: () => setOpen(!isOpen), point: null, setPoint: () => {} }}>
								<Dialog aria-label={label} className={slots.content()}>
									{children}
								</Dialog>
							</OverlayTriggerStateContext.Provider>
						</Overlay>
					)}
				</div>
			</div>
		</aside>
	);
}
