import { Icon } from '@parchment/icons/react'
import type { ReactNode } from 'react'
import {
  Button,
  ComboBox as RACComboBox,
  type ComboBoxProps as RACComboBoxProps,
  type ListBoxItemProps,
  type ValidationResult,
} from 'react-aria-components'
import { Description, FieldError, FieldGroup, Input, Label, fieldLayout } from './Field.js'
import { ListBox, ListBoxItem } from './ListBox.js'
import { Popover } from './Popover.js'
import { composeTailwindRenderProps } from './utils.js'

export interface ComboBoxProps<T extends object> extends Omit<RACComboBoxProps<T>, 'children'> {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: string | ((validation: ValidationResult) => string)
  placeholder?: string
  children: ReactNode | ((item: T) => ReactNode)
}

export function ComboBox<T extends object>({ label, description, errorMessage, placeholder, children, items, ...props }: ComboBoxProps<T>) {
  return (
    <RACComboBox {...props} items={items} className={composeTailwindRenderProps(props.className, fieldLayout)}>
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-40">
        <Input placeholder={placeholder} />
        <Button className="mr-1 flex size-8 items-center justify-center rounded-sm text-muted outline-0 data-[hovered]:bg-surface data-[pressed]:bg-surface data-[disabled]:text-disabled">
          <Icon name="chevron-down" aria-hidden className="size-4" />
        </Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-(--trigger-width)">
        <ListBox className="max-h-[inherit] overflow-auto">{children}</ListBox>
      </Popover>
    </RACComboBox>
  )
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />
}
