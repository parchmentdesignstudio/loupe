import { Icon } from '@parchment/icons/react'
import {
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  type MenuItemProps,
  type MenuProps as RACMenuProps,
  MenuSection as RACMenuSection,
  type MenuSectionProps as RACMenuSectionProps,
  Collection,
  Separator,
  type SeparatorProps,
  composeRenderProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { ListBoxHeader, item } from './ListBox.js'
import { Popover, type PopoverProps } from './Popover.js'

export { MenuTrigger, SubmenuTrigger } from 'react-aria-components'

export interface MenuProps<T> extends RACMenuProps<T> {
  placement?: PopoverProps['placement']
}

export function Menu<T extends object>({ placement, ...props }: MenuProps<T>) {
  return (
    <Popover placement={placement} className="min-w-48">
      <RACMenu {...props} className="max-h-[inherit] overflow-auto p-1 outline-0" />
    </Popover>
  )
}

const menuItem = tv({
  extend: item,
  variants: {
    variant: {
      default: '',
      critical: 'text-critical',
    },
  },
})

export function MenuItem({ variant, ...props }: MenuItemProps & { variant?: 'default' | 'critical' }) {
  const textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined)
  return (
    <RACMenuItem {...props} textValue={textValue} className={composeRenderProps(props.className, (className, renderProps) => menuItem({ ...renderProps, variant, className }))}>
      {composeRenderProps(props.children, (children, { selectionMode, isSelected, hasSubmenu }) => (
        <>
          {selectionMode !== 'none' && (
            <span className="flex size-4 items-center justify-center text-accent">
              {isSelected && <Icon name="checkmark" className="size-4" />}
            </span>
          )}
          <span className="flex flex-1 items-center gap-2 truncate">{children}</span>
          {hasSubmenu && <Icon name="chevron-right" aria-hidden className="size-4 text-muted" />}
        </>
      ))}
    </RACMenuItem>
  )
}

export interface MenuSectionProps<T> extends RACMenuSectionProps<T> {
  title?: string
  items?: Iterable<T>
}

export function MenuSection<T extends object>({ title, items, children, ...props }: MenuSectionProps<T>) {
  return (
    <RACMenuSection {...props} className="not-first:mt-1 not-first:border-t not-first:border-line not-first:pt-1">
      {title && <ListBoxHeader>{title}</ListBoxHeader>}
      <Collection items={items}>{children}</Collection>
    </RACMenuSection>
  )
}

export function MenuSeparator(props: SeparatorProps) {
  return <Separator {...props} className="mx-3 my-1 border-b border-line" />
}
