import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type PointerEvent } from 'react'
import { DeviceView } from '../devices/device-view'
import type { Theme } from '../devices/models'
import * as actions from './actions'
import { id, rectOf, type Device, type Doc } from './document'
import { between, intersects, round, translate, union, type Axis, type Point, type Rect } from './geometry'
import { useImageUrl } from './images'
import { Overlay } from './overlay'
import { Rulers } from './rulers'
import { snapRect, snapResize, snapValue } from './snapping'
import { beginGesture, cancelGesture, endGesture, get, previewGesture, set, updateSettings, useStore, type Viewport } from './store'
import { RULER, toWorld, zoomAt } from './viewport'

export type Handle = 'nw' | 'ne' | 'sw' | 'se'

type Gesture =
  | { kind: 'pan'; pointer: number; from: Point; viewport: Viewport }
  | { kind: 'press'; pointer: number; from: Point; world: Point; id: string; wasSelected: boolean; shift: boolean }
  | { kind: 'move'; pointer: number; world: Point; rects: Map<string, Rect>; bounds: Rect; copies: Map<string, Device> | null; previous: string[] }
  | { kind: 'resize'; pointer: number; handle: Handle; rects: Map<string, Rect>; bounds: Rect }
  | { kind: 'marquee'; pointer: number; world: Point; base: string[] }
  | { kind: 'guide'; pointer: number; id: string; axis: Axis; created: boolean }

function moved(doc: Doc, rects: Map<string, Rect>, dx: number, dy: number): Doc {
  return {
    ...doc,
    devices: doc.devices.map((device) => {
      const rect = rects.get(device.id)
      return rect ? { ...device, x: round(rect.x + dx), y: round(rect.y + dy) } : device
    }),
  }
}

function scaled(doc: Doc, rects: Map<string, Rect>, from: Rect, to: Rect): Doc {
  const scale = to.width / from.width
  return {
    ...doc,
    devices: doc.devices.map((device) => {
      const rect = rects.get(device.id)
      if (!rect) return device
      return { ...device, x: round(to.x + (rect.x - from.x) * scale), y: round(to.y + (rect.y - from.y) * scale), width: round(rect.width * scale) }
    }),
  }
}

/** A clear artboard shows as a checkerboard, light or dark with the theme, at the same size at any zoom */
function artboardStyle(fill: string | null, theme: Theme, zoom: number): CSSProperties {
  if (fill) return { background: fill }
  const [a, b] = theme === 'dark' ? ['oklch(23% 0.02 140)', 'oklch(26.5% 0.02 140)'] : ['#fff', 'oklch(95.5% 0.004 130)']
  const tile = 16 / zoom
  return { background: `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / ${tile}px ${tile}px` }
}

const Placed = memo(function Placed({ device, theme }: { device: Device; theme: Theme }) {
  const screen = useImageUrl(device.screen)
  return (
    <div data-device-id={device.id} className="absolute" style={{ left: device.x, top: device.y }}>
      <DeviceView
        model={device.model}
        orientation={device.orientation}
        theme={theme}
        width={device.width}
        screen={screen}
        statusBar={device.statusBar}
        hint
      />
    </div>
  )
})

