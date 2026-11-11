import { Button, DropZone, Link, ToastQueue, ToastRegion } from '@parchment/ui'
import { useEffect, useState } from 'react'
import { AppearanceMenu } from './appearance'
import { Canvas } from './canvas'
import { exportZip, saveOutput } from './files'
import { draw } from './frames'
import { Inspector } from './inspector'
import { outputs } from './outputs'
import { loadSource } from './render.js'
import { SAMPLES, sampleFile } from './sample.js'
import { Sources } from './sources'
import type { Art, Layer, Site, Source, Target } from './types'
import { filesFrom } from './ui'

const gutter = 'pr-[max(--spacing(4),env(safe-area-inset-right,0px))] pl-[max(--spacing(4),env(safe-area-inset-left,0px))]'

const asLayer = (source: Source): Layer => ({ id: source.id, source, scale: 1, glass: true })

const load = (files: File[]) => Promise.all(files.map(loadSource)) as Promise<Source[]>

const toasts = new ToastQueue()

/** A file saved, or one that wouldn’t load, as a toast */
const notify = (title: string) => {
  if (title) toasts.add({ title })
}

export function App() {
  const [art, setArt] = useState<Art>({ sources: [], og: { source: null }, ios: { layers: [], fill: 'gradient' }, background: '#f1efe6', overrides: {} })
  const [site, setSite] = useState<Site>({ name: 'Parchment', short: 'Parchment', url: 'https://parchment.studio', theme: '#0f3d30' })
  const [selected, setSelected] = useState('apple-touch')
  const [isExporting, setExporting] = useState(false)

  // Opens with example artwork, marked by its file names, so every output shows something.
  // Removing them leaves a clean slate
  useEffect(() => {
    let ignore = false
    Promise.all([load(SAMPLES.artwork.map(sampleFile)), load(SAMPLES.layers.map(sampleFile))]).then(
      ([sources, layers]) => {
        if (!ignore) setArt((current) => ({ ...current, sources, ios: { ...current.ios, layers: layers.map(asLayer) } }))
      },
      (error: Error) => {
        if (!ignore) notify(error.message)
      },
    )
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => void draw(art), 60)
    return () => clearTimeout(timer)
  }, [art])

  async function add(files: File[] | FileList | null, target: Target) {
    const list = [...(files ?? [])].filter((file) => file.type.startsWith('image/') || /\.svg$/i.test(file.name))
    if (!list.length) return
    try {
      const loaded = await load(list)
      if (target === 'artwork') setArt((current) => ({ ...current, sources: [...current.sources, ...loaded] }))
      if (target === 'og') setArt((current) => ({ ...current, og: { source: loaded[0] } }))
      if (target === 'layers') {
        if (loaded.length > 4 - art.ios.layers.length) notify('iOS icons take up to four layers')
        setArt((current) => ({ ...current, ios: { ...current.ios, layers: [...current.ios.layers, ...loaded.slice(0, 4 - current.ios.layers.length).map(asLayer)] } }))
      }
    } catch (error) {
      notify((error as Error).message)
    }
  }

  async function startExport() {
    if (!art.sources.length) {
      notify('Add some artwork first')
      return
    }
    setExporting(true)
    try {
      await exportZip(art, site, notify)
    } catch (error) {
      notify((error as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const output = outputs.find((each) => each.id === selected) ?? outputs[0]

  return (
    <div className="flex flex-col before:fixed before:inset-x-0 before:top-0 before:z-10 before:h-[env(safe-area-inset-top,0px)] before:bg-ground md:grid md:h-full md:grid-cols-[280px_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)_auto] md:before:hidden wide:grid-cols-[300px_minmax(0,1fr)_260px] wide:grid-rows-[auto_minmax(0,1fr)]">
      <header className={`sticky top-[env(safe-area-inset-top,0px)] z-5 flex items-center justify-between gap-4 bg-ground py-3 md:static md:col-span-full ${gutter}`}>
        <h1 className="text-title font-medium">Favicon</h1>
        <div className="flex items-center gap-4">
          <nav>
            <Link href="reference.html">Reference</Link>
          </nav>
          <Button isPending={isExporting} onPress={startExport}>
            Export zip
          </Button>
          <AppearanceMenu />
        </div>
      </header>

      <aside aria-label="Sources" className="relative order-2 border-t border-bleed/8 md:order-none md:col-start-1 md:row-span-2 md:row-start-2 md:overflow-y-auto md:border-t-0 wide:row-span-1">
        <Sources art={art} site={site} setArt={setArt} setSite={setSite} onAdd={add} />
      </aside>

      {/* The canvas is a card on the ground, as the library’s preview has its pages, with the columns beside it */}
      <main className="relative order-1 bg-panel [--bleed:var(--panel-bleed)] md:col-start-2 md:row-start-2 md:mr-2 md:mb-2 md:overflow-auto md:rounded-xl md:shadow-raised wide:mr-0">
        <DropZone
          variant="quiet"
          aria-label="Drop artwork onto the canvas"
          onDrop={(event) => void filesFrom(event).then((files) => add(files, 'artwork'))}
          className={`flex min-h-full flex-col gap-8 pt-5 pb-12 md:px-6 ${gutter}`}
        >
          <Canvas art={art} site={site} selected={selected} onSelect={setSelected} />
        </DropZone>
      </main>

      <aside
        aria-label="Selected output"
        className={`relative order-1 flex flex-col gap-4 py-4.5 md:col-start-2 md:row-start-3 md:max-h-[40vh] md:overflow-y-auto wide:col-start-3 wide:row-start-2 wide:max-h-none ${gutter}`}
      >
        <Inspector output={output} art={art} setArt={setArt} onSave={(filename) => void saveOutput(output, filename, art, notify)} />
      </aside>

      <ToastRegion queue={toasts} />
    </div>
  )
}
