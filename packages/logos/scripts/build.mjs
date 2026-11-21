#!/usr/bin/env node
// Turns the logos in source/ into:
//   svg/      clean SVG files
//   data.js   every logo’s viewBox and markup, for the components
//   logos.json, data.d.ts
//
// source/<name>.svg is the company’s own logo, which scales to any size.
// source/<size>/<name>.svg is drawn for that size, and used there instead.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(ROOT, 'source')
const NAME = /^(?:(\d+)\/)?([a-z0-9-]+)\.svg$/

// Exports write #hex, rgb(), a name or color(display-p3 r g b) with 0–1 channels.
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

const KNOCK_OUT = 'var(--icon-fill, Canvas)'
const PAINT = ['fill', 'stroke', 'stop-color']

// Some exports paint with style="fill:…" rather than attributes.
function styleToPaint(node) {
  if (!node.attributes.style) return
  const rest = []
  for (const declaration of node.attributes.style.split(';')) {
    const [property, value] = declaration.split(/:(.*)/s).map((part) => part?.trim())
    if (PAINT.includes(property) && value && !value.includes('var(')) node.attributes[property] = value
    else if (declaration.trim()) rest.push(declaration.trim())
  }
  if (rest.length) node.attributes.style = rest.join(';')
  else delete node.attributes.style
}

// Black, white and greys follow the theme: dark ones the text colour, light ones
// the knock-out, the same --icon-fill as the icons. Colours are the brand’s, so they stay.
const recolour = {
  name: 'recolour',
  fn: () => ({
    element: {
      enter(node, parent) {
        // A mask’s black and white decide what shows, so they’re left as drawn
        if (node.name === 'mask' || node.name === 'clipPath' || parent?.inMask) {
          node.inMask = true
          return
        }
        styleToPaint(node)
        for (const attr of PAINT) {
          const rgb = rgbOf(node.attributes[attr] ?? '')
          if (!rgb || Math.max(...rgb) - Math.min(...rgb) > 0.2) continue
          if (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.5) {
            delete node.attributes[attr]
            node.attributes.style = [node.attributes.style, `${attr}:${KNOCK_OUT}`].filter(Boolean).join(';')
          } else {
            node.attributes[attr] = 'currentColor'
          }
        }
      },
    },
  }),
}

// The components draw their own <svg>, filled with currentColor, so any other
// paint on the logo’s own <svg> moves to a group inside it.
const keepRootPaint = {
  name: 'keepRootPaint',
  fn: () => ({
    element: {
      enter(node) {
        if (node.name !== 'svg') return
        const paint = {}
        for (const k of ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'opacity', 'style']) {
          const value = node.attributes[k]
          if (value === undefined) continue
          delete node.attributes[k]
          if (k !== 'fill' || value.toLowerCase() !== 'currentcolor') paint[k] = value
        }
        if (Object.keys(paint).length) {
          node.children = [{ type: 'element', name: 'g', attributes: paint, children: node.children }]
        }
      },
    },
  }),
}

function clean(raw, id) {
  return optimize(raw, {
    multipass: true,
    plugins: [
      { name: 'removeElementsByAttr', params: { id: 'Keylines' } },
      recolour,
      keepRootPaint,
      {
        name: 'preset-default',
        params: { overrides: { convertColors: false } },
      },
      'removeDimensions',
      'removeTitle',
      'removeXlink',
      { name: 'prefixIds', params: { prefix: id, delim: '-' } },
    ],
  }).data
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

const round = (n) => Math.round(n * 100) / 100

// The logo at this height, as wide as its proportions make it
function toTag({ viewBox, width, height, body }, size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round((size * width) / height)}" height="${size}" viewBox="${viewBox}" fill="currentColor">${body}</svg>`
}

