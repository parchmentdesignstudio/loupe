import type { ReactNode } from 'react';
import { Collection, Header, ListBox as AriaListBox, ListBoxItem as AriaListBoxItem, type ListBoxItemProps, type ListBoxProps, ListBoxSection as AriaListBoxSection, type SectionProps, composeRenderProps } from 'react-aria-components';
import { Check } from './glyphs.js';
import { composeClassName, tv } from './tv.js';

/** A list of options, as in a select or combo box */
export function ListBox<T extends object>(props: ListBoxProps<T>) {
	return <AriaListBox {...props} className={composeClassName(props.className, 'max-h-[inherit] overflow-auto p-1.5 outline-0')} />;
}

// One option in a list or menu. Keyboard and pointer both move the highlight, so focus shows as a fill
export const option = tv({
	base: 'group flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-body text-ink outline-0 select-none forced-color-adjust-none',
	variants: {
		isFocused: {
			true: 'bg-ink/6 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
		},
		isPressed: {
			true: 'bg-ink/10',
		},
		isDisabled: {
			true: 'opacity-40',
		},
	},
});

/** An option with its text as children. It's ticked when selected */
export function ListBoxItem(props: ListBoxItemProps) {
	const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
	return (
		<AriaListBoxItem {...props} textValue={textValue} className={composeRenderProps(props.className, (className, state) => option({ ...state, className }))}>
			{composeRenderProps(props.children, (children, { isSelected }) => (
				<>
					<span className="flex min-w-0 flex-1 items-center gap-2 truncate group-data-[selected]:font-medium">{children}</span>
					{isSelected && <Check />}
				</>
			))}
		</AriaListBoxItem>
	);
}

/** A heading within a list or menu */
export function SectionHeader({ children }: { children: ReactNode }) {
	return <Header className="px-3 pt-2 pb-1 font-mono text-label text-muted">{children}</Header>;
}

export interface ListBoxSectionProps<T> extends SectionProps<T> {
	title?: string;
}

/** Options grouped under a heading */
export function ListBoxSection<T extends object>({ title, items, children, ...props }: ListBoxSectionProps<T>) {
	return (
		<AriaListBoxSection {...props} className="not-first:mt-1.5 not-first:border-t not-first:border-ink/8 not-first:pt-1.5">
			{title && <SectionHeader>{title}</SectionHeader>}
			<Collection items={items}>{children}</Collection>
		</AriaListBoxSection>
	);
}
