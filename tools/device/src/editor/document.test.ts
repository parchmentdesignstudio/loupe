import { describe, expect, it } from 'vitest'
import { byPosition, createDevice, defaultArtboard, defaultDoc, flow, sampleFor, slotAt, type Doc, type Layout } from './document'

const phones = (count: number, layout: Layout = 'row'): Doc => ({
  version: 1,
  artboard: { ...defaultArtboard, layout },
  theme: 'light',
  guides: [],
  devices: Array.from({ length: count }, () => createDevice('phone', { width: 380 })),
})

const lefts = (doc: Doc) => doc.devices.map((device) => device.x)

describe('flow', () => {
  it('sets three phones out as mcknny’s Mockup does', () => {
    const doc = flow(phones(3))
    expect(lefts(doc)).toEqual([261, 698, 1135])
    expect(doc.devices.map((device) => device.y)).toEqual([171.82, 171.82, 171.82])
  })

  it('centres the row afresh for another', () => {
    expect(lefts(flow(phones(4)))).toEqual([42.5, 479.5, 916.5, 1353.5])
  })

  it('runs over both edges alike when they don’t fit', () => {
    const doc = flow(phones(5))
    const last = doc.devices.at(-1)!
    expect(doc.devices[0].x).toBe(-176)
    expect(last.x + last.width - doc.artboard.width).toBe(176)
  })

  it('keeps each device’s own size, centred down the artboard', () => {
    const doc = phones(3)
    doc.devices[1] = createDevice('desktop', { width: 1326 })
    expect(lefts(flow(doc))).toEqual([-212, 225, 1608])
    expect(flow(doc).devices[1].y).toBe(172.04)
  })

  it('uses the gap', () => {
    const doc = phones(2)
    expect(lefts(flow({ ...doc, artboard: { ...doc.artboard, gap: 0 } }))).toEqual([508, 888])
  })

  it('leaves free devices where they are', () => {
    const doc = phones(3, 'free')
    expect(flow(doc)).toBe(doc)
  })

  it('gives back the same document when nothing moves', () => {
    const doc = flow(phones(3))
    expect(flow(doc)).toBe(doc)
  })

  it('starts with mcknny’s three phones and its wireframes', () => {
    const doc = defaultDoc()
    expect(lefts(doc)).toEqual([261, 698, 1135])
    expect(doc.devices.map((device) => device.screen)).toEqual(['sample:phone-home', 'sample:phone-list', 'sample:phone-dark'])
  })
})

describe('the row’s order', () => {
  it('goes by where each device’s middle is', () => {
    const [a, b, c] = flow(phones(3)).devices
    expect(byPosition([c, a, b])).toEqual([a, b, c])
  })

  it('puts something dropped after every middle it’s past', () => {
    const { devices } = flow(phones(3))
    expect([0, 452, 1000, 1700].map((x) => slotAt(devices, x))).toEqual([0, 1, 2, 3])
  })
})

describe('sampleFor', () => {
  it('swaps a phone’s wireframe for the desktop’s, and back', () => {
    const phone = createDevice('phone', { screen: 'sample:phone-list' })
    expect(sampleFor(phone, 'macbook-pro-14').screen).toBe('sample:desktop-home')
    expect(sampleFor(createDevice('desktop', { screen: 'sample:desktop-home' }), 'phone').screen).toBe('sample:phone-home')
  })

  it('keeps a wireframe that fits, and any screenshot', () => {
    expect(sampleFor(createDevice('phone', { screen: 'sample:phone-dark' }), 'iphone-air').screen).toBe('sample:phone-dark')
    expect(sampleFor(createDevice('phone', { screen: 'abc' }), 'desktop').screen).toBe('abc')
  })
})
