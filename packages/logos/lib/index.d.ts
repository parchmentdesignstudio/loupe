import type { LogoName } from '../data.js'

export type { LogoName } from '../data.js'

export interface LogoOptions {
  /** The height in pixels. The width follows the logo’s proportions. Default: 16 */
  size?: number
  /** Gives the logo role="img" and this label. Without it the logo is hidden from screen readers. */
  label?: string
}

export interface ResolvedLogo {
  name: LogoName
  size: number
  width: number
  height: number
  viewBox: string
  body: string
  /** Whether it’s a version drawn for this size, rather than the company’s own logo scaled to it */
  drawn: boolean
}

export declare function resolveLogo(name: LogoName, options?: Omit<LogoOptions, 'label'>): ResolvedLogo | null
export declare function logoAttributes(logo: Pick<ResolvedLogo, 'width' | 'height' | 'viewBox'>, options?: Pick<LogoOptions, 'label'>): Record<string, string | number>
export declare function toSvg(name: LogoName, options?: LogoOptions & { class?: string }): string
export declare function logoNames(): LogoName[]
