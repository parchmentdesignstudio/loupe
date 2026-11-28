// Variations on Compose's panel, drawn with Loupe's components over a made-up selection, to choose a direction from
import { Icon } from '@parchment/icons/react'
import { Button, Keyboard, ListBoxItem, Menu, MenuItem, MenuSeparator, MenuTrigger, NumberField, Select, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger } from '@parchment/ui'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import sheet from 'virtual:proto-styles'

document.head.append(Object.assign(document.createElement('style'), { textContent: sheet }))

const SELF = ['stretch', 'start', 'center', 'end'].map((id) => ({ id, name: id }))
const FROMS = [
  { id: 'base', name: 'Every width', short: 'Every width' },
  { id: 'md', name: 'md, 768px and up', short: 'From md' },
  { id: 'lg', name: 'lg, 1024px and up', short: 'From lg' },
]
const SCENES = {
  text: { path: ['body', 'main'], name: 'p.fact', mode: 'block', text: true, item: false, changes: 0 },
  grid: { path: ['body', 'main'], name: 'group', mode: 'grid', text: false, item: true, changes: 3 },
}

// What every variation shows and changes, so they differ only in how it's laid out
function useSelection(scene) {
  const [mode, setMode] = useState(scene.mode)
  const [fit, setFit] = useState(false)
  const [from, setFrom] = useState('base')
  const [columns, setColumns] = useState(12)
  const [gap, setGap] = useState('6')
  const [subgrid, setSubgrid] = useState(false)
  const [changes, setChanges] = useState(scene.changes)
  const [said, setSaid] = useState('')
  const say = (text) => {
    setSaid(text)
    setTimeout(() => setSaid(''), 1800)
  }
  const touch = (set) => (value) => {
    set(value)
    setChanges((count) => count + 1)
  }
  return { ...scene, mode, setMode: touch(setMode), fit, setFit: touch(setFit), from, setFrom, columns, setColumns: touch(setColumns), gap, setGap: touch(setGap), subgrid, setSubgrid: touch(setSubgrid), changes, said, say, copy: () => say(changes ? 'Copied' : 'No changes to copy yet'), reset: () => (changes ? setChanges(0) : say('Nothing to put back')) }
}

