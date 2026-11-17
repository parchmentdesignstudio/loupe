import { createElement, forwardRef, useId, useMemo } from 'react'
import { resolveIcon, iconAttributes } from '../index.js'
import { resolveMotionIcon } from '../motion.js'

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

// An icon that moves, at rest. Play it with playMotion from @parchment/icons/motion, or mark what holds it with
// data-motion-trigger and call playMotionOnHover once
export const MotionIcon = forwardRef(function MotionIcon({ name, label, ...rest }, ref) {
  const id = useId()
  const icon = useMemo(() => resolveMotionIcon(name, { id }), [name, id])
  return createElement('svg', {
    ...iconAttributes({ label }),
    viewBox: icon.viewBox,
    'data-motion': name,
    ref,
    ...rest,
    dangerouslySetInnerHTML: { __html: icon.body },
  })
})

export default Icon
