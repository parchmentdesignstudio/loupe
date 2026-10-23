import type { IconName } from '../data.js'

export type { IconName, LineIconName, SolidIconName } from '../data.js'
export type IconVariant = 'line' | 'solid'
export type IconSize = number

export interface IconOptions {
  variant?: IconVariant
  /** Rendered size in px. The closest drawn grid (16 or 24) is used. */
  size?: IconSize
  /** Gives the icon role="img" and this label. Without it the icon is hidden from screen readers. */
  label?: string
}

export interface ResolvedIcon {
  name: IconName
  variant: IconVariant
  drawn: 16 | 24
  viewBox: string
  body: string
}

export declare const variants: IconVariant[]
export declare const sizes: Array<16 | 24>
export declare function resolveIcon(name: IconName, options?: Omit<IconOptions, 'label'>): ResolvedIcon | null
export declare function iconAttributes(options?: Omit<IconOptions, 'variant'>): Record<string, string | number>
export declare function toSvg(name: IconName, options?: IconOptions & { class?: string }): string
export declare function iconNames(filter?: { variant?: IconVariant; size?: 16 | 24 }): IconName[]
