import { useEffect } from 'react'
import { Canvas } from './editor/canvas'
import { prune } from './editor/images'
import { Inspector } from './editor/inspector'
import { Layers } from './editor/layers'
import { Library } from './editor/library'
import { installShortcuts } from './editor/shortcuts'
import { get, useStore } from './editor/store'
import { Toolbar } from './editor/toolbar'

const panel = 'w-64 shrink-0 overflow-y-auto overscroll-contain border-olive-150 bg-white dark:border-olive-900 dark:bg-olive-975'

export function App() {
  const panels = useStore((state) => state.settings.panels)

  useEffect(() => installShortcuts(), [])

  // Screenshots no device uses any more go, once a session starts
  useEffect(() => {
    const used = new Set(get().doc.devices.flatMap((device) => (device.screen ? [device.screen] : [])))
    void prune(used).catch(() => {})
  }, [])

  return (
    <div className="flex h-full flex-col select-none [&_input]:select-text">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {panels.left && (
          <aside aria-label="Layers and devices" className={`${panel} border-r`}>
            <Layers />
            <Library />
          </aside>
        )}
        <main className="flex min-w-0 flex-1">
          <Canvas />
        </main>
        {panels.right && (
          <aside aria-label="Inspector" className={`${panel} border-l`}>
            <Inspector />
          </aside>
        )}
      </div>
    </div>
  )
}
