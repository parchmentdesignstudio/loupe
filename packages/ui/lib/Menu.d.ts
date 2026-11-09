import { type MenuItemProps as AriaMenuItemProps, type MenuProps as AriaMenuProps, type MenuSectionProps } from 'react-aria-components';
import { type PopoverProps } from './Popover.js';
export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
export type { MenuSectionProps };
export interface MenuProps<T> extends AriaMenuProps<T> {
    placement?: PopoverProps['placement'];
}
/** A menu of actions, opened by the Button beside it in a MenuTrigger */
export declare function Menu<T extends object>({ placement, ...props }: MenuProps<T>): import("react").JSX.Element;
export interface MenuItemProps extends AriaMenuItemProps {
    /** danger for an action that destroys something */
    variant?: 'default' | 'danger';
}
export declare function MenuItem({ variant, ...props }: MenuItemProps): import("react").JSX.Element;
/** Menu items grouped under a Header, which goes first inside it */
export declare function MenuSection<T extends object>(props: MenuSectionProps<T>): import("react").JSX.Element;
export declare function MenuSeparator(): import("react").JSX.Element;
