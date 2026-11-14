import { Button, GridList, GridListItem, Switch, tv } from '@parchment/ui'
import { useEffect, useId, useRef, useState } from 'react'
import { headHtml } from './files'
import { useFrame } from './frames'
import { describeSource, displayWidth, groups, warningFor } from './outputs'
import type { Art, Output, Site } from './types'
import { checker } from './ui'

const heading = 'text-base font-medium'

interface CanvasProps {
  art: Art
  site: Site
  selected: string
  onSelect: (id: string) => void
}

export function Canvas({ art, site, selected, onSelect }: CanvasProps) {
  const [showMasks, setShowMasks] = useState(true)
  const id = useId()
  return (
    <>
      <Switch isSelected={showMasks} onChange={setShowMasks} className="self-start">
        Show masks
      </Switch>
      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-3.5">
          <h2 id={`${id}-${group.id}`} className={heading}>
            {group.title}
          </h2>
          <GridList
            aria-labelledby={`${id}-${group.id}`}
            layout="grid"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={group.outputs.some((output) => output.id === selected) ? [selected] : []}
            onSelectionChange={(keys) => {
              const [key] = keys === 'all' ? [] : keys
              if (key != null) onSelect(String(key))
            }}
            className="flex flex-wrap items-end gap-x-6 gap-y-7"
          >
            {group.outputs.map((output) => (
              <Board key={output.id} output={output} art={art} showMasks={showMasks} />
            ))}
          </GridList>
        </section>
      ))}
      <HeadCode code={headHtml(art, site)} />
    </>
  )
}

// A board is a tile without the tile’s own frame, as its art carries one, which shows it’s chosen
const tile = 'max-w-full items-start border-0 p-0 shadow-none'
const artFrame = `flex max-w-full items-end gap-3 rounded-lg border border-bleed/8 p-2.5 group-data-[hovered]/item:border-bleed/24 group-data-[selected]/item:outline-2 group-data-[selected]/item:-outline-offset-1 group-data-[selected]/item:outline-ink ${checker}`

interface BoardProps {
  output: Output
  art: Art
  showMasks: boolean
}

function Board({ output, art, showMasks }: BoardProps) {
  const source = describeSource(output, art)
  const warning = warningFor(output, art)
  const mask = showMasks ? output.mask : undefined
  return (
    <GridListItem id={output.id} textValue={output.label} className={tile}>
      <span className={artFrame}>
        <Frame output={output} width={displayWidth(output)} mask={mask} />
        {output.w <= 64 && <Frame output={output} width={output.w * 4} isZoomed />}
      </span>
      <span className="flex flex-col gap-px">
        <span className="font-medium">
          {output.label}
          {output.note && <span className="font-mono text-label font-normal text-muted"> · {output.note}</span>}
        </span>
        <span className="font-mono text-label text-muted">
          {output.w} × {output.h}
        </span>
        {source && <span className="font-mono text-label text-muted">{source}</span>}
        {warning && <span className="text-label text-danger">{warning}</span>}
      </span>
    </GridListItem>
  )
}

const frame = tv({
  slots: {
    base: 'relative block max-w-full',
    canvas: 'block h-auto max-w-full',
  },
  variants: {
    mask: {
      ios: { canvas: 'rounded-[22.37%]' },
      maskable: { base: 'overflow-hidden' },
    },
    isZoomed: {
      true: { canvas: '[image-rendering:pixelated]' },
    },
  },
})

function Frame({ output, width, mask, isZoomed }: { output: Output; width: number; mask?: string; isZoomed?: boolean }) {
  const slots = frame({ mask: mask as 'ios' | 'maskable' | undefined, isZoomed })
  return (
    <span className={slots.base()}>
      <canvas ref={useFrame(output.id)} width={output.w} height={output.h} style={{ width }} className={slots.canvas()} />
      {mask === 'maskable' && (
        <span className="pointer-events-none absolute inset-[10%] rounded-full shadow-[0_0_0_999px_color-mix(in_oklab,var(--color-paper)_55%,transparent)] outline outline-ink outline-dashed" />
      )}
    </span>
  )
}

function HeadCode({ code }: { code: string }) {
  const [label, setLabel] = useState('Copy')
  const pre = useRef<HTMLPreElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setLabel('Copied')
    } catch {
      if (pre.current) getSelection()?.selectAllChildren(pre.current)
      setLabel('Selected')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLabel('Copy'), 1500)
  }

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className={heading}>HTML</h2>
        <Button variant="secondary" size="small" onPress={copy}>
          {label}
        </Button>
      </div>
      <pre ref={pre} className="overflow-x-auto rounded-lg border border-bleed/8 bg-panel px-4 py-3.5 font-mono text-label leading-relaxed">
        {code}
      </pre>
    </section>
  )
}
