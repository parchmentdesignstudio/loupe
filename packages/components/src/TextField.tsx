import type { ReactNode } from 'react'
import {
  Input as RACInput,
  TextArea as RACTextArea,
  TextField as RACTextField,
  type TextFieldProps as RACTextFieldProps,
  type ValidationResult,
} from 'react-aria-components'
import { Description, FieldError, Label, fieldLayout, textInput } from './Field.js'
import { composeTailwindRenderProps } from './utils.js'

export interface TextFieldProps extends RACTextFieldProps {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: string | ((validation: ValidationResult) => string)
  placeholder?: string
  /** Grows to a multi-line text area. */
  multiline?: boolean
  rows?: number
}

export function TextField({ label, description, errorMessage, placeholder, multiline, rows = 4, ...props }: TextFieldProps) {
  return (
    <RACTextField {...props} className={composeTailwindRenderProps(props.className, fieldLayout)}>
      {label && <Label>{label}</Label>}
      {multiline ? (
        <RACTextArea placeholder={placeholder} rows={rows} className={(renderProps) => textInput({ ...renderProps, className: 'resize-y leading-relaxed' })} />
      ) : (
        <RACInput placeholder={placeholder} className={(renderProps) => textInput(renderProps)} />
      )}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </RACTextField>
  )
}
