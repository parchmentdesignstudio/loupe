// Compose's panel and its opening button, drawn with Loupe's components. `api` is what client.js lets it read and do.
// The panel has no names beside its controls: each one says what it is, by its options, its placeholder or its label,
// and what's done less often is in the menu
import { Icon } from '@parchment/icons/react'
import { Button, Keyboard, ListBoxItem, Menu, MenuItem, MenuSeparator, MenuTrigger, NumberField, Select, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, TooltipTrigger } from '@parchment/ui'
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

// The key starts it afresh when the value changes from outside, such as by a drag or an undo
const Text = (props) => <TextInput key={props.value} {...props} />

// Text that's set when the field is left or Enter is pressed, and marked when CSS won't take it
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

// A choice that names itself in each option, as in Across, center, so it needs no name beside it
function Choice({ label, says, options, value, onChange }) {
  const items = options.map((id) => ({ id, name: `${says}, ${id.replace('flex-', '').replace('-', ' ')}` }))
  return (
    <Select variant="filled" size="small" className="min-w-0 flex-1" aria-label={label} items={items} value={value} onChange={(id) => id !== null && onChange(String(id))}>
      {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
    </Select>
  )
}

const Pair = ({ children }) => <div className="flex gap-1.5">{children}</div>
const Toggles = ({ children }) => <div className="flex flex-col gap-2 px-1 pt-1">{children}</div>

function Layout({ api, element }) {
  const style = getComputedStyle(element)
  const mode = style.display.endsWith('grid') ? 'grid' : style.display.endsWith('flex') ? 'flex' : 'block'
  const isItem = element !== document.body && getComputedStyle(element.parentElement).display.endsWith('grid')
  const grid = mode === 'grid' && api.geometry(element)
  const fills = element !== document.body && api.holdsText(element)
  const gap = <Text label="Gap" placeholder="Gap" value={api.gapOf(element)} onCommit={(value) => api.setGap(element, value)} />
  const subgrid = (property) => api.written(element, property).startsWith('subgrid')
  const sizes = (property) => (api.written(element, property) === 'none' ? '' : api.written(element, property))

  return (
    <>
      <Segments label="Layout" options={[['block', 'Block'], ['grid', 'Grid'], ['flex', 'Flex']]} value={mode} onChange={(value) => api.setLayout(element, value)} />
      {mode === 'grid' && (
        <>
          {!subgrid(COLUMNS) && (
            <Pair>
              <NumberField
                variant="filled"
                size="small"
                className="w-20 shrink-0"
                aria-label="How many columns"
                minValue={1}
                formatOptions={{ maximumFractionDigits: 0 }}
                value={grid.columns.tracks.length}
                onChange={(count) => !Number.isNaN(count) && api.setCount(element, COLUMNS, count)}
              />
              <Text label="Column sizes" placeholder="Columns" value={sizes(COLUMNS)} onCommit={(value) => api.setValue(element, COLUMNS, value)} />
            </Pair>
          )}
          <Pair>
            {!subgrid(ROWS) && <Text label="Row sizes" placeholder="Rows, auto" value={sizes(ROWS)} onCommit={(value) => api.setValue(element, ROWS, value)} />}
            {gap}
          </Pair>
        </>
      )}
      {mode === 'flex' && (
        <>
          <Segments label="Direction" options={[['row', 'Row'], ['column', 'Column']]} value={style.flexDirection.split('-')[0]} onChange={(value) => api.assign(element, 'flex-direction', value)} />
          <Pair>
            <Choice label="Align" says="Align" options={ALIGN} value={style.alignItems === 'normal' ? 'stretch' : style.alignItems} onChange={(value) => api.assign(element, 'align-items', value)} />
            <Choice label="Justify" says="Justify" options={JUSTIFY} value={style.justifyContent === 'normal' ? 'flex-start' : style.justifyContent} onChange={(value) => api.assign(element, 'justify-content', value)} />
          </Pair>
          <Pair>{gap}</Pair>
        </>
      )}
      {isItem && (
        <Pair>
          <Choice label="Across its columns" says="Across" options={SELF} value={SELF.includes(style.justifySelf) ? style.justifySelf : 'stretch'} onChange={(value) => api.assign(element, 'justify-self', value)} />
          <Choice label="Down its rows" says="Down" options={SELF} value={SELF.includes(style.alignSelf) ? style.alignSelf : 'stretch'} onChange={(value) => api.assign(element, 'align-self', value)} />
        </Pair>
      )}
      {(fills || mode === 'flex' || (mode === 'grid' && isItem)) && (
        <Toggles>
          {mode === 'flex' && (
            <Switch isSelected={style.flexWrap === 'wrap'} onChange={(on) => api.assign(element, 'flex-wrap', on ? 'wrap' : 'nowrap')}>
              Wrap
            </Switch>
          )}
          {mode === 'grid' && isItem && (
            <>
              <Switch isSelected={subgrid(COLUMNS)} onChange={(on) => api.setSubgrid(element, COLUMNS, on)}>
                Columns from its grid
              </Switch>
              <Switch isSelected={subgrid(ROWS)} onChange={(on) => api.setSubgrid(element, ROWS, on)}>
                Rows from its grid
              </Switch>
            </>
          )}
          {fills && (
            <Switch isSelected={api.fitted(element)} onChange={(on) => api.setFit(element, on)}>
              Fill width
            </Switch>
          )}
        </Toggles>
      )}
    </>
  )
}

function Panel({ api }) {
  const { selected, touch, several, from } = api.state
  const primary = selected.at(-1)
  const command = api.isMac ? '⌘' : 'Ctrl '
  const count = api.count()
  const message = api.message()
  const path = []
  for (let node = primary?.parentElement; node && node !== document.documentElement; node = node.parentElement) path.unshift(node)
  // Only the breakpoints the window has reached, as a change from a wider one wouldn't show
  const froms = Object.entries(api.breakpoints())
    .filter(([, width]) => width <= innerWidth)
    .map(([id, width]) => ({ id, name: id === 'base' ? 'Every width' : `From ${id}, ${width}px` }))
  const isPlaced = primary && primary !== document.body && api.geometry(primary.parentElement)
  // What's done by a shortcut, or seldom, so it needn't be in view. The keys aren't shown where there's no keyboard
  const key = (keys) => (touch ? null : <Keyboard>{keys}</Keyboard>)
  return (
    <div className="flex w-72 flex-col rounded-xl bg-overlay text-control text-ink shadow-overlay [--bleed:var(--overlay-bleed)]">
      <header className="flex cursor-grab touch-none items-center gap-1 p-2">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden pl-1">
          {!primary && <span className="px-1 font-medium">Compose</span>}
          {path.slice(-2).map((node, index) => (
            <span key={index} className="flex min-w-0 shrink items-center text-muted">
              <Button variant="ghost" size="small" className="min-w-0 text-muted" onPress={() => api.select([node])}>
                {api.label(node)}
              </Button>
              ›
            </span>
          ))}
          {primary && <span className="shrink-0 truncate px-2 font-medium">{api.label(primary)}</span>}
        </div>
        <MenuTrigger>
          <Button variant="ghost" size="small" aria-label="More">
            <Icon name="ellipsis" />
          </Button>
          <Menu>
            <MenuItem onAction={api.group}>Group {key(`${command}G`)}</MenuItem>
            <MenuItem onAction={api.ungroup}>Ungroup {key(`⇧${command}G`)}</MenuItem>
            <MenuItem onAction={api.duplicate}>Duplicate {key(`${command}D`)}</MenuItem>
            {isPlaced && <MenuItem onAction={() => api.clearPlace(primary)}>Let the grid place it</MenuItem>}
            {touch && <MenuItem onAction={() => api.setSeveral(!several)}>{several ? 'Select one at a time' : 'Select several'}</MenuItem>}
            <MenuSeparator />
            <MenuItem onAction={api.undo}>Undo {key(`${command}Z`)}</MenuItem>
            <MenuItem onAction={api.redo}>Redo {key(`⇧${command}Z`)}</MenuItem>
            <MenuItem onAction={api.reset}>Reset every change</MenuItem>
            <MenuSeparator />
            <MenuItem variant="danger" onAction={api.remove}>
              Delete {key('⌫')}
            </MenuItem>
          </Menu>
        </MenuTrigger>
        <TooltipTrigger>
          <Button variant="ghost" size="small" aria-label="Close" onPress={() => api.toggle(false)}>
            <Icon name="xmark" />
          </Button>
          <Tooltip>Close</Tooltip>
        </TooltipTrigger>
      </header>
      <div className="flex flex-col gap-2 px-3 pb-3">
        {!primary && <p className="text-body text-muted">{touch ? 'Double-tap an element to select it.' : `Click an element to select it, and ${command.trim()}-click to add more.`}</p>}
        {selected.length > 1 && <p className="text-body text-muted">{`${selected.length} selected. ${touch ? 'Group them from the menu.' : `${command}G groups them.`}`}</p>}
        {selected.length === 1 && <Layout api={api} element={primary} />}
      </div>
      <footer className="flex flex-col gap-2 border-t border-bleed/8 p-2">
        {message && <output className="px-1 text-label text-muted">{message}</output>}
        <div className="flex items-center gap-2">
          <Select variant="filled" size="small" className="min-w-0 flex-1" aria-label="The width changes apply from" items={froms} value={froms.some(({ id }) => id === from) ? from : 'base'} onChange={(id) => id !== null && api.setFrom(String(id))}>
            {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
          </Select>
          <Button variant={count ? 'primary' : 'secondary'} size="small" onPress={api.copy}>
            {count ? `Copy ${count} ${count === 1 ? 'change' : 'changes'}` : 'Copy changes'}
          </Button>
        </div>
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
