import { createContext, useContext } from 'react';
import {
	SelectionIndicator,
	Tab as AriaTab,
	TabList as AriaTabList,
	type TabListProps,
	TabPanel as AriaTabPanel,
	type TabPanelProps,
	type TabProps,
	Tabs as AriaTabs,
	type TabsProps,
	composeRenderProps,
} from 'react-aria-components';
import { focusRing, tv } from './tv.js';

export type { TabListProps, TabPanelProps, TabProps, TabsProps };

type Orientation = 'horizontal' | 'vertical';

// Tabs hands its orientation to each tab and panel, so a column of tabs has its bar on the side
const OrientationContext = createContext<Orientation>('horizontal');

const tabs = tv({
	base: 'flex',
	variants: {
		orientation: {
			horizontal: 'flex-col gap-5',
			vertical: 'items-start gap-8',
		},
	},
});

const tabList = tv({
	base: 'flex border-bleed/8',
	variants: {
		orientation: {
			horizontal: 'gap-6 border-b',
			vertical: 'shrink-0 flex-col border-s',
		},
	},
});

const tab = tv({
	extend: focusRing,
	base: 'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 text-control font-medium whitespace-nowrap text-muted transition-colors duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none',
	variants: {
		// 32px tall, as a button is
		orientation: {
			horizontal: '',
			vertical: 'ps-4',
		},
		isSelected: {
			true: 'text-ink',
		},
		isHovered: {
			true: 'text-ink',
		},
		isDisabled: {
			true: 'opacity-40',
		},
	},
});

// React Aria moves the bar to the chosen tab by its translate and size, so those are what transition. It covers the
// list's line, half on it and half inside
const indicator = tv({
	base: 'absolute rounded-full bg-ink transition-[translate,width,height] duration-250 ease-in-out motion-reduce:transition-none',
	variants: {
		orientation: {
			horizontal: '-bottom-px start-0 h-0.5 w-full',
			vertical: '-start-px top-0 h-full w-0.5',
		},
	},
});

// Beside a column of tabs, a panel's first line of text sits level with the first tab's
const tabPanel = tv({
	extend: focusRing,
	base: 'rounded-lg',
	variants: {
		orientation: {
			horizontal: '',
			vertical: 'min-w-0 flex-1 pt-1.5',
		},
	},
});

/** Panels of content, one shown at a time, chosen from a TabList. orientation="vertical" puts the tabs in a column beside them */
export function Tabs(props: TabsProps) {
	return (
		<OrientationContext.Provider value={props.orientation ?? 'horizontal'}>
			<AriaTabs {...props} className={composeRenderProps(props.className, (className, state) => tabs({ ...state, className }))} />
		</OrientationContext.Provider>
	);
}

/** The tabs, with a bar under the chosen one that slides to the next. Give it an aria-label */
export function TabList<T extends object>(props: TabListProps<T>) {
	return <AriaTabList {...props} className={composeRenderProps(props.className, (className, state) => tabList({ ...state, className }))} />;
}

/** One tab, with an id its TabPanel shares. With an href, it's a link to the page it shows */
export function Tab(props: TabProps) {
	const orientation = useContext(OrientationContext);
	return (
		<AriaTab {...props} className={composeRenderProps(props.className, (className, state) => tab({ ...state, orientation, className }))}>
			{composeRenderProps(props.children, (children) => (
				<>
					{children}
					<SelectionIndicator className={indicator({ orientation })} />
				</>
			))}
		</AriaTab>
	);
}

/** What a tab shows while it's chosen, with the same id as its Tab */
export function TabPanel(props: TabPanelProps) {
	const orientation = useContext(OrientationContext);
	return <AriaTabPanel {...props} className={composeRenderProps(props.className, (className, state) => tabPanel({ ...state, orientation, className }))} />;
}