function build() {
  const started = Date.now()
  const logos = {}
  const skipped = []
  const leftOut = []
  const offSize = []

  for (const file of walk(SOURCE).sort()) {
    const rel = path.relative(SOURCE, file).split(path.sep).join('/')
    if (!rel.endsWith('.svg')) continue
    const match = NAME.exec(rel)
    if (!match) { skipped.push(rel); continue }
    const [, size, name] = match
    const key = size ? `${size}/${name}` : name
    const svg = clean(fs.readFileSync(file, 'utf8'), `logo-${key.replace('/', '-')}`)
    const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
    if (!viewBox) { leftOut.push(`${rel} (no size)`); continue }
    const body = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    if (!body.trim()) { leftOut.push(`${rel} (nothing visible)`); continue }
    const [, , width, height] = viewBox.split(/[\s,]+/).map(Number)
    if (size && height !== Number(size)) offSize.push(`${rel} is ${height}px tall`)
    logos[key] = { name, size: size ? Number(size) : null, viewBox, width, height, body }
  }

  fs.rmSync(path.join(ROOT, 'svg'), { recursive: true, force: true })
  for (const [key, logo] of Object.entries(logos)) {
    write(path.join(ROOT, 'svg', `${key}.svg`), toTag(logo, logo.size ?? logo.height) + '\n')
  }

  const data = Object.fromEntries(Object.entries(logos).map(([key, l]) => [key, { viewBox: l.viewBox, body: l.body }]))
  write(path.join(ROOT, 'data.js'), `export default ${JSON.stringify(data, null, 2)}\n`)

  const byName = {}
  for (const logo of Object.values(logos)) {
    const entry = (byName[logo.name] ||= { original: false, drawn: [] })
    if (logo.size) entry.drawn.push(logo.size)
    else entry.original = true
  }
  const names = Object.keys(byName).sort()
  for (const name of names) byName[name].drawn.sort((a, b) => a - b)
  write(path.join(ROOT, 'logos.json'), JSON.stringify(Object.fromEntries(names.map((n) => [n, byName[n]])), null, 2) + '\n')

  write(
    path.join(ROOT, 'data.d.ts'),
    [
      `export type LogoName = ${names.length ? names.map((n) => `'${n}'`).join(' | ') : 'never'}`,
      `declare const data: Record<string, { viewBox: string; body: string }>`,
      `export default data`,
      '',
    ].join('\n'),
  )

  // Each logo at the sizes the sites use, and any it’s drawn at, saying which are drawn
  const cards = names
    .map((name) => {
      const sizes = [...new Set([16, 24, 32, ...byName[name].drawn])].sort((a, b) => a - b)
      const cells = sizes.map((size) => {
        const drawn = logos[`${size}/${name}`]
        const logo = drawn ?? logos[name]
        const art = logo
          ? toTag(logo, size)
          : `<span class="missing" style="width:${size}px;height:${size}px"></span>`
        return `<div class="size">${art}<small>${size}${drawn ? ' drawn' : logo ? '' : ' not drawn'}</small></div>`
      })
      return `<figure title="${name}"><div class="sizes">${cells.join('')}</div><figcaption>${name}</figcaption></figure>`
    })
    .join('\n')
  write(
    path.join(ROOT, 'preview.html'),
    `<!doctype html><meta charset="utf-8"><title>Logos</title><style>body{font:12px/1.4 system-ui;margin:24px;color:#092e24;background:#fbfaf5}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px}figure{margin:0;display:grid;gap:16px;padding:16px;border-radius:8px;background:#f1efe6;--icon-fill:#f1efe6}.sizes{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px}.size{display:grid;justify-items:start;gap:6px}small{opacity:.6}.missing{box-sizing:border-box;border:1px dashed;border-radius:4px;opacity:.4}@media (prefers-color-scheme:dark){body{color:#f1efe6;background:#14201c}figure{background:#1d2c27;--icon-fill:#1d2c27}}</style><main>\n${cards}\n</main>\n`,
  )

  console.log(`Built ${names.length} logos in ${Date.now() - started}ms`)
  if (offSize.length) console.warn(`Not drawn at their folder’s size, so they’ll scale: ${offSize.join(', ')}`)
  if (leftOut.length) console.warn(`Left out: ${leftOut.join(', ')}`)
  if (skipped.length) console.log(`Skipped, not named <name>.svg or <size>/<name>.svg: ${skipped.join(', ')}`)
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
