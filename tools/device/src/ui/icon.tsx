import { resolveIcon, type IconName } from '@parchment/icons'
import { Icon as LoupeIcon } from '@parchment/icons/react'
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  BringToFront,
  Hand,
  Image,
  Plus,
  SendToBack,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

// Lucide stands in for icons Loupe doesn’t have yet, under the names Loupe
// would give them, so each switches over once it’s drawn there
const fallbacks = {
  'hand-raised': Hand,
  plus: Plus,
  trash: Trash2,
  photo: Image,
  'align-horizontal-left': AlignStartVertical,
  'align-horizontal-center': AlignCenterVertical,
  'align-horizontal-right': AlignEndVertical,
  'align-vertical-top': AlignStartHorizontal,
  'align-vertical-center': AlignCenterHorizontal,
  'align-vertical-bottom': AlignEndHorizontal,
  'distribute-horizontal-center': AlignHorizontalDistributeCenter,
  'distribute-vertical-center': AlignVerticalDistributeCenter,
  'square-3-layers-3d-top-filled': BringToFront,
  'square-3-layers-3d-bottom-filled': SendToBack,
} satisfies Record<string, LucideIcon>

export type Name = IconName | keyof typeof fallbacks

interface Props {
  name: Name
  /** Without one, it’s hidden from screen readers */
  label?: string
  className?: string
}

export function Icon({ name, label, className }: Props) {
  if (resolveIcon(name as IconName, { variant: 'solid', size: 16 })) {
    return <LoupeIcon name={name as IconName} label={label} className={className} />
  }
  const Fallback = fallbacks[name as keyof typeof fallbacks]
  return (
    <Fallback
      size={16}
      strokeWidth={1.5}
      absoluteStrokeWidth
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  )
}
