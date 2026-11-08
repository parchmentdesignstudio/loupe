import { Icon } from '@parchment/icons/react'
import type { ReactNode } from 'react'
import {
  Checkbox as RACCheckbox,
  CheckboxGroup as RACCheckboxGroup,
  type CheckboxGroupProps as RACCheckboxGroupProps,
  type CheckboxProps,
  type ValidationResult,
  composeRenderProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Description, FieldError, Label } from './Field.js'
import { composeTailwindRenderProps, focusRing } from './utils.js'

export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, 'children'> {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: string | ((validation: ValidationResult) => string)
  children?: ReactNode
}

export function CheckboxGroup({ label, description, errorMessage, children, ...props }: CheckboxGroupProps) {
  return (
    <RACCheckboxGroup {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col gap-2')}>
      {label && <Label>{label}</Label>}
      <div className="flex flex-col gap-1">{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACCheckboxGroup>
  )
}

const checkbox = tv({
  base: 'group flex items-center gap-2.5 py-1 text-sm text-ink cursor-default [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: { true: 'text-disabled' },
  },
})

const box = tv({
  extend: focusRing,
  base: 'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
  variants: {
    isSelected: {
      false: 'border-line-strong bg-raised',
      true: 'border-transparent bg-accent text-on-accent',
    },
    isHovered: { true: '' },
    isPressed: { true: 'scale-95' },
    isInvalid: { true: '' },
    isDisabled: { true: 'border-line bg-surface text-disabled' },
  },
  compoundVariants: [
    { isSelected: false, isHovered: true, isDisabled: false, class: 'border-ink' },
    { isSelected: true, isHovered: true, isDisabled: false, class: 'bg-accent-hover' },
    { isInvalid: true, isSelected: false, class: 'border-critical' },
    { isInvalid: true, isSelected: true, class: 'bg-critical text-on-critical' },
  ],
})

export function Checkbox(props: CheckboxProps) {
  return (
    <RACCheckbox {...props} className={composeRenderProps(props.className, (className, renderProps) => checkbox({ ...renderProps, className }))}>
      {composeRenderProps(props.children, (children, { isSelected, isIndeterminate, ...renderProps }) => (
        <>
          <span className={box({ isSelected: isSelected || isIndeterminate, ...renderProps })}>
            {isIndeterminate ? (
              <Icon name="minus" className="size-3.5" />
            ) : isSelected ? (
              <Icon name="checkmark" className="size-3.5" />
            ) : null}
          </span>
          {children}
        </>
      ))}
    </RACCheckbox>
  )
}
