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

const ICON_FILL = 'var(--icon-fill, none)'

// Dark paint follows the text colour. Light paint is the knock-out behind a
// line icon, which sites theme through --icon-fill (none by default).
const recolour = {
  name: 'recolour',
  fn: () => ({
    element: {
      enter(node, parent) {
        if (node.name === 'mask' || parent?.inMask) node.inMask = true
        if (node.inMask) return
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

function clean(raw, id) {
  return optimize(raw, {
    multipass: true,
    plugins: [
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

function build() {
  const started = Date.now()
  const icons = {}
  const skipped = []
  const empty = []

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
    icons[key] = { variant, size: Number(size), name, viewBox, body }
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

  const data = Object.fromEntries(Object.entries(icons).map(([key, i]) => [key, { viewBox: i.viewBox, body: i.body }]))
  write(path.join(ROOT, 'data.js'), `export default ${JSON.stringify(data, null, 2)}\n`)

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
      `declare const data: Record<string, { viewBox: string; body: string }>`,
      `export default data`,
      '',
    ].join('\n'),
  )

  const cells = Object.entries(icons)
    .map(([key, i]) => `<figure title="${key}"><svg width="${i.size * 2}" height="${i.size * 2}" viewBox="${i.viewBox}" fill="none">${i.body}</svg><figcaption>${i.name}</figcaption></figure>`)
    .join('\n')
  write(
    path.join(ROOT, 'preview.html'),
    `<!doctype html><meta charset="utf-8"><title>Icons</title><style>body{font:11px system-ui;margin:24px;color:#092e24;background:#fbfaf5;--icon-fill:#fff}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}figure{margin:0;display:grid;justify-items:center;gap:6px;padding:12px 4px;border-radius:6px;background:#f1efe6}figcaption{text-align:center;overflow-wrap:anywhere}@media (prefers-color-scheme:dark){body{color:#f1efe6;background:#14201c;--icon-fill:#092e24}figure{background:#1d2c27}}</style><main>\n${cells}\n</main>\n`,
  )

  const count = Object.keys(icons).length
  console.log(`Built ${count} icons in ${Date.now() - started}ms`)
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
