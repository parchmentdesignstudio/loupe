// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { summarise } from '../src/changes.js'

const record = () => ({ styles: new Map(), groups: new Set(), removed: [], moved: new Map() })
const styled = (changes, element, values) => changes.styles.set(element, { original: new Map(), set: new Map(Object.entries(values)) })

beforeEach(() => {
  document.body.innerHTML = `
    <main>
      <h1 data-source="src/pages/index.astro:12:5">Tide tables</h1>
      <p class="standfirst lede">For ninety years</p>
      <img alt="The harbour" data-astro-source-file="/site/src/pages/index.astro" data-astro-source-loc="14:3">
      <p>Last</p>
    </main>`
})

describe('summarise', () => {
  it('has nothing to say about a page that hasn’t changed', () => {
    expect(summarise(record()).count).toBe(0)
  })

  it('names an element by its tag, classes, text and where it was written', () => {
    const changes = record()
    styled(changes, document.querySelector('h1'), { 'grid-column': '1 / span 6' })
    styled(changes, document.querySelector('.standfirst'), { 'grid-column': '7 / span 6', 'grid-row': '1' })
    styled(changes, document.querySelector('img'), { 'grid-row': '2' })
    const { count, text } = summarise(changes, { path: '/about', width: 1440 })
    expect(count).toBe(3)
    expect(text).toContain('Layout changes to /about, composed in the browser at 1440px wide.')
    expect(text).toContain('1. <h1> “Tide tables” (src/pages/index.astro:12:5)\n   grid-column: 1 / span 6')
    expect(text).toContain('2. <p class="standfirst lede"> “For ninety years” (body > main > p.standfirst)\n   grid-column: 7 / span 6; grid-row: 1')
    expect(text).toContain('3. <img> “The harbour” (/site/src/pages/index.astro:14:3)')
  })

  it('lists what a new group wraps, and refers to it by its number afterwards', () => {
    const changes = record()
    const group = document.createElement('div')
    document.querySelector('main').prepend(group)
    group.append(document.querySelector('h1'), document.querySelector('.standfirst'))
    changes.groups.add(group)
    styled(changes, group, { display: 'grid', gap: '24px' })
    changes.moved.set(document.querySelector('img'), { next: document.querySelector('main > p'), previous: document.querySelector('.standfirst') })
    document.querySelector('main').prepend(document.querySelector('img'))
    const { count, text } = summarise(changes)
    expect(count).toBe(2)
    expect(text).toContain('1. Wrap in a new <div>:\n   - <h1> “Tide tables” (src/pages/index.astro:12:5)\n   - <p class="standfirst lede">')
    expect(text).toContain('On the new <div>: display: grid; gap: 24px')
    expect(text).toContain('2. Move <img> “The harbour” (/site/src/pages/index.astro:14:3) to before the new <div> from 1')
  })

  it('reads siblings given the same thing as one change', () => {
    const changes = record()
    const main = document.querySelector('main')
    styled(changes, main, { display: 'grid' })
    for (const child of main.children) styled(changes, child, { 'grid-column': '1 / -1' })
    const { count, text } = summarise(changes)
    expect(count).toBe(2)
    expect(text).toContain('2. Every child of <main> (body > main)\n   grid-column: 1 / -1')
  })

  it('leaves out what was put back', () => {
    const changes = record()
    const image = document.querySelector('img')
    changes.moved.set(image, { next: image.nextElementSibling, previous: image.previousElementSibling })
    styled(changes, image, {})
    const gone = document.createElement('div')
    changes.groups.add(gone)
    expect(summarise(changes).count).toBe(0)
  })

  it('keeps what applies from a breakpoint apart from what always does', () => {
    const changes = record()
    changes.styles.set(document.querySelector('h1'), { original: new Map(), layers: new Map([['lg', new Map([['grid-column', '1 / span 6']])], ['base', new Map([['grid-column', '1 / -1']])]]) })
    expect(summarise(changes, { breakpoints: { base: 0, lg: 1024 } }).text).toContain('grid-column: 1 / -1\n   From lg (1024px): grid-column: 1 / span 6')
  })

  it('lists a copy and a deletion', () => {
    const changes = { ...record(), copies: new Map(), deleted: [] }
    const copy = document.querySelector('h1').cloneNode(true)
    document.querySelector('h1').after(copy)
    changes.copies.set(copy, '<h1> “Tide tables” (src/pages/index.astro:12:5)')
    changes.deleted.push({ element: document.createElement('p'), parent: document.querySelector('main'), described: '<p> “Last” (body > main > p)' })
    const { text } = summarise(changes)
    expect(text).toContain('1. Duplicate <h1> “Tide tables” (src/pages/index.astro:12:5), and put the copy before <p class="standfirst lede">')
    expect(text).toContain('2. Delete <p> “Last” (body > main > p)')
  })

  it('says which wrapper was taken away', () => {
    const changes = record()
    changes.removed.push({ element: document.createElement('div'), parent: document.querySelector('main'), described: '<div class="stack"> (src/pages/index.astro:8:3)' })
    expect(summarise(changes).text).toContain('1. Remove the wrapper <div class="stack"> (src/pages/index.astro:8:3), leaving what’s inside it in its place')
  })
})
