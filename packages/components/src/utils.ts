import { composeRenderProps } from 'react-aria-components'
import { cn, tv } from 'tailwind-variants'

// The focus ring every interactive part shares. Keyed off React Aria's
// isFocusVisible, so it shows for keyboard focus only.
export const focusRing = tv({
  base: 'outline outline-offset-2 outline-accent',
  variants: {
    isFocusVisible: {
      false: 'outline-0',
      true: 'outline-2',
    },
  },
})

// Merge a component's own classes with a className prop, which React Aria
// lets be a string or a function of render props.
export function composeTailwindRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tw: string,
): string | ((v: T) => string) {
  return composeRenderProps(className, (className) => cn(tw, className) ?? '')
}
