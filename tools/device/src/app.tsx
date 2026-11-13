import { useEffect } from 'react'
import { Canvas } from './editor/canvas'
import { prune } from './editor/images'
import { Inspector } from './editor/inspector'
import { installShortcuts } from './editor/shortcuts'
import { get, useStore } from './editor/store'
import { Toolbar } from './editor/toolbar'
import { cx } from './ui/controls'

export function App() {
  const inspector = useStore((state) => state.settings.inspector)

  useEffect(() => installShortcuts(), [])

  // Screenshots no device uses any more go, once a session starts
  useEffect(() => {
    const used = new Set(get().doc.devices.flatMap((device) => (device.screen ? [device.screen] : [])))
    void prune(used).catch(() => {})
  }, [])

  return (
    <div className="flex h-full flex-col text-control select-none [&_input]:select-text">
      <Toolbar />
      {/* The canvas is a card on the ground, as the library’s preview has its pages, with the inspector beside it */}
      <div className="flex min-h-0 flex-1 pb-2 pl-2">
        <main className={cx('flex min-w-0 flex-1 overflow-hidden rounded-xl bg-panel shadow-panel [--bleed:var(--panel-bleed)]', !inspector && 'mr-2')}>
          <Canvas />
        </main>
        {inspector && (
          <aside aria-label="Inspector" className="w-72 shrink-0 overflow-y-auto overscroll-contain">
            <Inspector />
          </aside>
        )}
      </div>
    </div>
  )
}
