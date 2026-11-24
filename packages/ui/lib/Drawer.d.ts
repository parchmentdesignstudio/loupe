import { type DialogProps, type SheetOverlayProps } from 'react-aria-components';
export { SheetTrigger as DrawerTrigger } from 'react-aria-components';
/**
 * Changes an open pushing drawer's width, as change sets --drawer-push-width, in time with how it opens: the page
 * rewraps once, what follows glides to its new place, and the panel grows or shrinks from its inner edge over the same
 * 350ms. For the preview's own drawers, such as a chat that widens for a larger view, so it's not in the index
 */
export declare function resizePushDrawer(within: HTMLElement, change: () => void): void;
declare const breakpoints: {
    readonly md: '48rem';
    readonly lg: '64rem';
    readonly xl: '80rem';
};
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
export declare function Drawer({ mode, pushFrom, reflow, ...props }: DrawerProps): import("react").JSX.Element;
