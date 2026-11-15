export type MotionIconName =
  | 'airplane-side'
  | 'airplane-side-belly'
  | 'car-side'
  | 'bus-side'
  | 'train-side-front-car'
  | 'ferry-side-front'
  | 'ferry-side'
  | 'sailboat'

export interface ResolvedMotionIcon {
  name: MotionIconName
  viewBox: string
  body: string
}

export declare const motionNames: MotionIconName[]
export declare function resolveMotionIcon(name: MotionIconName, options?: { id?: string }): ResolvedMotionIcon
export declare function toMotionSvg(name: MotionIconName, options?: { label?: string; class?: string; id?: string }): string
export declare function playMotion(svg: SVGSVGElement | null | undefined): Animation[]
export declare function playMotionOnHover(root?: Document | Element): () => void
