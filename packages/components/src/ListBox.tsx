import { Icon } from '@parchment/icons/react'
import {
  Header,
  ListBox as RACListBox,
  ListBoxItem as RACListBoxItem,
  type ListBoxItemProps,
  type ListBoxProps,
  ListBoxSection,
  type SectionProps,
  Collection,
  composeRenderProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps } from './utils.js'

export function ListBox<T extends object>({ children, ...props }: ListBoxProps<T>) {
  return (
    <RACListBox {...props} className={composeTailwindRenderProps(props.className, 'outline-0 p-1')}>
      {children}
    </RACListBox>
  )
}

// An option in a select, combo box or menu.
export const item = tv({
  base: 'group flex items-center gap-3 rounded-md py-2 pl-3 pr-2 text-sm text-ink outline-0 cursor-default select-none forced-color-adjust-none',
  variants: {
    isDisabled: { true: 'text-disabled' },
    isFocused: { true: 'bg-highlight' },
    isPressed: { true: 'bg-highlight' },
  },
})

export function ListBoxItem(props: ListBoxItemProps) {
  const textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined)
  return (
    <RACListBoxItem {...props} textValue={textValue} className={composeRenderProps(props.className, (className, renderProps) => item({ ...renderProps, className }))}>
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          <span className="flex flex-1 items-center gap-2 truncate group-data-[selected]:font-medium">{children}</span>
          <span className="flex size-4 items-center justify-center text-accent">
            {isSelected && <Icon name="checkmark" className="size-4" />}
          </span>
        </>
      ))}
    </RACListBoxItem>
  )
}

export interface ListBoxSectionProps<T> extends SectionProps<T> {
  title?: string
  items?: Iterable<T>
}

export function ListBoxHeader({ children }: { children: React.ReactNode }) {
  return <Header className="px-3 pt-2 pb-1 text-xs font-medium text-muted">{children}</Header>
}

export function Section<T extends object>({ title, items, children, ...props }: ListBoxSectionProps<T>) {
  return (
    <ListBoxSection {...props} className="not-first:mt-1 not-first:border-t not-first:border-line not-first:pt-1">
      {title && <ListBoxHeader>{title}</ListBoxHeader>}
      <Collection items={items}>{children}</Collection>
    </ListBoxSection>
  )
}
