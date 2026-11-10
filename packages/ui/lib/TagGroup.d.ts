import type { ReactNode } from 'react';
import { type TagGroupProps as AriaTagGroupProps, type TagListProps, type TagProps } from 'react-aria-components';
import { type FieldTextProps } from './Field.js';
export type { TagProps };
export interface TagGroupProps<T extends object> extends Omit<AriaTagGroupProps, 'children'>, Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'>, Omit<FieldTextProps, 'errorMessage'> {
    /** Shown under the tags, as a tag group isn't validated like a field */
    errorMessage?: ReactNode;
}
/** Tags under one label. selectionMode lets them be chosen, and onRemove gives each a remove button */
export declare function TagGroup<T extends object>({ label, description, errorMessage, items, children, renderEmptyState, ...props }: TagGroupProps<T>): import("react").JSX.Element;
export declare const tag: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isSelected: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
    allowsRemoving: {
        true: string;
    };
}, undefined, "inline-flex max-w-full cursor-default items-center gap-1 rounded-lg bg-bleed/8 px-2 py-1 text-label leading-4 text-ink transition-colors duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight]", undefined, undefined, undefined>>;
/** A tag with its text as children. In a group with onRemove, it ends with a button to remove it */
export declare function Tag(props: TagProps): import("react").JSX.Element;
