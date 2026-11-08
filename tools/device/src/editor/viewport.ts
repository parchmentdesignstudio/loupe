import type { Point, Rect } from './geometry'
import type { Viewport } from './store'

export const MIN_ZOOM = 0.02
export const MAX_ZOOM = 32
export const RULER = 20

export const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))

export const toWorld = (viewport: Viewport, point: Point): Point => ({
  x: (point.x - viewport.x) / viewport.zoom,
  y: (point.y - viewport.y) / viewport.zoom,
})

export const toScreen = (viewport: Viewport, point: Point): Point => ({
  x: point.x * viewport.zoom + viewport.x,
  y: point.y * viewport.zoom + viewport.y,
})

/** Fits a rectangle in an area of the view, inside some padding */
export function fit(rect: Rect, area: Rect, padding = 64): Viewport {
  const zoom = clampZoom(Math.min((area.width - padding * 2) / rect.width, (area.height - padding * 2) / rect.height))
  return {
    zoom,
    x: area.x + (area.width - rect.width * zoom) / 2 - rect.x * zoom,
    y: area.y + (area.height - rect.height * zoom) / 2 - rect.y * zoom,
  }
}

/** Zooms so the point on screen stays where it is */
export function zoomAt(viewport: Viewport, zoom: number, point: Point): Viewport {
  const next = clampZoom(zoom)
  const ratio = next / viewport.zoom
  return { zoom: next, x: point.x - (point.x - viewport.x) * ratio, y: point.y - (point.y - viewport.y) * ratio }
}

const steps = [0.02, 0.05, 0.1, 0.125, 0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32]

/** The next zoom level in or out */
export function step(zoom: number, direction: 1 | -1): number {
  if (direction > 0) return steps.find((level) => level > zoom * 1.001) ?? MAX_ZOOM
  return steps.findLast((level) => level < zoom / 1.001) ?? MIN_ZOOM
}

/** The canvas without its rulers */
export function visibleArea(view: { width: number; height: number }, rulers: boolean): Rect {
  const inset = rulers ? RULER : 0
  return { x: inset, y: inset, width: Math.max(0, view.width - inset), height: Math.max(0, view.height - inset) }
}
