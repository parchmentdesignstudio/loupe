import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
import type { IconName, IconSize, IconVariant } from '../index.js'
import type { MotionIconName } from '../motion.js'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: IconName
  variant?: IconVariant
  size?: IconSize
  label?: string
}

export declare const Icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
export interface MotionIconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: MotionIconName
  label?: string
}

export declare const MotionIcon: ForwardRefExoticComponent<MotionIconProps & RefAttributes<SVGSVGElement>>
export default Icon
