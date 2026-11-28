// What changed, written for whoever makes it in the source: each element by its tag, classes, text and the place
// it was written, then what to do with it. It reads the page as it stands, so a change that was undone isn't there

import { gatherPadding, spacingClasses } from './spacing.js'

const short = (text, length) => (text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text)

/**
 * Where an element was written. Loupe's locate leaves it on the element. So does Astro's dev server, until its
 * toolbar takes it off again, so Compose's integration keeps what was there, and gives the path from the site's root
 */
export function sourceOf(element) {
  const located = element.getAttribute('data-source')
  if (located) return located
  const kept = globalThis.parchmentComposeSources?.get(element) ?? {}
  const file = element.getAttribute('data-astro-source-file') ?? kept['data-astro-source-file']
  const place = element.getAttribute('data-astro-source-loc') ?? kept['data-astro-source-loc']
  if (!file) return null
  const root = globalThis.__astro_dev_toolbar__?.root ?? ''
  return `${root && file.startsWith(root) ? file.slice(root.length) : file}${place ? `:${place}` : ''}`
}

/** A short path of selectors, for a page that doesn't say where its elements were written */
function pathOf(element, isNew) {
  const steps = []
  for (let node = element; node && node.localName !== 'html' && steps.length < 4; node = node.parentElement) {
    if (isNew(node)) continue
    if (node.id) {
      steps.unshift(`#${node.id}`)
      break
    }
    steps.unshift(node.localName + (node.classList[0] ? `.${node.classList[0]}` : ''))
  }
  return steps.join(' > ')
}

export function describe(element, isNew = () => false) {
  let tag = `<${element.localName}`
  if (element.id) tag += ` id="${element.id}"`
  const classes = element.getAttribute('class')?.trim()
  if (classes) tag += ` class="${short(classes, 80)}"`
  // Its words find a heading or a paragraph in the source. What only holds other elements has none of its own
  const own = [...element.childNodes].some((node) => node.nodeType === 3 && node.data.trim()) || element.querySelectorAll('*').length < 3
  const text = (own && element.textContent.replace(/\s+/g, ' ').trim()) || element.getAttribute('alt') || element.getAttribute('aria-label') || ''
  return `${tag}>${text ? ` “${short(text, 48)}”` : ''} (${sourceOf(element) ?? pathOf(element, isNew)})`
}

/**
 * The changes as a numbered list. `record` holds what Compose has touched: `groups`, the wrappers it added,
 * `removed`, the wrappers it took away, each described as it was, `moved`, the neighbours each reordered element began between, and `styles`, what it set, in `layers` by the breakpoint each applies from
 */
export function summarise(record, { path = '/', width = 0, breakpoints = {} } = {}) {
  const inDocument = (first, second) => (first.compareDocumentPosition(second) & 4 ? -1 : 1)
  const groups = [...record.groups].filter((group) => group.isConnected).sort(inDocument)
  const copies = [...(record.copies ?? [])].filter(([copy]) => copy.isConnected).sort(([first], [second]) => inDocument(first, second))
  const isNew = (element) => record.groups.has(element) || Boolean(record.copies?.has(element))
  const name = (element) => {
    if (record.groups.has(element)) return `the new <div> from ${groups.indexOf(element) + 1}`
    const copy = copies.findIndex(([made]) => made === element)
    return copy < 0 ? describe(element, isNew) : `the copy from ${groups.length + copy + 1}`
  }
  const written = (values) =>
    [...gatherPadding(values)]
      .map(([property, value]) => {
        const classes = spacingClasses(property, value)
        const fills = property === 'font-size' && /cqi$|vw$/.test(value)
        return `${property}: ${value}${classes ? ` (${classes})` : ''}${fills ? ' (sized so the text fills its width, which text-fit: grow does by itself in browsers that have it)' : ''}`
      })
      .join('; ')
  // What's set for every width first, then what only applies from a breakpoint up, narrowest first
  const declarations = (element) => {
    const entry = record.styles.get(element)
    const layers = [...(entry?.layers ?? [['base', entry?.set ?? new Map()]])].filter(([, values]) => values.size)
    return layers
      .sort(([first], [second]) => (breakpoints[first] ?? 0) - (breakpoints[second] ?? 0))
      .map(([name, values]) => (name === 'base' ? written(values) : `From ${name}${breakpoints[name] ? ` (${breakpoints[name]}px)` : ''}: ${written(values)}`))
      .join('\n   ')
  }
  const items = []

  for (const group of groups) {
    const lines = ['Wrap in a new <div>:', ...[...group.children].map((child) => `   - ${name(child)}`)]
    if (declarations(group)) lines.push(`   On the new <div>: ${declarations(group)}`)
    items.push(lines.join('\n'))
  }
  for (const [copy, source] of copies) {
    const next = copy.nextElementSibling
    items.push(`Duplicate ${source}, and put the copy ${next ? `before ${name(next)}` : `at the end of ${name(copy.parentElement)}`}`)
  }
  for (const { element, parent, described } of record.deleted ?? []) {
    if (!element.isConnected && parent.isConnected) items.push(`Delete ${described}`)
  }
  for (const { element, parent, described } of record.removed) {
    if (!element.isConnected && parent.isConnected) items.push(`Remove the wrapper ${described}, leaving what’s inside it in its place`)
  }
  for (const [element, origin] of record.moved) {
    // Beside either of the neighbours it began with, it hasn't moved, whatever has been wrapped around them since
    if (!element.isConnected || element.nextElementSibling === origin.next || element.previousElementSibling === origin.previous) continue
    const next = element.nextElementSibling
    items.push(`Move ${name(element)} ${next ? `to before ${name(next)}` : `to the end of ${name(element.parentElement)}`}`)
  }
  // Siblings given the same thing, as the children of a new grid are, read as one change
  const styled = [...record.styles.keys()].filter((element) => element.isConnected && !record.groups.has(element) && declarations(element)).sort(inDocument)
  const alike = Map.groupBy(styled, (element) => element.parentElement)
  for (const [parent, siblings] of alike) {
    for (const [text, elements] of Map.groupBy(siblings, declarations)) {
      if (elements.length < 3) for (const element of elements) items.push(`${name(element)}\n   ${text}`)
      else if (elements.length === parent.children.length) items.push(`Every child of ${name(parent)}\n   ${text}`)
      else items.push([`${elements.length} children of ${name(parent)}`, `   ${text}`, ...elements.map((element) => `   - ${name(element)}`)].join('\n'))
    }
  }

  const intro = `Layout changes to ${path}, composed in the browser${width ? ` at ${width}px wide` : ''}. Make them in the source, the way the project styles things rather than as inline styles.`
  return { count: items.length, text: [intro, '', ...items.map((item, index) => `${index + 1}. ${item}`)].join('\n') }
}
