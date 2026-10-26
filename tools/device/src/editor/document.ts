import type { Tone } from '../devices/frames'
import { layoutOf } from '../devices/frames'
import { modelById, upright, type Kind, type Orientation, type Theme } from '../devices/models'
import { round, type Axis, type Rect } from './geometry'

export type StatusBar = Tone | 'none'

export interface Device {
  id: string
  model: string
  orientation: Orientation
  /** Its top left on the artboard */
  x: number
  y: number
  /** How wide it shows. Its height follows from its frame */
  width: number
  /** The screenshot, by its id in the image store */
  screen: string | null
  statusBar: StatusBar
  name: string | null
  hidden: boolean
  locked: boolean
}

export interface Guide {
  id: string
  /** x runs down the artboard at value, y runs across it */
  axis: Axis
  value: number
}

export interface Artboard {
  width: number
  height: number
  /** A colour, or null to leave it clear */
  fill: string | null
}

export interface Doc {
  version: 1
  artboard: Artboard
  theme: Theme
  /** From the back to the front */
  devices: Device[]
  guides: Guide[]
}

export interface Settings {
  snap: boolean
  /** Snap to the artboard and other devices, their edges, centres and spacing */
  objects: boolean
  grid: { size: number; visible: boolean; snap: boolean }
  /** Shown columns snap too */
  columns: { count: number; gutter: number; margin: number; visible: boolean }
  /** Shown guides snap too */
  guides: boolean
  rulers: boolean
  panels: { left: boolean; right: boolean }
}

/** mcknny’s composed images, which its Mockup lays devices out on */
export const CANVAS = { width: 1776, height: 1152 }

export const id = () => crypto.randomUUID()

export function heightOf(device: Pick<Device, 'model' | 'orientation' | 'width'>): number {
  const layout = layoutOf(device.model, device.orientation)
  return (device.width * layout.height) / layout.width
}

export function rectOf(device: Device): Rect {
  return { x: device.x, y: device.y, width: device.width, height: heightOf(device) }
}

export function nameOf(device: Device): string {
  return device.name ?? modelById(device.model).name
}

export function kindOf(device: Device): Kind {
  return modelById(device.model).kind
}

export function createDevice(model: string, values: Partial<Device> = {}): Device {
  return {
    id: id(),
    model,
    orientation: upright(modelById(model)),
    x: 0,
    y: 0,
    width: 380,
    screen: null,
    statusBar: 'dark',
    name: null,
    hidden: false,
    locked: false,
    ...values,
  }
}

/**
 * How wide a device starts: as tall as mcknny’s phones on its canvas, 808
 * of 1152, unless that’s wider than three quarters of the artboard. Its
 * phone comes out 380 wide and its desktop 1326, as its Mockup has them
 */
export function startingWidth(model: string, orientation: Orientation, artboard: Artboard): number {
  const layout = layoutOf(model, orientation)
  const scale = Math.min(artboard.width / CANVAS.width, artboard.height / CANVAS.height)
  const height = ((380 * 936) / 440) * scale
  return round(Math.min((height * layout.width) / layout.height, artboard.width * 0.75))
}

export const layouts = [
  { id: 'phones-3', name: 'Three phones' },
  { id: 'phones-2', name: 'Two phones' },
  { id: 'phones-1', name: 'One phone' },
  { id: 'crop', name: 'Cropped phone' },
  { id: 'desktop', name: 'Desktop' },
] as const

export type LayoutId = (typeof layouts)[number]['id']

type Screen = Pick<Device, 'screen' | 'statusBar'>

// mcknny’s wireframes, from its Mockup stories
const samples: Record<'phone' | 'desktop', Screen[]> = {
  phone: [
    { screen: 'sample:phone-home', statusBar: 'dark' },
    { screen: 'sample:phone-list', statusBar: 'dark' },
    { screen: 'sample:phone-dark', statusBar: 'light' },
  ],
  desktop: [{ screen: 'sample:desktop-home', statusBar: 'dark' }],
}

