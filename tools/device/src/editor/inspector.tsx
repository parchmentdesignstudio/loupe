import {
  Button,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  Dialog,
  DialogTrigger,
  FileTrigger,
  Header,
  ListBoxItem,
  ListBoxSection,
  NumberField,
  Popover,
  Select,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  type ColorAreaProps,
} from '@parchment/ui'
import { useState } from 'react'
import { layoutOf } from '../devices/frames'
import { kinds, modelById, models, screenSize, type Orientation } from '../devices/models'
import { BoundsField, cx, Note, Section, WithTooltip } from '../ui/controls'
import { Icon, type Name } from '../ui/icon'
import * as actions from './actions'
import { artboardSizes, fills, rectOf, type Device, type Layout, type StatusBar } from './document'
import { round, union } from './geometry'
import { useImageUrl } from './images'
import { useStore } from './store'

// Without grouping, so 1776 doesn’t show as 1,776
const points: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 2 }
const whole: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 0 }

/** A cleared field gives NaN, and leaves the value as it was */
const numeric = (apply: (value: number) => void) => (value: number) => {
  if (!Number.isNaN(value)) apply(value)
}

export function Inspector() {
  const devices = useStore((state) => state.doc.devices)
  const selection = useStore((state) => state.selection)
  const selected = devices.filter((device) => selection.includes(device.id))
  return selected.length > 0 ? <Devices devices={selected} /> : <Artboard />
}

