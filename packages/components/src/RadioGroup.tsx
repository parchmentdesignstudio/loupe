import type { ReactNode } from 'react'
import {
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  type RadioGroupProps as RACRadioGroupProps,
  type RadioProps,
  type ValidationResult,
  composeRenderProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Description, FieldError, Label } from './Field.js'
import { composeTailwindRenderProps, focusRing } from './utils.js'

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: string | ((validation: ValidationResult) => string)
  children?: ReactNode
}

export function RadioGroup({ label, description, errorMessage, children, ...props }: RadioGroupProps) {
  return (
    <RACRadioGroup {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-2')}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-x-5 gap-y-1 group-data-[orientation=vertical]:flex-col">{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACRadioGroup>
  )
}

const dot = tv({
  extend: focusRing,
  base: 'size-[18px] shrink-0 rounded-full border bg-raised transition-all',
  variants: {
    isSelected: {
      false: 'border-line-strong',
      true: 'border-[5px] border-accent',
    },
    isHovered: { true: '' },
    isPressed: { true: 'scale-95' },
    isInvalid: { true: 'border-critical' },
    isDisabled: { true: 'border-line bg-surface' },
  },
  compoundVariants: [
    { isSelected: false, isHovered: true, isDisabled: false, class: 'border-ink' },
    { isSelected: true, isHovered: true, isDisabled: false, class: 'border-accent-hover' },
    { isSelected: true, isDisabled: true, class: 'border-disabled' },
  ],
})

export function Radio(props: RadioProps) {
  return (
    <RACRadio
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'group flex items-center gap-2.5 py-1 text-sm text-ink cursor-default disabled:text-disabled [-webkit-tap-highlight-color:transparent]',
      )}
    >
      {composeRenderProps(props.children, (children, renderProps) => (
        <>
          <span className={dot(renderProps)} />
          {children}
        </>
      ))}
    </RACRadio>
  )
}
