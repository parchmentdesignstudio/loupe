import type { IconName } from '../data.js'

export type { IconName, LineIconName, SolidIconName } from '../data.js'
export type IconVariant = 'line' | 'solid'
export type IconSize = 16 | 24

export interface IconOptions {
  variant?: IconVariant
  /** The drawn size, which is also the rendered size. Default: 16 */
  size?: IconSize
  /** Gives the icon role="img" and this label. Without it the icon is hidden from screen readers. */
  label?: string
}

export interface ResolvedIcon {
  name: IconName
  variant: IconVariant
  size: IconSize
  viewBox: string
  body: string
}

export declare const variants: IconVariant[]
export declare const sizes: IconSize[]
export declare function resolveIcon(name: IconName, options?: Omit<IconOptions, 'label'>): ResolvedIcon | null
export declare function iconAttributes(options?: Omit<IconOptions, 'variant'>): Record<string, string | number>
export declare function toSvg(name: IconName, options?: IconOptions & { class?: string }): string
export declare function iconNames(filter?: { variant?: IconVariant; size?: IconSize }): IconName[]