function Devices({ devices }: { devices: Device[] }) {
  const row = useStore((state) => state.doc.artboard.layout === 'row')
  const ids = devices.map((device) => device.id)
  const single = devices.length === 1 ? devices[0] : null
  const bounds = union(devices.map(rectOf))!
  const model = new Set(devices.map((device) => device.model)).size === 1 ? modelById(devices[0].model) : null
  const orientation = new Set(devices.map((device) => device.orientation)).size === 1 ? devices[0].orientation : null

  return (
    <>
      <Section title={single ? 'Device' : `${devices.length} devices`}>
        <Select
          variant="filled"
          size="small"
          aria-label="Device"
          placeholder="Mixed"
          value={model?.id ?? null}
          onChange={(id) => {
            if (id !== null) actions.switchModel(ids, String(id))
          }}
        >
          {/* React Aria keeps sections’ and items’ ids together, and mcknny’s phone and desktop share their kinds’ names */}
          {kinds.map(({ kind, name }) => (
            <ListBoxSection key={kind} id={name}>
              <Header>{name}</Header>
              {models
                .filter((each) => each.kind === kind)
                .map((each) => (
                  <ListBoxItem key={each.id} id={each.id}>
                    {each.name}
                  </ListBoxItem>
                ))}
            </ListBoxSection>
          ))}
        </Select>
        {model?.rotates && (
          <ToggleButtonGroup
            aria-label="Orientation"
            selectedKeys={orientation ? [orientation] : []}
            onSelectionChange={(keys) => {
              const [next] = keys as Set<Orientation>
              if (next) actions.rotate(devices.filter((device) => device.orientation !== next).map((device) => device.id))
            }}
          >
            <ToggleButton id="portrait">Portrait</ToggleButton>
            <ToggleButton id="landscape">Landscape</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Section>

      <Section title={row ? 'Size' : 'Position and size'}>
        <div className="grid grid-cols-2 gap-2">
          {!row && (
            <>
              <BoundsField label="X" title="From the left" value={bounds.x} onChange={(x) => actions.setBounds({ x })} />
              <BoundsField label="Y" title="From the top" value={bounds.y} onChange={(y) => actions.setBounds({ y })} />
            </>
          )}
          <BoundsField label="W" title="Width" value={bounds.width} min={8} onChange={(width) => actions.setBounds({ width })} />
          <BoundsField label="H" title="Height" value={bounds.height} min={8} onChange={(height) => actions.setBounds({ height })} />
        </div>
        {single && <Note>Drawn at {round((single.width / layoutOf(single.model, single.orientation).width) * 100)}% of its size in points.</Note>}
      </Section>

      {single && <Screen device={single} />}
      {!row && <Arrange count={devices.length} />}
    </>
  )
}

function Screen({ device }: { device: Device }) {
  const url = useImageUrl(device.screen)
  const model = modelById(device.model)
  const size = screenSize(model, device.orientation)
  const phone = model.kind === 'phone'
  const capture = `${size.width * model.density} × ${size.height * model.density}`
  const choose = (files: FileList | null) => {
    const file = files?.[0]
    if (file) void actions.placeScreen(device.id, file)
  }

  return (
    <Section title="Screen">
      <div className="flex items-center gap-3">
        <FileTrigger acceptedFileTypes={['image/*']} onSelect={choose}>
          <Button
            variant="secondary"
            aria-label={url ? 'Replace the screenshot' : 'Choose a screenshot'}
            className={({ isHovered }) => cx('grid place-items-center overflow-hidden p-0 text-muted', 'h-16', isHovered ? 'bg-bleed/12' : 'bg-bleed/8')}
            style={{ aspectRatio: `${size.width} / ${size.height}`, maxWidth: 112 }}
          >
            {url ? <img src={url} alt="" className="size-full object-cover object-top" /> : <Icon name="photo" />}
          </Button>
        </FileTrigger>
        <div className="flex flex-col items-start gap-1.5">
          <FileTrigger acceptedFileTypes={['image/*']} onSelect={choose}>
            <Button variant="secondary" size="small">{url ? 'Replace…' : 'Choose…'}</Button>
          </FileTrigger>
          {device.screen && (
            <Button variant="ghost" size="small" onPress={() => actions.updateDevices([device.id], () => ({ screen: null }))}>Remove</Button>
          )}
        </div>
      </div>
      <Note>
        Fits {size.width} × {size.height}: capture at {capture}, {model.density}x
        {phone && device.statusBar !== 'none' && ', with the top 62 clear for the status bar'}.{' '}
        {model.mcknny ? 'mcknny’s screenshot script makes them this size. ' : ''}
        Or drop one onto the device.
      </Note>
      {phone && (
        <ToggleButtonGroup
          aria-label="Status bar"
          selectedKeys={[device.statusBar]}
          onSelectionChange={(keys) => {
            const [statusBar] = keys as Set<StatusBar>
            if (statusBar) actions.updateDevices([device.id], () => ({ statusBar }))
          }}
        >
          <ToggleButton id="dark">Dark</ToggleButton>
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="none">None</ToggleButton>
        </ToggleButtonGroup>
      )}
    </Section>
  )
}

function ArrangeButton({ icon, tooltip, shortcut, onPress }: { icon: Name; tooltip: string; shortcut?: string; onPress: () => void }) {
  return (
    <WithTooltip tooltip={tooltip} shortcut={shortcut}>
      <Button variant="ghost" shape="full" aria-label={tooltip} onPress={onPress}>
        <Icon name={icon} />
      </Button>
    </WithTooltip>
  )
}

/** Lining up and stacking, for devices placed freely */
function Arrange({ count }: { count: number }) {
  return (
    <Section title="Arrange">
      <div className="-mx-1 flex justify-between">
        <ArrangeButton icon="align-horizontal-left" tooltip="Align left" onPress={() => actions.align('left')} />
        <ArrangeButton icon="align-horizontal-center" tooltip="Align centre" onPress={() => actions.align('centre')} />
        <ArrangeButton icon="align-horizontal-right" tooltip="Align right" onPress={() => actions.align('right')} />
        <ArrangeButton icon="align-vertical-top" tooltip="Align top" onPress={() => actions.align('top')} />
        <ArrangeButton icon="align-vertical-center" tooltip="Align middle" onPress={() => actions.align('middle')} />
        <ArrangeButton icon="align-vertical-bottom" tooltip="Align bottom" onPress={() => actions.align('bottom')} />
      </div>
      {count === 1 && <Note>One device lines up with the artboard.</Note>}
      <div className="-mx-1 flex gap-1">
        {count >= 3 && (
          <>
            <ArrangeButton icon="distribute-horizontal-center" tooltip="Space evenly across" onPress={() => actions.distribute('x')} />
            <ArrangeButton icon="distribute-vertical-center" tooltip="Space evenly down" onPress={() => actions.distribute('y')} />
          </>
        )}
        <ArrangeButton icon="square-3-layers-3d-top-filled" tooltip="Bring forward" shortcut="⌘]" onPress={() => actions.reorder('forward')} />
        <ArrangeButton icon="square-3-layers-3d-bottom-filled" tooltip="Send backward" shortcut="⌘[" onPress={() => actions.reorder('backward')} />
        <ArrangeButton icon="square-on-square" tooltip="Duplicate" shortcut="⌘D" onPress={() => actions.duplicate()} />
        <ArrangeButton icon="trash" tooltip="Delete" shortcut="⌫" onPress={actions.removeSelected} />
      </div>
    </Section>
  )
}

const sizeKey = (width: number, height: number) => `${width}x${height}`

type Color = Parameters<NonNullable<ColorAreaProps['onChange']>>[0]

const isHex = (value: string) => /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)

/** A hex as React Aria keys its swatches, eight upper-case digits, so #fff and #FFFFFFFF match */
function hexa(hex: string) {
  const digits = hex.slice(1)
  const full = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join('') : digits
  return `#${full.length === 6 ? `${full}ff` : full}`.toUpperCase()
}

/** The preset a fill is, by its value, or by a hex the same as its swatch */
const presetOf = (fill: string | null) => fills.find((each) => each.value === fill || (fill !== null && isHex(fill) && hexa(fill) === hexa(each.swatch)))

function Fill() {
  const fill = useStore((state) => state.doc.artboard.fill)
  const preset = presetOf(fill)
  const custom = !preset && fill !== null && isHex(fill) ? fill : null

  // Eight squares to a row: the presets take seven columns of the eight, so their squares match the last one
  return (
    <div className="grid grid-cols-8 gap-1.5">
      <ColorSwatchPicker
        aria-label="Fill"
        // A colour none of the presets has, so none of them shows as chosen while another colour is
        value={preset?.swatch ?? custom ?? '#fffffe'}
        onChange={(color) => {
          const chosen = fills.find((each) => hexa(each.swatch) === color.toString('hexa'))
          if (chosen) actions.setArtboard({ fill: chosen.value })
        }}
        className="col-span-7 grid grid-cols-7 gap-1.5"
      >
        {fills.map((each) => (
          <ColorSwatchPickerItem key={each.name} color={each.swatch} aria-label={each.name} className="aspect-square size-auto w-full" />
        ))}
      </ColorSwatchPicker>
      <AnotherColour custom={custom} start={custom ?? (preset?.value ? preset.swatch : '#fff')} />
    </div>
  )
}

/** Any other colour, from a square after the presets: a plus until one’s chosen, then that colour */
function AnotherColour({ custom, start }: { custom: string | null; start: string }) {
  const label = custom ? `Another colour, ${custom}` : 'Another colour'
  return (
    <DialogTrigger>
      <WithTooltip tooltip="Another colour">
        <Button
          variant="secondary"
          aria-label={label}
          className={cx(
            'relative aspect-square size-auto w-full p-0 text-muted outline-offset-4',
            // Chosen, it’s ringed as a chosen swatch is: paper inside an ink line
            custom && 'after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-paper after:outline-2 after:outline-ink',
          )}
        >
          {custom ? <ColorSwatch color={custom} className="size-full rounded-[inherit]" /> : <Icon name="plus" />}
        </Button>
      </WithTooltip>
      <Popover placement="bottom end">
        <Dialog aria-label="Another colour" className="w-64">
          <ColourControls start={start} />
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}

/** The area, hue and hex, sharing one colour while the popover’s open, so the hue holds through greys */
function ColourControls({ start }: { start: string }) {
  const [color, setColor] = useState<Color | string>(start)
  const change = (next: Color | null) => {
    if (!next) return
    setColor(next)
    const preset = fills.find((each) => hexa(each.swatch) === next.toString('hexa'))
    actions.setArtboard({ fill: preset ? preset.value : next.toString('hex').toLowerCase() })
  }
  return (
    <div className="flex flex-col gap-3">
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" value={color} onChange={change} />
      <ColorSlider colorSpace="hsb" channel="hue" value={color} onChange={change} />
      <ColorField label="Hex" value={color} onChange={change} />
    </div>
  )
}

function Artboard() {
  const artboard = useStore((state) => state.doc.artboard)
  const preset = artboardSizes.find((each) => each.width === artboard.width && each.height === artboard.height)

  return (
    <>
      <Section title="Artboard">
        <Select
          variant="filled"
          size="small"
          aria-label="Size"
          placeholder="Custom"
          value={preset ? sizeKey(preset.width, preset.height) : null}
          onChange={(key) => {
            const found = artboardSizes.find((each) => sizeKey(each.width, each.height) === key)
            if (found) actions.setArtboard({ width: found.width, height: found.height })
          }}
        >
          {artboardSizes.map((each) => (
            <ListBoxItem key={each.name} id={sizeKey(each.width, each.height)}>
              {`${each.name}, ${each.width} × ${each.height}`}
            </ListBoxItem>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <NumberField variant="filled" size="small" label="Width" value={artboard.width} minValue={16} formatOptions={whole} onChange={numeric((width) => actions.setArtboard({ width }))} />
          <NumberField variant="filled" size="small" label="Height" value={artboard.height} minValue={16} formatOptions={whole} onChange={numeric((height) => actions.setArtboard({ height }))} />
        </div>
        <Fill />
      </Section>

      <Section title="Layout">
        <ToggleButtonGroup
          aria-label="Layout"
          selectedKeys={[artboard.layout]}
          onSelectionChange={(keys) => {
            const [layout] = keys as Set<Layout>
            if (layout) actions.setLayout(layout)
          }}
        >
          <ToggleButton id="row">Automatic</ToggleButton>
          <ToggleButton id="free">Free</ToggleButton>
        </ToggleButtonGroup>
        {artboard.layout === 'row' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <NumberField variant="filled" size="small" label="Gap" value={artboard.gap} formatOptions={points} onChange={numeric((gap) => actions.setArtboard({ gap }))} />
            </div>
            <Note>A centred row, as a flexbox lays it out. Drag a device along it, or use the arrow keys.</Note>
          </>
        ) : (
          <Note>Each device stays where it’s put, and snaps to the others, the grid and guides.</Note>
        )}
      </Section>

      {artboard.layout === 'free' && <Placing />}
    </>
  )
}

/** What only matters placing devices freely: the grid, columns, guides and snapping */
function Placing() {
  const guides = useStore((state) => state.doc.guides.length)
  const settings = useStore((state) => state.settings)

  return (
    <>
      <Section title="Grid">
        <div className="grid grid-cols-2 gap-2">
          <NumberField variant="filled" size="small" label="Size" value={settings.grid.size} minValue={1} formatOptions={points} onChange={numeric((size) => actions.setGrid({ size }))} />
        </div>
        <Switch isSelected={settings.grid.visible} onChange={(visible) => actions.setGrid({ visible })}>Show the grid</Switch>
        <Switch isSelected={settings.grid.snap} onChange={(snap) => actions.setGrid({ snap })}>Snap to the grid</Switch>
      </Section>

      <Section title="Columns">
        <div className="grid grid-cols-2 gap-2">
          <NumberField variant="filled" size="small" label="Count" value={settings.columns.count} minValue={1} formatOptions={whole} onChange={numeric((count) => actions.setColumns({ count }))} />
          <NumberField variant="filled" size="small" label="Gutter" value={settings.columns.gutter} minValue={0} formatOptions={points} onChange={numeric((gutter) => actions.setColumns({ gutter }))} />
          <NumberField variant="filled" size="small" label="Margin" value={settings.columns.margin} minValue={0} formatOptions={points} onChange={numeric((margin) => actions.setColumns({ margin }))} />
        </div>
        <Switch isSelected={settings.columns.visible} onChange={(visible) => actions.setColumns({ visible })}>Show them, and snap to them</Switch>
      </Section>

      <Section
        title={guides === 1 ? '1 guide' : `${guides || 'No'} guides`}
        action={
          guides > 0 && (
            <Button variant="ghost" size="small" onPress={actions.clearGuides}>Clear</Button>
          )
        }
      >
        <Note>Drag from a ruler for a guide, and back onto it to remove one.</Note>
        <Switch isSelected={settings.guides} onChange={() => actions.toggle('guides')}>Show them, and snap to them</Switch>
      </Section>

      <Section title="Snapping">
        <Switch isSelected={settings.snap} onChange={() => actions.toggle('snap')}>Snap</Switch>
        <Switch isSelected={settings.objects} onChange={() => actions.toggle('objects')}>To other devices, their spacing and the artboard</Switch>
        <Note>Hold ⌘ while dragging to place something freely, or shift to keep to one axis.</Note>
      </Section>
    </>
  )
}
