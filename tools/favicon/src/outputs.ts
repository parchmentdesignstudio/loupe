import { iosLayers, settingsFor, sourceFor } from './render.js'
import { GROUPS, OUTPUTS } from './specs.js'
import type { Art, Layer, Output, Source } from './types'

export const outputs: Output[] = OUTPUTS

export const groups = Object.entries(GROUPS).map(([id, title]) => ({ id, title, outputs: outputs.filter((output) => output.group === id) }))

export function layers(art: Art): Layer[] {
  return iosLayers(art)
}

/** The sizes a piece of artwork is drawn for */
export function usesOf(source: Source, art: Art): number[] {
  const sizes = new Set<number>()
  for (const output of outputs) {
    if (output.kind === 'ios' || output.kind === 'og') continue
    if (sourceFor(output, art) === source) sizes.add(Math.min(output.w, output.h))
  }
  return [...sizes].toSorted((a, b) => a - b)
}

export function describeSource(output: Output, art: Art): string {
  if (output.kind === 'ios') {
    const count = layers(art).length
    return count ? `${count} layer${count > 1 ? 's' : ''}` : ''
  }
  const source: Source | null = sourceFor(output, art)
  return source ? source.name : ''
}

export function warningFor(output: Output, art: Art): string {
  if (output.kind === 'ios') return ''
  const source: Source | null = sourceFor(output, art)
  if (!source || source.type === 'svg') return ''
  const needed = Math.max(output.w, output.h) * (output.kind === 'og' && art.og.source === source ? 1 : 1 - 2 * settingsFor(output, art).pad)
  return source.size < needed ? `Scaled up from ${source.size}px` : ''
}

export function displayWidth(output: Output): number {
  if (output.kind === 'og') return 480
  if (output.w <= 64) return output.w
  return output.kind === 'ios' ? 200 : Math.min(output.w, 180)
}

export function fileNameFor(output: Output): string {
  if (output.id.startsWith('favicon')) return 'favicon.ico'
  return output.kind === 'ios' ? `AppIcon-${output.appearance}.png` : output.label
}
