// The shapes render.js and specs.js work with

export interface Output {
  id: string
  group: string
  label: string
  note?: string
  w: number
  h: number
  pad?: number
  bg?: boolean
  lockBg?: boolean
  mask?: string
  kind?: string
  appearance?: string
}

export interface Source {
  id: string
  name: string
  type: string
  width: number
  height: number
  size: number
  preview: HTMLImageElement
}

export interface Layer {
  id: string
  source: Source
  scale: number
  glass: boolean
}

export interface Override {
  pad?: number
  bg?: boolean
  source?: string
}

/** Everything the outputs are drawn from, in the shape render.js reads */
export interface Art {
  sources: Source[]
  og: { source: Source | null }
  ios: { layers: Layer[]; fill: string }
  background: string
  overrides: Record<string, Override>
}

export interface Site {
  name: string
  short: string
  url: string
  theme: string
}

export type Target = 'artwork' | 'og' | 'layers'
