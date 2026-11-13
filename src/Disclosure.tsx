import { type ReactNode, createContext, useContext } from 'react';
import {
	Button,
	Disclosure as AriaDisclosure,
	DisclosureGroup as AriaDisclosureGroup,
	type DisclosureGroupProps as AriaDisclosureGroupProps,
	DisclosurePanel as AriaDisclosurePanel,
	type DisclosurePanelProps as AriaDisclosurePanelProps,
	type DisclosureProps as AriaDisclosureProps,
	DisclosureStateContext,
	Heading,
} from 'react-aria-components';
import { ChevronDown } from './glyphs.js';
import { composeClassName, focusRing, tv } from './tv.js';

type Size = 'medium' | 'small';

// A group hands its size to each disclosure in it, and a disclosure to its header and panel
const SizeContext = createContext<Size>('medium');

const trigger = tv({
	extend: focusRing,
	base: 'flex w-full cursor-default items-center justify-between gap-4 rounded-sm text-left font-medium text-ink',
	variants: {
		size: {
			medium: 'py-4 text-base',
			// The chevron follows the title, so it stays put when a wider panel opens
			small: 'justify-start gap-1.5 py-1.5 text-body',
		},
		isDisabled: {
			true: 'text-muted',
		},
	},
});

const chevron = tv({
	base: 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted transition-transform duration-250 ease-in-out motion-reduce:transition-none',
	variants: {
		isHovered: {
			true: 'text-ink',
		},
		isExpanded: {
			true: 'rotate-180',
		},
	},
});

// React Aria sets --disclosure-panel-height as the panel opens and closes, so the height transitions. The padding sits
// inside, so it closes to nothing
const panel = tv({
	slots: {
		base: 'h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-in-out motion-reduce:transition-none',
		content: '',
	},
	variants: {
		size: {
			medium: { content: 'pb-4' },
			small: { content: '' },
		},
	},
});

export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
	/** Medium for questions and answers, divided by lines. Small for navigation, or a title over its description */
	size?: Size;
}

/** Disclosures that open one at a time, unless allowsMultipleExpanded */
export function DisclosureGroup({ size = 'medium', ...props }: DisclosureGroupProps) {
	return (
		<SizeContext.Provider value={size}>
			<AriaDisclosureGroup {...props} className={composeClassName(props.className, size === 'medium' ? 'flex flex-col divide-y divide-bleed/8' : 'flex flex-col')} />
		</SizeContext.Provider>
	);
}

export interface DisclosureProps extends AriaDisclosureProps {
	/** Medium, with room around it, or small, with little space built in. In a group, it takes the group's */
	size?: Size;
}

/** A DisclosureHeader that shows or hides the DisclosurePanel under it */
export function Disclosure({ size, ...props }: DisclosureProps) {
	const groupSize = useContext(SizeContext);
	return (
		<SizeContext.Provider value={size ?? groupSize}>
			<AriaDisclosure {...props} />
		</SizeContext.Provider>
	);
}

export interface DisclosureHeaderProps {
	children: ReactNode;
	/** The heading's level, 3 unless set */
	level?: number;
	/** Classes for the header's button, such as padding to line it up with what's beside it */
	className?: string;
}

/** A heading whose button opens and closes its disclosure, with a chevron that turns as it does */
export function DisclosureHeader({ children, level, className }: DisclosureHeaderProps) {
	const size = useContext(SizeContext);
	const isExpanded = useContext(DisclosureStateContext)?.isExpanded ?? false;
	return (
		<Heading level={level}>
			<Button slot="trigger" className={(state) => trigger({ ...state, size, className })}>
				{({ isHovered }) => (
					<>
						{children}
						<ChevronDown className={chevron({ isHovered, isExpanded })} />
					</>
				)}
			</Button>
		</Heading>
	);
}

export interface DisclosurePanelProps extends Omit<AriaDisclosurePanelProps, 'children'> {
	children: ReactNode;
}

/** What a disclosure shows when it's open. A closed panel stays in the page, hidden until found */
export function DisclosurePanel({ children, ...props }: DisclosurePanelProps) {
	const slots = panel({ size: useContext(SizeContext) });
	return (
		<AriaDisclosurePanel {...props} className={composeClassName(props.className, slots.base())}>
			<div className={slots.content()}>{children}</div>
		</AriaDisclosurePanel>
	);
}
