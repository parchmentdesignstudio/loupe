import { type DialogProps, Sheet, SheetBackdrop, SheetContent, SheetOverlay, type SheetOverlayProps } from 'react-aria-components';
import { composeClassName, tv } from './tv.js';

export { SheetTrigger as DrawerTrigger } from 'react-aria-components';

// A drawer is React Aria's Sheet, which moves by scrolling. The backdrop’s fade and the step back of a drawer under
// another are keyframes in styles/theme.css, which it plays in time with the swipe. Overscroll padding sits outside
// the drawer’s size, hence box-content
const drawer = tv({
	slots: {
		backdrop: 'data-[stack-index=0]:bg-(--drawer-backdrop,var(--color-scrim))',
		panel: 'z-1 box-content overflow-clip rounded-(--drawer-radius) bg-(--drawer-fill,var(--color-overlay)) [--bleed:var(--overlay-bleed)] text-ink shadow-overlay [--shadow-overlay-color:var(--drawer-shadow)] outline-0 will-change-transform transform-[perspective(1000px)] forced-colors:bg-[Canvas]',
		content: 'relative box-border h-full overflow-hidden p-(--dialog-padding) pb-[calc(var(--dialog-padding)_+_var(--sheet-scroll-padding-y))] outline-0 group-data-expanded/drawer:overflow-auto',
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

export interface DrawerProps extends Omit<SheetOverlayProps, 'children'> {
	/** Names the drawer for screen readers, when there’s no DialogHeading inside */
	'aria-label'?: string;
	children?: DialogProps['children'];
}

/** A panel that slides in from an edge of the screen and swipes back out, opened by the Button beside it in a DrawerTrigger */
export function Drawer({ children, 'aria-label': label, ...props }: DrawerProps) {
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
