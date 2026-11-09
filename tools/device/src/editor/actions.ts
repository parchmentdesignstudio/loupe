import { layoutOf } from '../devices/frames'
import { modelById, models, screenSize, upright, type Orientation, type Theme } from '../devices/models'
import {
  byPosition,
  columnEdges,
  createDevice,
  heightOf,
  id,
  rectOf,
  sampleFor,
  slotAt,
  startingWidth,
  type Artboard,
  type Device,
  type Doc,
  type Layout,
  type Settings,
} from './document'
import { renderPng } from './export'
import { end, middle, round, size, start, union, type Axis, type Point, type Rect } from './geometry'
import { addImage } from './images'
import type { SnapContext } from './snapping'
import { change, get, set, updateSettings } from './store'
import { fit, step, toWorld, visibleArea, zoomAt } from './viewport'

// Selection

export function select(ids: string[]) {
  set({ selection: [...new Set(ids)] })
}

export function selectAll() {
  select(get().doc.devices.map((device) => device.id))
}

export function selectedDevices(): Device[] {
  const { doc, selection } = get()
  return doc.devices.filter((device) => selection.includes(device.id))
}

/** Just after the last of the selection, or at the end with none */
function afterSelection(doc: Doc): number {
  const { selection } = get()
  const last = doc.devices.findLastIndex((device) => selection.includes(device.id))
  return last >= 0 ? last + 1 : doc.devices.length
}

// Snapping

/** What a drag can snap to, leaving out the devices or guide being dragged */
export function snapContext(excluding: Set<string>): SnapContext | null {
  const { doc, settings, viewport } = get()
  if (!settings.snap) return null
  return {
    threshold: 6 / viewport.zoom,
    artboard: settings.objects ? { x: 0, y: 0, width: doc.artboard.width, height: doc.artboard.height } : null,
    objects: settings.objects ? doc.devices.filter((device) => !excluding.has(device.id)).map(rectOf) : [],
    guides: settings.guides ? doc.guides.filter((guide) => !excluding.has(guide.id)) : [],
    columns: settings.columns.visible ? columnEdges(doc.artboard, settings.columns).flatMap(({ x, width }) => [x, x + width]) : [],
    grid: settings.grid.snap ? settings.grid.size : null,
  }
}

// Devices

export function updateDevices(ids: string[], update: (device: Device) => Partial<Device>) {
  const chosen = new Set(ids)
  if (chosen.size === 0) return
  change((doc) => ({ ...doc, devices: doc.devices.map((device) => (chosen.has(device.id) ? { ...device, ...update(device) } : device)) }))
}

/** The middle of what’s in view, or of the artboard when it’s out of sight */
function placeFor(): Point {
  const { viewport, view, settings, doc } = get()
  const area = visibleArea(view, settings.rulers)
  const centre = toWorld(viewport, { x: area.x + area.width / 2, y: area.y + area.height / 2 })
  const { width, height } = doc.artboard
  const inside = centre.x >= 0 && centre.y >= 0 && centre.x <= width && centre.y <= height
  return inside ? centre : { x: width / 2, y: height / 2 }
}

/**
 * Adds a device. In the row it goes where it’s dropped, or else after the
 * selection, or at the end. Free, it’s centred on the point, on the grid,
 * and stepped on from any already about there
 */
export function addDevice(model: string, at?: Point, values: Partial<Device> = {}): Device {
  const { doc, settings } = get()
  const orientation = values.orientation ?? upright(modelById(model))
  const width = values.width ?? startingWidth(model, orientation, doc.artboard)
  let device: Device
  if (doc.artboard.layout === 'row') {
    device = createDevice(model, { ...values, orientation, width })
    const index = at ? slotAt(doc.devices, at.x) : afterSelection(doc)
    change((current) => ({ ...current, devices: current.devices.toSpliced(index, 0, device) }))
  } else {
    const point = at ?? placeFor()
    const grid = settings.snap && settings.grid.snap ? settings.grid.size : 0
    const snap = (value: number) => (grid ? Math.round(value / grid) * grid : round(value))
    let x = snap(point.x - width / 2)
    let y = snap(point.y - heightOf({ model, orientation, width }) / 2)
    // Snapping to the grid can leave it a point or two off one already there, so near enough counts
    const step = 24
    while (doc.devices.some((each) => Math.abs(each.x - x) < step / 2 && Math.abs(each.y - y) < step / 2)) {
      x += step
      y += step
    }
    device = createDevice(model, { ...values, orientation, width, x, y })
    change((current) => ({ ...current, devices: [...current.devices, device] }))
  }
  set({ selection: [device.id], tool: 'select' })
  return get().doc.devices.find((each) => each.id === device.id) ?? device
}

