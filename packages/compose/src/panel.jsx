// Compose's panel and its opening button, drawn with Loupe's components. `api` is what client.js lets it read and do
import { Icon } from '@parchment/icons/react'
import { Button, Keyboard, ListBoxItem, NumberField, Select, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger } from '@parchment/ui'
import { useState } from 'react'
import { UNSAFE_PortalProvider } from 'react-aria'
import { createRoot } from 'react-dom/client'
import { enableShadowDOM } from 'react-stately/private/flags/flags'

// React Aria looks for the element under a press or with focus in the page unless it's told it may be in a shadow root
enableShadowDOM()

const COLUMNS = 'grid-template-columns'
const ROWS = 'grid-template-rows'
const ALIGN = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline']
const JUSTIFY = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']
const SELF = ['stretch', 'start', 'center', 'end']
const named = (values) => values.map((id) => ({ id, name: id.replace('flex-', '').replace('-', ' ') }))

function Row({ name, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 px-1 text-label text-muted">{name}</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  )
}

// Text that's set when the field is left or Enter is pressed, and marked when CSS won't take it
// The key starts it afresh when the value changes from outside, such as by a drag or an undo
const Text = (props) => <TextInput key={props.value} {...props} />

function TextInput({ label, value, placeholder, onCommit }) {
  const [text, setText] = useState(value)
  const [isInvalid, setInvalid] = useState(false)
  const commit = () => text !== value && setInvalid(onCommit(text) === false)
  return (
    <TextField
      variant="filled"
      size="small"
      className="min-w-0 flex-1"
      aria-label={label}
      placeholder={placeholder}
      value={text}
      isInvalid={isInvalid}
      onChange={setText}
      onBlur={commit}
      onKeyDown={(event) => event.key === 'Enter' && commit()}
    />
  )
}

function Segments({ label, options, value, onChange }) {
  return (
    <ToggleButtonGroup aria-label={label} size="small" width="fill" selectionMode="single" disallowEmptySelection selectedKeys={[value]} onSelectionChange={(keys) => onChange([...keys][0])}>
      {options.map(([id, name]) => (
        <ToggleButton key={id} id={id}>
          {name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

function Choice({ label, options, value, onChange }) {
  return (
    <Select variant="filled" size="small" className="min-w-0 flex-1" aria-label={label} items={named(options)} value={value} onChange={(id) => id !== null && onChange(String(id))}>
      {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
    </Select>
  )
}

function IconButton({ label, icon, onPress }) {
  return (
    <TooltipTrigger>
      <Button variant="ghost" size="small" aria-label={label} onPress={onPress}>
        <Icon name={icon} />
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  )
}

function Layout({ api, element }) {
  const style = getComputedStyle(element)
  const mode = style.display.endsWith('grid') ? 'grid' : style.display.endsWith('flex') ? 'flex' : 'block'
  const isItem = element !== document.body && getComputedStyle(element.parentElement).display.endsWith('grid')
  const grid = mode === 'grid' && api.geometry(element)
  const outer = element !== document.body && api.geometry(element.parentElement)
  const gap = <Row name="Gap">{<Text label="Gap" placeholder="0" value={api.gapOf(element)} onCommit={(value) => api.setGap(element, value)} />}</Row>

  const tracks = (name, axis, property) => {
    const written = api.written(element, property)
    const isSubgrid = written.startsWith('subgrid')
    return (
      <Row name={name}>
        {axis === 'columns' && !isSubgrid && (
          <NumberField
            variant="filled"
            size="small"
            className="w-20 shrink-0"
            aria-label="How many columns"
            minValue={1}
            formatOptions={{ maximumFractionDigits: 0 }}
            value={grid[axis].tracks.length}
            onChange={(count) => !Number.isNaN(count) && api.setCount(element, property, count)}
          />
        )}
        {!isSubgrid && <Text label={name} placeholder="auto" value={written === 'none' ? '' : written} onCommit={(value) => api.setValue(element, property, value)} />}
        {isItem && (
          <Switch isSelected={isSubgrid} onChange={(on) => api.setSubgrid(element, property, on)}>
            Subgrid
          </Switch>
        )}
      </Row>
    )
  }

  return (
    <>
      <Row name="Layout">
        <Segments label="Layout" options={[['block', 'Block'], ['grid', 'Grid'], ['flex', 'Flex']]} value={mode} onChange={(value) => api.setLayout(element, value)} />
      </Row>
      {mode === 'grid' && (
        <>
          {tracks('Columns', 'columns', COLUMNS)}
          {tracks('Rows', 'rows', ROWS)}
          {gap}
        </>
      )}
      {mode === 'flex' && (
        <>
          <Row name="Direction">
            <Segments label="Direction" options={[['row', 'Row'], ['column', 'Column']]} value={style.flexDirection.split('-')[0]} onChange={(value) => api.assign(element, 'flex-direction', value)} />
          </Row>
          <Row name="Align">
            <Choice label="Align" options={ALIGN} value={style.alignItems === 'normal' ? 'stretch' : style.alignItems} onChange={(value) => api.assign(element, 'align-items', value)} />
          </Row>
          <Row name="Justify">
            <Choice label="Justify" options={JUSTIFY} value={style.justifyContent === 'normal' ? 'flex-start' : style.justifyContent} onChange={(value) => api.assign(element, 'justify-content', value)} />
          </Row>
          <Row name="Wrap">
            <Switch aria-label="Wrap" isSelected={style.flexWrap === 'wrap'} onChange={(on) => api.assign(element, 'flex-wrap', on ? 'wrap' : 'nowrap')} />
          </Row>
          {gap}
        </>
      )}
      {element !== document.body && api.holdsText(element) && (
        <Row name="Type">
          <Switch isSelected={api.fitted(element)} onChange={(on) => api.setFit(element, on)}>
            Fill width
          </Switch>
        </Row>
      )}
      {outer && (
        <Row name="Align">
          <Choice label="Across its columns" options={SELF} value={SELF.includes(style.justifySelf) ? style.justifySelf : 'stretch'} onChange={(value) => api.assign(element, 'justify-self', value)} />
          <Choice label="Down its rows" options={SELF} value={SELF.includes(style.alignSelf) ? style.alignSelf : 'stretch'} onChange={(value) => api.assign(element, 'align-self', value)} />
        </Row>
      )}
      {outer && (
        <Row name="Placed">
          <span className="min-w-0 flex-1 text-control">{api.placeOf(element, outer)}</span>
          <Button variant="secondary" size="small" onPress={() => api.clearPlace(element)}>
            Auto
          </Button>
        </Row>
      )}
    </>
  )
}

function Panel({ api }) {
  const { selected, touch, several } = api.state
  const primary = selected.at(-1)
  const command = api.isMac ? '⌘' : 'Ctrl '
  const count = api.count()
  const path = []
  for (let node = primary; node && node !== document.documentElement; node = node.parentElement) path.unshift(node)
  return (
    <div className="flex w-72 flex-col rounded-xl bg-overlay text-control text-ink shadow-overlay [--bleed:var(--overlay-bleed)]">
      <header className="flex cursor-grab touch-none items-center gap-1 p-2">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden text-muted">
          {!primary && <span className="px-2 font-medium text-ink">Compose</span>}
          {path.length > 3 && <span className="px-1">…</span>}
          {path.slice(-3).map((node, index, shown) => (
            <Button key={index} variant="ghost" size="small" className={index === shown.length - 1 ? 'shrink-0 font-medium text-ink' : 'min-w-0 text-muted'} onPress={() => api.select([node])}>
              {api.label(node)}
            </Button>
          ))}
        </div>
        <IconButton label={`Undo ${command}Z`} icon="arrow-uturn-left" onPress={api.undo} />
        <IconButton label={`Redo ⇧${command}Z`} icon="arrow-uturn-right" onPress={api.redo} />
        <IconButton label="Close" icon="xmark" onPress={() => api.toggle(false)} />
      </header>
      <div className="flex flex-col gap-2 border-t border-bleed/8 p-2">
        {!primary && <p className="px-1 py-1 text-body text-muted">{touch ? 'Double-tap an element to select it.' : `Click an element to select it, and ${command.trim()}-click to add more.`}</p>}
        {primary && (
          <div className="flex gap-2">
            <Button variant="secondary" size="small" className="flex-1" end={touch ? undefined : <Keyboard variant="plain">{`${command}G`}</Keyboard>} onPress={api.group}>
              Group
            </Button>
            <Button variant="secondary" size="small" className="flex-1" end={touch ? undefined : <Keyboard variant="plain">{`⇧${command}G`}</Keyboard>} onPress={api.ungroup}>
              Ungroup
            </Button>
          </div>
        )}
        {primary && touch && (
          <Switch isSelected={several} onChange={api.setSeveral}>
            Select several
          </Switch>
        )}
        {selected.length === 1 && <Layout api={api} element={primary} />}
      </div>
      <footer className="flex items-center gap-2 border-t border-bleed/8 p-2">
        <output className="min-w-0 flex-1 px-1 text-label text-muted">
          {api.message() || (count ? `${count} ${count === 1 ? 'change' : 'changes'}` : 'No changes yet')}
        </output>
        <Button variant="secondary" size="small" onPress={api.reset}>
          Reset
        </Button>
        <Button variant="primary" size="small" onPress={api.copy}>
          Copy changes
        </Button>
      </footer>
    </div>
  )
}

/** Draws the panel into `panel` and the opening button into `opener`. What it floats, such as a menu, goes in `floats` */
export function createPanel({ panel, opener, floats }) {
  const roots = [createRoot(panel), createRoot(opener)]
  return (api) => {
    roots[0].render(
      <UNSAFE_PortalProvider getContainer={() => floats}>
        <Panel api={api} />
      </UNSAFE_PortalProvider>,
    )
    roots[1].render(
      <Button variant="secondary" shape="full" onPress={() => api.toggle(true)}>
        Compose
      </Button>,
    )
  }
}
