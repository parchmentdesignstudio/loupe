import { end, middle, other, round, size, start, type Axis, type Rect } from './geometry'

export type SnapKind = 'artboard' | 'object' | 'guide' | 'column' | 'spacing'

export interface SnapLine {
  /** On x, a line down at value; on y, a line across */
  axis: Axis
  value: number
  /** Its extent on the other axis, or null for the whole artboard or view */
  from: number | null
  to: number | null
  kind: SnapKind
}

/** A space between two things that matches another, drawn from one to the other */
export interface SnapGap {
  axis: Axis
  from: number
  to: number
  /** Where it sits on the other axis */
  at: number
}

export interface SnapContext {
  /** How close counts, in the artboard’s units */
  threshold: number
  /** Its edges and centre, or null when not snapping to them */
  artboard: Rect | null
  objects: Rect[]
  guides: { axis: Axis; value: number }[]
  /** The layout columns’ edges, across */
  columns: number[]
  grid: number | null
}

export interface Snapped {
  x: number
  y: number
  lines: SnapLine[]
  gaps: SnapGap[]
}

interface Target {
  value: number
  kind: SnapKind
  rect?: Rect
}

interface Best {
  offset: number
  distance: number
  priority: number
}

// When two are as close, a guide wins, as it was put there to snap to
const priority: Record<SnapKind, number> = { guide: 5, object: 4, spacing: 3, artboard: 2, column: 1 }

const withStart = (rect: Rect, axis: Axis, value: number): Rect => ({ ...rect, [axis]: value })
const points = (rect: Rect, axis: Axis) => [start(rect, axis), middle(rect, axis), end(rect, axis)]

function targets(axis: Axis, context: SnapContext): Target[] {
  const list: Target[] = []
  const add = (rect: Rect, kind: SnapKind) => {
    for (const value of points(rect, axis)) list.push({ value, kind, rect })
  }
  if (context.artboard) add(context.artboard, 'artboard')
  for (const rect of context.objects) add(rect, 'object')
  for (const guide of context.guides) if (guide.axis === axis) list.push({ value: guide.value, kind: 'guide' })
  if (axis === 'x') for (const value of context.columns) list.push({ value, kind: 'column' })
  return list
}

function better(best: Best | null, offset: number, kind: SnapKind, threshold: number): Best | null {
  const distance = Math.abs(offset)
  if (distance > threshold) return best
  if (!best || distance < best.distance - 1e-6) return { offset, distance, priority: priority[kind] }
  if (Math.abs(distance - best.distance) <= 1e-6 && priority[kind] > best.priority) return { offset, distance, priority: priority[kind] }
  return best
}

function overlap(a: Rect, b: Rect, axis: Axis): [number, number] | null {
  const from = Math.max(start(a, axis), start(b, axis))
  const to = Math.min(end(a, axis), end(b, axis))
  return from < to ? [from, to] : null
}

function gapBetween(before: Rect, after: Rect, axis: Axis): SnapGap {
  const across = other(axis)
  const shared = overlap(before, after, across)
  const at = shared ? (shared[0] + shared[1]) / 2 : (middle(before, across) + middle(after, across)) / 2
  return { axis, from: end(before, axis), to: start(after, axis), at }
}

/**
 * Where the rectangle would sit to space itself evenly with what’s in line
 * with it: on from the two before it, back from the two after, or centred
 * between its neighbours
 */
function spacings(rect: Rect, axis: Axis, objects: Rect[]): { start: number; gaps: SnapGap[] }[] {
  const across = other(axis)
  const inLine = objects.filter((object) => overlap(object, rect, across))
  const centre = middle(rect, axis)
  const before = inLine.filter((object) => end(object, axis) <= centre).sort((a, b) => end(b, axis) - end(a, axis))
  const after = inLine.filter((object) => start(object, axis) >= centre).sort((a, b) => start(a, axis) - start(b, axis))
  const length = size(rect, axis)
  const list: { start: number; gaps: SnapGap[] }[] = []

  const [near] = before
  const [next] = after
  const farBefore = near && before.find((object) => end(object, axis) <= start(near, axis))
  const farAfter = next && after.find((object) => start(object, axis) >= end(next, axis))

  if (near && farBefore) {
    const value = end(near, axis) + start(near, axis) - end(farBefore, axis)
    const placed = withStart(rect, axis, value)
    list.push({ start: value, gaps: [gapBetween(farBefore, near, axis), gapBetween(near, placed, axis)] })
  }
  if (next && farAfter) {
    const value = start(next, axis) - (start(farAfter, axis) - end(next, axis)) - length
    const placed = withStart(rect, axis, value)
    list.push({ start: value, gaps: [gapBetween(placed, next, axis), gapBetween(next, farAfter, axis)] })
  }
  if (near && next && start(next, axis) - end(near, axis) >= length) {
    const value = end(near, axis) + (start(next, axis) - end(near, axis) - length) / 2
    const placed = withStart(rect, axis, value)
    list.push({ start: value, gaps: [gapBetween(near, placed, axis), gapBetween(placed, next, axis)] })
  }
  return list
}

