import { useEffect, useRef, useSyncExternalStore } from 'react'
import { rectOf } from './document'
import { union, type Axis } from './geometry'
import { useStore } from './store'
import { RULER } from './viewport'

const system = window.matchMedia('(prefers-color-scheme: dark)')

/** Changes when the page turns light or dark, by the system or by the appearance set on the root */
function useScheme() {
  return useSyncExternalStore(
    (listener) => {
      system.addEventListener('change', listener)
      const observer = new MutationObserver(listener)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
      return () => {
        system.removeEventListener('change', listener)
        observer.disconnect()
      }
    },
    () => `${document.documentElement.style.colorScheme}${system.matches}`,
  )
}

// A canvas draws with colours, not classes, so the library’s tokens are resolved through the ruler itself
const tokens = {
  background: 'var(--color-panel)',
  edge: 'color-mix(in oklab, var(--bleed) 12%, transparent)',
  tick: 'color-mix(in oklab, var(--bleed) 40%, transparent)',
  text: 'var(--color-muted)',
  band: 'color-mix(in oklab, var(--color-avocado) 20%, transparent)',
  guide: 'var(--color-tango)',
}

type Palette = typeof tokens

function resolve(element: HTMLElement): Palette {
  const resolved = { ...tokens }
  for (const key of Object.keys(tokens) as (keyof Palette)[]) {
    element.style.color = tokens[key]
    resolved[key] = getComputedStyle(element).color
  }
  element.style.color = ''
  return resolved
}

const spacings = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]

/** Labels at least 56 apart on screen, with ticks between in tens, quarters or fifths */
function scaleFor(zoom: number) {
  const spacing = spacings.find((each) => each * zoom >= 56) ?? spacings.at(-1)!
  const lead = spacing / 10 ** Math.floor(Math.log10(spacing))
  return { spacing, divisions: lead === 1 ? 10 : lead === 2 ? 4 : 5 }
}

const label = (value: number) => (value < 0 ? `−${-value}` : String(value))

function draw(
  canvas: HTMLCanvasElement,
  axis: Axis,
  length: number,
  offset: number,
  zoom: number,
  band: [number, number] | null,
  guides: number[],
  colours: Palette,
) {
  const ratio = window.devicePixelRatio || 1
  const along = axis === 'x'
  const width = along ? length : RULER
  const height = along ? RULER : length
  canvas.width = Math.max(1, Math.round(width * ratio))
  canvas.height = Math.max(1, Math.round(height * ratio))
  const context = canvas.getContext('2d')
  if (!context) return
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.fillStyle = colours.background
  context.fillRect(0, 0, width, height)

  const at = (value: number) => Math.round(value * zoom + offset)
  const bar = (position: number, from: number, size: number) =>
    along ? context.fillRect(position, from, 1, size) : context.fillRect(from, position, size, 1)

  if (band) {
    context.fillStyle = colours.band
    const [from, to] = [at(band[0]), at(band[1])]
    if (along) context.fillRect(from, 0, to - from, height)
    else context.fillRect(0, from, width, to - from)
  }

  const { spacing, divisions } = scaleFor(zoom)
  const step = spacing / divisions
  context.font = `500 10px ${getComputedStyle(document.body).fontFamily}`
  context.textBaseline = 'top'
  for (let index = Math.floor(-offset / zoom / step); index * step * zoom + offset <= length; index++) {
    const position = at(index * step)
    const major = index % divisions === 0
    context.fillStyle = colours.tick
    bar(position, major ? RULER / 2 : RULER * 0.75, major ? RULER / 2 : RULER / 4)
    if (!major) continue
    context.fillStyle = colours.text
    const text = label(Math.round(index * step))
    if (along) context.fillText(text, position + 3, 3)
    else {
      context.save()
      context.translate(3, position - 3)
      context.rotate(-Math.PI / 2)
      context.fillText(text, 0, 0)
      context.restore()
    }
  }

  context.fillStyle = colours.guide
  for (const guide of guides) bar(at(guide), 0, RULER)

  context.fillStyle = colours.edge
  if (along) context.fillRect(0, height - 1, width, 1)
  else context.fillRect(width - 1, 0, 1, height)
}

/**
 * The artboard’s units along the top and down the side, with the selection’s
 * extent shaded and guides marked. Dragging from one makes a guide
 */
export function Rulers() {
  const viewport = useStore((state) => state.viewport)
  const view = useStore((state) => state.view)
  const doc = useStore((state) => state.doc)
  const selection = useStore((state) => state.selection)
  const scheme = useScheme()
  const top = useRef<HTMLCanvasElement>(null)
  const side = useRef<HTMLCanvasElement>(null)
  const across = Math.max(0, view.width - RULER)
  const down = Math.max(0, view.height - RULER)

  useEffect(() => {
    const bounds = union(doc.devices.filter((device) => selection.includes(device.id)).map(rectOf))
    if (!top.current) return
    const colours = resolve(top.current)
    const guides = (axis: Axis) => doc.guides.filter((guide) => guide.axis === axis).map((guide) => guide.value)
    if (top.current) draw(top.current, 'x', across, viewport.x - RULER, viewport.zoom, bounds && [bounds.x, bounds.x + bounds.width], guides('x'), colours)
    if (side.current) draw(side.current, 'y', down, viewport.y - RULER, viewport.zoom, bounds && [bounds.y, bounds.y + bounds.height], guides('y'), colours)
  }, [viewport, across, down, doc, selection, scheme])

  return (
    <>
      <canvas ref={top} data-ruler="y" title="Drag down for a guide" className="absolute top-0 left-5 cursor-row-resize" style={{ width: across, height: RULER }} />
      <canvas ref={side} data-ruler="x" title="Drag across for a guide" className="absolute top-5 left-0 cursor-col-resize" style={{ width: RULER, height: down }} />
      <div className="absolute top-0 left-0 size-5 border-r border-b border-bleed/12 bg-panel" />
    </>
  )
}
