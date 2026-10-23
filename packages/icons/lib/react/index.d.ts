import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
import type { IconName, IconVariant } from '../index.js'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: IconName
  variant?: IconVariant
  size?: number
  label?: string
}

export declare const Icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
export default Icon
