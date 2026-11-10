import { useCallback } from 'react'
import { outputs } from './outputs'
import { renderOutput } from './render.js'
import type { Art, Output } from './types'

// Each output is drawn once, off screen, then copied onto every canvas showing it
const drawn = new Map<string, HTMLCanvasElement>()
const views = new Map<string, Set<HTMLCanvasElement>>()
let version = 0

function paint(view: HTMLCanvasElement, canvas: HTMLCanvasElement) {
  const context = view.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, view.width, view.height)
  context.drawImage(canvas, 0, 0)
}

/** Draws every output, giving up if a newer draw starts */
export async function draw(art: Art) {
  const current = ++version
  for (const output of outputs) {
    const canvas = await renderOutput(output, art)
    if (current !== version) return
    drawn.set(output.id, canvas)
    for (const view of views.get(output.id) ?? []) paint(view, canvas)
  }
}

export async function drawing(output: Output, art: Art): Promise<HTMLCanvasElement> {
  return drawn.get(output.id) ?? renderOutput(output, art)
}

/** A ref for a canvas that shows an output, repainted each time it’s drawn */
export function useFrame(id: string) {
  return useCallback(
    (view: HTMLCanvasElement | null) => {
      if (!view) return
      const set = views.get(id) ?? new Set()
      views.set(id, set)
      set.add(view)
      const canvas = drawn.get(id)
      if (canvas) paint(view, canvas)
      return () => {
        set.delete(view)
      }
    },
    [id],
  )
}
