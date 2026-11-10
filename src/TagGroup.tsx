import type { ReactNode } from 'react';
import {
	Button,
	Tag as AriaTag,
	TagGroup as AriaTagGroup,
	type TagGroupProps as AriaTagGroupProps,
	TagList,
	type TagListProps,
	type TagProps,
	Text,
	composeRenderProps,
} from 'react-aria-components';
import { Description, type FieldTextProps, Label, field } from './Field.js';
import { Cross } from './glyphs.js';
import { focusRing, tv } from './tv.js';

export type { TagProps };

const group = tv({ base: 'flex flex-col gap-1.5' });

export interface TagGroupProps<T extends object> extends Omit<AriaTagGroupProps, 'children'>, Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'>, Omit<FieldTextProps, 'errorMessage'> {
	/** Shown under the tags, as a tag group isn't validated like a field */
	errorMessage?: ReactNode;
}

/** Tags under one label. selectionMode lets them be chosen, and onRemove gives each a remove button */
export function TagGroup<T extends object>({ label, description, errorMessage, items, children, renderEmptyState, ...props }: TagGroupProps<T>) {
	return (
		<AriaTagGroup {...props} className={group({ className: props.className })}>
			{label && <Label>{label}</Label>}
			<TagList items={items} renderEmptyState={renderEmptyState && ((state) => <span className="text-label text-muted">{renderEmptyState(state)}</span>)} className="flex flex-wrap gap-1.5 outline-0">
				{children}
			</TagList>
			{description && <Description>{description}</Description>}
			{errorMessage && (
				<Text slot="errorMessage" className={field().error()}>
					{errorMessage}
				</Text>
			)}
		</AriaTagGroup>
	);
}

export const tag = tv({
	extend: focusRing,
	base: 'inline-flex max-w-full cursor-default items-center gap-1 rounded-lg bg-bleed/8 px-2 py-1 text-label leading-4 text-ink transition-colors duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none',
	variants: {
		// Only a tag that can be chosen or acted on takes the hover
		isHovered: {
			true: 'bg-bleed/12',
		},
		isSelected: {
			true: 'bg-ink text-paper',
		},
		isDisabled: {
			true: 'opacity-40',
		},
		allowsRemoving: {
			true: 'pr-1',
		},
	},
	compoundVariants: [{ isSelected: true, isHovered: true, class: 'bg-ink/88' }],
});

// Tinted from the tag's own colour, so it suits a chosen tag as well
const remove = 'flex shrink-0 cursor-default items-center justify-center rounded-full p-0.5 outline-0 data-[hovered]:bg-current/12 data-[pressed]:bg-current/24';

/** A tag with its text as children. In a group with onRemove, it ends with a button to remove it */
export function Tag(props: TagProps) {
	const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
	return (
		<AriaTag {...props} textValue={textValue} className={composeRenderProps(props.className, (className, state) => tag({ ...state, className }))}>
			{composeRenderProps(props.children, (children, { allowsRemoving }) => (
				<>
					{children}
					{allowsRemoving && (
						<Button slot="remove" className={remove}>
							<Cross className="size-3 shrink-0 fill-none stroke-current stroke-2" />
						</Button>
					)}
				</>
			))}
		</AriaTag>
	);
}
