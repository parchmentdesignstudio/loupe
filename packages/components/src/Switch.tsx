import type { ReactNode } from 'react'
import { Switch as RACSwitch, type SwitchProps as RACSwitchProps, composeRenderProps } from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps, focusRing } from './utils.js'

export interface SwitchProps extends Omit<RACSwitchProps, 'children'> {
  children?: ReactNode
}

const track = tv({
  extend: focusRing,
  base: 'flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors',
  variants: {
    isSelected: {
      false: 'bg-line-strong',
      true: 'bg-accent',
    },
    isHovered: { true: '' },
    isDisabled: { true: 'bg-line' },
  },
  compoundVariants: [
    { isSelected: true, isHovered: true, isDisabled: false, class: 'bg-accent-hover' },
    { isSelected: false, isHovered: true, isDisabled: false, class: 'bg-muted' },
  ],
})

const handle = tv({
  base: 'size-4 rounded-full bg-raised shadow-sm transition-transform duration-200',
  variants: {
    isSelected: { true: 'translate-x-4' },
    isPressed: { true: 'scale-90' },
    isDisabled: { true: 'bg-surface' },
  },
})

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <RACSwitch
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'group flex items-center gap-2.5 py-1 text-sm text-ink cursor-default disabled:text-disabled [-webkit-tap-highlight-color:transparent]',
      )}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          <span className={track(renderProps)}>
            <span className={handle(renderProps)} />
          </span>
          {children}
        </>
      ))}
    </RACSwitch>
  )
}
