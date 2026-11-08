import type { CSSProperties, ReactNode } from 'react'
import { cx, format } from '../ui/controls'
import type { Handle } from './canvas'
import { columnEdges, rectOf } from './document'
import { union, type Rect } from './geometry'
import type { SnapLine } from './snapping'
import { useStore } from './store'

const HANDLE = 8

function Label({ className, style, children }: { className: string; style: CSSProperties; children: ReactNode }) {
  return (
    <span className={cx('absolute rounded px-1 py-px leading-4 whitespace-nowrap', className)} style={style}>
      {children}
    </span>
  )
}

// Everything over the artboard drawn at the screen’s size, so lines stay a
// pixel wide at any zoom: what’s cut off beyond the artboard, the grid,
// columns and guides, then the selection and what a drag is snapping to
export function Overlay() {
  const doc = useStore((state) => state.doc)
  const viewport = useStore((state) => state.viewport)
  const view = useStore((state) => state.view)
  const selection = useStore((state) => state.selection)
  const hovered = useStore((state) => state.hovered)
  const dropTarget = useStore((state) => state.dropTarget)
  const snaps = useStore((state) => state.snaps)
  const marquee = useStore((state) => state.marquee)
  const settings = useStore((state) => state.settings)
  const busy = useStore((state) => state.busy)
  const activeGuide = useStore((state) => state.activeGuide)

  const { zoom } = viewport
  const sx = (x: number) => x * zoom + viewport.x
  const sy = (y: number) => y * zoom + viewport.y
  const crisp = (value: number) => Math.round(value) + 0.5
  const box = (rect: Rect) => {
    const x = crisp(sx(rect.x))
    const y = crisp(sy(rect.y))
    return { x, y, width: Math.max(0, crisp(sx(rect.x + rect.width)) - x), height: Math.max(0, crisp(sy(rect.y + rect.height)) - y) }
  }

  const { width: W, height: H } = view
  const artboard = { x: 0, y: 0, width: doc.artboard.width, height: doc.artboard.height }
  const board = box(artboard)
  const selected = doc.devices.filter((device) => selection.includes(device.id))
  const bounds = union(selected.map(rectOf))
  const hover = !busy && hovered && !selection.includes(hovered) ? doc.devices.find((device) => device.id === hovered) : undefined
  const drop = dropTarget ? doc.devices.find((device) => device.id === dropTarget) : undefined
  const guide = activeGuide ? doc.guides.find((each) => each.id === activeGuide) : undefined

  // The grid, over what’s in view of the artboard, with every eighth line stronger
  const grid = { minor: '', major: '' }
  const pitch = settings.grid.size * zoom
  if (settings.grid.visible && pitch * 8 >= 6) {
    const size = settings.grid.size
    const left = Math.max(0, -viewport.x / zoom)
    const right = Math.min(artboard.width, (W - viewport.x) / zoom)
    const top = Math.max(0, -viewport.y / zoom)
    const bottom = Math.min(artboard.height, (H - viewport.y) / zoom)
    for (let index = Math.ceil(left / size); index * size <= right; index++) {
      const line = `M${crisp(sx(index * size))} ${sy(top)}V${sy(bottom)}`
      if (index % 8 === 0) grid.major += line
      else if (pitch >= 6) grid.minor += line
    }
    for (let index = Math.ceil(top / size); index * size <= bottom; index++) {
      const line = `M${sx(left)} ${crisp(sy(index * size))}H${sx(right)}`
      if (index % 8 === 0) grid.major += line
      else if (pitch >= 6) grid.minor += line
    }
  }

  const span = (line: SnapLine): [number, number] => {
    const vertical = line.axis === 'x'
    if (line.from !== null && line.to !== null) return vertical ? [sy(line.from), sy(line.to)] : [sx(line.from), sx(line.to)]
    if (line.kind === 'column') return vertical ? [board.y, board.y + board.height] : [board.x, board.x + board.width]
    return [0, vertical ? H : W]
  }

  const outline = bounds ? box(bounds) : null
  const handles: [Handle, number, number][] = outline
    ? [
        ['nw', outline.x, outline.y],
        ['ne', outline.x + outline.width, outline.y],
        ['sw', outline.x, outline.y + outline.height],
        ['se', outline.x + outline.width, outline.y + outline.height],
      ]
    : []

  return (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
        <path
          d={`M0 0H${W}V${H}H0Z M${board.x} ${board.y}h${board.width}v${board.height}h${-board.width}Z`}
          fillRule="evenodd"
          className="fill-workspace/80 dark:fill-dark-workspace/80"
        />
        <rect {...board} className="fill-none stroke-olive-300 dark:stroke-olive-700" />

        {grid.minor && <path d={grid.minor} className="stroke-olive-500/25" />}
        {grid.major && <path d={grid.major} className="stroke-olive-500/50" />}

        {settings.columns.visible &&
          columnEdges(doc.artboard, settings.columns).map((column) => (
            <rect key={column.x} x={sx(column.x)} y={board.y} width={column.width * zoom} height={board.height} className="fill-thulian/12" />
          ))}

        {settings.guides &&
          doc.guides.map((each) => {
            const vertical = each.axis === 'x'
            const at = crisp(vertical ? sx(each.value) : sy(each.value))
            const line = vertical ? { x1: at, y1: 0, x2: at, y2: H } : { x1: 0, y1: at, x2: W, y2: at }
            return (
              <g key={each.id}>
                <line {...line} className="stroke-tango" />
                <line {...line} data-guide={each.id} stroke="transparent" strokeWidth={9} pointerEvents="stroke" className={vertical ? 'cursor-col-resize' : 'cursor-row-resize'} />
              </g>
            )
          })}

        {drop && <rect {...box(rectOf(drop))} strokeWidth={2} className="fill-avocado/10 stroke-avocado" />}
        {hover && <rect {...box(rectOf(hover))} className="fill-none stroke-avocado" />}
        {selected.map((device) => (
          <rect key={device.id} {...box(rectOf(device))} className="fill-none stroke-avocado" />
        ))}
        {outline && selected.length > 1 && <rect {...outline} className="fill-none stroke-avocado" />}

        {snaps?.lines.map((line, index) => {
          const vertical = line.axis === 'x'
          const at = crisp(vertical ? sx(line.value) : sy(line.value))
          const [from, to] = span(line)
          return <line key={index} x1={vertical ? at : from} y1={vertical ? from : at} x2={vertical ? at : to} y2={vertical ? to : at} className="stroke-thulian" />
        })}
        {snaps?.gaps.map((gap, index) => {
          const across = gap.axis === 'x'
          const from = across ? sx(gap.from) : sy(gap.from)
          const to = across ? sx(gap.to) : sy(gap.to)
          const at = crisp(across ? sy(gap.at) : sx(gap.at))
          const tick = (value: number) =>
            across ? `M${crisp(value)} ${at - 4}V${at + 4}` : `M${at - 4} ${crisp(value)}H${at + 4}`
          const d = (across ? `M${from} ${at}H${to}` : `M${at} ${from}V${to}`) + tick(from) + tick(to)
          return <path key={index} d={d} className="stroke-thulian" />
        })}

        {marquee && <rect {...box(marquee)} className="fill-avocado/8 stroke-avocado" />}

        {handles.map(([handle, x, y]) => (
          <rect
            key={handle}
            data-handle={handle}
            x={Math.round(x - HANDLE / 2) + 0.5}
            y={Math.round(y - HANDLE / 2) + 0.5}
            width={HANDLE}
            height={HANDLE}
            className={cx('pointer-events-auto fill-white stroke-avocado', handle === 'nw' || handle === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize')}
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 overflow-hidden text-[11px] font-medium tabular-nums">
        <span className="absolute whitespace-nowrap text-olive-975/60 dark:text-pearl/60" style={{ left: board.x, top: board.y - 22 }}>
          Artboard <span className="opacity-70">{doc.artboard.width} × {doc.artboard.height}</span>
        </span>

        {outline && (
          <Label className="bg-avocado-dark text-white" style={{ left: outline.x + outline.width / 2, top: outline.y + outline.height + 8, translate: '-50% 0' }}>
            {format(bounds!.width)} × {format(bounds!.height)}
          </Label>
        )}

        {snaps?.gaps.map((gap, index) => {
          const across = gap.axis === 'x'
          const middle = across ? sx((gap.from + gap.to) / 2) : sy((gap.from + gap.to) / 2)
          const at = across ? sy(gap.at) : sx(gap.at)
          const style: CSSProperties = across
            ? { left: middle, top: at + 6, translate: '-50% 0' }
            : { left: at + 6, top: middle, translate: '0 -50%' }
          return (
            <Label key={index} className="bg-thulian text-olive-975" style={style}>
              {format(gap.to - gap.from)}
            </Label>
          )
        })}

        {guide && (
          <Label
            className="bg-tango text-olive-975"
            style={guide.axis === 'x' ? { left: sx(guide.value) + 6, top: 26 } : { left: 26, top: sy(guide.value) + 6 }}
          >
            {format(guide.value)}
          </Label>
        )}
      </div>
    </>
  )
}
