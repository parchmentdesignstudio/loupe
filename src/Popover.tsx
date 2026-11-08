import type { ReactNode } from 'react';
import { OverlayArrow, Popover as AriaPopover, type PopoverProps as AriaPopoverProps, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';

// Shared by popovers and the lists of selects, combo boxes and menus
export const popover = tv({
	base: 'rounded-2xl bg-paper text-ink shadow-overlay outline-0',
	variants: {
		isEntering: {
			true: 'animate-enter motion-reduce:animate-fade-in',
		},
		isExiting: {
			true: 'animate-exit motion-reduce:animate-fade-out',
		},
	},
});

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
	/** Points back at what opened it, for a popover that isn't a list */
	showArrow?: boolean;
	children: ReactNode;
}

/** Content that floats beside what opened it, such as a DialogTrigger's button */
export function Popover({ showArrow = false, children, ...props }: PopoverProps) {
	return (
		<AriaPopover offset={showArrow ? 12 : 8} {...props} className={composeRenderProps(props.className, (className, state) => popover({ ...state, className }))}>
			{showArrow && (
				<OverlayArrow className="group">
					<svg aria-hidden="true" width={14} height={8} viewBox="0 0 14 8" className="block fill-paper drop-shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_8%,transparent)] group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90">
						<path d="M0 0 7 7 14 0Z" />
					</svg>
				</OverlayArrow>
			)}
			{children}
		</AriaPopover>
	);
}
