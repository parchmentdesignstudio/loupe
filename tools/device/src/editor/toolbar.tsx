import { useState } from 'react'
import { cx, Divider, IconButton, Menu, MenuItem, Segmented } from '../ui/controls'
import { Icon } from '../ui/icon'
import * as actions from './actions'
import { redo, set, undo, useStore } from './store'

function Tools() {
  const tool = useStore((state) => state.tool)
  return (
    <>
      <IconButton icon="cursorarrow" label="Select" shortcut="V" pressed={tool === 'select'} onClick={() => set({ tool: 'select' })} />
      <IconButton icon="hand-raised" label="Pan" shortcut="H, or hold space" pressed={tool === 'hand'} onClick={() => set({ tool: 'hand' })} />
    </>
  )
}

function UndoRedo() {
  const canUndo = useStore((state) => state.past.length > 0)
  const canRedo = useStore((state) => state.future.length > 0)
  return (
    <>
      <IconButton icon="arrow-uturn-left" label="Undo" shortcut="⌘Z" disabled={!canUndo} onClick={undo} />
      <IconButton icon="arrow-uturn-right" label="Redo" shortcut="⇧⌘Z" disabled={!canRedo} onClick={redo} />
    </>
  )
}

function Zoom() {
  const zoom = useStore((state) => state.viewport.zoom)
  return (
    <div className="flex items-center">
      <IconButton icon="minus" label="Zoom out" shortcut="⌘−" onClick={() => actions.zoomStep(-1)} />
      <Menu
        id="zoom"
        label="Zoom"
        className="justify-center px-1 text-[13px] tabular-nums hover:bg-olive-100 dark:hover:bg-olive-900"
        button={<span className="w-11 text-center">{Math.round(zoom * 100)}%</span>}
      >
        <MenuItem menu="zoom" shortcut="⇧1" onClick={actions.fitArtboard}>
          Zoom to fit
        </MenuItem>
        <MenuItem menu="zoom" shortcut="⇧2" onClick={actions.zoomToSelection}>
          Zoom to selection
        </MenuItem>
        <MenuItem menu="zoom" onClick={() => actions.zoomTo(0.5)}>
          50%
        </MenuItem>
        <MenuItem menu="zoom" shortcut="⇧0" onClick={() => actions.zoomTo(1)}>
          100%
        </MenuItem>
        <MenuItem menu="zoom" onClick={() => actions.zoomTo(2)}>
          200%
        </MenuItem>
      </Menu>
      <IconButton icon="plus" label="Zoom in" shortcut="⌘+" onClick={() => actions.zoomStep(1)} />
    </div>
  )
}

function Export() {
  const artboard = useStore((state) => state.doc.artboard)
  const [working, setWorking] = useState(false)
  const run = async (scale: number) => {
    setWorking(true)
    try {
      await actions.exportImage(scale)
    } finally {
      setWorking(false)
    }
  }
  return (
    <Menu
      id="export"
      label="Export as a PNG"
      className="bg-olive-975 px-3 text-[13px] font-medium text-white hover:bg-olive-950 dark:bg-pearl dark:text-olive-975 dark:hover:bg-white"
      button={
        <>
          <Icon name="square-and-arrow-up" />
          {working ? 'Exporting…' : 'Export'}
        </>
      }
    >
      {[1, 2, 3].map((scale) => (
        <MenuItem key={scale} menu="export" shortcut={scale === 2 ? '⇧⌘E' : undefined} onClick={() => void run(scale)}>
          {`PNG at ${scale}x`}
          <span className="ml-2 text-olive-975/60 tabular-nums dark:text-pearl/60">
            {artboard.width * scale} × {artboard.height * scale}
          </span>
        </MenuItem>
      ))}
    </Menu>
  )
}

export function Toolbar() {
  const settings = useStore((state) => state.settings)
  const theme = useStore((state) => state.doc.theme)

  return (
    <header className="flex h-12 shrink-0 items-center gap-0.5 border-b border-olive-150 bg-white px-2 dark:border-olive-900 dark:bg-olive-975">
      <h1 className="px-2 text-sm font-medium">Device</h1>
      <Divider />
      <Tools />
      <Divider />
      <UndoRedo />
      <Divider />
      <IconButton icon="magnet" label="Snapping" shortcut="hold ⌘ to place freely" pressed={settings.snap} onClick={() => actions.toggle('snap')} />
      <IconButton icon="square-grid-3x3" label="Grid" shortcut="⌘’" pressed={settings.grid.visible} onClick={() => actions.setGrid({ visible: !settings.grid.visible })} />
      <IconButton icon="rectangle-split-3x1" label="Columns" shortcut="⇧G" pressed={settings.columns.visible} onClick={() => actions.setColumns({ visible: !settings.columns.visible })} />
      <IconButton icon="ruler" label="Rulers" shortcut="⇧R" pressed={settings.rulers} onClick={() => actions.toggle('rulers')} />
      <div className="flex-1" />
      <Segmented
        label="Theme"
        value={theme}
        options={[
          { value: 'light', label: 'Light', icon: 'sun-max' },
          { value: 'dark', label: 'Dark', icon: 'moon' },
        ]}
        onChange={actions.setTheme}
      />
      <Divider />
      <Zoom />
      <Divider />
      <Export />
      <IconButton icon="sidebar-right" label="Inspector" pressed={settings.inspector} onClick={() => actions.toggle('inspector')} className="ml-1" />
    </header>
  )
}

/** Some of the top’s quick actions again, floating over the bottom of the canvas, with a device to add in one click */
export function FloatingToolbar() {
  const rulers = useStore((state) => state.settings.rulers)
  const { name, screen } = actions.defaultModel

  return (
    <div className={cx('pointer-events-none absolute right-0 bottom-4 flex justify-center', rulers ? 'left-5' : 'left-0')}>
      {/* Inside the canvas, so scrolling over it pans, but a click here mustn’t start a drag there */}
      <div
        role="group"
        aria-label="Quick actions"
        onPointerDown={(event) => event.stopPropagation()}
        className="pointer-events-auto flex cursor-default items-center gap-0.5 rounded-[10px] bg-white p-1 shadow-float dark:bg-olive-975 dark:shadow-dark-float"
      >
        <Tools />
        <Divider />
        <button
          type="button"
          title={`Add device (${name}, ${screen.width} × ${screen.height})`}
          onClick={() => actions.addDefaultDevice()}
          className={cx(
            'flex h-8 shrink-0 items-center gap-1.5 rounded-md pr-2.5 pl-2 text-[13px] font-medium outline-avocado',
            'hover:bg-olive-100 focus-visible:outline-2 dark:hover:bg-olive-900',
          )}
        >
          <Icon name="plus" />
          Add device
        </button>
        <Divider />
        <UndoRedo />
      </div>
    </div>
  )
}
