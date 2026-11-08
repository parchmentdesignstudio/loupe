import { Icon } from '@parchment/icons/react'
import type { ReactNode } from 'react'
import {
  Button,
  Select as RACSelect,
  type SelectProps as RACSelectProps,
  SelectValue,
  type ListBoxItemProps,
  type ValidationResult,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Description, FieldError, Label, fieldBorder, fieldLayout } from './Field.js'
import { ListBox, ListBoxItem } from './ListBox.js'
import { Popover } from './Popover.js'
import { composeTailwindRenderProps, focusRing } from './utils.js'

export interface SelectProps<T extends object> extends Omit<RACSelectProps<T>, 'children'> {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: string | ((validation: ValidationResult) => string)
  items?: Iterable<T>
  children: ReactNode | ((item: T) => ReactNode)
}

const trigger = tv({
  extend: [focusRing, fieldBorder],
  base: 'flex h-10 w-full min-w-40 items-center gap-2 rounded-md bg-raised pl-3 pr-2.5 text-left text-sm text-ink cursor-default [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: { true: 'text-disabled' },
  },
})

export function Select<T extends object>({ label, description, errorMessage, items, children, ...props }: SelectProps<T>) {
  return (
    <RACSelect {...props} className={composeTailwindRenderProps(props.className, fieldLayout)}>
      {({ isInvalid }) => (
        <>
          {label && <Label>{label}</Label>}
          <Button className={(renderProps) => trigger({ ...renderProps, isInvalid })}>
            <SelectValue className="flex-1 truncate data-[placeholder]:text-muted">
              {({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? defaultChildren : selectedText)}
            </SelectValue>
            <Icon name="chevron-down" aria-hidden className="size-4 text-muted group-data-[disabled]:text-disabled" />
          </Button>
          {description && <Description>{description}</Description>}
          <FieldError>{errorMessage}</FieldError>
          <Popover className="min-w-(--trigger-width)">
            <ListBox items={items} className="max-h-[inherit] overflow-auto">
              {children}
            </ListBox>
          </Popover>
        </>
      )}
    </RACSelect>
  )
}

export function SelectItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />
}
