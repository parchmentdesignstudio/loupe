import { type Appearance, Button, Keyboard, Menu, MenuItem, MenuTrigger, Separator, ToggleButton, ToggleButtonGroup, Toolbar as Bar, type TooltipProps, useAppearance } from '@parchment/ui'
import { useState } from 'react'
import type { Theme } from '../devices/models'
import { cx, WithTooltip } from '../ui/controls'
import { Icon } from '../ui/icon'
import * as actions from './actions'
import { redo, set, undo, useStore, type Tool } from './store'

type Placement = TooltipProps['placement']

function Tools({ placement }: { placement: Placement }) {
  const tool = useStore((state) => state.tool)
  return (
    <ToggleButtonGroup
      aria-label="Tool"
      selectedKeys={[tool]}
      onSelectionChange={(keys) => {
        const [next] = keys
        if (next) set({ tool: next as Tool })
      }}
    >
      <WithTooltip tooltip="Select" shortcut="V" placement={placement}>
        <ToggleButton id="select" aria-label="Select">
          <Icon name="cursorarrow" />
        </ToggleButton>
      </WithTooltip>
      <WithTooltip tooltip="Pan" shortcut="H, or hold space" placement={placement}>
        <ToggleButton id="hand" aria-label="Pan">
          <Icon name="hand-raised" />
        </ToggleButton>
      </WithTooltip>
    </ToggleButtonGroup>
  )
}

function UndoRedo({ placement }: { placement: Placement }) {
  const canUndo = useStore((state) => state.past.length > 0)
  const canRedo = useStore((state) => state.future.length > 0)
  return (
    <>
      <WithTooltip tooltip="Undo" shortcut="⌘Z" placement={placement}>
        <Button variant="ghost" shape="full" aria-label="Undo" isDisabled={!canUndo} onPress={undo}>
          <Icon name="arrow-uturn-left" />
        </Button>
      </WithTooltip>
      <WithTooltip tooltip="Redo" shortcut="⇧⌘Z" placement={placement}>
        <Button variant="ghost" shape="full" aria-label="Redo" isDisabled={!canRedo} onPress={redo}>
          <Icon name="arrow-uturn-right" />
        </Button>
      </WithTooltip>
    </>
  )
}

/** Snapping, and the grid, columns and rulers that help place devices */
function Placing() {
  const settings = useStore((state) => state.settings)
  const on = [settings.snap && 'snap', settings.grid.visible && 'grid', settings.columns.visible && 'columns', settings.rulers && 'rulers'].filter((key) => key !== false)

  return (
    <ToggleButtonGroup
      aria-label="Snapping and guides"
      selectionMode="multiple"
      selectedKeys={on}
      onSelectionChange={(keys) => {
        if (keys.has('snap') !== settings.snap) actions.toggle('snap')
        if (keys.has('grid') !== settings.grid.visible) actions.setGrid({ visible: keys.has('grid') })
        if (keys.has('columns') !== settings.columns.visible) actions.setColumns({ visible: keys.has('columns') })
        if (keys.has('rulers') !== settings.rulers) actions.toggle('rulers')
      }}
    >
      <WithTooltip tooltip="Snapping" shortcut="hold ⌘ to place freely" placement="bottom">
        <ToggleButton id="snap" aria-label="Snapping">
          <Icon name="magnet" />
        </ToggleButton>
      </WithTooltip>
      <WithTooltip tooltip="Grid" shortcut="⌘’" placement="bottom">
        <ToggleButton id="grid" aria-label="Grid">
          <Icon name="square-grid-3x3" />
        </ToggleButton>
      </WithTooltip>
      <WithTooltip tooltip="Columns" shortcut="⇧G" placement="bottom">
        <ToggleButton id="columns" aria-label="Columns">
          <Icon name="rectangle-split-3x1" />
        </ToggleButton>
      </WithTooltip>
      <WithTooltip tooltip="Rulers" shortcut="⇧R" placement="bottom">
        <ToggleButton id="rulers" aria-label="Rulers">
          <Icon name="ruler" />
        </ToggleButton>
      </WithTooltip>
    </ToggleButtonGroup>
  )
}

