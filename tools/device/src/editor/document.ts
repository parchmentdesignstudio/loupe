import type { Tone } from '../devices/frames'
import { layoutOf } from '../devices/frames'
import { modelById, upright, type Orientation, type Theme } from '../devices/models'
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
}

export interface Guide {
  id: string
  /** x runs down the artboard at value, y runs across it */
  axis: Axis
  value: number
}

/** Devices in a centred row that lays itself out, or each where it’s put */
export type Layout = 'row' | 'free'

export interface Artboard {
  width: number
  height: number
  /** A colour, or null to leave it clear */
  fill: string | null
  layout: Layout
  /** Between devices in the row */
  gap: number
}

export interface Doc {
  version: 1
  artboard: Artboard
  theme: Theme
  /** From the back to the front, and in the row, from left to right */
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
  inspector: boolean
}

/** mcknny’s composed images, which its Mockup lays devices out on */
export const CANVAS = { width: 1776, height: 1152 }

/** mcknny’s artboard, with its devices in a row 57 apart, as its Mockup sets them */
export const defaultArtboard: Artboard = { ...CANVAS, fill: null, layout: 'row', gap: 57 }

export const id = () => crypto.randomUUID()

export function heightOf(device: Pick<Device, 'model' | 'orientation' | 'width'>): number {
  const layout = layoutOf(device.model, device.orientation)
  return (device.width * layout.height) / layout.width
}

export function rectOf(device: Device): Rect {
  return { x: device.x, y: device.y, width: device.width, height: heightOf(device) }
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
    ...values,
  }
}

/**
 * How wide a device starts: as tall as mcknny’s phones on its canvas, 808
 * of 1152, unless that’s wider than three quarters of the artboard. Its
 * phone comes out 380 wide and its desktop 1326, as its Mockup has them
 */
export function startingWidth(model: string, orientation: Orientation, artboard: Pick<Artboard, 'width' | 'height'>): number {
  const layout = layoutOf(model, orientation)
  const scale = Math.min(artboard.width / CANVAS.width, artboard.height / CANVAS.height)
  const height = ((380 * 936) / 440) * scale
  return round(Math.min((height * layout.width) / layout.height, artboard.width * 0.75))
}

/**
 * Lays devices out as a centred flexbox would: in a row, each its own size
 * and the gap apart, centred across and down the artboard. More than fit
 * run over both edges alike. Free devices stay where they are
 */
export function flow(doc: Doc): Doc {
  const { layout, gap, width, height } = doc.artboard
  if (layout !== 'row') return doc
  const span = doc.devices.reduce((total, device) => total + device.width, 0) + Math.max(0, doc.devices.length - 1) * gap
  let left = (width - span) / 2
  let moved = false
  const devices = doc.devices.map((device) => {
    const x = round(left)
    const y = round((height - heightOf(device)) / 2)
    left += device.width + gap
    if (x === device.x && y === device.y) return device
    moved = true
    return { ...device, x, y }
  })
  return moved ? { ...doc, devices } : doc
}

/** From left to right, by their middles */
export function byPosition(devices: Device[]): Device[] {
  return devices.toSorted((a, b) => a.x + a.width / 2 - (b.x + b.width / 2))
}

/** Where in a row something dropped at x goes: after every device whose middle it’s past */
export function slotAt(devices: Device[], x: number): number {
  return devices.filter((device) => device.x + device.width / 2 < x).length
}

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

const wide = (model: string) => ['laptop', 'desktop'].includes(modelById(model).kind)

/** A wireframe the shape of another model’s screen, for a device changing to it */
export function sampleFor(device: Device, model: string): Screen {
  const { screen, statusBar } = device
  if (!screen?.startsWith('sample:') || wide(device.model) === wide(model)) return { screen, statusBar }
  return wide(model) ? samples.desktop[0] : samples.phone[0]
}

/** Three phones, as mcknny’s Mockup lays them out, with its wireframes on their screens */
export function defaultDoc(): Doc {
  const width = startingWidth('phone', 'portrait', defaultArtboard)
  const devices = samples.phone.map((sample) => createDevice('phone', { ...sample, width }))
  return flow({ version: 1, artboard: defaultArtboard, theme: 'light', devices, guides: [] })
}

export const defaultSettings: Settings = {
  snap: true,
  objects: true,
  grid: { size: 8, visible: false, snap: true },
  columns: { count: 12, gutter: 32, margin: 64, visible: false },
  guides: true,
  rulers: true,
  inspector: true,
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
// sit on, olive-200 over the page and olive-900 over the dark page. React Aria’s
// colours can’t read oklch or none, so each swatch shows the nearest hex
export const fills = [
  { name: 'None', value: null, swatch: '#0000' },
  { name: 'White', value: '#fff', swatch: '#fff' },
  { name: 'Page', value: 'oklch(98.3% 0.004 130.6)', swatch: '#f8faf7' },
  { name: 'Card', value: 'oklch(90.5% 0.009 130.6)', swatch: '#dde1db' },
  { name: 'Pearl', value: 'oklch(94.9% 0.009 26)', swatch: '#f4eceb' },
  { name: 'Dark card', value: 'oklch(28.5% 0.038 132.5)', swatch: '#232e1a' },
  { name: 'Dark page', value: 'oklch(17.3% 0.027 148)', swatch: '#081309' },
]