export function Canvas() {
  const element = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const doc = useStore((state) => state.doc)
  const viewport = useStore((state) => state.viewport)
  const tool = useStore((state) => state.tool)
  const spaceHeld = useStore((state) => state.spaceHeld)
  const rulers = useStore((state) => state.settings.rulers)
  const [panning, setPanning] = useState(false)

  const local = (event: { clientX: number; clientY: number }): Point => {
    const bounds = element.current!.getBoundingClientRect()
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }

  const reset = () => set({ snaps: null, marquee: null, activeGuide: null, busy: false })

  const abort = () => {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    if (current.kind === 'pan') setPanning(false)
    else if (current.kind === 'marquee') set({ selection: current.base })
    else if (current.kind !== 'press') cancelGesture()
    if (current.kind === 'move') set({ selection: current.previous })
    if (element.current?.hasPointerCapture(current.pointer)) element.current.releasePointerCapture(current.pointer)
    reset()
  }

  // Keeps the view’s size, and fits the artboard into it the first time
  useLayoutEffect(() => {
    const node = element.current
    if (!node) return
    let fitted = false
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      set({ view: { width, height } })
      if (!fitted && width > 0 && height > 0) {
        fitted = true
        actions.fitArtboard()
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Pinching, or the wheel with ctrl or ⌘, zooms; scrolling pans. Not
  // passive, so the page itself doesn’t zoom
  useEffect(() => {
    const node = element.current
    if (!node) return
    let pinching = false
    let pinchFrom = 1
    const position = (event: { clientX: number; clientY: number }) => {
      const bounds = node.getBoundingClientRect()
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      const { viewport } = get()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientHeight : 1
      if (event.ctrlKey || event.metaKey) {
        if (pinching) return
        const delta = Math.max(-25, Math.min(25, event.deltaY * unit))
        set({ viewport: zoomAt(viewport, viewport.zoom * Math.exp(-delta * 0.01), position(event)) })
        return
      }
      let dx = event.deltaX * unit
      let dy = event.deltaY * unit
      if (event.shiftKey && dx === 0) [dx, dy] = [dy, 0]
      set({ viewport: { ...viewport, x: viewport.x - dx, y: viewport.y - dy } })
    }
    // Safari pinches with gesture events instead
    const gestureStart = (event: Event) => {
      event.preventDefault()
      pinching = true
      pinchFrom = get().viewport.zoom
    }
    const gestureChange = (event: Event) => {
      event.preventDefault()
      const { scale, clientX, clientY } = event as Event & { scale: number; clientX: number; clientY: number }
      set({ viewport: zoomAt(get().viewport, pinchFrom * scale, position({ clientX, clientY })) })
    }
    const gestureEnd = () => {
      pinching = false
    }
    node.addEventListener('wheel', wheel, { passive: false })
    node.addEventListener('gesturestart', gestureStart)
    node.addEventListener('gesturechange', gestureChange)
    node.addEventListener('gestureend', gestureEnd)
    return () => {
      node.removeEventListener('wheel', wheel)
      node.removeEventListener('gesturestart', gestureStart)
      node.removeEventListener('gesturechange', gestureChange)
      node.removeEventListener('gestureend', gestureEnd)
    }
  }, [])

  // Escape lets go of a drag, putting everything back
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !gesture.current) return
      event.stopImmediatePropagation()
      abort()
    }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  })

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current) return
    const node = element.current!
    const target = event.target as Element
    const state = get()
    const screen = local(event)
    const world = toWorld(state.viewport, screen)
    const pointer = event.pointerId
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()

    if (event.button === 1 || state.spaceHeld || state.tool === 'hand') {
      event.preventDefault()
      node.setPointerCapture(pointer)
      gesture.current = { kind: 'pan', pointer, from: screen, viewport: state.viewport }
      setPanning(true)
      return
    }
    if (event.button !== 0) return

    // From a ruler, a new guide: the top one’s run across, the left one’s down
    const ruler = target.closest<HTMLElement>('[data-ruler]')
    if (ruler) {
      const axis = ruler.dataset.ruler as Axis
      const guide = { id: id(), axis, value: round(axis === 'x' ? world.x : world.y) }
      if (!state.settings.guides) updateSettings((settings) => ({ ...settings, guides: true }))
      beginGesture()
      previewGesture((doc) => ({ ...doc, guides: [...doc.guides, guide] }))
      node.setPointerCapture(pointer)
      gesture.current = { kind: 'guide', pointer, id: guide.id, axis, created: true }
      set({ activeGuide: guide.id, busy: true })
      return
    }

    const guideElement = target.closest<SVGElement>('[data-guide]')
    const guide = guideElement && state.doc.guides.find((each) => each.id === guideElement.dataset.guide)
    if (guide) {
      beginGesture()
      node.setPointerCapture(pointer)
      gesture.current = { kind: 'guide', pointer, id: guide.id, axis: guide.axis, created: false }
      set({ activeGuide: guide.id, busy: true })
      return
    }

    const handle = target.closest<SVGElement>('[data-handle]')
    const resizing = handle ? actions.movable() : []
    if (handle && resizing.length > 0) {
      const rects = new Map(resizing.map((device) => [device.id, rectOf(device)]))
      beginGesture()
      node.setPointerCapture(pointer)
      gesture.current = { kind: 'resize', pointer, handle: handle.dataset.handle as Handle, rects, bounds: union([...rects.values()])! }
      set({ busy: true, hovered: null })
      return
    }

    const deviceElement = target.closest<HTMLElement>('[data-device-id]')
    const device = deviceElement && state.doc.devices.find((each) => each.id === deviceElement.dataset.deviceId)
    if (device && !device.locked) {
      const wasSelected = state.selection.includes(device.id)
      if (!wasSelected) actions.select(event.shiftKey ? [...state.selection, device.id] : [device.id])
      node.setPointerCapture(pointer)
      gesture.current = { kind: 'press', pointer, from: screen, world, id: device.id, wasSelected, shift: event.shiftKey }
      return
    }

    node.setPointerCapture(pointer)
    const base = event.shiftKey ? state.selection : []
    if (!event.shiftKey) actions.select([])
    gesture.current = { kind: 'marquee', pointer, world, base }
    set({ busy: true, hovered: null })
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current
    const state = get()
    if (!current) {
      const hovered = (event.target as Element).closest<HTMLElement>('[data-device-id]')?.dataset.deviceId ?? null
      if (hovered !== state.hovered) set({ hovered })
      return
    }
    if (event.pointerId !== current.pointer) return
    const screen = local(event)
    const world = toWorld(state.viewport, screen)
    // ⌘ or ctrl places it freely
    const free = event.metaKey || event.ctrlKey

    switch (current.kind) {
      case 'pan': {
        const { viewport, from } = current
        set({ viewport: { ...viewport, x: viewport.x + screen.x - from.x, y: viewport.y + screen.y - from.y } })
        return
      }

      case 'press': {
        if (Math.hypot(screen.x - current.from.x, screen.y - current.from.y) < 3) return
        // Becomes a move, of copies with alt
        const ids = actions.movable().map((device) => device.id)
        const copies = event.altKey ? actions.copiesOf(state.doc, ids) : null
        const sources = state.doc.devices.filter((device) => ids.includes(device.id))
        const rects = new Map(sources.map((device) => [copies?.get(device.id)?.id ?? device.id, rectOf(device)]))
        beginGesture()
        gesture.current = { kind: 'move', pointer: current.pointer, world: current.world, rects, bounds: union([...rects.values()])!, copies, previous: state.selection }
        if (copies) set({ selection: [...rects.keys()] })
        set({ busy: true, hovered: null })
        onPointerMove(event)
        return
      }

      case 'move': {
        let dx = world.x - current.world.x
        let dy = world.y - current.world.y
        const axes = { x: true, y: true }
        if (event.shiftKey && Math.abs(dx) > Math.abs(dy)) {
          dy = 0
          axes.y = false
        } else if (event.shiftKey) {
          dx = 0
          axes.x = false
        }
        const context = free ? null : actions.snapContext(new Set(current.rects.keys()))
        if (context) {
          const snapped = snapRect(translate(current.bounds, dx, dy), context, axes)
          dx = snapped.x - current.bounds.x
          dy = snapped.y - current.bounds.y
          set({ snaps: { lines: snapped.lines, gaps: snapped.gaps } })
        } else set({ snaps: null })
        previewGesture((doc) => moved(actions.withCopies(doc, current.copies), current.rects, dx, dy))
        return
      }

      case 'resize': {
        // Along the diagonal through the handle, from the opposite corner,
        // or from the centre with alt
        const { bounds, handle } = current
        const west = handle === 'nw' || handle === 'sw'
        const north = handle === 'nw' || handle === 'ne'
        const corner = { x: west ? bounds.x : bounds.x + bounds.width, y: north ? bounds.y : bounds.y + bounds.height }
        const centre = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
        const anchor = event.altKey ? centre : { x: west ? bounds.x + bounds.width : bounds.x, y: north ? bounds.y + bounds.height : bounds.y }
        const reach = { x: corner.x - anchor.x, y: corner.y - anchor.y }
        const along = ((world.x - anchor.x) * reach.x + (world.y - anchor.y) * reach.y) / (reach.x ** 2 + reach.y ** 2)
        const scale = Math.max(along, 16 / bounds.width)
        const width = bounds.width * scale
        const height = bounds.height * scale
        let rect = event.altKey
          ? { x: centre.x - width / 2, y: centre.y - height / 2, width, height }
          : { x: west ? anchor.x - width : anchor.x, y: north ? anchor.y - height : anchor.y, width, height }
        const context = free || event.altKey ? null : actions.snapContext(new Set(current.rects.keys()))
        if (context) {
          const snapped = snapResize(rect, { x: west ? 'end' : 'start', y: north ? 'end' : 'start' }, context)
          rect = snapped.rect
          set({ snaps: { lines: snapped.lines, gaps: [] } })
        } else set({ snaps: null })
        previewGesture((doc) => scaled(doc, current.rects, bounds, rect))
        return
      }

      case 'marquee': {
        const area = between(current.world, world)
        const touched = state.doc.devices.filter((device) => actions.selectable(device) && intersects(rectOf(device), area)).map((device) => device.id)
        set({ marquee: area, selection: [...new Set([...current.base, ...touched])] })
        return
      }

      case 'guide': {
        const raw = current.axis === 'x' ? world.x : world.y
        const context = free ? null : actions.snapContext(new Set([current.id]))
        const value = round(context ? snapValue(raw, current.axis, context) : raw)
        previewGesture((doc) => {
          const exists = doc.guides.some((guide) => guide.id === current.id)
          const guides = exists
            ? doc.guides.map((guide) => (guide.id === current.id ? { ...guide, value } : guide))
            : [...doc.guides, { id: current.id, axis: current.axis, value }]
          return { ...doc, guides }
        })
        return
      }
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current
    if (!current || event.pointerId !== current.pointer) return
    gesture.current = null
    const state = get()

    switch (current.kind) {
      case 'pan':
        setPanning(false)
        break
      case 'press':
        // A click on one of several picks it alone, or with shift, lets it go
        if (current.wasSelected) actions.select(current.shift ? state.selection.filter((each) => each !== current.id) : [current.id])
        break
      case 'guide': {
        // Back over its ruler, a guide goes
        const screen = local(event)
        const overRuler = state.settings.rulers && (current.axis === 'y' ? screen.y < RULER : screen.x < RULER)
        if (overRuler && current.created) cancelGesture()
        else {
          if (overRuler) previewGesture((doc) => ({ ...doc, guides: doc.guides.filter((guide) => guide.id !== current.id) }))
          endGesture()
        }
        break
      }
      case 'marquee':
        break
      default:
        endGesture()
    }
    reset()
  }

  const onDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as Element).closest<HTMLElement>('[data-device-id]')
    const device = target && get().doc.devices.find((each) => each.id === target.dataset.deviceId)
    if (device && !device.locked) actions.chooseScreen(device.id)
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    const files = event.dataTransfer.types.includes('Files')
    if (!files && !event.dataTransfer.types.includes(actions.MODEL_TYPE)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    const target = files ? ((event.target as Element).closest<HTMLElement>('[data-device-id]')?.dataset.deviceId ?? null) : null
    if (target !== get().dropTarget) set({ dropTarget: target })
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!element.current?.contains(event.relatedTarget as Node | null)) set({ dropTarget: null })
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const target = get().dropTarget
    set({ dropTarget: null, hovered: null })
    const world = toWorld(get().viewport, local(event))
    const model = event.dataTransfer.getData(actions.MODEL_TYPE)
    if (model) {
      actions.addDevice(model, world)
      return
    }
    const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) return
    if (target) {
      void actions.placeScreen(target, files[0])
      if (files.length > 1) void actions.addScreens(files.slice(1))
    } else void actions.addScreens(files, world)
  }

  const cursor = panning ? 'grabbing' : spaceHeld || tool === 'hand' ? 'grab' : 'default'

  return (
    <div
      ref={element}
      className="relative min-h-0 min-w-0 flex-1 touch-none overflow-hidden bg-workspace select-none dark:bg-dark-workspace"
      style={{ cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={abort}
      onPointerLeave={() => !gesture.current && get().hovered && set({ hovered: null })}
      onDoubleClick={onDoubleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}>
        <div className="absolute top-0 left-0" style={{ width: doc.artboard.width, height: doc.artboard.height, ...artboardStyle(doc.artboard.fill, doc.theme, viewport.zoom) }} />
        {doc.devices.map((device) => (device.hidden ? null : <Placed key={device.id} device={device} theme={doc.theme} />))}
      </div>
      <Overlay />
      {rulers && <Rulers />}
    </div>
  )
}
