import { type ReactNode } from 'react';
import { type GridListItemProps } from 'react-aria-components';
import { type GridListProps } from './GridList.js';
export interface FileListProps<T> extends Omit<GridListProps<T>, 'layout' | 'renderEmptyState'> {
}
/**
 * The files chosen or dropped, as rows under a DropZone: a site keeps the files, and their uploads, in its own state,
 * and adds to it from the zone’s onDrop and its FileTrigger’s onSelect. Each row is a FileListItem. With no files it
 * renders nothing, so it can sit under the zone from the start. Give it an aria-label, such as “Uploads”
 */
export declare function FileList<T extends object>({ items, children, ...props }: FileListProps<T>): import("react").JSX.Element | null;
export declare const fileListItem: import("tailwind-variants").TVReturnType<{
    status: {
        uploading: {};
        done: {};
        failed: {
            meta: string;
        };
    };
}, {
    base: string;
    thumbnail: string;
    image: string;
    body: string;
    name: string;
    meta: string;
    actions: string;
    done: string;
    error: string;
}, undefined, undefined, undefined, undefined>;
export interface FileListItemProps extends Omit<GridListItemProps, 'children' | 'textValue'> {
    /** The file itself, for its name, size and type, and a thumbnail if it’s an image. Without one, give its name */
    file?: File;
    /** Its name, if not the file’s own. A long one loses its middle, so the extension stays in sight */
    name?: string;
    /** Its size in bytes, if not the file’s own, shown in the locale’s units */
    size?: number;
    /** A picture of it, such as an uploaded image’s URL. An image file shows its own without one */
    thumbnail?: string;
    /** Uploading shows a progress bar, done a tick, and failed the errorMessage and, with onRetry, a button to try again.
     * Without one, it’s just listed */
    status?: 'uploading' | 'done' | 'failed';
    /** How far its upload is, from 0 to 100. Without it, an upload’s bar slides, as there’s no telling */
    progress?: number;
    /** Why it failed, in place of its size */
    errorMessage?: ReactNode;
    /** Gives it a button to remove it */
    onRemove?: () => void;
    /** Gives a failed file a button to try again */
    onRetry?: () => void;
}
/** A file in a FileList: its thumbnail or an icon, its name and size, how its upload is going, and buttons to retry or remove it */
export declare function FileListItem({ file, name, size, thumbnail, status, progress, errorMessage, onRemove, onRetry, ...props }: FileListItemProps): import("react").JSX.Element;
