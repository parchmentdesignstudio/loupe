import { layoutOf } from '../devices/frames'
import { kinds, modelById, models, screenSize, type Orientation } from '../devices/models'
import { Check, cx, IconButton, Note, NumberField, Section, Segmented, Select, TextButton } from '../ui/controls'
import { Icon } from '../ui/icon'
import * as actions from './actions'
import { artboardSizes, fills, layouts, nameOf, rectOf, type Device, type StatusBar } from './document'
import { round, union } from './geometry'
import { useImageUrl } from './images'
import { useStore } from './store'

export function Inspector() {
  const devices = useStore((state) => state.doc.devices)
  const selection = useStore((state) => state.selection)
  const selected = devices.filter((device) => selection.includes(device.id))
  return selected.length > 0 ? <Devices devices={selected} /> : <Artboard />
}

function Devices({ devices }: { devices: Device[] }) {
  const ids = devices.map((device) => device.id)
  const single = devices.length === 1 ? devices[0] : null
  const bounds = union(devices.map(rectOf))!
  const model = new Set(devices.map((device) => device.model)).size === 1 ? modelById(devices[0].model) : null
  const orientation = new Set(devices.map((device) => device.orientation)).size === 1 ? devices[0].orientation : null
  const locked = devices.every((device) => device.locked)

  return (
    <>
      <Section title={single ? nameOf(single) : `${devices.length} devices`}>
        <Select label="Device" value={model?.id ?? ''} onChange={(value) => actions.switchModel(ids, value)}>
          {!model && (
            <option value="" disabled>
              Mixed
            </option>
          )}
          {kinds.map(({ kind, name }) => (
            <optgroup key={kind} label={name}>
              {models
                .filter((each) => each.kind === kind)
                .map((each) => (
                  <option key={each.id} value={each.id}>
                    {each.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </Select>
        {model?.rotates && (
          <Segmented<Orientation>
            label="Orientation"
            value={orientation}
            options={[
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]}
            onChange={(next) => actions.rotate(devices.filter((device) => device.orientation !== next).map((device) => device.id))}
          />
        )}
        {locked && <Note>Locked, so it stays put. Unlock it from its layer.</Note>}
      </Section>

      <Section title="Position and size">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" title="From the left" value={bounds.x} onChange={(x) => actions.setBounds({ x })} />
          <NumberField label="Y" title="From the top" value={bounds.y} onChange={(y) => actions.setBounds({ y })} />
          <NumberField label="W" title="Width" value={bounds.width} min={8} onChange={(width) => actions.setBounds({ width })} />
          <NumberField label="H" title="Height" value={bounds.height} min={8} onChange={(height) => actions.setBounds({ height })} />
        </div>
        {single && <Note>Drawn at {round((single.width / layoutOf(single.model, single.orientation).width) * 100)}% of its size in points.</Note>}
      </Section>

      {single && <Screen device={single} />}
      <Arrange count={devices.length} />
    </>
  )
}

function Screen({ device }: { device: Device }) {
  const url = useImageUrl(device.screen)
  const model = modelById(device.model)
  const size = screenSize(model, device.orientation)
  const phone = model.kind === 'phone'
  const capture = `${size.width * model.density} × ${size.height * model.density}`

  return (
    <Section title="Screen">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={url ? 'Replace the screenshot' : 'Choose a screenshot'}
          onClick={() => actions.chooseScreen(device.id)}
          className="grid h-16 shrink-0 place-items-center overflow-hidden rounded-md bg-olive-100 text-olive-975/50 outline-avocado shadow-hairline hover:bg-olive-120 focus-visible:outline-2 dark:bg-olive-950 dark:text-pearl/50 dark:shadow-dark-hairline"
          style={{ aspectRatio: `${size.width} / ${size.height}`, maxWidth: 112 }}
        >
          {url ? <img src={url} alt="" className="size-full object-cover object-top" /> : <Icon name="photo" />}
        </button>
        <div className="flex flex-col gap-1.5">
          <TextButton onClick={() => actions.chooseScreen(device.id)}>{url ? 'Replace…' : 'Choose…'}</TextButton>
          {device.screen && <TextButton onClick={() => actions.updateDevices([device.id], () => ({ screen: null }))}>Remove</TextButton>}
        </div>
      </div>
      <Note>
        Fits {size.width} × {size.height}: capture at {capture}, {model.density}x
        {phone && device.statusBar !== 'none' && ', with the top 62 clear for the status bar'}.{' '}
        {model.mcknny ? 'mcknny’s screenshot script makes them this size. ' : ''}
        Or drop one onto the device.
      </Note>
      {phone && (
        <Segmented<StatusBar>
          label="Status bar"
          value={device.statusBar}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'none', label: 'None' },
          ]}
          onChange={(statusBar) => actions.updateDevices([device.id], () => ({ statusBar }))}
        />
      )}
    </Section>
  )
}

function Arrange({ count }: { count: number }) {
  return (
    <Section title="Arrange">
      <div className="-mx-1 flex justify-between">
        <IconButton icon="align-horizontal-left" label="Align left" onClick={() => actions.align('left')} />
        <IconButton icon="align-horizontal-center" label="Align centre" onClick={() => actions.align('centre')} />
        <IconButton icon="align-horizontal-right" label="Align right" onClick={() => actions.align('right')} />
        <IconButton icon="align-vertical-top" label="Align top" onClick={() => actions.align('top')} />
        <IconButton icon="align-vertical-center" label="Align middle" onClick={() => actions.align('middle')} />
        <IconButton icon="align-vertical-bottom" label="Align bottom" onClick={() => actions.align('bottom')} />
      </div>
      {count === 1 && <Note>One device lines up with the artboard.</Note>}
      <div className="-mx-1 flex gap-1">
        {count >= 3 && (
          <>
            <IconButton icon="distribute-horizontal-center" label="Space evenly across" onClick={() => actions.distribute('x')} />
            <IconButton icon="distribute-vertical-center" label="Space evenly down" onClick={() => actions.distribute('y')} />
          </>
        )}
        <IconButton icon="square-3-layers-3d-top-filled" label="Bring forward" shortcut="⌘]" onClick={() => actions.reorder('forward')} />
        <IconButton icon="square-3-layers-3d-bottom-filled" label="Send backward" shortcut="⌘[" onClick={() => actions.reorder('backward')} />
        <IconButton icon="square-on-square" label="Duplicate" shortcut="⌘D" onClick={() => actions.duplicate()} />
        <IconButton icon="trash" label="Delete" shortcut="⌫" onClick={actions.removeSelected} />
      </div>
    </Section>
  )
}

const sizeKey = (width: number, height: number) => `${width}x${height}`

function Fill() {
  const fill = useStore((state) => state.doc.artboard.fill)
  const custom = fill !== null && !fills.some((each) => each.value === fill)
  const swatch = 'size-6 shrink-0 rounded-full outline-offset-2 outline-avocado shadow-hairline [corner-shape:round]! aria-pressed:outline-2 focus-visible:outline-2 dark:shadow-dark-hairline'

  return (
    <div role="group" aria-label="Fill" className="flex flex-wrap items-center gap-2">
      {fills.map((each) => (
        <button
          key={each.name}
          type="button"
          title={each.name}
          aria-label={each.name}
          aria-pressed={fill === each.value}
          onClick={() => actions.setArtboard({ fill: each.value })}
          className={swatch}
          style={{ background: each.value ?? 'repeating-conic-gradient(#fff 0 25%, oklch(88% 0.004 130) 0 50%) 0 0 / 8px 8px' }}
        />
      ))}
      <label
        title="Another colour"
        className={cx(swatch, 'relative grid place-items-center bg-olive-100 text-olive-975/60 focus-within:outline-2 dark:bg-olive-950 dark:text-pearl/60', custom && 'outline-2')}
        style={custom ? { background: fill } : undefined}
      >
        {!custom && <Icon name="plus" />}
        <input
          type="color"
          aria-label="Another colour"
          value={custom && fill.startsWith('#') && fill.length === 7 ? fill : '#ffffff'}
          onChange={(event) => actions.setArtboard({ fill: event.target.value })}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}

function Artboard() {
  const artboard = useStore((state) => state.doc.artboard)
  const guides = useStore((state) => state.doc.guides.length)
  const settings = useStore((state) => state.settings)
  const preset = artboardSizes.find((each) => each.width === artboard.width && each.height === artboard.height)

  return (
    <>
      <Section title="Artboard">
        <Select
          label="Size"
          value={preset ? sizeKey(preset.width, preset.height) : 'custom'}
          onChange={(value) => {
            const found = artboardSizes.find((each) => sizeKey(each.width, each.height) === value)
            if (found) actions.setArtboard({ width: found.width, height: found.height })
          }}
        >
          {artboardSizes.map((each) => (
            <option key={each.name} value={sizeKey(each.width, each.height)}>
              {each.name}, {each.width} × {each.height}
            </option>
          ))}
          {!preset && <option value="custom">Custom</option>}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="W" title="Width" value={artboard.width} min={16} onChange={(width) => actions.setArtboard({ width: Math.round(width) })} />
          <NumberField label="H" title="Height" value={artboard.height} min={16} onChange={(height) => actions.setArtboard({ height: Math.round(height) })} />
        </div>
        <Fill />
      </Section>

      <Section title="Layout">
        <Note>mcknny’s Mockup layouts, which set the devices out afresh.</Note>
        <div className="grid grid-cols-2 gap-1.5">
          {layouts.map((layout) => (
            <TextButton key={layout.id} onClick={() => actions.applyLayout(layout.id)}>
              {layout.name}
            </TextButton>
          ))}
        </div>
      </Section>

      <Section title="Grid">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Size" title="Grid size" value={settings.grid.size} min={1} onChange={(size) => actions.setGrid({ size })} />
        </div>
        <Check label="Show the grid" checked={settings.grid.visible} onChange={(visible) => actions.setGrid({ visible })} />
        <Check label="Snap to the grid" checked={settings.grid.snap} onChange={(snap) => actions.setGrid({ snap })} />
      </Section>

      <Section title="Columns">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Count" title="Columns" value={settings.columns.count} min={1} onChange={(count) => actions.setColumns({ count: Math.round(count) })} />
          <NumberField label="Gutter" title="Gutter" value={settings.columns.gutter} min={0} onChange={(gutter) => actions.setColumns({ gutter })} />
          <NumberField label="Margin" title="Margin" value={settings.columns.margin} min={0} onChange={(margin) => actions.setColumns({ margin })} />
        </div>
        <Check label="Show them, and snap to them" checked={settings.columns.visible} onChange={(visible) => actions.setColumns({ visible })} />
      </Section>

      <Section
        title={guides === 1 ? '1 guide' : `${guides || 'No'} guides`}
        action={guides > 0 && <TextButton onClick={actions.clearGuides}>Clear</TextButton>}
      >
        <Note>Drag from a ruler for a guide, and back onto it to remove one.</Note>
        <Check label="Show them, and snap to them" checked={settings.guides} onChange={() => actions.toggle('guides')} />
      </Section>

      <Section title="Snapping">
        <Check label="Snap" checked={settings.snap} onChange={() => actions.toggle('snap')} />
        <Check label="To other devices, their spacing and the artboard" checked={settings.objects} onChange={() => actions.toggle('objects')} />
        <Note>Hold ⌘ while dragging to place something freely, or shift to keep to one axis.</Note>
      </Section>

      <Section title="Start again">
        <Note>Back to mcknny’s three phones on its artboard. You can undo it.</Note>
        <TextButton onClick={actions.startOver}>Start again</TextButton>
      </Section>
    </>
  )
}
