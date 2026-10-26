export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export type Axis = 'x' | 'y'

export const other = (axis: Axis): Axis => (axis === 'x' ? 'y' : 'x')
export const start = (rect: Rect, axis: Axis) => rect[axis]
export const size = (rect: Rect, axis: Axis) => (axis === 'x' ? rect.width : rect.height)
export const end = (rect: Rect, axis: Axis) => start(rect, axis) + size(rect, axis)
export const middle = (rect: Rect, axis: Axis) => start(rect, axis) + size(rect, axis) / 2

export function union(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null
  const left = Math.min(...rects.map((rect) => rect.x))
  const top = Math.min(...rects.map((rect) => rect.y))
  const right = Math.max(...rects.map((rect) => rect.x + rect.width))
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height))
  return { x: left, y: top, width: right - left, height: bottom - top }
}

export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

/** The rectangle between two corners, whichever way round */
export function between(a: Point, b: Point): Rect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

export function translate(rect: Rect, dx: number, dy: number): Rect {
  return { ...rect, x: rect.x + dx, y: rect.y + dy }
}

/** Two decimals at most, as positions show and are kept */
export function round(value: number): number {
  return Math.round(value * 100) / 100
}
