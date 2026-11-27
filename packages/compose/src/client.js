// Compose: rearrange a page's layout in the browser, then hand the changes to whoever writes the source.
// Everything it does is a change to the live page, kept in `record`, which `summarise` turns into the handover
import { describe, summarise } from './changes.js'
import { formatTemplate, linePosition, linesOf, nearestLine, nearestTrack, parseTemplate, placement, placeTracks, withCount } from './grid.js'
import { gapSteps, gapValue } from './spacing.js'
import sheet from 'virtual:compose-panel-styles'
import { createPanel } from './panel.jsx'
import { styles } from './styles.js'

const COLUMNS = 'grid-template-columns'
const ROWS = 'grid-template-rows'
const FRACTION = 'minmax(0, 1fr)'
const REPLACED = /^(img|svg|video|canvas|picture|iframe|input|button|select|textarea|object|embed)$/
const px = (value) => parseFloat(value) || 0
const clamp = (value, low, high) => Math.min(Math.max(value, low), high)
const isMac = /Mac|iPhone|iPad/.test(navigator.platform)

function h(tag, properties = {}, ...children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(properties)) {
    if (key.startsWith('on')) node.addEventListener(key.slice(2), value)
    else if (value === true) node.setAttribute(key, '')
    else if (value !== false && value != null) node.setAttribute(key, value)
  }
  node.append(...children.flat().filter((child) => child != null && child !== false))
  return node
}

