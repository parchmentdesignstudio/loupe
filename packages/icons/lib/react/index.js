import { createElement, forwardRef } from 'react'
import { resolveIcon, iconAttributes } from '../index.js'

export const Icon = forwardRef(function Icon({ name, variant = 'solid', size = 16, label, ...rest }, ref) {
  const icon = resolveIcon(name, { variant, size })
  if (!icon) throw new Error(`No ${variant} icon called ${name} drawn at ${size}px`)
  return createElement('svg', {
    ...iconAttributes({ size, label }),
    viewBox: icon.viewBox,
    ref,
    ...rest,
    dangerouslySetInnerHTML: { __html: icon.body },
  })
})

export default Icon
