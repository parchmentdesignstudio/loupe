import { type MenuItemProps, type MenuProps as RACMenuProps, type MenuSectionProps as RACMenuSectionProps, type SeparatorProps } from 'react-aria-components';
import { type PopoverProps } from './Popover.js';
export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
export interface MenuProps<T> extends RACMenuProps<T> {
    placement?: PopoverProps['placement'];
}
export declare function Menu<T extends object>({ placement, ...props }: MenuProps<T>): import("react").JSX.Element;
export declare function MenuItem({ variant, ...props }: MenuItemProps & {
    variant?: 'default' | 'critical';
}): import("react").JSX.Element;
export interface MenuSectionProps<T> extends RACMenuSectionProps<T> {
    title?: string;
    items?: Iterable<T>;
}
export declare function MenuSection<T extends object>({ title, items, children, ...props }: MenuSectionProps<T>): import("react").JSX.Element;
export declare function MenuSeparator(props: SeparatorProps): import("react").JSX.Element;
