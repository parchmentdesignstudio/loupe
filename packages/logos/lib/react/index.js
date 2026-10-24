import { createElement, forwardRef } from 'react'
import { resolveLogo, logoAttributes } from '../index.js'

export const Logo = forwardRef(function Logo({ name, size = 16, label, ...rest }, ref) {
  const logo = resolveLogo(name, { size })
  if (!logo) throw new Error(`No logo called ${name} at ${size}px`)
  return createElement('svg', {
    ...logoAttributes(logo, { label }),
    ref,
    ...rest,
    dangerouslySetInnerHTML: { __html: logo.body },
  })
})

export default Logo
