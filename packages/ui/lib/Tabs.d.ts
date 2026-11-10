import { type TabListProps, type TabPanelProps, type TabProps, type TabsProps } from 'react-aria-components';
export type { TabListProps, TabPanelProps, TabProps, TabsProps };
/** Panels of content, one shown at a time, chosen from a TabList. orientation="vertical" puts the tabs in a column beside them */
export declare function Tabs(props: TabsProps): import("react").JSX.Element;
/** The tabs, with a bar under the chosen one that slides to the next. Give it an aria-label */
export declare function TabList<T extends object>(props: TabListProps<T>): import("react").JSX.Element;
/** One tab, with an id its TabPanel shares. With an href, it's a link to the page it shows */
export declare function Tab(props: TabProps): import("react").JSX.Element;
/** What a tab shows while it's chosen, with the same id as its Tab */
export declare function TabPanel(props: TabPanelProps): import("react").JSX.Element;
