import { useEffect } from 'react'
import { Canvas } from './editor/canvas'
import { prune } from './editor/images'
import { Inspector } from './editor/inspector'
import { installShortcuts } from './editor/shortcuts'
import { get, useStore } from './editor/store'
import { Toolbar } from './editor/toolbar'

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
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1">
          <Canvas />
        </main>
        {inspector && (
          <aside
            aria-label="Inspector"
            className="w-72 shrink-0 overflow-y-auto overscroll-contain border-l border-bleed/8 bg-panel [--bleed:var(--panel-bleed)]"
          >
            <Inspector />
          </aside>
        )}
      </div>
    </div>
  )
}
