import { describe, expect, it } from 'vitest'
import { snapRect, snapResize, snapValue, type SnapContext } from './snapping'

const context = (values: Partial<SnapContext> = {}): SnapContext => ({
  threshold: 6,
  artboard: { x: 0, y: 0, width: 1776, height: 1152 },
  objects: [],
  guides: [],
  columns: [],
  grid: null,
  ...values,
})

describe('snapRect', () => {
  it('lines an edge up with a nearby object’s', () => {
    const object = { x: 100, y: 100, width: 380, height: 808 }
    const snapped = snapRect({ x: 483, y: 400, width: 380, height: 808 }, context({ artboard: null, objects: [object] }))
    expect(snapped.x).toBe(480)
    expect(snapped.lines).toContainEqual(expect.objectContaining({ axis: 'x', value: 480, kind: 'object' }))
  })

  it('centres on the artboard', () => {
    const snapped = snapRect({ x: 701, y: 170, width: 380, height: 808.36 }, context())
    expect(snapped.x).toBe(698)
    expect(snapped.y).toBeCloseTo(171.82, 2)
  })

  it('leaves it be when nothing’s within reach', () => {
    const snapped = snapRect({ x: 301, y: 301, width: 100, height: 100 }, context())
    expect(snapped).toMatchObject({ x: 301, y: 301, lines: [], gaps: [] })
  })

  it('falls back to the grid', () => {
    const snapped = snapRect({ x: 301, y: 299, width: 100, height: 100 }, context({ grid: 8 }))
    expect(snapped).toMatchObject({ x: 304, y: 296 })
  })

  it('spaces a third phone as the first two are, like mcknny’s', () => {
    const first = { x: 261, y: 172, width: 380, height: 808 }
    const second = { x: 698, y: 172, width: 380, height: 808 }
    const snapped = snapRect({ x: 1138, y: 172, width: 380, height: 808 }, context({ artboard: null, objects: [first, second] }))
    expect(snapped.x).toBe(1135)
    expect(snapped.gaps).toHaveLength(2)
    expect(snapped.gaps.map((gap) => gap.to - gap.from)).toEqual([57, 57])
  })

  it('centres between its neighbours', () => {
    const left = { x: 0, y: 0, width: 100, height: 100 }
    const right = { x: 500, y: 0, width: 100, height: 100 }
    const snapped = snapRect({ x: 248, y: 0, width: 100, height: 100 }, context({ artboard: null, objects: [left, right] }))
    expect(snapped.x).toBe(250)
  })

  it('prefers a guide to an object as close', () => {
    const object = { x: 0, y: 0, width: 200, height: 100 }
    const snapped = snapRect(
      { x: 204, y: 300, width: 100, height: 100 },
      context({ artboard: null, objects: [object], guides: [{ axis: 'x', value: 200 }] }),
    )
    expect(snapped.x).toBe(200)
    expect(snapped.lines.some((line) => line.kind === 'guide')).toBe(true)
  })

  it('keeps to one axis when asked', () => {
    const snapped = snapRect({ x: 701, y: 170, width: 380, height: 808.36 }, context(), { x: true, y: false })
    expect(snapped).toMatchObject({ x: 698, y: 170 })
  })
})

describe('snapResize', () => {
  it('keeps the proportions as the moving edge snaps', () => {
    const { rect } = snapResize({ x: 0, y: 0, width: 497, height: 1000 }, { x: 'start', y: 'start' }, context({ artboard: null, guides: [{ axis: 'x', value: 500 }] }))
    expect(rect.width).toBe(500)
    expect(rect.height).toBeCloseTo(1006.04, 2)
  })

  it('moves the near corner when the far one’s fixed', () => {
    const { rect } = snapResize({ x: 103, y: 50, width: 297, height: 150 }, { x: 'end', y: 'end' }, context({ artboard: null, guides: [{ axis: 'x', value: 100 }] }))
    expect(rect.x).toBe(100)
    expect(rect.width).toBe(300)
    expect(rect.y + rect.height).toBe(200)
  })
})

describe('snapValue', () => {
  it('snaps a guide to an artboard edge, or else the grid', () => {
    expect(snapValue(1772, 'x', context())).toBe(1776)
    expect(snapValue(1003, 'x', context({ grid: 8 }))).toBe(1000)
  })
})