/** What Add device adds, with nothing to choose: mcknny’s phone */
export const defaultModel = modelById('phone')

export function addDefaultDevice(): Device {
  return addDevice(defaultModel.id)
}

export function removeSelected() {
  const { selection } = get()
  if (selection.length === 0) return
  change((doc) => ({ ...doc, devices: doc.devices.filter((device) => !selection.includes(device.id)) }))
}

/** Copies of devices, keyed by their originals’, to sit just above them */
export function copiesOf(doc: Doc, ids: string[], offset = 0): Map<string, Device> {
  const copies = new Map<string, Device>()
  for (const device of doc.devices) {
    if (ids.includes(device.id)) copies.set(device.id, { ...device, id: id(), x: round(device.x + offset), y: round(device.y + offset) })
  }
  return copies
}

export function withCopies(doc: Doc, copies: Map<string, Device> | null): Doc {
  if (!copies?.size) return doc
  return { ...doc, devices: doc.devices.flatMap((device) => (copies.has(device.id) ? [device, copies.get(device.id)!] : [device])) }
}

export function duplicate(offset = 24) {
  const ids = selectedDevices().map((device) => device.id)
  if (ids.length === 0) return
  const copies = copiesOf(get().doc, ids, offset)
  change((doc) => withCopies(doc, copies))
  select([...copies.values()].map((copy) => copy.id))
}

export function nudge(dx: number, dy: number) {
  updateDevices(
    selectedDevices().map((device) => device.id),
    (device) => ({ x: round(device.x + dx), y: round(device.y + dy) }),
  )
}

/** Moves and scales the selection as one, to new bounds. In the row, only its size counts */
export function setBounds(next: Partial<Rect>) {
  const devices = selectedDevices()
  const bounds = union(devices.map(rectOf))
  if (!bounds) return
  const scale = next.width !== undefined ? next.width / bounds.width : next.height !== undefined ? next.height / bounds.height : 1
  if (!(scale > 0)) return
  const x = next.x ?? bounds.x
  const y = next.y ?? bounds.y
  updateDevices(
    devices.map((device) => device.id),
    (device) => ({
      x: round(x + (device.x - bounds.x) * scale),
      y: round(y + (device.y - bounds.y) * scale),
      width: round(device.width * scale),
    }),
  )
}

export type Edge = 'left' | 'centre' | 'right' | 'top' | 'middle' | 'bottom'

/** Lines devices up: one with the artboard, more with each other */
export function align(edge: Edge) {
  const devices = selectedDevices()
  if (devices.length === 0) return
  const { artboard } = get().doc
  const frame = devices.length === 1 ? { x: 0, y: 0, width: artboard.width, height: artboard.height } : union(devices.map(rectOf))!
  const axis: Axis = edge === 'left' || edge === 'centre' || edge === 'right' ? 'x' : 'y'
  const place = (rect: Rect) => {
    if (edge === 'left' || edge === 'top') return start(frame, axis)
    if (edge === 'centre' || edge === 'middle') return middle(frame, axis) - size(rect, axis) / 2
    return end(frame, axis) - size(rect, axis)
  }
  updateDevices(
    devices.map((device) => device.id),
    (device) => ({ [axis]: round(place(rectOf(device))) }),
  )
}