function Zoom() {
  const zoom = useStore((state) => state.viewport.zoom)
  const percent = Math.round(zoom * 100)
  return (
    <div className="flex items-center">
      <WithTooltip tooltip="Zoom out" shortcut="⌘−" placement="bottom">
        <Button variant="ghost" shape="full" aria-label="Zoom out" onPress={() => actions.zoomStep(-1)}>
          <Icon name="minus" />
        </Button>
      </WithTooltip>
      <MenuTrigger>
        <Button variant="ghost" aria-label={`Zoom, ${percent}%`}>
          <span className="w-10 text-center tabular-nums">{percent}%</span>
        </Button>
        <Menu placement="bottom">
          <MenuItem textValue="Zoom to fit" onAction={actions.fitArtboard}>
            Zoom to fit
            <Keyboard>⇧1</Keyboard>
          </MenuItem>
          <MenuItem textValue="Zoom to selection" onAction={actions.zoomToSelection}>
            Zoom to selection
            <Keyboard>⇧2</Keyboard>
          </MenuItem>
          <MenuItem onAction={() => actions.zoomTo(0.5)}>50%</MenuItem>
          <MenuItem textValue="100%" onAction={() => actions.zoomTo(1)}>
            100%
            <Keyboard>⇧0</Keyboard>
          </MenuItem>
          <MenuItem onAction={() => actions.zoomTo(2)}>200%</MenuItem>
        </Menu>
      </MenuTrigger>
      <WithTooltip tooltip="Zoom in" shortcut="⌘+" placement="bottom">
        <Button variant="ghost" shape="full" aria-label="Zoom in" onPress={() => actions.zoomStep(1)}>
          <Icon name="plus" />
        </Button>
      </WithTooltip>
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
    <MenuTrigger>
      <Button start={<Icon name="square-and-arrow-up" />}>
        {working ? 'Exporting…' : 'Export'}
      </Button>
      <Menu placement="bottom end">
        {[1, 2, 3].map((scale) => (
          <MenuItem key={scale} textValue={`PNG at ${scale}x`} onAction={() => void run(scale)}>
            PNG at {scale}x
            <span className="text-muted tabular-nums">
              {artboard.width * scale} × {artboard.height * scale}
            </span>
            {scale === 2 && <Keyboard>⇧⌘E</Keyboard>}
          </MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  )
}

/** The tool’s own light or dark, or the system’s. The theme toggle beside it sets the devices’ */
function AppearanceMenu() {
  const [appearance, setAppearance] = useAppearance()
  return (
    <MenuTrigger>
      <WithTooltip tooltip="Appearance" placement="bottom">
        <Button variant="ghost" shape="full" aria-label="Appearance">
          <Icon name={appearance === 'dark' ? 'moon' : appearance === 'light' ? 'sun-max' : 'sun-horizon'} />
        </Button>
      </WithTooltip>
      <Menu
        placement="bottom end"
        selectionMode="single"
        selectedKeys={[appearance]}
        onSelectionChange={(keys) => {
          const [next] = keys as Set<Appearance>
          if (next) setAppearance(next)
        }}
      >
        <MenuItem id="light">Light</MenuItem>
        <MenuItem id="auto">Auto</MenuItem>
        <MenuItem id="dark">Dark</MenuItem>
      </Menu>
    </MenuTrigger>
  )
}

export function Toolbar() {
  const inspector = useStore((state) => state.settings.inspector)
  const theme = useStore((state) => state.doc.theme)

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 px-2">
      <h1 className="px-2 font-medium">Device</h1>
      <Separator orientation="vertical" />
      <Bar aria-label="Editing" className="flex-1">
        <Tools placement="bottom" />
        <Separator />
        <UndoRedo placement="bottom" />
        <Separator />
        <Placing />
        <div className="flex-1" />
        <ToggleButtonGroup
          aria-label="Theme"
          selectedKeys={[theme]}
          onSelectionChange={(keys) => {
            const [next] = keys
            if (next) actions.setTheme(next as Theme)
          }}
        >
          <ToggleButton id="light">
            <Icon name="sun-max" />
            Light
          </ToggleButton>
          <ToggleButton id="dark">
            <Icon name="moon" />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
        <Separator />
        <Zoom />
        <Separator />
        <Export />
        <AppearanceMenu />
        <WithTooltip tooltip="Inspector" placement="bottom">
          <ToggleButton aria-label="Inspector" isSelected={inspector} onChange={() => actions.toggle('inspector')}>
            <Icon name="sidebar-right" />
          </ToggleButton>
        </WithTooltip>
      </Bar>
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
      <Bar
        aria-label="Quick actions"
        onPointerDown={(event) => event.stopPropagation()}
        className="pointer-events-auto cursor-default rounded-xl bg-overlay p-1 shadow-floating [--bleed:var(--overlay-bleed)]"
      >
        <Tools placement="top" />
        <Separator />
        <WithTooltip tooltip={`${name}, ${screen.width} × ${screen.height}`} placement="top">
          <Button variant="ghost" start={<Icon name="plus" />} onPress={() => actions.addDefaultDevice()}>
            Add device
          </Button>
        </WithTooltip>
        <Separator />
        <UndoRedo placement="top" />
      </Bar>
    </div>
  )
}