/**
 * mcknny’s Mockup layouts, at its sizes on a 1776 × 1152 artboard and in
 * proportion on any other: one to three phones 380 wide, 57 apart and
 * centred, one cropped phone 1072 wide from 187 down, or a desktop 1326
 * wide. Screens carry over, in order, from devices of the same kind, and
 * while every screen is one of mcknny’s wireframes, they fill any gaps
 */
export function arrange(doc: Doc, layout: LayoutId): Doc {
  const { width: W, height: H } = doc.artboard
  const scale = Math.min(W / CANVAS.width, H / CANVAS.height)
  const showing = doc.devices.every((device) => !device.screen || device.screen.startsWith('sample:'))
  const screens = (kinds: Kind[]): Screen[] => {
    const own = doc.devices.filter((device) => device.screen && kinds.includes(kindOf(device))).map(({ screen, statusBar }) => ({ screen, statusBar }))
    if (!showing) return own
    const fallback = samples[kinds.includes('phone') ? 'phone' : 'desktop'].filter((sample) => !own.some((each) => each.screen === sample.screen))
    return [...own, ...fallback]
  }

  if (layout === 'desktop') {
    const width = 1326 * scale
    const height = (width * 892) / 1464
    const [screen] = screens(['desktop', 'laptop'])
    return { ...doc, devices: [createDevice('desktop', { ...screen, x: round((W - width) / 2), y: round((H - height) / 2), width: round(width) })] }
  }

  const phones = screens(['phone'])
  if (layout === 'crop') {
    const width = 1072 * scale
    return { ...doc, devices: [createDevice('phone', { ...phones[0], x: round((W - width) / 2), y: round(187 * scale), width: round(width) })] }
  }

  const count = Number(layout.slice(-1))
  const width = 380 * scale
  const gap = 57 * scale
  const height = (width * 936) / 440
  const left = (W - (count * width + (count - 1) * gap)) / 2
  return {
    ...doc,
    devices: Array.from({ length: count }, (_, index) =>
      createDevice('phone', { ...phones[index], x: round(left + index * (width + gap)), y: round((H - height) / 2), width: round(width) }),
    ),
  }
}

/** Three phones, as mcknny’s Mockup lays them out, with its wireframes on their screens */
export function defaultDoc(): Doc {
  const doc: Doc = { version: 1, artboard: { ...CANVAS, fill: null }, theme: 'light', devices: [], guides: [] }
  return arrange(doc, 'phones-3')
}

export const defaultSettings: Settings = {
  snap: true,
  objects: true,
  grid: { size: 8, visible: false, snap: true },
  columns: { count: 12, gutter: 32, margin: 64, visible: false },
  guides: true,
  rulers: true,
  panels: { left: true, right: true },
}

/** The edges of the layout columns across the artboard */
export function columnEdges(artboard: Artboard, columns: Settings['columns']): { x: number; width: number }[] {
  const { count, gutter, margin } = columns
  const width = (artboard.width - 2 * margin - (count - 1) * gutter) / count
  if (count < 1 || width <= 0) return []
  return Array.from({ length: count }, (_, index) => ({ x: margin + index * (width + gutter), width }))
}

export const artboardSizes = [
  { name: 'Case study', width: 1776, height: 1152 },
  { name: 'Shot, 4:3', width: 1600, height: 1200 },
  { name: 'Wide, 16:9', width: 1920, height: 1080 },
  { name: 'Square', width: 1080, height: 1080 },
  { name: 'Portrait, 4:5', width: 1080, height: 1350 },
  { name: 'Social card', width: 1200, height: 630 },
]

// mcknny’s backgrounds, opaque: its page, and the cards its Mockup stories
// sit on, olive-200 over the page and olive-900 over the dark page
export const fills = [
  { name: 'None', value: null },
  { name: 'White', value: '#fff' },
  { name: 'Page', value: 'oklch(98.3% 0.004 130.6)' },
  { name: 'Card', value: 'oklch(90.5% 0.009 130.6)' },
  { name: 'Pearl', value: 'oklch(94.9% 0.009 26)' },
  { name: 'Dark card', value: 'oklch(28.5% 0.038 132.5)' },
  { name: 'Dark page', value: 'oklch(17.3% 0.027 148)' },
]