const Segments = ({ label, value, onChange, options }) => (
  <ToggleButtonGroup aria-label={label} size="small" width="fill" selectionMode="single" disallowEmptySelection selectedKeys={[value]} onSelectionChange={(keys) => onChange([...keys][0])}>
    {options.map(([id, name]) => (
      <ToggleButton key={id} id={id}>
        {name}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
)
const Layouts = ({ selection }) => <Segments label="Layout" value={selection.mode} onChange={selection.setMode} options={[['block', 'Block'], ['grid', 'Grid'], ['flex', 'Flex']]} />
const Choice = ({ label, items = SELF, value = 'stretch', className = 'min-w-0 flex-1', onChange = () => {} }) => (
  <Select variant="filled" size="small" className={className} aria-label={label} items={items} defaultValue={value} onChange={onChange}>
    {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
  </Select>
)
const From = ({ selection, className }) => (
  <Select variant="filled" size="small" className={className} aria-label="The width changes apply from" items={FROMS} value={selection.from} onChange={(id) => id && selection.setFrom(String(id))}>
    {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
  </Select>
)
const Field = ({ label, value, placeholder, onChange = () => {} }) => <TextField variant="filled" size="small" className="min-w-0 flex-1" aria-label={label} placeholder={placeholder} defaultValue={value} onChange={onChange} />
const Count = ({ selection, className = 'w-20 shrink-0' }) => <NumberField variant="filled" size="small" className={className} aria-label="How many columns" minValue={1} value={selection.columns} onChange={(count) => !Number.isNaN(count) && selection.setColumns(count)} />
const IconButton = ({ label, icon, onPress }) => (
  <TooltipTrigger>
    <Button variant="ghost" size="small" aria-label={label} onPress={onPress}>
      <Icon name={icon} />
    </Button>
    <Tooltip>{label}</Tooltip>
  </TooltipTrigger>
)
const Shell = ({ children }) => <div className="flex w-72 flex-col rounded-xl bg-overlay text-control text-ink shadow-overlay [--bleed:var(--overlay-bleed)]">{children}</div>
const tally = (count) => (count ? `${count} ${count === 1 ? 'change' : 'changes'}` : 'No changes yet')

// ——— Now: the panel as it is

function Now({ selection: s }) {
  const Row = ({ name, children }) => (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 px-1 text-label text-muted">{name}</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </div>
  )
  return (
    <Shell>
      <header className="flex items-center gap-1 p-2">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          {[...s.path, s.name].map((step, index, all) => (
            <Button key={step} variant="ghost" size="small" className={index === all.length - 1 ? 'shrink-0 font-medium text-ink' : 'min-w-0 text-muted'}>
              {step}
            </Button>
          ))}
        </div>
        <IconButton label="Undo ⌘Z" icon="arrow-uturn-left" />
        <IconButton label="Redo ⇧⌘Z" icon="arrow-uturn-right" />
        <IconButton label="Close" icon="xmark" />
      </header>
      <div className="flex flex-col gap-2 border-t border-bleed/8 p-2">
        <div className="flex gap-2">
          <Button variant="secondary" size="small" className="flex-1" end={<Keyboard variant="plain">⌘G</Keyboard>}>
            Group
          </Button>
          <Button variant="secondary" size="small" className="flex-1" end={<Keyboard variant="plain">⇧⌘G</Keyboard>}>
            Ungroup
          </Button>
        </div>
        <Row name="From">
          <From selection={s} className="min-w-0 flex-1" />
        </Row>
        <Row name="Layout">
          <Layouts selection={s} />
        </Row>
        {s.mode === 'grid' && (
          <>
            <Row name="Columns">
              <Count selection={s} />
              <Field label="Columns" value={`repeat(${s.columns}, minmax(0, 1fr))`} />
            </Row>
            <Row name="Rows">
              <Field label="Rows" placeholder="auto" />
            </Row>
            <Row name="Gap">
              <Field label="Gap" value={s.gap} onChange={s.setGap} />
            </Row>
          </>
        )}
        {s.text && (
          <Row name="Type">
            <Switch isSelected={s.fit} onChange={s.setFit}>
              Fill width
            </Switch>
          </Row>
        )}
        {s.item && (
          <>
            <Row name="Align">
              <Choice label="Across its columns" />
              <Choice label="Down its rows" />
            </Row>
            <Row name="Placed">
              <span className="min-w-0 flex-1">Column 1 / 7, row 2 / 3</span>
              <Button variant="secondary" size="small">
                Auto
              </Button>
            </Row>
          </>
        )}
      </div>
      <footer className="flex items-center gap-2 border-t border-bleed/8 p-2">
        <output className="min-w-0 flex-1 px-1 text-label text-muted">{s.said || tally(s.changes)}</output>
        <Button variant="secondary" size="small" onPress={s.reset}>
          Reset
        </Button>
        <Button variant="primary" size="small" onPress={s.copy}>
          Copy changes
        </Button>
      </footer>
    </Shell>
  )
}

// ——— A: named sections, each a label over its controls

function Sections({ selection: s }) {
  const Section = ({ name, children }) => (
    <section className="flex flex-col gap-1.5">
      <h3 className="px-1 text-label text-muted">{name}</h3>
      {children}
    </section>
  )
  return (
    <Shell>
      <header className="flex items-start gap-1 p-2 pb-3">
        <div className="flex min-w-0 flex-1 flex-col px-2 pt-1">
          <span className="truncate text-label text-muted">{s.path.join(' › ')}</span>
          <span className="truncate text-body font-medium">{s.name}</span>
        </div>
        <IconButton label="Undo ⌘Z" icon="arrow-uturn-left" />
        <IconButton label="Redo ⇧⌘Z" icon="arrow-uturn-right" />
        <IconButton label="Close" icon="xmark" />
      </header>
      <div className="flex flex-col gap-4 border-t border-bleed/8 p-3">
        <Section name="Layout">
          <Layouts selection={s} />
          {s.mode === 'grid' && (
            <div className="flex gap-1.5">
              <Count selection={s} />
              <Field label="Columns" value={`repeat(${s.columns}, minmax(0, 1fr))`} />
            </div>
          )}
        </Section>
        {s.mode === 'grid' && (
          <div className="flex gap-3">
            <Section name="Rows">
              <Field label="Rows" placeholder="auto" />
            </Section>
            <Section name="Gap">
              <Field label="Gap" value={s.gap} onChange={s.setGap} />
            </Section>
          </div>
        )}
        {s.text && (
          <Section name="Type">
            <div className="px-1">
              <Switch isSelected={s.fit} onChange={s.setFit}>
                Fill width
              </Switch>
            </div>
          </Section>
        )}
        {s.item && (
          <Section name="In its grid">
            <div className="flex gap-1.5">
              <Choice label="Across its columns" />
              <Choice label="Down its rows" />
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="min-w-0 flex-1 text-muted">Column 1 / 7, row 2 / 3</span>
              <Button variant="ghost" size="small">
                Auto
              </Button>
            </div>
          </Section>
        )}
      </div>
      <footer className="flex items-center gap-1 border-t border-bleed/8 p-2">
        <From selection={s} className="w-32" />
        <span className="flex-1" />
        <IconButton label="Reset" icon="arrow-counterclockwise" onPress={s.reset} />
        <Button variant="primary" size="small" onPress={s.copy}>
          {s.said || (s.changes ? `Copy ${tally(s.changes)}` : 'Copy changes')}
        </Button>
      </footer>
    </Shell>
  )
}

// ——— B: tools along the top, then one column of names and one of controls

function Columns({ selection: s }) {
  const Row = ({ name, children }) => (
    <>
      <span className="self-center text-label text-muted">{name}</span>
      <div className="flex min-w-0 items-center gap-1.5">{children}</div>
    </>
  )
  return (
    <Shell>
      <header className="flex items-center gap-1 p-2">
        <span className="min-w-0 flex-1 truncate px-2">
          <span className="text-muted">{s.path.at(-1)} › </span>
          <span className="font-medium">{s.name}</span>
        </span>
        <From selection={s} className="w-32" />
        <IconButton label="Close" icon="xmark" />
      </header>
      <div className="flex items-center gap-0.5 border-t border-bleed/8 px-2 py-1">
        <IconButton label="Group ⌘G" icon="square-dashed-and-cursorarrow" />
        <IconButton label="Ungroup ⇧⌘G" icon="rectangle-split-3x1" />
        <IconButton label="Duplicate ⌘D" icon="square-on-square" />
        <IconButton label="Delete" icon="trash" />
        <span className="flex-1" />
        <IconButton label="Undo ⌘Z" icon="arrow-uturn-left" />
        <IconButton label="Redo ⇧⌘Z" icon="arrow-uturn-right" />
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-bleed/8 p-3">
        <Row name="Layout">
          <Layouts selection={s} />
        </Row>
        {s.mode === 'grid' && (
          <>
            <Row name="Columns">
              <Count selection={s} className="min-w-0 flex-1" />
            </Row>
            <Row name="Sizes">
              <Field label="Columns" value={`repeat(${s.columns}, minmax(0, 1fr))`} />
            </Row>
            <Row name="Rows">
              <Field label="Rows" placeholder="auto" />
            </Row>
            <Row name="Gap">
              <Field label="Gap" value={s.gap} onChange={s.setGap} />
            </Row>
          </>
        )}
        {s.text && (
          <Row name="Fill width">
            <span className="flex-1" />
            <Switch aria-label="Fill width" isSelected={s.fit} onChange={s.setFit} />
          </Row>
        )}
        {s.item && (
          <>
            <Row name="Across">
              <Choice label="Across its columns" />
            </Row>
            <Row name="Down">
              <Choice label="Down its rows" />
            </Row>
            <Row name="Placed">
              <span className="min-w-0 flex-1">1 / 7, 2 / 3</span>
              <Button variant="ghost" size="small">
                Auto
              </Button>
            </Row>
          </>
        )}
      </div>
      <footer className="flex flex-col border-t border-bleed/8 p-2">
        <Button variant="primary" size="small" onPress={s.copy}>
          {s.said || (s.changes ? `Copy ${tally(s.changes)}` : 'Copy changes')}
        </Button>
      </footer>
    </Shell>
  )
}

// ——— C: no names at all. Each control says what it is, and the rest is in a menu

function Bare({ selection: s }) {
  return (
    <Shell>
      <header className="flex items-center gap-1 p-2">
        <span className="min-w-0 flex-1 truncate px-2">
          <span className="text-muted">{s.path.at(-1)} › </span>
          <span className="font-medium">{s.name}</span>
        </span>
        <MenuTrigger>
          <Button variant="ghost" size="small" aria-label="More">
            <Icon name="ellipsis" />
          </Button>
          <Menu>
            <MenuItem>Group</MenuItem>
            <MenuItem>Ungroup</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem onAction={s.reset}>Reset every change</MenuItem>
            <MenuSeparator />
            <MenuItem variant="danger">Delete</MenuItem>
          </Menu>
        </MenuTrigger>
        <IconButton label="Close" icon="xmark" />
      </header>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <Layouts selection={s} />
        {s.mode === 'grid' && (
          <>
            <div className="flex gap-1.5">
              <Count selection={s} />
              <Field label="Columns" value={`repeat(${s.columns}, minmax(0, 1fr))`} />
            </div>
            <div className="flex gap-1.5">
              <Field label="Rows" placeholder="Rows, auto" />
              <Field label="Gap" placeholder="Gap" value={s.gap} onChange={s.setGap} />
            </div>
          </>
        )}
        {s.text && (
          <div className="px-1 pt-1">
            <Switch isSelected={s.fit} onChange={s.setFit}>
              Fill width
            </Switch>
          </div>
        )}
        {s.item && (
          <div className="flex gap-1.5">
            <Choice label="Across its columns" items={SELF.map(({ id }) => ({ id, name: `Across, ${id}` }))} />
            <Choice label="Down its rows" items={SELF.map(({ id }) => ({ id, name: `Down, ${id}` }))} />
          </div>
        )}
      </div>
      <footer className="flex items-center gap-2 border-t border-bleed/8 p-2">
        <From selection={s} className="min-w-0 flex-1" />
        <Button variant={s.changes ? 'primary' : 'secondary'} size="small" onPress={s.copy}>
          {s.said || (s.changes ? `Copy ${tally(s.changes)}` : 'Copy changes')}
        </Button>
      </footer>
    </Shell>
  )
}

const VARIATIONS = [
  ['Now', 'As it is today.', Now],
  ['A. Sections', 'The element is the title, and each group of controls sits under its name.', Sections],
  ['B. Tools and a list', 'Actions are icons along the top. Below, one column of names and one of controls.', Columns],
  ['C. Bare', 'No names. Each control says what it is, and the rarer actions are in a menu.', Bare],
]

function Column({ name, line, Panel, scene }) {
  const selection = useSelection(SCENES[scene])
  return (
    <section className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-body font-medium">{name}</h2>
        <p className="text-body text-muted">{line}</p>
      </div>
      <Panel selection={selection} />
    </section>
  )
}

function Page() {
  const [scene, setScene] = useState('grid')
  return (
    <main className="flex flex-col gap-8 px-4 py-10 md:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title">Compose panel</h1>
          <p className="text-body text-muted">Three ways to give the panel a clearer order, beside how it is now. The controls work, on a made-up selection.</p>
        </div>
        <div className="w-64">
          <Segments label="What's selected" value={scene} onChange={setScene} options={[['grid', 'A grid in a grid'], ['text', 'A line of text']]} />
        </div>
      </header>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-10">
        {VARIATIONS.map(([name, line, Panel]) => (
          <Column key={name + scene} name={name} line={line} Panel={Panel} scene={scene} />
        ))}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Page />)
