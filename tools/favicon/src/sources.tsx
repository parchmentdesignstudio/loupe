import type { IconName } from '@parchment/icons'
import { Icon } from '@parchment/icons/react'
import { Button, type ButtonProps, ColorPicker, type ColorPickerProps, DropZone, FileTrigger, NumberField, Slider, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger } from '@parchment/ui'
import { useId, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { usesOf } from './outputs'
import type { Art, Layer, Override, Site, Source, Target } from './types'
import { checker, fieldLabel, filesFrom } from './ui'

const section = 'flex flex-col gap-2.5 border-b border-bleed/8 py-4.5 pr-[max(--spacing(4),env(safe-area-inset-right,0px))] pl-[max(--spacing(4),env(safe-area-inset-left,0px))]'
const heading = 'text-base font-medium'
const hint = 'text-label text-muted'

interface SourcesProps {
  art: Art
  site: Site
  setArt: Dispatch<SetStateAction<Art>>
  setSite: Dispatch<SetStateAction<Site>>
  onAdd: (files: File[] | FileList | null, target: Target) => void
}

export function Sources({ art, site, setArt, setSite, onAdd }: SourcesProps) {
  const fillLabel = useId()

  const resize = (id: string, size: number) => setArt((current) => ({ ...current, sources: current.sources.map((source) => (source.id === id ? { ...source, size } : source)) }))
  const remove = (id: string) => setArt((current) => ({ ...current, sources: current.sources.filter((source) => source.id !== id), overrides: forget(current.overrides, id) }))
  const setLayers = (change: (list: Layer[]) => Layer[]) => setArt((current) => ({ ...current, ios: { ...current.ios, layers: change(current.ios.layers) } }))
  const changeLayer = (id: string, change: Partial<Layer>) => setLayers((list) => list.map((layer) => (layer.id === id ? { ...layer, ...change } : layer)))
  const move = (index: number, by: number) =>
    setLayers((list) => {
      const next = [...list]
      ;[next[index], next[index + by]] = [next[index + by], next[index]]
      return next
    })

  const og = art.og.source
  const layers = art.ios.layers

  return (
    <>
      <DropZone variant="quiet" aria-label="Drop artwork" onDrop={(event) => void filesFrom(event).then((files) => onAdd(files, 'artwork'))} className={section}>
        <SectionHead title="Artwork">
          <FileTrigger acceptedFileTypes={['.svg', 'image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']} allowsMultiple onSelect={(files) => onAdd(files, 'artwork')}>
            <Button variant="secondary" size="small">
              Add
            </Button>
          </FileTrigger>
        </SectionHead>
        <p className={hint}>Each output uses the artwork drawn closest above its size. Add a 16 or 32px drawing to replace the scaled one.</p>
        <ul className="flex flex-col gap-1.5">
          {art.sources.length === 0 && <Empty>Drop an SVG or a large PNG</Empty>}
          {art.sources
            .toSorted((a, b) => b.size - a.size)
            .map((source) => {
              const uses = usesOf(source, art)
              return (
                <Row key={source.id} source={source} actions={<IconButton icon="xmark" label={`Remove ${source.name}`} tooltip="Remove" onPress={() => remove(source.id)} />}>
                  <span className="flex items-center gap-2">
                    Drawn at
                    <NumberField
                      aria-label={`Size ${source.name} is drawn at`}
                      value={source.size}
                      minValue={1}
                      maxValue={4096}
                      step={1}
                      formatOptions={{ useGrouping: false }}
                      onChange={(size) => size > 0 && resize(source.id, size)}
                      className="w-28"
                    />
                    px
                  </span>
                  {uses.length ? (
                    <ul aria-label="Sizes this artwork makes" title="Sizes this artwork makes" className="flex flex-wrap gap-1">
                      {uses.map((size) => (
                        <li key={size} className="rounded-lg bg-bleed/8 px-1.5 font-mono text-ink">
                          {size}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>Not used</span>
                  )}
                </Row>
              )
            })}
        </ul>
      </DropZone>

      <DropZone variant="quiet" aria-label="Drop an Open Graph image" onDrop={(event) => void filesFrom(event).then((files) => onAdd(files, 'og'))} className={section}>
        <SectionHead title="Open Graph image">
          <FileTrigger acceptedFileTypes={['image/*', '.svg']} onSelect={(files) => onAdd(files, 'og')}>
            <Button variant="secondary" size="small">
              Choose
            </Button>
          </FileTrigger>
        </SectionHead>
        {og ? (
          <ul className="flex flex-col gap-1.5">
            <Row
              source={og}
              actions={<IconButton icon="xmark" label={`Remove ${og.name}`} tooltip="Remove" onPress={() => setArt((current) => ({ ...current, og: { source: null } }))} />}
            >
              <span className="font-mono">
                {og.width} × {og.height}
                {(og.width < 1200 || og.height < 630) && <span className="text-danger"> smaller than 1200 × 630</span>}
              </span>
            </Row>
          </ul>
        ) : (
          <p className={hint}>Without one, the artwork is placed on the background colour.</p>
        )}
      </DropZone>

      <DropZone variant="quiet" aria-label="Drop iOS layers" onDrop={(event) => void filesFrom(event).then((files) => onAdd(files, 'layers'))} className={section}>
        <SectionHead title="iOS layers">
          <FileTrigger acceptedFileTypes={['.svg', 'image/svg+xml', 'image/png']} allowsMultiple onSelect={(files) => onAdd(files, 'layers')}>
            <Button variant="secondary" size="small">
              Add
            </Button>
          </FileTrigger>
        </SectionHead>
        <p className={hint}>Front first, up to four. Draw each on the same 1024 canvas.</p>
        <ul className="flex flex-col gap-1.5">
          {layers.length === 0 && <Empty>{art.sources.length ? 'Using the artwork as one layer' : 'Drop up to four layers'}</Empty>}
          {layers.map((layer, index) => (
            <Row
              key={layer.id}
              source={layer.source}
              actions={
                <>
                  <IconButton icon="arrow-up" label="Move forward" isDisabled={index === 0} onPress={() => move(index, -1)} />
                  <IconButton icon="arrow-down" label="Move back" isDisabled={index === layers.length - 1} onPress={() => move(index, 1)} />
                  <IconButton icon="xmark" label={`Remove ${layer.source.name}`} tooltip="Remove" onPress={() => setLayers((list) => list.filter((each) => each.id !== layer.id))} />
                </>
              }
            >
              <Switch isSelected={layer.glass} onChange={(glass) => changeLayer(layer.id, { glass })}>
                Glass
              </Switch>
              <Slider
                label="Size"
                thumbLabels={[layer.source.name]}
                value={layer.scale}
                minValue={0.1}
                maxValue={1.5}
                step={0.01}
                formatOptions={{ style: 'percent' }}
                onChange={(scale) => changeLayer(layer.id, { scale })}
                className="basis-full"
              />
            </Row>
          ))}
        </ul>
        <div className="flex flex-col gap-1.5">
          <span id={fillLabel} className={fieldLabel}>
            Background
          </span>
          <ToggleButtonGroup
            aria-labelledby={fillLabel}
            selectedKeys={[art.ios.fill]}
            onSelectionChange={(keys) => {
              const [fill] = keys
              if (fill) setArt((current) => ({ ...current, ios: { ...current.ios, fill: String(fill) } }))
            }}
          >
            <ToggleButton id="gradient">Automatic gradient</ToggleButton>
            <ToggleButton id="solid">Solid</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </DropZone>

      <section className={section}>
        <h2 className={heading}>Site</h2>
        <TextField label="Name" value={site.name} onChange={(name) => setSite((current) => ({ ...current, name }))} />
        <TextField label="Short name" value={site.short} onChange={(short) => setSite((current) => ({ ...current, short }))} />
        <TextField label="URL" type="url" value={site.url} onChange={(url) => setSite((current) => ({ ...current, url }))} />
        <div className="grid grid-cols-2 gap-2.5">
          <ColorPicker label="Background" defaultValue={art.background} onChange={(color) => setArt((current) => ({ ...current, background: hex(color) }))} />
          <ColorPicker label="Theme" defaultValue={site.theme} onChange={(color) => setSite((current) => ({ ...current, theme: hex(color) }))} />
        </div>
      </section>
    </>
  )
}

// Lowercase, as it’s written into the manifest and head. The pickers keep their own colour, so a grey keeps its hue
const hex = (color: Parameters<NonNullable<ColorPickerProps['onChange']>>[0]) => color.toString('hex').toLowerCase()

// An output set to a source that’s gone goes back to the closest size
function forget(overrides: Record<string, Override>, id: string) {
  const next: Record<string, Override> = {}
  for (const [output, override] of Object.entries(overrides)) {
    const { source, ...rest } = override
    const kept = source === id ? rest : override
    if (Object.keys(kept).length) next[output] = kept
  }
  return next
}

function SectionHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className={heading}>{title}</h2>
      {children}
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <li className="rounded-lg border border-dashed border-bleed/16 p-3.5 text-center text-label text-muted">{children}</li>
}

function Row({ source, actions, children }: { source: Source; actions: ReactNode; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 rounded-lg border border-bleed/8 p-2">
      <img src={source.preview.src} alt="" className={`size-10 rounded-sm object-contain ${checker}`} />
      <span title={source.name} className="truncate font-medium">
        {source.name}
      </span>
      <span className="flex">{actions}</span>
      <div className="col-span-full flex flex-wrap items-center gap-x-2.5 gap-y-2 text-label text-muted">{children}</div>
    </li>
  )
}

function IconButton({ icon, label, tooltip = label, ...props }: Omit<ButtonProps, 'children'> & { icon: IconName; label: string; tooltip?: string }) {
  return (
    <TooltipTrigger delay={300}>
      <Button variant="ghost" shape="circle" size="small" aria-label={label} {...props}>
        <Icon name={icon} />
      </Button>
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  )
}
