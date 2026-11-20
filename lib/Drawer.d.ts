import { type DialogProps, type SheetOverlayProps } from 'react-aria-components';
export { SheetTrigger as DrawerTrigger } from 'react-aria-components';
export interface DrawerProps extends Omit<SheetOverlayProps, 'children'> {
    /** Names the drawer for screen readers, when there’s no DialogHeading inside */
    'aria-label'?: string;
    children?: DialogProps['children'];
}
/** A panel that slides in from an edge of the screen and swipes back out, opened by the Button beside it in a DrawerTrigger */
export declare function Drawer({ children, 'aria-label': label, ...props }: DrawerProps): import("react").JSX.Element;