/** Spaces three or more devices evenly between the outermost */
export function distribute(axis: Axis) {
  const placed = selectedDevices()
    .map((device) => ({ device, rect: rectOf(device) }))
    .sort((a, b) => start(a.rect, axis) - start(b.rect, axis))
  if (placed.length < 3) return
  const bounds = union(placed.map(({ rect }) => rect))!
  const gap = (size(bounds, axis) - placed.reduce((total, { rect }) => total + size(rect, axis), 0)) / (placed.length - 1)
  const positions = new Map<string, number>()
  let cursor = start(bounds, axis)
  for (const { device, rect } of placed) {
    positions.set(device.id, round(cursor))
    cursor += size(rect, axis) + gap
  }
  updateDevices([...positions.keys()], (device) => ({ [axis]: positions.get(device.id) }))
}

export type Order = 'forward' | 'backward' | 'front' | 'back'

/** Free, up or down the stack; in the row, along it to the right or left */
export function reorder(order: Order) {
  const { selection } = get()
  if (selection.length === 0) return
  change((doc) => {
    const chosen = (device: Device) => selection.includes(device.id)
    let devices = [...doc.devices]
    if (order === 'front') devices = [...devices.filter((device) => !chosen(device)), ...devices.filter(chosen)]
    else if (order === 'back') devices = [...devices.filter(chosen), ...devices.filter((device) => !chosen(device))]
    else if (order === 'forward') {
      for (let index = devices.length - 2; index >= 0; index--) {
        if (chosen(devices[index]) && !chosen(devices[index + 1])) [devices[index], devices[index + 1]] = [devices[index + 1], devices[index]]
      }
    } else {
      for (let index = 1; index < devices.length; index++) {
        if (chosen(devices[index]) && !chosen(devices[index - 1])) [devices[index], devices[index - 1]] = [devices[index - 1], devices[index]]
      }
    }
    return devices.every((device, index) => device === doc.devices[index]) ? doc : { ...doc, devices }
  })
}

/** Changes devices to another model, keeping their heights and centres, and a wireframe to the new shape */
export function switchModel(ids: string[], model: string) {
  const next = modelById(model)
  updateDevices(ids, (device) => {
    const orientation: Orientation = next.rotates && modelById(device.model).rotates ? device.orientation : upright(next)
    const rect = rectOf(device)
    const layout = layoutOf(model, orientation)
    const width = round((rect.height * layout.width) / layout.height)
    return { model, orientation, width, x: round(rect.x + (rect.width - width) / 2), ...sampleFor(device, model) }
  })
}

/** Turns tablets between portrait and landscape about their centres, keeping their long side */
export function rotate(ids: string[]) {
  updateDevices(ids, (device) => {
    if (!modelById(device.model).rotates) return {}
    const orientation: Orientation = device.orientation === 'portrait' ? 'landscape' : 'portrait'
    const rect = rectOf(device)
    const long = Math.max(rect.width, rect.height)
    const layout = layoutOf(device.model, orientation)
    const width = layout.width >= layout.height ? long : (long * layout.width) / layout.height
    const height = (width * layout.height) / layout.width
    return { orientation, width: round(width), x: round(rect.x + (rect.width - width) / 2), y: round(rect.y + (rect.height - height) / 2) }
  })
}

// Screens

/** The model, and way round, whose screen an image fits best */
export function closestModel(width: number, height: number): { model: string; orientation: Orientation } {
  const ratio = width / height
  let best = { model: 'phone', orientation: 'portrait' as Orientation, distance: Infinity }
  for (const model of models) {
    const ways: Orientation[] = model.rotates ? ['portrait', 'landscape'] : [upright(model)]
    for (const orientation of ways) {
      const screen = screenSize(model, orientation)
      const distance = Math.abs(Math.log(ratio / (screen.width / screen.height)))
      if (distance < best.distance - 1e-9) best = { model: model.id, orientation, distance }
    }
  }
  return best
}

export async function placeScreen(deviceId: string, file: File) {
  const added = await addImage(file)
  updateDevices([deviceId], (device) => ({ screen: added.id, statusBar: device.statusBar === 'none' ? 'none' : added.statusBar }))
}

