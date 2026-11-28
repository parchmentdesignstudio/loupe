import { describe, expect, it } from 'vitest'
import { formatTemplate, linePosition, linesOf, nearestLine, nearestTrack, parseTemplate, placement, placeTracks, withCount } from '../src/grid.js'

describe('parseTemplate', () => {
  it('reads sizes and the names on each line', () => {
    expect(parseTemplate('[full-start] 1fr [content-start] minmax(0, 60ch) [content-end] 1fr [full-end]')).toEqual({
      sizes: ['1fr', 'minmax(0, 60ch)', '1fr'],
      names: [['full-start'], ['content-start'], ['content-end'], ['full-end']],
    })
  })

  it('writes a repeat out in full, with the names inside it', () => {
    expect(parseTemplate('repeat(3, [col] minmax(0, 1fr))')).toEqual({ sizes: Array(3).fill('minmax(0, 1fr)'), names: [['col'], ['col'], ['col'], []] })
  })

  it('reads what the browser resolves, including two names on a line', () => {
    expect(parseTemplate('[a b] 120.5px 80px')).toEqual({ sizes: ['120.5px', '80px'], names: [['a', 'b'], [], []] })
  })

  it('has no tracks for none, and nothing to edit for subgrid or auto-fill', () => {
    expect(parseTemplate('none')).toEqual({ sizes: [], names: [[]] })
    expect(parseTemplate('subgrid [] []')).toBeNull()
    expect(parseTemplate('repeat(auto-fill, minmax(200px, 1fr))')).toBeNull()
  })
})

describe('formatTemplate', () => {
  it('gathers a run of the same size into a repeat', () => {
    expect(formatTemplate(parseTemplate('1fr 1fr 1fr 200px'))).toBe('repeat(3, 1fr) 200px')
  })

  it('breaks a run where a line has a name', () => {
    const template = parseTemplate('repeat(12, minmax(0, 1fr))')
    template.names[2] = ['content-start']
    template.names[10] = ['content-end']
    expect(formatTemplate(template)).toBe('repeat(2, minmax(0, 1fr)) [content-start] repeat(8, minmax(0, 1fr)) [content-end] repeat(2, minmax(0, 1fr))')
  })

  it('comes back the same through parseTemplate', () => {
    const text = '[full-start] 1fr [content-start] repeat(2, 20rem) [content-end] 1fr [full-end]'
    expect(formatTemplate(parseTemplate(text))).toBe(text)
  })
})

describe('withCount', () => {
  it('adds tracks the size of the last, and keeps the last line’s names at the end', () => {
    expect(formatTemplate(withCount(parseTemplate('[start] 1fr 1fr [end]'), 4))).toBe('[start] repeat(4, 1fr) [end]')
  })

  it('takes tracks away from the end, down to one', () => {
    expect(formatTemplate(withCount(parseTemplate('200px 1fr 1fr [end]'), 2))).toBe('200px 1fr [end]')
    expect(withCount(parseTemplate('1fr 1fr'), 0).sizes).toEqual(['1fr'])
  })

  it('starts an empty list from the fallback', () => {
    expect(formatTemplate(withCount(parseTemplate('none'), 2, 'auto'))).toBe('repeat(2, auto)')
  })
})

describe('placeTracks', () => {
  it('lays tracks out from the start with the gap between them', () => {
    expect(placeTracks([100, 100], { start: 10, extent: 220, gap: 20 })).toEqual([{ start: 10, end: 110 }, { start: 130, end: 230 }])
  })

  it('spreads what’s left over as the container says', () => {
    expect(placeTracks([100], { start: 0, extent: 300, distribute: 'center' })[0].start).toBe(100)
    expect(placeTracks([100], { start: 0, extent: 300, distribute: 'end' })[0].start).toBe(200)
    expect(placeTracks([100, 100], { start: 0, extent: 300, distribute: 'space-between' })[1].start).toBe(200)
  })
})

describe('finding lines and tracks', () => {
  const tracks = placeTracks([100, 100, 100], { start: 0, extent: 340, gap: 20 })

  it('draws a line at the edges and in the middle of each gap', () => {
    expect([1, 2, 3, 4].map((line) => linePosition(tracks, line))).toEqual([0, 110, 230, 340])
  })

  it('finds the line and the track nearest a point', () => {
    expect(nearestLine(tracks, 100)).toBe(2)
    expect(nearestLine(tracks, 500)).toBe(4)
    expect(nearestTrack(tracks, 115)).toBe(1)
  })

  it('counts a point well past the end as a track or line that isn’t there yet', () => {
    expect(nearestTrack(tracks, 400, 24)).toBe(3)
    expect(nearestLine(tracks, 400, 24)).toBe(5)
    expect(nearestTrack(tracks, 350, 24)).toBe(2)
  })
})

describe('linesOf', () => {
  const tracks = placeTracks([100, 100, 100, 100], { start: 0, extent: 400 })

  it('takes whole numbers and spans from the item’s style', () => {
    expect(linesOf(tracks, { start: '2', end: 'span 2', from: 0, to: 0 })).toEqual({ start: 2, end: 4 })
    expect(linesOf(tracks, { start: '1', end: '-1', from: 0, to: 0 })).toEqual({ start: 1, end: 5 })
  })

  it('reads an item the browser placed off where it sits', () => {
    expect(linesOf(tracks, { start: 'auto', end: 'auto', from: 100, to: 200 })).toEqual({ start: 2, end: 3 })
    expect(linesOf(tracks, { start: 'auto', end: 'span 2', from: 200, to: 400 })).toEqual({ start: 3, end: 5 })
  })

  it('keeps an item that doesn’t fill its track in that track', () => {
    expect(linesOf(tracks, { start: 'auto', end: 'auto', from: 260, to: 290 })).toEqual({ start: 3, end: 4 })
  })
})

describe('placement', () => {
  it('writes numbers, leaving out a span of one', () => {
    expect(placement([[], [], [], []], 2, 3)).toBe('2')
    expect(placement([[], [], [], []], 1, 4)).toBe('1 / span 3')
  })

  it('uses a line’s name where only that line has it', () => {
    const names = [['full-start'], ['content-start'], ['content-end'], ['full-end']]
    expect(placement(names, 2, 3)).toBe('content-start / content-end')
    expect(placement(names, 1, 4)).toBe('full-start / full-end')
    expect(placement([['col'], ['col'], ['col'], []], 1, 3)).toBe('1 / span 2')
  })

  it('spans from a named start to an end with no name', () => {
    expect(placement([['hero'], [], []], 1, 2)).toBe('hero / span 1')
  })
})