/** Puts Compose on the page. `launcher` adds its own button, for a page with no toolbar to open it from */
export function mount({ launcher = true, onToggle } = {}) {
  if (window.parchmentCompose) return window.parchmentCompose

  const state = { on: false, selected: [], hover: null, press: null, drag: null, indicator: null, note: null, landing: null, tap: null, touch: matchMedia('(pointer: coarse)').matches, several: false }
  const record = { styles: new Map(), groups: new Set(), copies: new Map(), removed: [], deleted: [], moved: new Map() }
  const history = { done: [], undone: [], batch: null }

  const host = h('div', { 'data-compose': true })
  const root = host.attachShadow({ mode: 'open' })
  const layer = h('div', { class: 'layer' })
  const panel = h('div', { class: 'panel', hidden: true })
  const naming = h('input', { class: 'naming', hidden: true, 'aria-label': 'Line name', placeholder: 'Line name' })
  const open = h('div', { class: 'launcher', hidden: !launcher })
  const floats = h('div', { class: 'floats' })
  // Loupe's sheet is written for a page, so its :root becomes this shadow root's host. A shadow root can't register
  // properties, which Tailwind's shadows and rings start from, so those go to the page, where they change nothing
  const registered = sheet.match(/@property[^{]+\{[^}]*\}/g) ?? []
  root.append(h('style', {}, `@layer reset;${sheet.replaceAll(':root', ':host')}`), h('style', {}, styles), layer, naming, panel, open, floats)
  document.head.append(h('style', { 'data-compose-properties': true }, registered.join('\n')))
  const draw = createPanel({ panel, opener: open, floats })

  const ours = (event) => event.composedPath().some((node) => node === host || /^(astro-dev-toolbar|vite-error-overlay)$/.test(node.localName ?? ''))

  // ——— Styles: what Compose set on each element, and what its style attribute held before

  function entry(element) {
    if (!record.styles.has(element)) record.styles.set(element, { original: new Map(), set: new Map() })
    return record.styles.get(element)
  }

  function write(element, property, value) {
    const { original, set } = entry(element)
    if (!original.has(property)) original.set(property, element.style.getPropertyValue(property))
    element.style.removeProperty(property)
    if (value) {
      element.style.setProperty(property, value)
      set.set(property, value)
    } else {
      if (original.get(property)) element.style.setProperty(property, original.get(property))
      set.delete(property)
      if (!element.getAttribute('style')) element.removeAttribute('style')
    }
  }

  // The same, but a value that changes nothing is left out, so going back to how an element was leaves no change
  function assign(element, property, value) {
    write(element, property, value)
    if (!value) return
    const applied = getComputedStyle(element).getPropertyValue(property)
    write(element, property, '')
    if (getComputedStyle(element).getPropertyValue(property) !== applied) write(element, property, value)
  }

  const composed = (element, property) => record.styles.get(element)?.set.get(property) ?? ''
  const snapshot = (elements) => elements.map((element) => [element, new Map(entry(element).set)])
  const restore = (saved) => {
    for (const [element, values] of saved) {
      for (const property of new Set([...entry(element).set.keys(), ...values.keys()])) write(element, property, values.get(property) ?? '')
    }
  }

  // ——— History

  function push(step) {
    if (history.batch) return history.batch.push(step)
    history.done.push(step)
    history.undone = []
  }

  function batch(run) {
    const steps = (history.batch = [])
    try {
      run()
    } finally {
      history.batch = null
    }
    if (!steps.length) return
    push({ undo: () => steps.toReversed().forEach((step) => step.undo()), redo: () => steps.forEach((step) => step.redo()) })
  }

  function commit(before) {
    const after = snapshot(before.map(([element]) => element))
    const text = (saved) => JSON.stringify(saved.map(([, values]) => [...values]))
    if (text(before) !== text(after)) push({ undo: () => restore(before), redo: () => restore(after) })
  }

  function change(elements, run) {
    const before = snapshot(elements)
    run()
    refit(elements)
    commit(before)
    render()
  }

  function step(from, to, action) {
    const last = from.pop()
    if (!last) return
    last[action]()
    to.push(last)
    select(state.selected.filter((element) => element.isConnected))
  }
  const undo = () => step(history.done, history.undone, 'undo')
  const redo = () => step(history.undone, history.done, 'redo')

  // ——— Grids: where the tracks are, and which lines an item is between

  function geometry(element) {
    const style = getComputedStyle(element)
    if (!style.display.endsWith('grid')) return null
    const rect = element.getBoundingClientRect()
    const left = rect.left + px(style.borderLeftWidth) + px(style.paddingLeft)
    const top = rect.top + px(style.borderTopWidth) + px(style.paddingTop)
    const width = element.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
    const height = element.clientHeight - px(style.paddingTop) - px(style.paddingBottom)
    const axis = (name, template, gap, start, extent, distribute) => {
      if (template.startsWith('subgrid')) {
        const outer = element.parentElement && geometry(element.parentElement)
        if (outer?.[name].tracks.length) {
          const lines = linesIn(element, outer)[name]
          return { tracks: outer[name].tracks.slice(lines.start - 1, lines.end - 1), names: outer[name].names.slice(lines.start - 1, lines.end), subgrid: true }
        }
      }
      const parsed = parseTemplate(template) ?? { sizes: [], names: [[]] }
      const between = gap.endsWith('%') ? (extent * px(gap)) / 100 : px(gap)
      return { tracks: placeTracks(parsed.sizes.map(px), { start, extent, gap: between, distribute }), names: parsed.names, subgrid: false }
    }
    return {
      element,
      left,
      top,
      width,
      height,
      columns: axis('columns', style.gridTemplateColumns, style.columnGap, left, width, style.justifyContent),
      rows: axis('rows', style.gridTemplateRows, style.rowGap, top, height, style.alignContent),
    }
  }

  function linesIn(item, grid) {
    const style = getComputedStyle(item)
    const rect = item.getBoundingClientRect()
    return {
      columns: linesOf(grid.columns.tracks, {
        start: style.gridColumnStart,
        end: style.gridColumnEnd,
        from: rect.left - px(style.marginLeft),
        to: rect.right + px(style.marginRight),
      }),
      rows: linesOf(grid.rows.tracks, {
        start: style.gridRowStart,
        end: style.gridRowEnd,
        from: rect.top - px(style.marginTop),
        to: rect.bottom + px(style.marginBottom),
      }),
    }
  }

  function place(item, grid, lines) {
    if (lines.columns) write(item, 'grid-column', placement(grid.columns.names, lines.columns.start, lines.columns.end))
    if (lines.rows) write(item, 'grid-row', placement(grid.rows.names, lines.rows.start, lines.rows.end))
  }

  // Gives every item the place it has now. An item the browser placed moves when another is put in its way, so
  // before one is moved by hand they all hold still, and can then overlap
  function pin(grid) {
    const whole = (value) => /^-?\d+$/.test(value)
    const loose = [...grid.element.children].filter((child) => {
      const style = getComputedStyle(child)
      return style.display !== 'none' && !/^(absolute|fixed)$/.test(style.position) && !(whole(style.gridColumnStart) && whole(style.gridRowStart))
    })
    const lines = loose.map((child) => linesIn(child, grid))
    loose.forEach((child, index) => place(child, grid, lines[index]))
  }

  // What a stylesheet gives a property, as it was written. Computed tracks are in pixels, which is no use to edit.
  // The last rule that matches wins, which is right for utility classes and close enough for the rest
  function authored(element, property) {
    if (element.style.getPropertyValue(property)) return element.style.getPropertyValue(property)
    let found = ''
    const visit = (rules) => {
      for (const rule of rules) {
        try {
          if (rule instanceof CSSStyleRule) {
            const value = rule.style.getPropertyValue(property)
            if (value && element.matches(rule.selectorText)) found = value
          } else if (rule instanceof CSSMediaRule && !matchMedia(rule.conditionText).matches) continue
          if (rule.cssRules?.length) visit(rule.cssRules)
        } catch {}
      }
    }
    for (const sheet of document.styleSheets) {
      try {
        visit(sheet.cssRules)
      } catch {}
    }
    return found
  }

  // A track list to change a line at a time. One the browser can't hand over as written, such as auto-fill, comes
  // from what it resolved to instead: even columns as fractions, rows as auto
  function template(element, property) {
    const parsed = parseTemplate(composed(element, property) || authored(element, property))
    if (parsed?.sizes.length) return parsed
    const resolved = parseTemplate(getComputedStyle(element).getPropertyValue(property)) ?? { sizes: [], names: [[]] }
    const even = resolved.sizes.length > 1 && resolved.sizes.every((size) => Math.abs(px(size) - px(resolved.sizes[0])) < 0.5)
    return { sizes: resolved.sizes.map((size) => (property === ROWS ? 'auto' : even ? FRACTION : size)), names: resolved.names }
  }

  // ——— Selection

  function pick(node) {
    if (!(node instanceof Element) || node === host || node.closest('astro-dev-toolbar, vite-error-overlay')) return null
    let element = node
    while (element.ownerSVGElement) element = element.ownerSVGElement
    while (element.parentElement && getComputedStyle(element).display === 'inline' && !REPLACED.test(element.localName)) element = element.parentElement
    return element === document.documentElement ? document.body : element
  }

  const childOf = (ancestor, element) => {
    while (element.parentElement !== ancestor) element = element.parentElement
    return element
  }

  // A click stays at the level of what's selected: on something beside it, or on whatever holds the pointer among
  // its siblings. Clicking inside what's selected goes one level in. With nothing selected, it's the element itself
  function resolve(target) {
    const inside = state.selected.find((element) => element.contains(target))
    if (inside) return inside === target ? inside : childOf(inside, target)
    const scope = state.selected.at(-1)?.parentElement
    return scope && scope !== target && scope.contains(target) ? childOf(scope, target) : target
  }

  function select(elements) {
    state.selected = elements
    render()
  }

  const label = (element) => (record.groups.has(element) ? 'group' : record.copies.has(element) ? `${element.localName} copy` : element.localName + (element.classList[0] ? `.${element.classList[0]}` : ''))

  // ——— Structure: grouping, ungrouping and moving

  // Where every element stood before anything was moved, read the first time something is: its neighbours, to tell
  // later whether it has really moved, and its path down from the body, to find it again after a reload
  const origins = new Map()
  function stamp() {
    if (origins.size) return
    const visit = (parent, path) => {
      const children = [...parent.children].filter((child) => child !== host)
      children.forEach((child, index) => {
        origins.set(child, { id: `${path}/${index}`, parent, next: children[index + 1] ?? null, previous: children[index - 1] ?? null })
        visit(child, `${path}/${index}`)
      })
    }
    origins.set(document.body, { id: '' })
    visit(document.body, '')
  }

  function group() {
    const elements = [...state.selected].sort((first, second) => (first.compareDocumentPosition(second) & 4 ? -1 : 1))
    const parent = elements[0]?.parentElement
    if (!parent || elements.includes(document.body) || elements.some((element) => element.parentElement !== parent)) {
      return say('Elements need the same parent to be grouped')
    }
    stamp()
    const wrapper = document.createElement('div')
    const places = elements.map((element) => element.nextSibling)
    const outer = geometry(parent)
    const lines = outer && elements.map((element) => linesIn(element, outer))
    const apply = () => {
      parent.insertBefore(wrapper, elements[0])
      wrapper.append(...elements)
      record.groups.add(wrapper)
    }
    batch(() => {
      // In a grid the group takes the room its elements had between them, and they let go of their own places
      const before = snapshot([wrapper, ...elements])
      apply()
      if (outer) {
        const span = (axis) => ({ start: Math.min(...lines.map((line) => line[axis].start)), end: Math.max(...lines.map((line) => line[axis].end)) })
        place(wrapper, outer, { columns: span('columns'), rows: elements.some((element) => composed(element, 'grid-row')) ? span('rows') : null })
        for (const element of elements) {
          write(element, 'grid-column', '')
          write(element, 'grid-row', '')
        }
      }
      push({
        undo: () => {
          for (let index = elements.length - 1; index >= 0; index--) parent.insertBefore(elements[index], places[index])
          wrapper.remove()
          record.groups.delete(wrapper)
        },
        redo: apply,
      })
      commit(before)
    })
    select([wrapper])
  }

  function ungroup() {
    const wrappers = state.selected.filter((element) => element !== document.body && element.parentElement && element.children.length)
    if (!wrappers.length) return say('Nothing here to ungroup')
    const loose = (wrapper) => [...wrapper.childNodes].some((node) => node.nodeType === 3 && node.data.trim())
    if (wrappers.some(loose)) return say('Text of its own would be left loose')
    const freed = []
    stamp()
    batch(() => {
      for (const wrapper of wrappers) {
        const parent = wrapper.parentElement
        const next = wrapper.nextSibling
        const inside = [...wrapper.childNodes]
        const children = [...wrapper.children]
        const added = record.groups.has(wrapper)
        const removal = { element: wrapper, parent, described: describe(wrapper, isNew) }
        // In a grid each one takes the group's columns, or keeps its own lines where the group passed the grid's
        // on as a subgrid. Outside one, a place on the group's grid means nothing
        const outer = geometry(parent)
        const inner = geometry(wrapper)
        const held = outer && linesIn(wrapper, outer)
        const places = children.map((child) => {
          if (!outer) return null
          const own = inner && linesIn(child, inner)
          const shift = (axis) => ({ start: own[axis].start + held[axis].start - 1, end: own[axis].end + held[axis].start - 1 })
          return { columns: inner?.columns.subgrid ? shift('columns') : held.columns, rows: inner?.rows.subgrid ? shift('rows') : null }
        })
        const before = snapshot(children)
        const apply = () => {
          for (const node of inside) parent.insertBefore(node, wrapper)
          wrapper.remove()
          if (added) record.groups.delete(wrapper)
          else record.removed.push(removal)
        }
        apply()
        children.forEach((child, index) => {
          for (const property of ['grid-column', 'grid-row']) write(child, property, '')
          if (places[index]) place(child, outer, places[index])
        })
        push({
          undo: () => {
            parent.insertBefore(wrapper, next)
            wrapper.append(...inside)
            if (added) record.groups.add(wrapper)
            else record.removed.splice(record.removed.indexOf(removal), 1)
          },
          redo: apply,
        })
        commit(before)
        freed.push(...children)
      }
    })
    select(freed)
  }

  // Puts an element before another, in its own parent or a different one. A place on the grid it leaves means
  // nothing where it's going, and in a grid it arrives across every column, as a new grid's children start
  function move(element, before, parent = element.parentElement) {
    const from = element.parentElement
    const was = element.nextSibling
    if (parent === from && (before === element || before === element.nextElementSibling)) return
    stamp()
    if (!record.moved.has(element)) record.moved.set(element, origins.get(element) ?? { next: element.nextElementSibling, previous: element.previousElementSibling })
    const apply = () => parent.insertBefore(element, before)
    batch(() => {
      const saved = snapshot([element])
      apply()
      if (parent !== from) {
        for (const property of ['grid-column', 'grid-row']) write(element, property, '')
        if (geometry(parent)) write(element, 'grid-column', '1 / -1')
      }
      push({ undo: () => from.insertBefore(element, was), redo: apply })
      commit(saved)
    })
  }

  const isNew = (element) => record.groups.has(element) || record.copies.has(element)

  function duplicate() {
    const sources = state.selected.filter((element) => element !== document.body && element.parentElement)
    if (!sources.length) return say('Select something to duplicate')
    const copies = []
    stamp()
    batch(() => {
      for (const source of sources) {
        const copy = source.cloneNode(true)
        const apply = () => {
          source.after(copy)
          record.copies.set(copy, describe(source, isNew))
        }
        apply()
        push({
          undo: () => {
            copy.remove()
            record.copies.delete(copy)
          },
          redo: apply,
        })
        copies.push(copy)
      }
    })
    select(copies)
  }

  function remove() {
    const elements = state.selected.filter((element) => element !== document.body && element.parentElement)
    if (!elements.length) return say('Select something to delete')
    if (elements.some((element) => record.groups.has(element))) return say('Ungroup it first, or what it holds goes too')
    stamp()
    batch(() => {
      for (const element of elements) {
        const parent = element.parentElement
        const next = element.nextSibling
        const copied = record.copies.get(element)
        const deletion = { element, parent, described: describe(element, isNew) }
        const apply = () => {
          element.remove()
          if (copied) record.copies.delete(element)
          else record.deleted.push(deletion)
        }
        apply()
        push({
          undo: () => {
            parent.insertBefore(element, next)
            if (copied) record.copies.set(element, copied)
            else record.deleted.splice(record.deleted.indexOf(deletion), 1)
          },
          redo: apply,
        })
      }
    })
    select([])
  }

  // ——— Layout: what the panel changes

  function setLayout(element, mode) {
    const children = [...element.children]
    change([element, ...children], () => {
      assign(element, 'display', mode)
      if (mode === 'grid') {
        if (authored(element, COLUMNS) && authored(element, COLUMNS) !== 'none') return
        write(element, COLUMNS, `repeat(12, ${FRACTION})`)
        // Each element starts across the whole grid, so nothing moves until it's dragged
        for (const child of children) {
          const style = getComputedStyle(child)
          if (style.gridColumnStart === 'auto' && style.gridColumnEnd === 'auto') write(child, 'grid-column', '1 / -1')
        }
        return
      }
      for (const property of [COLUMNS, ROWS]) write(element, property, '')
      for (const child of children) for (const property of ['grid-column', 'grid-row']) write(child, property, '')
      if (mode !== 'flex') for (const property of ['flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap']) write(element, property, '')
    })
  }

  function setCount(element, property, count) {
    change([element], () => assign(element, property, formatTemplate(withCount(template(element, property), count, property === ROWS ? 'auto' : FRACTION))))
  }

  function setValue(element, property, value) {
    const text = value.trim()
    if (text && !CSS.supports(property, text)) return false
    change([element], () => assign(element, property, text))
  }

  // ——— Type that fills its width

  const fitted = (element) => /c(qi|qw)$|vw$/.test(composed(element, 'font-size'))
  const holdsText = (element) => [...element.childNodes].some((node) => node.nodeType === 3 && node.data.trim())

  // The size is a share of the nearest container's width, so the type keeps filling it as the page narrows. The
  // parent becomes that container unless something above already is one, or being one would change its own width,
  // as it does for an element sized by what's in it. Then the size is a share of the window's width instead
  function sizeToWidth(element) {
    const parent = element.parentElement
    let container = parent
    while (container && getComputedStyle(container).containerType === 'normal') container = container.parentElement
    if (!container) {
      const width = parent.getBoundingClientRect().width
      write(parent, 'container-type', 'inline-size')
      if (Math.abs(parent.getBoundingClientRect().width - width) > 1) write(parent, 'container-type', '')
      else container = parent
    }
    const inner = (box) => box.clientWidth - px(getComputedStyle(box).paddingLeft) - px(getComputedStyle(box).paddingRight)
    const basis = container ? inner(container) : innerWidth
    const words = document.createRange()
    words.selectNodeContents(element)
    // Twice, as the width of a line doesn't grow quite in step with its size
    for (let pass = 0; pass < 2; pass++) {
      const size = (px(getComputedStyle(element).fontSize) * inner(element)) / words.getBoundingClientRect().width
      write(element, 'font-size', `${Math.floor((size / basis) * 10000) / 100}${container ? 'cqi' : 'vw'}`)
    }
  }

  function setFit(element, on) {
    const parent = element.parentElement
    change([element, parent], () => {
      if (on) {
        write(element, 'white-space', 'nowrap')
        return sizeToWidth(element)
      }
      for (const property of ['font-size', 'white-space']) write(element, property, '')
      if (![...parent.children].some(fitted)) write(parent, 'container-type', '')
    })
  }

  // Type that fills its width is sized again when the width it has changes
  function refit(elements) {
    for (const element of elements) if (element.isConnected && fitted(element)) sizeToWidth(element)
  }

  // Dragging a grip changes a gap or one side's padding by steps of the spacing scale. With Alt held it takes the
  // other with it: the gap the other way, or the padding on the opposite side
  function dragSpacing(element, { space, side, axis }, press) {
    const root = getComputedStyle(document.documentElement)
    const token = root.getPropertyValue('--spacing').trim()
    const step = token.endsWith('px') ? px(token) : (px(token) || 0.25) * px(root.fontSize)
    const opposite = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }
    const property = space === 'padding' ? `padding-${side}` : axis === 'columns' ? 'column-gap' : 'row-gap'
    const other = space === 'padding' ? `padding-${opposite[side]}` : axis === 'columns' ? 'row-gap' : 'column-gap'
    const along = space === 'padding' ? side === 'left' || side === 'right' : axis === 'columns'
    const start = px(getComputedStyle(element).getPropertyValue(property))
    const before = snapshot([element])
    const drag = {
      spacing: true,
      sides: [],
      move(event) {
        const moved = (along ? event.clientX - press.x : event.clientY - press.y) * (side === 'right' || side === 'bottom' ? -1 : 1)
        const steps = Math.max(0, Math.round((start + moved) / step))
        const value = gapValue(`${steps}`, Boolean(token))
        restore(before)
        write(element, property, value)
        if (event.altKey) write(element, other, value)
        if (space === 'gap') gatherGap(element)
        drag.sides = space === 'padding' ? (event.altKey ? [side, opposite[side]] : [side]) : []
        state.note = { left: event.clientX + 14, top: event.clientY - 14, text: `${steps}` }
      },
      end() {
        state.note = null
        commit(before)
      },
    }
    return drag
  }

  // A gap is kept as the one property, rows then columns, so the panel's field and the list of changes read it whole
  function gatherGap(element) {
    const style = getComputedStyle(element)
    const [rows, columns] = ['row-gap', 'column-gap'].map((property) => composed(element, property) || (style.getPropertyValue(property) === 'normal' ? '0px' : style.getPropertyValue(property)))
    for (const property of ['row-gap', 'column-gap']) write(element, property, '')
    write(element, 'gap', rows === columns ? rows : `${rows} ${columns}`)
  }

  function nameLine(element, axis, line, value) {
    const property = axis === 'columns' ? COLUMNS : ROWS
    const tracks = template(element, property)
    tracks.names[line - 1] = value.trim().split(/\s+/).filter(Boolean)
    const text = formatTemplate(tracks)
    if (!CSS.supports(property, text)) return say('A line can’t take that name')
    change([element], () => assign(element, property, text))
  }

  // An arrow key selects the sibling that lies that way: the nearest one, counting distance to the side double so
  // one straight ahead wins over one that's closer but off to the side
  function walk(key) {
    const element = state.selected.at(-1)
    if (!element?.parentElement || element === document.body) return
    const [x, y] = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] }[key]
    const centre = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    const from = centre(element.getBoundingClientRect())
    let nearest = null
    let least = Infinity
    for (const sibling of element.parentElement.children) {
      if (sibling === element || sibling === host || !sibling.getClientRects().length) continue
      const to = centre(sibling.getBoundingClientRect())
      const ahead = (to.x - from.x) * x + (to.y - from.y) * y
      const aside = Math.abs((to.x - from.x) * y) + Math.abs((to.y - from.y) * x)
      if (ahead > 1 && ahead + aside * 2 < least) [nearest, least] = [sibling, ahead + aside * 2]
    }
    if (!nearest) return
    nearest.scrollIntoView({ block: 'nearest' })
    select([nearest])
  }

  // With Shift an arrow key moves a grid item by a track, and with Alt changes how many it spans. Outside a grid,
  // Shift reorders
  function nudge(key, resize) {
    const element = state.selected.at(-1)
    const parent = element?.parentElement
    if (!parent || element === document.body) return
    const grid = geometry(parent)
    const forward = key === 'arrowright' || key === 'arrowdown'
    if (!grid) {
      if (resize) return
      const before = forward ? element.nextElementSibling?.nextElementSibling ?? null : element.previousElementSibling
      if (before || forward) move(element, before)
      return render()
    }
    const axis = key === 'arrowleft' || key === 'arrowright' ? 'columns' : 'rows'
    const lines = linesIn(element, grid)
    const { start, end } = lines[axis]
    const last = grid[axis].tracks.length + (axis === 'rows' ? 2 : 1)
    const by = forward ? 1 : -1
    if (resize) lines[axis] = { start, end: clamp(end + by, start + 1, last) }
    else if (start + by >= 1 && end + by <= last) lines[axis] = { start: start + by, end: end + by }
    if (lines[axis].start === start && lines[axis].end === end) return
    change([...parent.children], () => {
      pin(grid)
      place(element, grid, lines)
    })
  }

  // ——— Dragging

  // What's dragged follows the pointer, though the page has it wherever it would land. `hold` shifts it there
  // without changing the layout, and `settle` lets it slide into the place it ends up
  function lift(element) {
    const kept = ['translate', 'transition', 'opacity', 'z-index', 'position'].map((property) => [property, element.style.getPropertyValue(property)])
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const clear = () => {
      for (const [property, value] of kept) value ? element.style.setProperty(property, value) : element.style.removeProperty(property)
      if (!element.getAttribute('style')) element.removeAttribute('style')
    }
    return {
      // Where it sits in the layout, without the shift
      landed() {
        element.style.translate = 'none'
        return element.getBoundingClientRect()
      },
      hold(left, top) {
        const rect = this.landed()
        Object.assign(element.style, { translate: `${left - rect.left}px ${top - rect.top}px`, opacity: '0.85', transition: 'none' })
        if (getComputedStyle(element).position === 'static') element.style.position = 'relative'
        element.style.zIndex = '2147483000'
        return rect
      },
      settle() {
        const from = element.getBoundingClientRect()
        const to = this.landed()
        if (still || (from.left === to.left && from.top === to.top)) return clear()
        element.style.translate = `${from.left - to.left}px ${from.top - to.top}px`
        element.getBoundingClientRect()
        Object.assign(element.style, { transition: 'translate 0.16s ease-out', translate: '0px 0px', opacity: '' })
        setTimeout(clear, 180)
      },
    }
  }

  function dragOnGrid(element, press, handle) {
    const grid = geometry(element.parentElement)
    const at = linesIn(element, grid)
    const siblings = [...element.parentElement.children]
    const before = snapshot(siblings)
    let pinned = false
    const columns = grid.columns.tracks
    const rows = grid.rows.tracks
    const span = { columns: at.columns.end - at.columns.start, rows: at.rows.end - at.rows.start }
    const grab = { column: nearestTrack(columns, press.x) - at.columns.start, row: nearestTrack(rows, press.y) - at.rows.start }
    // Everything is read once, as the press began: rows change height as the item moves, and chasing them would
    // make it jump about under the pointer
    const origin = element.getBoundingClientRect()
    const lifted = handle ? null : lift(element)
    let elsewhere = null
    const others = siblings
      .filter((child) => child !== element && child.getClientRects().length && !/^(absolute|fixed)$/.test(getComputedStyle(child).position))
      .map((child) => ({ element: child, rect: child.getBoundingClientRect(), lines: linesIn(child, grid) }))
    return {
      move(event) {
        const { clientX, clientY, altKey } = event
        // Well outside the grid, it's on its way to somewhere else on the page
        const away = Math.max(grid.left - clientX, clientX - grid.left - grid.width, grid.top - clientY, clientY - grid.top - grid.height) > 24
        if (lifted && away) {
          restore(before)
          pinned = false
          lifted.hold(origin.left + clientX - press.x, origin.top + clientY - press.y)
          elsewhere = aim(element, event)
          return
        }
        elsewhere = state.indicator = null
        const lines = { columns: { ...at.columns }, rows: { ...at.rows } }
        const shares = []
        // Dropped on another item, it shares that item's row: the two take half each, three a third, in the order
        // they sit under the pointer. Alt leaves it free to overlap instead
        const over = !handle && !altKey && others.find(({ rect }) => clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom)
        const mates = over ? others.filter((other) => other.lines.rows.start === over.lines.rows.start).sort((first, second) => first.lines.columns.start - second.lines.columns.start) : []
        if (over && mates.length < columns.length) {
          const order = [...mates]
          order.splice(mates.filter(({ rect }) => rect.left + rect.width / 2 < clientX).length, 0, null)
          const each = Math.floor(columns.length / order.length)
          order.forEach((mate, index) => {
            const shared = { start: 1 + index * each, end: index === order.length - 1 ? columns.length + 1 : 1 + (index + 1) * each }
            if (mate) shares.push([mate.element, { columns: shared, rows: mate.lines.rows }])
            else Object.assign(lines, { columns: shared, rows: { ...over.lines.rows } })
          })
        } else if (!handle) {
          const column = clamp(nearestTrack(columns, clientX) - grab.column, 1, Math.max(1, columns.length + 1 - span.columns))
          const row = Math.max(1, nearestTrack(rows, clientY, 24) - grab.row)
          lines.columns = { start: column, end: column + span.columns }
          lines.rows = { start: row, end: row + span.rows }
        } else {
          if (handle.x < 0) lines.columns.start = Math.min(nearestLine(columns, clientX), at.columns.end - 1)
          if (handle.x > 0) lines.columns.end = Math.max(nearestLine(columns, clientX), at.columns.start + 1)
          if (handle.y < 0) lines.rows.start = Math.min(nearestLine(rows, clientY), at.rows.end - 1)
          if (handle.y > 0) lines.rows.end = Math.max(nearestLine(rows, clientY, 24), at.rows.start + 1)
        }
        if (pinned || JSON.stringify(lines) !== JSON.stringify(at)) {
          pinned = true
          restore(before)
          pin(grid)
          for (const [mate, shared] of shares) place(mate, grid, shared)
          place(element, grid, lines)
        }
        if (!lifted) return
        const rect = lifted.hold(origin.left + clientX - press.x, origin.top + clientY - press.y)
        state.landing = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      },
      end() {
        state.landing = null
        if (elsewhere) return drop(element, elsewhere, lifted)
        lifted?.settle()
        refit([element])
        commit(before)
      },
    }
  }

  // Dragging a column line gives one of the columns beside it what it takes from the other, in quarters of a
  // fraction, so the rest of the grid keeps its widths
  function dragLine(grid, line, press) {
    const element = grid.element
    const tracks = template(element, COLUMNS)
    const fraction = (size) => /^(?:minmax\(0(?:px)?,\s*)?(\d*\.?\d+)fr\)?$/.exec(size ?? '')?.[1]
    const [first, second] = [fraction(tracks.sizes[line - 2]), fraction(tracks.sizes[line - 1])].map(Number)
    if (!first || !second) return null
    const wrapped = tracks.sizes[line - 2].startsWith('minmax')
    const widths = [grid.columns.tracks[line - 2], grid.columns.tracks[line - 1]].map((track) => track.end - track.start)
    const before = snapshot([element])
    let moved = false
    return {
      line: true,
      move({ clientX }) {
        if (!moved && Math.abs(clientX - press.x) < 4) return
        moved = true
        const total = first + second
        const share = clamp((widths[0] + clientX - press.x) / (widths[0] + widths[1]), 0, 1)
        const one = clamp(Math.round(share * total * 4) / 4, 0.25, total - 0.25)
        const sizes = [...tracks.sizes]
        for (const [index, value] of [[line - 2, one], [line - 1, total - one]]) sizes[index] = wrapped ? `minmax(0, ${value}fr)` : `${value}fr`
        restore(before)
        write(element, COLUMNS, formatTemplate({ sizes, names: tracks.names }))
        state.note = { left: clientX + 14, top: press.y + 18, text: `${one}fr ${total - one}fr` }
      },
      end() {
        state.note = null
        commit(before)
      },
    }
  }

  // Where a dragged element would go if it were let go here: before a sibling, into a container, or beside
  // another element as a pair. It can be anywhere on the page, not only in the parent it came from
  function aim(element, { clientX, clientY, altKey }) {
    state.indicator = state.landing = null
    const under = document.elementsFromPoint(clientX, clientY).find((node) => node !== host && node !== document.documentElement && !element.contains(node))
    const leaf = under && pick(under)
    if (!leaf || element.contains(leaf)) return null
    const box = (node) => node.getBoundingClientRect()
    const holds = (node) => node === document.body || record.groups.has(node) || (node.children.length > 0 && !holdsText(node))
    // Within a few pixels of a container's edge means beside it, not inside it. Not for a container the element is
    // already in, where the edge is as much the first or last place inside
    const atEdge = (node) => {
      const rect = box(node)
      return !node.contains(element) && Math.min(clientX - rect.left, rect.right - clientX, clientY - rect.top, rect.bottom - clientY) < 10
    }
    let sibling = holds(leaf) && !(leaf !== document.body && atEdge(leaf)) ? null : leaf
    let parent = sibling ? sibling.parentElement : leaf
    while (parent !== document.body && parent.parentElement && atEdge(parent)) [sibling, parent] = [parent, parent.parentElement]
    if (sibling === element) return null
    if (geometry(parent)) {
      const rect = box(parent)
      state.landing = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      return { parent, before: null }
    }
    const style = getComputedStyle(parent)
    const across = style.display.endsWith('flex') && style.flexDirection.startsWith('row')
    const siblings = [...parent.children].filter((child) => child !== element && child !== host && child.getClientRects().length)
    // In a stack, the left or right third of another element puts the two side by side, half each
    const within = sibling && !across && !altKey ? (clientX - box(sibling).left) / box(sibling).width : 0.5
    if (within < 1 / 3 || within > 2 / 3) {
      const rect = box(sibling)
      state.indicator = { left: (within > 2 / 3 ? rect.right : rect.left) - 1, top: rect.top, width: 2, height: rect.height }
      return { pair: sibling, after: within > 2 / 3 }
    }
    const middle = (rect) => (across ? rect.left + rect.width / 2 : rect.top + rect.height / 2)
    const before = siblings.find((other) => (across ? clientX : clientY) < middle(box(other))) ?? null
    const near = before ?? siblings.at(-1)
    if (!near) {
      const rect = box(parent)
      state.landing = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      return { parent, before }
    }
    const rect = box(near)
    state.indicator = across
      ? { left: (before ? rect.left : rect.right) - 1, top: rect.top, width: 2, height: rect.height }
      : { left: rect.left, top: (before ? rect.top : rect.bottom) - 1, width: rect.width, height: 2 }
    return { parent, before }
  }

  function drop(element, target, lifted) {
    state.indicator = state.landing = null
    const from = element.getBoundingClientRect()
    if (target?.pair) pair(target.pair, element, target.after)
    else if (target) move(element, target.before, target.parent)
    // From where it was let go to where the page now has it
    lifted.hold(from.left, from.top)
    lifted.settle()
  }

  function dragInFlow(element, press) {
    const origin = element.getBoundingClientRect()
    const lifted = lift(element)
    let target
    return {
      move(event) {
        lifted.hold(origin.left + event.clientX - press.x, origin.top + event.clientY - press.y)
        target = aim(element, event)
      },
      end: () => drop(element, target, lifted),
    }
  }

  // Two elements of a stack side by side: a new 12-column grid where the first stood, with half each
  function pair(sibling, element, after) {
    stamp()
    const parent = sibling.parentElement
    const wrapper = document.createElement('div')
    const inside = after ? [sibling, element] : [element, sibling]
    // Put back last to first as they stood, so each one's old neighbour is there to go before
    const stood = [sibling, element].sort((first, second) => (first.compareDocumentPosition(second) & 4 ? 1 : -1)).map((node) => [node, node.parentElement, node.nextSibling])
    const apply = () => {
      parent.insertBefore(wrapper, sibling)
      wrapper.append(...inside)
      record.groups.add(wrapper)
    }
    batch(() => {
      const saved = snapshot([wrapper, ...inside])
      apply()
      write(wrapper, 'display', 'grid')
      write(wrapper, COLUMNS, `repeat(12, ${FRACTION})`)
      write(inside[0], 'grid-column', '1 / span 6')
      write(inside[1], 'grid-column', '7 / span 6')
      for (const node of inside) write(node, 'grid-row', '')
      push({
        undo: () => {
          for (const [node, home, next] of stood) home.insertBefore(node, next)
          wrapper.remove()
          record.groups.delete(wrapper)
        },
        redo: apply,
      })
      commit(saved)
    })
    select([element])
  }

  function beginDrag(press, handle) {
    const element = press.element
    if (element === document.body || !element.parentElement) return null
    return geometry(element.parentElement) ? dragOnGrid(element, press, handle) : handle ? null : dragInFlow(element, press)
  }

  // ——— The overlay: outlines, the grid, its line badges and the handles, redrawn only when one of them moves

  let drawn = ''
  let painting = false
  function paint() {
    painting = state.on
    if (!state.on) return
    requestAnimationFrame(paint)
    if (state.selected.some((element) => !element.isConnected)) select(state.selected.filter((element) => element.isConnected))
    const parts = []
    const box = (kind, rect, extra) => parts.push({ kind, left: rect.left, top: rect.top, width: rect.width, height: rect.height, ...extra })
    const primary = state.selected.at(-1)
    const outer = primary?.parentElement && primary !== document.body ? geometry(primary.parentElement) : null
    const own = primary ? geometry(primary) : null
    const focus = state.drag?.grid ? outer : (own ?? outer)

    for (const grid of [outer, own]) {
      if (!grid) continue
      const quiet = grid === focus ? '' : ' quiet'
      for (const track of grid.columns.tracks) box(`strip${quiet}`, { left: track.start, top: grid.top, width: track.end - track.start, height: grid.height })
      for (const track of grid.rows.tracks) box(`rule${quiet}`, { left: grid.left, top: track.start, width: grid.width, height: track.end - track.start })
    }
    if (state.hover && !state.drag && !state.selected.includes(state.hover)) box('hover', state.hover.getBoundingClientRect())
    for (const element of state.selected) box('selected', element.getBoundingClientRect())
    if (primary) {
      const rect = primary.getBoundingClientRect()
      box('tag', { left: rect.left, top: Math.max(rect.top, 16), width: 'auto', height: 'auto' }, { text: label(primary) })
      if (outer && !state.drag?.flow) {
        for (const x of [-1, 0, 1]) {
          for (const y of [-1, 0, 1]) {
            if (x || y) parts.push({ kind: 'handle', left: rect.left + ((x + 1) / 2) * rect.width, top: rect.top + ((y + 1) / 2) * rect.height, x, y })
          }
        }
      }
    }
    if (focus && (!state.drag || state.drag.line)) {
      const badge = (axis, line, left, top) => parts.push({ kind: 'badge', left, top, axis, line, text: focus[axis].names[line - 1]?.join(' ') || `${line}` })
      const above = focus.top > 28 ? focus.top - 12 : focus.top + 12
      const beside = focus.left > 28 ? focus.left - 14 : focus.left + 14
      for (let line = 1; line <= focus.columns.tracks.length + 1 && focus.columns.tracks.length; line++) badge('columns', line, linePosition(focus.columns.tracks, line), above)
      for (let line = 1; line <= focus.rows.tracks.length + 1 && focus.rows.tracks.length; line++) badge('rows', line, beside, linePosition(focus.rows.tracks, line))
      if (focus.columns.tracks.length && !focus.columns.subgrid && !state.drag) parts.push({ kind: 'badge add', left: focus.columns.tracks.at(-1).end + 22, top: above, add: 'columns', text: '+' })
    }
    // Grips for the selected container's padding, a side each, and for the gaps between its tracks or children
    if (primary?.children.length && (!state.drag || state.drag.spacing)) {
      const rect = primary.getBoundingClientRect()
      const style = getComputedStyle(primary)
      const edge = { left: rect.left + px(style.borderLeftWidth), right: rect.right - px(style.borderRightWidth), top: rect.top + px(style.borderTopWidth), bottom: rect.bottom - px(style.borderBottomWidth) }
      const padding = { left: px(style.paddingLeft), right: px(style.paddingRight), top: px(style.paddingTop), bottom: px(style.paddingBottom) }
      // In the middle of as much of it as is on screen, so a tall container's grips aren't a scroll away
      const middle = { x: (Math.max(edge.left, 0) + Math.min(edge.right, innerWidth)) / 2, y: (Math.max(edge.top, 0) + Math.min(edge.bottom, innerHeight)) / 2 }
      const grip = (left, top, upright, data) => parts.push({ kind: upright ? 'grip' : 'grip wide', left, top, ...data })
      const inset = (size) => Math.max(size / 2, 7)
      for (const side of state.drag?.sides ?? []) {
        const upright = side === 'left' || side === 'right'
        box('band', {
          left: side === 'right' ? edge.right - padding.right : edge.left,
          top: side === 'bottom' ? edge.bottom - padding.bottom : edge.top,
          width: upright ? padding[side] : edge.right - edge.left,
          height: upright ? edge.bottom - edge.top : padding[side],
        })
      }
      if (rect.width > 64 && rect.height > 64) {
        grip(edge.left + inset(padding.left), middle.y, true, { space: 'padding', side: 'left' })
        grip(edge.right - inset(padding.right), middle.y, true, { space: 'padding', side: 'right' })
        grip(middle.x, edge.top + inset(padding.top), false, { space: 'padding', side: 'top' })
        grip(middle.x, edge.bottom - inset(padding.bottom), false, { space: 'padding', side: 'bottom' })
      }
      if (own) {
        const between = (tracks, index) => (tracks[index - 1].end + tracks[index].start) / 2
        for (let index = 1; index < own.columns.tracks.length; index++) grip(between(own.columns.tracks, index), middle.y, true, { space: 'gap', axis: 'columns' })
        for (let index = 1; index < own.rows.tracks.length; index++) grip(middle.x, between(own.rows.tracks, index), false, { space: 'gap', axis: 'rows' })
      } else if (style.display.endsWith('flex')) {
        const across = style.flexDirection.startsWith('row')
        const rects = [...primary.children].filter((child) => child.getClientRects().length).map((child) => child.getBoundingClientRect())
        for (let index = 1; index < rects.length; index++) {
          const [first, second] = [rects[index - 1], rects[index]]
          if (across) grip((first.right + second.left) / 2, middle.y, true, { space: 'gap', axis: 'columns' })
          else grip(middle.x, (first.bottom + second.top) / 2, false, { space: 'gap', axis: 'rows' })
        }
      }
    }
    if (state.landing) box('landing', state.landing)
    if (state.note) parts.push({ kind: 'note', ...state.note })
    if (state.indicator) box('drop', state.indicator)

    const text = JSON.stringify(parts)
    if (text === drawn) return
    drawn = text
    layer.replaceChildren(
      ...parts.map(({ kind, left, top, width, height, text, ...data }) => {
        const size = (value) => (typeof value === 'number' ? `${value}px` : value)
        const node = h('div', { class: kind, style: `left:${left}px;top:${top}px;${width === undefined ? '' : `width:${size(width)};height:${size(height)}`}` }, text ?? '')
        if (kind === 'handle') node.style.cursor = `${data.y < 0 ? 'n' : data.y > 0 ? 's' : ''}${data.x < 0 ? 'w' : data.x > 0 ? 'e' : ''}-resize`
        Object.assign(node.dataset, data)
        return node
      }),
    )
    layer.grid = focus
  }

  layer.addEventListener('pointerdown', (event) => {
    const { x, y } = event.target.dataset
    const element = state.selected.at(-1)
    if (event.target.matches('.grip') && element) {
      event.preventDefault()
      state.drag = dragSpacing(element, event.target.dataset, { x: event.clientX, y: event.clientY })
      return
    }
    if (event.target.matches('.badge') && layer.grid) {
      const { axis, line, add } = event.target.dataset
      event.preventDefault()
      if (add) return setCount(layer.grid.element, COLUMNS, layer.grid.columns.tracks.length + 1)
      // Pressed and moved it resizes the columns either side. Pressed twice, it's named, below
      if (axis === 'columns' && !layer.grid.columns.subgrid) state.drag = dragLine(layer.grid, Number(line), { x: event.clientX, y: event.clientY })
      return
    }
    if (!event.target.matches('.handle') || !element) return
    event.preventDefault()
    state.drag = beginDrag({ element, x: event.clientX, y: event.clientY }, { x: Number(x), y: Number(y) })
    if (state.drag) state.drag.grid = true
  })

  layer.addEventListener('dblclick', (event) => {
    const { axis, line } = event.target.dataset
    const grid = layer.grid
    if (!event.target.matches('.badge') || !grid || !axis) return
    if (grid[axis].subgrid) return say('Name this line on the grid it comes from')
    Object.assign(naming.style, { left: event.target.style.left, top: event.target.style.top })
    naming.value = grid[axis].names[line - 1]?.join(' ') ?? ''
    naming.hidden = false
    naming.focus()
    naming.select()
    naming.commit = () => nameLine(grid.element, axis, Number(line), naming.value)
  })

  naming.addEventListener('change', () => naming.commit())
  naming.addEventListener('blur', () => (naming.hidden = true))
  naming.addEventListener('keydown', (event) => event.key === 'Enter' && naming.blur())

  // ——— The panel

  let message = ''
  let messageTimer
  function say(text) {
    message = text
    clearTimeout(messageTimer)
    messageTimer = setTimeout(() => {
      message = ''
      render()
    }, 2400)
    render()
  }

  const api = {
    state,
    isMac,
    message: () => message,
    count: () => summarise(record).count,
    label,
    geometry,
    select,
    toggle,
    group,
    ungroup,
    duplicate,
    remove,
    reset,
    copy,
    undo: () => (history.done.length ? undo() : say('Nothing to undo')),
    redo: () => (history.undone.length ? redo() : say('Nothing to redo')),
    setLayout,
    setCount,
    setValue,
    setFit,
    fitted,
    holdsText,
    written: (element, property) => composed(element, property) || authored(element, property),
    assign: (element, property, value) => change([element], () => assign(element, property, value)),
    gapOf(element) {
      const gap = getComputedStyle(element).gap
      return gapSteps(composed(element, 'gap')) ?? (composed(element, 'gap') || (gap === 'normal' ? '' : gap))
    },
    setGap: (element, value) => setValue(element, 'gap', gapValue(value, Boolean(getComputedStyle(document.documentElement).getPropertyValue('--spacing')))),
    // A subgrid from a stylesheet is turned off by saying none, and one Compose set by taking it away again
    setSubgrid(element, property, on) {
      change([element], () => write(element, property, on ? 'subgrid' : composed(element, property) === 'subgrid' ? '' : 'none'))
    },
    placeOf(element, outer) {
      const { columns, rows } = linesIn(element, outer)
      return `Column ${columns.start} / ${columns.end}, row ${rows.start} / ${rows.end}`
    },
    clearPlace(element) {
      if (!composed(element, 'grid-column') && !composed(element, 'grid-row')) return say('The grid already places it')
      change([element], () => ['grid-column', 'grid-row'].forEach((property) => write(element, property, '')))
    },
    setSeveral(on) {
      state.several = on
      render()
    },
  }

  let rendering = false
  function render() {
    if (rendering) return
    rendering = true
    // After the event that asked for it, so several changes in one go draw once
    setTimeout(() => {
      rendering = false
      draw(api)
    })
  }

  function reset() {
    if (!history.done.length) return say('Nothing to put back')
    while (history.done.length) {
      const last = history.done.pop()
      last.undo()
      history.undone.push(last)
    }
    select(state.selected.filter((element) => element.isConnected))
  }

  async function copy() {
    const { count, text } = summarise(record, { path: location.pathname, width: innerWidth })
    if (!count) return say('No changes to copy yet')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // A page that isn't allowed the clipboard, such as one in a frame, can still copy what's selected
      const holder = h('textarea', { style: 'position:fixed;opacity:0' })
      holder.value = text
      root.append(holder)
      holder.select()
      document.execCommand('copy')
      holder.remove()
    }
    say('Copied')
  }

  // The panel moves by its header, to get it off whatever is being worked on
  panel.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('header') || event.target.closest('button')) return
    const rect = panel.getBoundingClientRect()
    const from = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const drag = (moved) => Object.assign(panel.style, { left: `${clamp(moved.clientX - from.x, 0, innerWidth - rect.width)}px`, top: `${clamp(moved.clientY - from.y, 0, innerHeight - 40)}px`, right: 'auto', bottom: 'auto' })
    addEventListener('pointermove', drag)
    addEventListener('pointerup', () => removeEventListener('pointermove', drag), { once: true })
  })

  // ——— The page's own events, caught before the page sees them while Compose is on

  const swallow = (event) => {
    if (!state.on || ours(event)) return
    event.preventDefault()
    event.stopPropagation()
  }

  function onPointerDown(event) {
    if (!state.on || ours(event) || event.button !== 0) return
    if (event.pointerType === 'touch') return onTouchDown(event)
    swallow(event)
    root.activeElement?.blur()
    const target = pick(event.target)
    if (!target) return
    const held = state.selected.find((element) => element.contains(target))
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return select(held ? state.selected.filter((other) => other !== held) : [...state.selected, resolve(target)])
    }
    // A press on what's selected may be the start of dragging it, so going inside it waits until the press ends
    if (!held) select([resolve(target)])
    state.press = { element: held ?? state.selected[0], inside: held && held !== target ? childOf(held, target) : null, x: event.clientX, y: event.clientY }
  }

  // A finger scrolls the page, so one tap selects nothing: two do. A touch that starts on what's selected and
  // moves is a drag, which the touchmove listener below keeps the page from scrolling under
  function onTouchDown(event) {
    if (!state.touch) {
      state.touch = true
      render()
    }
    const target = pick(event.target)
    if (!target) return
    const { tap } = state
    const again = tap && event.timeStamp - tap.time < 350 && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) < 30
    state.tap = again ? null : { time: event.timeStamp, x: event.clientX, y: event.clientY }
    const held = state.selected.find((element) => element.contains(target))
    if (!again) {
      if (held) state.press = { element: held, inside: null, touch: true, x: event.clientX, y: event.clientY }
      return
    }
    state.zoom = true
    root.activeElement?.blur()
    state.press = null
    if (state.several) select(held ? state.selected.filter((other) => other !== held) : [...state.selected, resolve(target)])
    else select([resolve(target)])
  }

  function onPointerMove(event) {
    if (!state.on) return
    if (state.drag) return state.drag.move(event)
    if (state.press) {
      if (Math.hypot(event.clientX - state.press.x, event.clientY - state.press.y) < 4) return
      select([state.press.element])
      state.drag = beginDrag(state.press)
      if (state.drag) state.drag[geometry(state.press.element.parentElement) ? 'grid' : 'flow'] = true
      state.press = state.drag ? state.press : null
      return state.drag?.move(event)
    }
    const target = ours(event) || event.pointerType === 'touch' ? null : pick(document.elementFromPoint(event.clientX, event.clientY))
    state.hover = target && resolve(target)
  }

  function onPointerUp() {
    if (state.drag) {
      state.drag.end()
      state.drag = null
      render()
    } else if (state.press?.inside) select([state.press.inside])
    else if (state.press && !state.press.touch && state.selected.length > 1) select([state.press.element])
    state.press = null
  }

  function onKeyDown(event) {
    const command = event.metaKey || event.ctrlKey
    if (event.altKey && !command && event.code === 'KeyG') {
      event.preventDefault()
      return toggle()
    }
    if (!state.on) return
    const target = event.composedPath()[0]
    if (ours(event) && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return event.key === 'Escape' && target.blur()
    const key = event.key.toLowerCase()
    // A focused button in the panel keeps the keys that work it
    if (ours(event) && ['enter', 'tab', ' '].includes(key)) return
    const primary = state.selected.at(-1)
    if (command && key === 'g') (event.shiftKey ? ungroup : group)()
    else if (command && key === 'z') (event.shiftKey ? redo : undo)()
    else if (command && key === 'd') duplicate()
    else if (command || (event.altKey && !key.startsWith('arrow'))) return
    else if ((key === 'delete' || key === 'backspace') && primary) remove()
    else if (key === 'escape' && state.selected.length) select([])
    else if (key === 'escape') toggle(false)
    else if (key === 'enter' && primary) {
      const next = event.shiftKey ? (primary === document.body ? null : primary.parentElement) : primary.firstElementChild
      if (next) select([next])
    } else if (key === 'tab' && primary) {
      const next = event.shiftKey ? primary.previousElementSibling : primary.nextElementSibling
      if (next && next !== host) select([next])
    } else if (key.startsWith('arrow') && primary) {
      if (event.altKey) nudge(key, true)
      else if (event.shiftKey) nudge(key, false)
      else walk(key)
    }
    else return
    event.preventDefault()
    event.stopPropagation()
  }

  function toggle(on = !state.on) {
    if (on === state.on) return
    state.on = on
    panel.hidden = !on
    open.hidden = on || !launcher
    state.hover = state.press = state.drag = null
    drawn = ''
    layer.replaceChildren()
    if (on) {
      if (!host.isConnected) document.documentElement.append(host)
      render()
      if (!painting) requestAnimationFrame(paint)
    }
    onToggle?.(on)
  }

  addEventListener('pointerdown', onPointerDown, true)
  addEventListener('pointermove', onPointerMove, true)
  addEventListener('pointerup', onPointerUp, true)
  addEventListener('pointercancel', onPointerUp, true)
  addEventListener('touchmove', (event) => state.on && (state.press || state.drag) && event.cancelable && event.preventDefault(), { capture: true, passive: false })
  // The second tap of two would otherwise zoom the page in
  addEventListener(
    'touchend',
    (event) => {
      if (state.zoom && event.cancelable) event.preventDefault()
      state.zoom = false
    },
    { capture: true, passive: false },
  )
  addEventListener('keydown', onKeyDown, true)
  for (const type of ['click', 'dblclick', 'auxclick', 'mousedown', 'mouseup', 'dragstart', 'submit']) addEventListener(type, swallow, true)
  document.documentElement.append(host)
  render()

  window.parchmentCompose = {
    toggle,
    get active() {
      return state.on
    },
    /** The changes so far, as the text Copy changes gives */
    changes: () => summarise(record, { path: location.pathname, width: innerWidth }),
  }
  return window.parchmentCompose
}
