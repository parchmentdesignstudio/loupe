#!/usr/bin/env node
// Turns the raw Sketch exports in source/<variant>/<size>/<name>.svg into:
//   svg/      clean SVG files using currentColor
//   sprite/   one <symbol> sprite per variant and size
//   data.js   every icon’s viewBox and markup, for the components
//   icons.json, data.d.ts

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(ROOT, 'source')
const NAME = /^(line|solid)\/(16|24)\/([a-z0-9-]+)\.svg$/

// Sketch writes #hex, rgb() or color(display-p3 r g b) with 0–1 channels.
function rgbOf(value) {
  const v = value.trim().toLowerCase()
  if (v === 'white') return [1, 1, 1]
  if (v === 'black') return [0, 0, 0]
  let m = /^#([0-9a-f]{6})$/.exec(v)
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
  m = /^#([0-9a-f]{3})$/.exec(v)
  if (m) return m[1].split('').map((c) => parseInt(c + c, 16) / 255)
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(v)
  if (m) return [m[1], m[2], m[3]].map((n) => parseFloat(n) / 255)
  m = /^color\(\s*[\w-]+\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(v)
  if (m) return [m[1], m[2], m[3]].map(parseFloat)
  return null
}

const ICON_FILL = 'var(--icon-fill, Canvas)'

// Dark paint follows the text colour. Light paint is the knock-out behind a
// line icon, which sites theme through --icon-fill (the page background, Canvas, by default).
const recolour = {
  name: 'recolour',
  fn: () => ({
    element: {
      enter(node, parent) {
        if (node.name === 'mask' || parent?.inMask) node.inMask = true
        if (node.inMask) {
          if (SHAPES.has(node.name) && node.attributes.fill === undefined && node.name !== 'mask') node.attributes.fill = '#fff'
          return
        }
        for (const attr of ['fill', 'stroke']) {
          const value = node.attributes[attr]
          if (!value || value === 'none') continue
          const rgb = rgbOf(value)
          if (!rgb) continue
          const light = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.5
          if (light && attr === 'fill') {
            delete node.attributes.fill
            node.attributes.style = `fill:${ICON_FILL}`
          } else {
            node.attributes[attr] = 'currentColor'
          }
        }
      },
    },
  }),
}

// The line icons come from iamsteve, styled with its Tailwind utilities
// (stroke-current stroke-2 sl-r) rather than attributes.
function paintOf(classes) {
  const paint = {}
  for (const c of classes.split(/\s+/)) {
    let m
    if (!c || c.includes(':')) continue
    if (c === 'fill-none') paint.fill = 'none'
    else if (/^fill-current(color)?$/i.test(c)) paint.fill = 'currentColor'
    else if (c === 'fill-(--icon-fill-bg)') paint.style = 'fill:var(--icon-fill-bg, color-mix(in oklab, Canvas 70%, currentColor))'
    else if (c === 'fill-success') paint.style = `fill:var(--icon-success, ${ICON_FILL})`
    else if (/^fill-/.test(c)) paint.style = `fill:${ICON_FILL}`
    else if (/^stroke-current(color)?$/i.test(c)) paint.stroke = 'currentColor'
    else if ((m = /^(?:stroke|sw)-\[?(\d*\.?\d+)\]?$/.exec(c))) paint['stroke-width'] = m[1]
    else if (c === 'sl-r') Object.assign(paint, { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
    else if (c === 'sl-s') Object.assign(paint, { 'stroke-linecap': 'round', 'stroke-linejoin': 'miter' })
    else if ((m = /^slc-([rsb])$/.exec(c))) paint['stroke-linecap'] = { r: 'round', s: 'square', b: 'butt' }[m[1]]
    else if ((m = /^opacity-(\d+)$/.exec(c))) paint.opacity = String(Number(m[1]) / 100)
  }
  if (paint.style) delete paint.fill
  return paint
}

const SHAPES = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'])

const classesToAttributes = {
  name: 'classesToAttributes',
  fn: () => ({
    element: {
      enter(node, parent) {
        const ownPaint = paintOf(node.attributes.class || '')
        delete node.attributes.class
        for (const [k, v] of Object.entries(ownPaint)) if (node.attributes[k] === undefined) node.attributes[k] = v
        const filled = node.attributes.fill !== undefined || node.attributes.style?.includes('fill')
        const stroked = node.attributes.stroke && node.attributes.stroke !== 'none'
        node.hasFill = filled || parent?.hasFill
        node.hasStroke = stroked || parent?.hasStroke
        // A stroked shape with no fill anywhere is line work, not a black blob.
        if (SHAPES.has(node.name) && node.hasStroke && !node.hasFill) node.attributes.fill = 'none'
        // Unpainted shapes draw black by default, so keep them solid.
        if (SHAPES.has(node.name) && !node.hasStroke && !node.hasFill && !node.inMask) node.attributes.fill = 'currentColor'
        if (node.name === 'mask' || parent?.inMask) node.inMask = true
        if (node.name === 'svg') {
          const paint = {}
          for (const k of ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'style', 'opacity']) {
            if (node.attributes[k] !== undefined && (k !== 'fill' || node.attributes[k] !== 'none')) {
              paint[k] = node.attributes[k]
              delete node.attributes[k]
            }
          }
          if (Object.keys(paint).length) {
            node.children = [{ type: 'element', name: 'g', attributes: paint, children: node.children }]
          }
        }
      },
    },
  }),
}

// A layer or group named part-<name> in Sketch (part-body, part-wheel) is a
// moving part. Sketch exports the name as its id, which becomes
// data-part="<name>" for a site to animate. Everything else still merges.
const PART = /^part-([a-z0-9]+(?:-[a-z0-9]+)*)$/

const markParts = {
  name: 'markParts',
  fn: () => ({
    element: {
      enter(node) {
        const m = PART.exec(String(node.attributes.id || '').toLowerCase())
        if (!m) return
        node.attributes['data-part'] = m[1]
        delete node.attributes.id
      },
    },
  }),
}

// Layers sharing a part name move as one, so they're gathered into a single
// <g data-part> where the first of them was.
const gatherParts = {
  name: 'gatherParts',
  fn: () => ({
    root: {
      exit(root) {
        const found = new Map()
        const visit = (node) => {
          for (const child of node.children || []) {
            if (child.type !== 'element') continue
            const part = child.attributes['data-part']
            if (!part) { visit(child); continue }
            if (!found.has(part)) found.set(part, [])
            found.get(part).push({ node: child, parent: node })
          }
        }
        visit(root)
        for (const [part, list] of found) {
          const parent = list[0].parent
          if (list.length < 2 || list.some((e) => e.parent !== parent)) continue
          const nodes = list.map((e) => e.node)
          nodes.forEach((n) => delete n.attributes['data-part'])
          const at = parent.children.indexOf(nodes[0])
          parent.children = parent.children.filter((c) => !nodes.includes(c))
          parent.children.splice(at, 0, { type: 'element', name: 'g', attributes: { 'data-part': part }, children: nodes })
        }
      },
    },
  }),
}

// Sketch exports an outline mask as <mask fill="white"> on the layers it masks.
// It clips, so it becomes a clipPath, which ignores paint, where a mask’s shape
// would pick up currentColor. A part’s clip moves onto a group around the part,
// so the clip stays put while the part moves through it, as a ferry’s hull
// slides past its waterline.
const URL_REF = /^url\(#(.+)\)$/

const holdClips = {
  name: 'holdClips',
  fn: () => ({
    root: {
      exit(root) {
        const all = []
        const byId = new Map()
        const visit = (node) => {
          for (const child of node.children || []) {
            if (child.type !== 'element') continue
            all.push({ node: child, parent: node })
            if (child.attributes.id) byId.set(child.attributes.id, child)
            visit(child)
          }
        }
        visit(root)

        const clips = new Set()
        for (const { node } of all) {
          if (node.name !== 'mask' || node.attributes.fill !== 'white') continue
          node.name = 'clipPath'
          node.attributes = { id: node.attributes.id }
          node.children = node.children.map((child) => {
            if (child.type !== 'element' || child.name !== 'use') return child
            if (['x', 'y', 'transform'].some((a) => child.attributes[a] !== undefined)) return child
            const ref = byId.get(String(child.attributes.href ?? child.attributes['xlink:href'] ?? '').replace(/^#/, ''))
            if (!ref || !SHAPES.has(ref.name)) return child
            const { id: _id, fill: _fill, style: _style, ...shape } = ref.attributes
            return { type: 'element', name: ref.name, attributes: shape, children: [] }
          })
          clips.add(node.attributes.id)
        }
        for (const { node } of all) {
          const m = URL_REF.exec(node.attributes.mask || '')
          if (!m || !clips.has(m[1])) continue
          node.attributes['clip-path'] = node.attributes.mask
          delete node.attributes.mask
        }

        // The shapes the clips took in are no longer used where Sketch defined them
        const used = new Set()
        const refs = (node) => {
          for (const child of node.children || []) {
            if (child.type !== 'element') continue
            for (const value of Object.values(child.attributes)) for (const m of String(value).matchAll(/#([\w-]+)/g)) used.add(m[1])
            refs(child)
          }
        }
        refs(root)
        for (const { node, parent } of all) {
          if (node.name !== 'defs') continue
          node.children = node.children.filter((c) => c.type !== 'element' || !c.attributes.id || used.has(c.attributes.id))
          if (!node.children.some((c) => c.type === 'element')) parent.children = parent.children.filter((c) => c !== node)
        }

        for (const { node, parent } of all) {
          if (!node.attributes['data-part']) continue
          const hold = {}
          for (const a of ['transform', 'clip-path', 'mask']) {
            if (node.attributes[a] === undefined) continue
            hold[a] = node.attributes[a]
          }
          if (!hold['clip-path'] && !hold.mask) continue
          for (const a of Object.keys(hold)) delete node.attributes[a]
          parent.children[parent.children.indexOf(node)] = { type: 'element', name: 'g', attributes: hold, children: [node] }
        }
      },
    },
  }),
}

function clean(raw, id) {
  const svg = optimize(raw, {
    multipass: true,
    plugins: [
      markParts,
      classesToAttributes,
      recolour,
      {
        name: 'preset-default',
        params: { overrides: { convertColors: false } },
      },
      'removeDimensions',
      'removeTitle',
      'removeXlink',
      { name: 'prefixIds', params: { prefix: id, delim: '-' } },
      { name: 'removeAttrs', params: { attrs: ['svg:(version|class|data-name)'] } },
      gatherParts,
    ],
  }).data
  // After the rest, as SVGO would collapse a part's wrapper again
  return optimize(svg, { plugins: [holdClips] }).data
}

// Each part an icon names, and any that keeps a transform of its own, which a
// CSS animation would replace.
function partsOf(svg) {
  const tags = [...svg.matchAll(/<[^>]*\bdata-part="([^"]+)"[^>]*>/g)]
  return {
    parts: [...new Set(tags.map((m) => m[1]))],
    transformed: tags.filter((m) => /\stransform="/.test(m[0])).map((m) => m[1]),
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

function build() {
  const started = Date.now()
  const icons = {}
  const skipped = []
  const empty = []
  const transformed = []

  for (const file of walk(SOURCE).sort()) {
    const rel = path.relative(SOURCE, file).split(path.sep).join('/')
    if (!rel.endsWith('.svg')) continue
    const match = NAME.exec(rel)
    if (!match) { skipped.push(rel); continue }
    const [, variant, size, name] = match
    const key = `${variant}/${size}/${name}`
    const svg = clean(fs.readFileSync(file, 'utf8'), `${variant}-${size}-${name}`)
    const viewBox = /viewBox="([^"]+)"/.exec(svg)[1]
    const body = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    if (!body.trim()) { empty.push(key); continue }
    const found = partsOf(body)
    if (found.transformed.length) transformed.push(`${key} (${found.transformed.join(', ')})`)
    icons[key] = { variant, size: Number(size), name, viewBox, body, ...(found.parts.length ? { parts: found.parts } : {}) }
  }

  for (const dir of ['svg', 'sprite']) fs.rmSync(path.join(ROOT, dir), { recursive: true, force: true })

  const sprites = {}
  for (const [key, icon] of Object.entries(icons)) {
    const size = icon.size
    write(
      path.join(ROOT, 'svg', `${key}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="none">${icon.body}</svg>\n`,
    )
    const sprite = `${icon.variant}-${icon.size}`
    ;(sprites[sprite] ||= []).push(`<symbol id="${icon.name}" viewBox="${icon.viewBox}" fill="none">${icon.body}</symbol>`)
  }
  for (const [sprite, symbols] of Object.entries(sprites)) {
    write(
      path.join(ROOT, 'sprite', `${sprite}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join('\n')}\n</svg>\n`,
    )
  }

  const data = Object.fromEntries(Object.entries(icons).map(([key, i]) => [key, { viewBox: i.viewBox, body: i.body, ...(i.parts ? { parts: i.parts } : {}) }]))
  write(path.join(ROOT, 'data.js'), `export default ${JSON.stringify(data, null, 2)}\n`)

  const parts = Object.fromEntries(Object.entries(icons).filter(([, i]) => i.parts).map(([key, i]) => [key, i.parts]))
  write(path.join(ROOT, 'parts.json'), JSON.stringify(parts, null, 2) + '\n')

  const byVariant = { line: { 16: [], 24: [] }, solid: { 16: [], 24: [] } }
  for (const icon of Object.values(icons)) byVariant[icon.variant][icon.size].push(icon.name)
  write(path.join(ROOT, 'icons.json'), JSON.stringify(byVariant, null, 2) + '\n')

  const names = [...new Set(Object.values(icons).map((i) => i.name))].sort()
  const union = (list) => (list.length ? list.map((n) => `'${n}'`).join(' | ') : 'never')
  write(
    path.join(ROOT, 'data.d.ts'),
    [
      `export type IconName = ${union(names)}`,
      `export type LineIconName = ${union([...new Set([...byVariant.line[16], ...byVariant.line[24]])].sort())}`,
      `export type SolidIconName = ${union([...new Set([...byVariant.solid[16], ...byVariant.solid[24]])].sort())}`,
      `declare const data: Record<string, { viewBox: string; body: string; parts?: string[] }>`,
      `export default data`,
      '',
    ].join('\n'),
  )

  const cells = Object.entries(icons)
    .map(([key, i]) => `<figure title="${key}"><svg width="${i.size * 2}" height="${i.size * 2}" viewBox="${i.viewBox}" fill="none">${i.body}</svg><figcaption>${i.name}</figcaption></figure>`)
    .join('\n')
  write(
    path.join(ROOT, 'preview.html'),
    `<!doctype html><meta charset="utf-8"><title>Icons</title><style>body{font:11px system-ui;margin:24px;color:#092e24;background:#fbfaf5}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}figure{margin:0;display:grid;justify-items:center;gap:6px;padding:12px 4px;border-radius:6px;background:#f1efe6}figcaption{text-align:center;overflow-wrap:anywhere}@media (prefers-color-scheme:dark){body{color:#f1efe6;background:#14201c;--icon-fill:#092e24}figure{background:#1d2c27}}</style><main>\n${cells}\n</main>\n`,
  )

  const count = Object.keys(icons).length
  console.log(`Built ${count} icons in ${Date.now() - started}ms`)
  const withParts = Object.entries(parts).map(([key, list]) => `${key} (${list.join(', ')})`)
  if (withParts.length) console.log(`Moving parts: ${withParts.join(', ')}`)
  if (transformed.length) console.warn(`Parts with their own transform, which an animation would replace: ${transformed.join(', ')}`)
  if (empty.length) console.warn(`Left out, nothing visible (art inside Keylines?): ${empty.join(', ')}`)
  if (skipped.length) console.log(`Skipped (not variant/size/name): ${skipped.join(', ')}`)
}

build()

if (process.argv.includes('--watch')) {
  let timer
  console.log(`Watching ${path.relative(process.cwd(), SOURCE) || 'source'}`)
  fs.watch(SOURCE, { recursive: true }, () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      try { build() } catch (error) { console.error(error.message) }
    }, 200)
  })
}
