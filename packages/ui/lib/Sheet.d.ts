import { type DialogProps, type SheetOverlayProps } from 'react-aria-components';
export { SheetTrigger } from 'react-aria-components';
export interface SheetProps extends Omit<SheetOverlayProps, 'children'> {
    /** Names the sheet for screen readers, when there’s no DialogHeading inside */
    'aria-label'?: string;
    children?: DialogProps['children'];
}
/** A panel that slides in from an edge of the screen and swipes back out, opened by the Button beside it in a SheetTrigger */
export declare function Sheet({ children, 'aria-label': label, ...props }: SheetProps): import("react").JSX.Element;