function offsetFor(rect: Rect, axis: Axis, context: SnapContext): number {
  let best: Best | null = null
  for (const target of targets(axis, context)) {
    for (const point of points(rect, axis)) best = better(best, target.value - point, target.kind, context.threshold)
  }
  for (const spacing of spacings(rect, axis, context.objects)) {
    best = better(best, spacing.start - start(rect, axis), 'spacing', context.threshold)
  }
  if (best) return best.offset
  if (context.grid) return Math.round(start(rect, axis) / context.grid) * context.grid - start(rect, axis)
  return 0
}

/** The lines to show for everything the rectangle lines up with on an axis */
function linesFor(rect: Rect, axis: Axis, context: SnapContext): SnapLine[] {
  const across = other(axis)
  const lines = new Map<string, SnapLine>()
  const own = points(rect, axis)
  for (const target of targets(axis, context)) {
    if (!own.some((point) => Math.abs(point - target.value) < 0.01)) continue
    const key = `${target.kind} ${round(target.value)}`
    const from = target.rect ? Math.min(start(rect, across), start(target.rect, across)) : null
    const to = target.rect ? Math.max(end(rect, across), end(target.rect, across)) : null
    const line = lines.get(key)
    if (!line) lines.set(key, { axis, value: target.value, from, to, kind: target.kind })
    else if (line.from !== null && line.to !== null && from !== null && to !== null) {
      line.from = Math.min(line.from, from)
      line.to = Math.max(line.to, to)
    }
  }
  return [...lines.values()]
}

function gapsFor(rect: Rect, axis: Axis, context: SnapContext): SnapGap[] {
  const match = spacings(rect, axis, context.objects).find((spacing) => Math.abs(spacing.start - start(rect, axis)) < 0.01)
  return match?.gaps ?? []
}

/** Moves a rectangle onto what’s close, on either axis or both */
export function snapRect(rect: Rect, context: SnapContext, axes: { x: boolean; y: boolean } = { x: true, y: true }): Snapped {
  const x = axes.x ? rect.x + offsetFor(rect, 'x', context) : rect.x
  const y = axes.y ? rect.y + offsetFor(rect, 'y', context) : rect.y
  const snapped = { ...rect, x, y }
  const lines = [...(axes.x ? linesFor(snapped, 'x', context) : []), ...(axes.y ? linesFor(snapped, 'y', context) : [])]
  const gaps = [...(axes.x ? gapsFor(snapped, 'x', context) : []), ...(axes.y ? gapsFor(snapped, 'y', context) : [])]
  return { x, y, lines, gaps }
}

function nearest(value: number, axis: Axis, context: SnapContext): { value: number; distance: number } | null {
  let found: { value: number; distance: number } | null = null
  for (const target of targets(axis, context)) {
    const distance = Math.abs(target.value - value)
    if (distance <= context.threshold && (!found || distance < found.distance)) found = { value: target.value, distance }
  }
  return found
}

/** A single position, such as a guide’s, onto what’s close, or else the grid */
export function snapValue(value: number, axis: Axis, context: SnapContext): number {
  const found = nearest(value, axis, context)
  if (found) return found.value
  return context.grid ? Math.round(value / context.grid) * context.grid : value
}

/**
 * Resizes a rectangle from a fixed corner, keeping its proportions, so the
 * edge that moves on whichever axis is closer lands on what’s there
 */
export function snapResize(rect: Rect, fixed: { x: 'start' | 'end'; y: 'start' | 'end' }, context: SnapContext): { rect: Rect; lines: SnapLine[] } {
  const ratio = rect.width / rect.height
  const movingX = fixed.x === 'start' ? end(rect, 'x') : rect.x
  const movingY = fixed.y === 'start' ? end(rect, 'y') : rect.y
  const onX = nearest(movingX, 'x', context)
  const onY = nearest(movingY, 'y', context)

  let width = rect.width
  if (onX && (!onY || onX.distance <= onY.distance)) {
    width = fixed.x === 'start' ? onX.value - rect.x : end(rect, 'x') - onX.value
  } else if (onY) {
    width = (fixed.y === 'start' ? onY.value - rect.y : end(rect, 'y') - onY.value) * ratio
  } else if (context.grid) {
    const value = Math.round(movingX / context.grid) * context.grid
    width = fixed.x === 'start' ? value - rect.x : end(rect, 'x') - value
  }
  if (width < 8) width = rect.width

  const height = width / ratio
  const snapped = {
    x: fixed.x === 'start' ? rect.x : end(rect, 'x') - width,
    y: fixed.y === 'start' ? rect.y : end(rect, 'y') - height,
    width,
    height,
  }
  return { rect: snapped, lines: [...linesFor(snapped, 'x', context), ...linesFor(snapped, 'y', context)] }
}