/** A device for each image, of the model whose screen it fits: next along in the row, or stepped on down and right */
export async function addScreens(files: File[], at?: Point) {
  let point = at
  for (const file of files) {
    const added = await addImage(file)
    const { model, orientation } = closestModel(added.width, added.height)
    const device = addDevice(model, point, { orientation, screen: added.id, statusBar: added.statusBar })
    point = get().doc.artboard.layout === 'row' ? undefined : { x: device.x + device.width / 2 + 48, y: device.y + heightOf(device) / 2 + 48 }
  }
}

/** Opens the file picker for a device’s screen */
export function chooseScreen(deviceId: string) {
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', hidden: true })
  input.addEventListener('change', () => {
    const file = input.files?.[0]
    if (file) void placeScreen(deviceId, file)
    input.remove()
  })
  document.body.append(input)
  input.click()
}

export function pasteImages(files: File[]) {
  const selected = selectedDevices()
  if (selected.length === 1) return placeScreen(selected[0].id, files[0])
  return addScreens(files)
}

// A clipboard of devices within the tool, so they paste into another place
let clipboard: Device[] = []

export function copySelection(): number {
  clipboard = selectedDevices()
  return clipboard.length
}

/** Free, on top and stepped on; in the row, after the selection */
export function pasteDevices() {
  if (clipboard.length === 0) return
  clipboard = clipboard.map((device) => ({ ...device, id: id(), x: round(device.x + 24), y: round(device.y + 24) }))
  const copies = clipboard
  change((doc) => {
    const index = doc.artboard.layout === 'row' ? afterSelection(doc) : doc.devices.length
    return { ...doc, devices: doc.devices.toSpliced(index, 0, ...copies) }
  })
  select(copies.map((device) => device.id))
}

// Guides

export function removeGuide(guideId: string) {
  change((doc) => ({ ...doc, guides: doc.guides.filter((guide) => guide.id !== guideId) }))
}

export function clearGuides() {
  change((doc) => (doc.guides.length ? { ...doc, guides: [] } : doc))
}

// Artboard

export function setArtboard(patch: Partial<Artboard>) {
  change((doc) => ({ ...doc, artboard: { ...doc.artboard, ...patch } }))
}

/** Into the row in the order they stand, from left to right, or free from where they are */
export function setLayout(layout: Layout) {
  change((doc) =>
    doc.artboard.layout === layout ? doc : { ...doc, artboard: { ...doc.artboard, layout }, devices: layout === 'row' ? byPosition(doc.devices) : doc.devices },
  )
}

export function setTheme(theme: Theme) {
  change((doc) => (doc.theme === theme ? doc : { ...doc, theme }))
}

// View

function area() {
  const { view, settings } = get()
  return visibleArea(view, settings.rulers)
}

export function fitArtboard() {
  const { artboard } = get().doc
  set({ viewport: fit({ x: 0, y: 0, width: artboard.width, height: artboard.height }, area()) })
}

export function zoomToSelection() {
  const bounds = union(selectedDevices().map(rectOf))
  if (!bounds) return fitArtboard()
  set({ viewport: fit(bounds, area()) })
}

export function zoomTo(zoom: number) {
  const { x, y, width, height } = area()
  set({ viewport: zoomAt(get().viewport, zoom, { x: x + width / 2, y: y + height / 2 }) })
}

export function zoomStep(direction: 1 | -1) {
  zoomTo(step(get().viewport.zoom, direction))
}

// Settings

export function toggle(key: 'snap' | 'objects' | 'guides' | 'rulers' | 'inspector') {
  updateSettings((settings) => ({ ...settings, [key]: !settings[key] }))
}

export function setGrid(patch: Partial<Settings['grid']>) {
  updateSettings((settings) => ({ ...settings, grid: { ...settings.grid, ...patch } }))
}

export function setColumns(patch: Partial<Settings['columns']>) {
  updateSettings((settings) => ({ ...settings, columns: { ...settings.columns, ...patch } }))
}

// Export

export async function exportImage(scale: number) {
  const blob = await renderPng(get().doc, scale)
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: scale === 1 ? 'mockup.png' : `mockup@${scale}x.png` })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
