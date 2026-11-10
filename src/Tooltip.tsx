import type { ReactNode } from 'react';
import { OverlayArrow, Tooltip as AriaTooltip, type TooltipProps as AriaTooltipProps, composeRenderProps } from 'react-aria-components';
import { tv } from './tv.js';

export { TooltipTrigger } from 'react-aria-components';

const tooltip = tv({
	base: 'max-w-64 rounded-lg bg-inverse px-2.5 py-1.5 text-label text-paper [&_kbd]:ms-2 [&_kbd]:text-paper/70',
	variants: {
		isEntering: {
			true: 'animate-enter motion-reduce:animate-fade-in',
		},
		isExiting: {
			true: 'animate-fade-out',
		},
	},
});

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
	/** Points at the control it labels */
	showArrow?: boolean;
	children: ReactNode;
}

/** A short label for a control, shown on hover and keyboard focus. It sits in a TooltipTrigger with the control */
export function Tooltip({ showArrow = false, children, ...props }: TooltipProps) {
	return (
		<AriaTooltip offset={8} {...props} className={composeRenderProps(props.className, (className, state) => tooltip({ ...state, className }))}>
			{showArrow && (
				<OverlayArrow className="group">
					<svg aria-hidden="true" width={10} height={5} viewBox="0 0 10 5" className="block fill-inverse group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90">
						<path d="M0 0 5 5 10 0Z" />
					</svg>
				</OverlayArrow>
			)}
			{children}
		</AriaTooltip>
	);
}
