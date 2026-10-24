import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
import type { LogoName } from '../index.js'

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: LogoName
  size?: number
  label?: string
}

export declare const Logo: ForwardRefExoticComponent<LogoProps & RefAttributes<SVGSVGElement>>
export default Logo
