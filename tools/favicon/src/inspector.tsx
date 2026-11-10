import { Button, ListBoxItem, Select, Slider, Switch } from '@parchment/ui'
import { useId, type Dispatch, type SetStateAction } from 'react'
import { useFrame } from './frames'
import { describeSource, fileNameFor } from './outputs'
import { settingsFor } from './render.js'
import type { Art, Output, Override } from './types'
import { checker } from './ui'

interface InspectorProps {
  output: Output
  art: Art
  setArt: Dispatch<SetStateAction<Art>>
  onSave: (filename: string) => void
}

export function Inspector({ output, art, setArt, onSave }: InspectorProps) {
  const lockedNote = useId()
  const settings: Required<Override> = settingsFor(output, art)
  const fileName = fileNameFor(output)
  const isIos = output.kind === 'ios'

  const setOverride = (change: Override) =>
    setArt((current) => ({ ...current, overrides: { ...current.overrides, [output.id]: { ...current.overrides[output.id], ...change } } }))
  const reset = () =>
    setArt((current) => {
      const overrides = { ...current.overrides }
      delete overrides[output.id]
      return { ...current, overrides }
    })

  const choices = [{ id: 'auto', name: output.kind === 'og' && art.og.source ? 'Open Graph image' : 'Closest size' }, ...art.sources.map(({ id, name }) => ({ id, name }))]

  return (
    <>
      <h2 className="text-base font-medium">
        {output.label}
        {output.note && ` · ${output.note}`}
      </h2>
      <canvas
        key={output.id}
        ref={useFrame(output.id)}
        width={output.w}
        height={output.h}
        className={`block h-auto w-full max-w-80 rounded-lg border border-bleed/8 ${checker} ${output.w <= 64 ? '[image-rendering:pixelated]' : ''}`}
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-label">
        <dt className="text-muted">Size</dt>
        <dd className="font-mono">
          {output.w} × {output.h}
        </dd>
        <dt className="text-muted">Artwork</dt>
        <dd className="wrap-anywhere">{describeSource(output, art) || 'None'}</dd>
      </dl>
      {isIos ? (
        <p className="text-label text-muted">
          {output.appearance === 'light'
            ? 'Change layers and the background in iOS layers. Icon Composer adds the glass, so this is a flat preview.'
            : `A flat preview of the ${output.appearance} appearance. Icon Composer works this out from the layers.`}
        </p>
      ) : (
        <>
          <Slider label="Padding" value={settings.pad} minValue={0} maxValue={0.4} step={0.01} formatOptions={{ style: 'percent' }} onChange={(pad) => setOverride({ pad })} />
          <div className="flex flex-col gap-1">
            <Switch isSelected={settings.bg} isDisabled={output.lockBg} aria-describedby={output.lockBg ? lockedNote : undefined} onChange={(bg) => setOverride({ bg })}>
              Background
            </Switch>
            {output.lockBg && (
              <p id={lockedNote} className="text-label text-muted">
                Always on for this file
              </p>
            )}
          </div>
          <Select label="Artwork" items={choices} value={settings.source} onChange={(key) => key != null && setOverride({ source: String(key) })}>
            {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
          </Select>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {!isIos && art.overrides[output.id] && (
          <Button variant="plain" size="small" onPress={reset}>
            Reset
          </Button>
        )}
        {!output.id.startsWith('favicon') && (
          <Button variant="plain" size="small" onPress={() => onSave(fileName)}>
            Save {fileName}
          </Button>
        )}
      </div>
    </>
  )
}
