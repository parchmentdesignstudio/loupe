import { makeIco, makeZip } from './encode.js'
import { makeIconPackage } from './iconfile.js'
import { canvasToBlob, iosLayers, loadSource, pickSource, renderOutput, serialiseSvg, settingsFor, sourceFor } from './render.js'
import { SAMPLES, sampleFile } from './sample.js'
import { GROUPS, OUTPUTS, STORAGE_KEY } from './specs.js'

const $ = (id) => document.getElementById(id)

const state = {
  sources: [],
  og: { source: null },
  ios: { layers: [], fill: 'gradient' },
  background: '#f1efe6',
  theme: '#0f3d30',
  site: { name: 'Parchment', short: 'Parchment', url: 'https://parchment.studio' },
  overrides: {},
  selected: 'apple-touch',
}

const rendered = new Map()

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue
    if (key === 'class') node.className = value
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value)
    else if (key in node && typeof value !== 'string') node[key] = value
    else node.setAttribute(key, value === true ? '' : value)
  }
  node.append(...children.flat().filter((c) => c != null && c !== false))
  return node
}

function status(text) {
  $('status').textContent = text
}

// Sources

async function addFiles(files, target) {
  const list = [...files].filter((f) => f.type.startsWith('image/') || /\.svg$/i.test(f.name))
  if (!list.length) return
  try {
    const loaded = await Promise.all(list.map(loadSource))
    if (target === 'artwork') state.sources.push(...loaded)
    if (target === 'og') state.og.source = loaded[0]
    if (target === 'layers') {
      const room = 4 - state.ios.layers.length
      if (loaded.length > room) status('iOS icons take up to four layers.')
      state.ios.layers.push(...loaded.slice(0, room).map((source) => ({ id: source.id, source, scale: 1, glass: true })))
    }
    update()
  } catch (error) {
    status(error.message)
  }
}

function usesOf(source) {
  const sizes = new Set()
  for (const output of OUTPUTS) {
    if (output.kind === 'ios' || output.kind === 'og') continue
    if (sourceFor(output, state) === source) sizes.add(Math.min(output.w, output.h))
  }
  return [...sizes].toSorted((a, b) => a - b)
}

function sourceRow(source, { onRemove, extra }) {
  return el('li', { class: 'source' },
    el('img', { class: 'thumb', src: source.preview.src, alt: '' }),
    el('span', { class: 'name', title: source.name }, source.name),
    el('span', { class: 'actions' }, el('button', { type: 'button', class: 'icon-button', 'aria-label': `Remove ${source.name}`, onclick: onRemove }, '✕')),
    el('span', { class: 'meta' }, extra),
  )
}

function renderSources() {
  const artwork = $('artwork-list')
  artwork.replaceChildren()
  if (!state.sources.length) artwork.append(el('li', { class: 'empty' }, 'Drop an SVG or a large PNG'))
  for (const source of state.sources.toSorted((a, b) => b.size - a.size)) {
    const uses = usesOf(source)
    artwork.append(sourceRow(source, {
      onRemove: () => {
        state.sources = state.sources.filter((s) => s !== source)
        update()
      },
      extra: [
        el('label', {}, 'Drawn at', el('input', {
          type: 'number', min: 1, max: 4096, value: source.size, id: `size-${source.id}`,
          'aria-label': `Size ${source.name} is drawn at`,
          onchange: (e) => {
            const value = parseInt(e.target.value, 10)
            if (value > 0) source.size = value
            update()
          },
        }), 'px'),
        uses.length
          ? el('span', { class: 'chips', title: 'Sizes this artwork makes' }, uses.map((u) => el('span', { class: 'chip' }, u)))
          : el('span', {}, 'Not used'),
      ],
    }))
  }

  const og = $('og-list')
  og.replaceChildren()
  $('og-hint').hidden = !!state.og.source
  if (state.og.source) {
    const s = state.og.source
    og.append(sourceRow(s, {
      onRemove: () => { state.og.source = null; update() },
      extra: el('span', { class: 'mono' }, `${s.width} × ${s.height}`, s.width < 1200 || s.height < 630 ? el('span', { class: 'warn' }, ' smaller than 1200 × 630') : null),
    }))
  }

  const layers = $('layer-list')
  layers.replaceChildren()
  if (!state.ios.layers.length) {
    layers.append(el('li', { class: 'empty' }, state.sources.length ? 'Using the artwork as one layer' : 'Drop up to four layers'))
  }
  state.ios.layers.forEach((layer, i) => {
    const move = (by) => {
      const list = state.ios.layers
      ;[list[i], list[i + by]] = [list[i + by], list[i]]
      update()
    }
    const row = sourceRow(layer.source, {
      onRemove: () => {
        state.ios.layers = state.ios.layers.filter((l) => l !== layer)
        update()
      },
      extra: [
        el('label', {}, el('input', { type: 'checkbox', checked: layer.glass, id: `glass-${layer.id}`, onchange: (e) => { layer.glass = e.target.checked; update() } }), 'Glass'),
        el('span', { class: 'range' },
          'Size',
          el('input', { type: 'range', min: 10, max: 150, value: Math.round(layer.scale * 100), id: `scale-${layer.id}`, 'aria-label': 'Layer size',
            oninput: (e) => { layer.scale = e.target.value / 100; e.target.nextSibling.textContent = `${e.target.value}%`; schedule() },
            onchange: () => update() }),
          el('span', { class: 'mono' }, `${Math.round(layer.scale * 100)}%`),
        ),
      ],
    })
    row.querySelector('.actions').prepend(
      el('button', { type: 'button', class: 'icon-button', 'aria-label': 'Move forward', disabled: i === 0, onclick: () => move(-1) }, '↑'),
      el('button', { type: 'button', class: 'icon-button', 'aria-label': 'Move back', disabled: i === state.ios.layers.length - 1, onclick: () => move(1) }, '↓'),
    )
    layers.append(row)
  })
}

// Canvas

function boardFor(output) {
  return document.querySelector(`.board[data-id='${output.id}']`)
}

function displaySize(output) {
  if (output.kind === 'og') return { w: 480, h: 252 }
  if (output.w <= 64) return { w: output.w, h: output.h }
  const w = output.kind === 'ios' ? 200 : Math.min(output.w, 180)
  return { w, h: w }
}

function buildBoards() {
  const root = $('boards')
  root.replaceChildren()
  for (const [group, title] of Object.entries(GROUPS)) {
    const outputs = OUTPUTS.filter((o) => o.group === group)
    root.append(el('section', { class: 'group' },
      el('h2', {}, title),
      el('div', { class: 'boards' }, outputs.map((output) => {
        const size = displaySize(output)
        const main = el('canvas', { width: output.w, height: output.h, style: `width:${size.w}px` })
        const frames = [el('span', { class: 'frame' }, main)]
        if (output.w <= 64) frames.push(el('span', { class: 'frame' }, el('canvas', { class: 'zoom', width: output.w, height: output.h, style: `width:${output.w * 4}px` })))
        return el('button', {
          type: 'button', class: 'board', 'data-id': output.id, 'data-mask': output.mask || '',
          'aria-pressed': String(state.selected === output.id),
          onclick: () => select(output.id),
        },
        el('span', { class: 'art' }, frames),
        el('span', { class: 'label' },
          el('span', { class: 'file' }, output.label, output.note ? el('span', { class: 'dims' }, ` · ${output.note}`) : null),
          el('span', { class: 'dims' }, `${output.w} × ${output.h}`),
          el('span', { class: 'dims source-name' }),
          el('span', { class: 'warn' }),
        ))
      })),
    ))
  }
}

function describeSource(output) {
  if (output.kind === 'ios') {
    const layers = iosLayers(state)
    return layers.length ? `${layers.length} layer${layers.length > 1 ? 's' : ''}` : ''
  }
  const source = sourceFor(output, state)
  return source ? source.name : ''
}

function warningFor(output) {
  if (output.kind === 'ios') return ''
  const source = sourceFor(output, state)
  if (!source || source.type === 'svg') return ''
  const needed = Math.max(output.w, output.h) * (output.kind === 'og' && state.og.source === source ? 1 : 1 - 2 * settingsFor(output, state).pad)
  return source.size < needed ? `Scaled up from ${source.size}px` : ''
}

let pending = null
let version = 0

function schedule() {
  clearTimeout(pending)
  pending = setTimeout(draw, 60)
}

async function draw() {
  const current = ++version
  for (const output of OUTPUTS) {
    const canvas = await renderOutput(output, state)
    if (current !== version) return
    rendered.set(output.id, canvas)
    const board = boardFor(output)
    if (!board) continue
    for (const target of board.querySelectorAll('canvas')) {
      const ctx = target.getContext('2d')
      ctx.clearRect(0, 0, target.width, target.height)
      ctx.drawImage(canvas, 0, 0)
    }
    board.querySelector('.source-name').textContent = describeSource(output)
    board.querySelector('.warn').textContent = warningFor(output)
  }
  renderInspector()
  renderHead()
}

// Inspector

function select(id) {
  state.selected = id
  document.querySelectorAll('.board').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)))
  renderInspector()
}

function setOverride(id, key, value) {
  state.overrides[id] = { ...state.overrides[id], [key]: value }
}

function renderInspector() {
  const output = OUTPUTS.find((o) => o.id === state.selected)
  const root = $('inspector')
  const canvas = rendered.get(output.id)
  const preview = el('canvas', { class: 'preview', width: output.w, height: output.h })
  if (canvas) preview.getContext('2d').drawImage(canvas, 0, 0)
  if (output.w <= 64) preview.style.imageRendering = 'pixelated'

  const settings = settingsFor(output, state)
  const controls = []
  if (output.kind === 'ios') {
    controls.push(el('p', { class: 'hint' }, output.appearance === 'light'
      ? 'Change layers and the background in iOS layers. Icon Composer adds the glass, so this is a flat preview.'
      : `A flat preview of the ${output.appearance} appearance. Icon Composer works this out from the layers.`))
  } else {
    controls.push(el('label', { class: 'field' }, 'Padding',
      el('span', { class: 'row' },
        el('input', { type: 'range', min: 0, max: 40, value: Math.round(settings.pad * 100), id: 'inspect-pad',
          oninput: (e) => { setOverride(output.id, 'pad', e.target.value / 100); e.target.nextSibling.textContent = `${e.target.value}%`; schedule() } }),
        el('span', { class: 'mono' }, `${Math.round(settings.pad * 100)}%`),
      )))
    controls.push(el('label', { class: 'toggle' },
      el('input', { type: 'checkbox', id: 'inspect-bg', checked: settings.bg, disabled: !!output.lockBg,
        onchange: (e) => { setOverride(output.id, 'bg', e.target.checked); schedule() } }),
      output.lockBg ? 'Background (always on for this file)' : 'Background'))
    controls.push(el('label', { class: 'field' }, 'Artwork',
      el('select', { id: 'inspect-source', onchange: (e) => { setOverride(output.id, 'source', e.target.value); update() } },
        el('option', { value: 'auto', selected: settings.source === 'auto' }, output.kind === 'og' && state.og.source ? 'Open Graph image' : 'Closest size'),
        state.sources.map((s) => el('option', { value: s.id, selected: settings.source === s.id }, s.name)),
      )))
  }

  const fileName = output.id.startsWith('favicon') ? 'favicon.ico' : output.kind === 'ios' ? `AppIcon-${output.appearance}.png` : output.label
  root.replaceChildren(
    el('h2', {}, output.label, output.note ? ` · ${output.note}` : ''),
    preview,
    el('dl', {},
      el('dt', {}, 'Size'), el('dd', { class: 'mono' }, `${output.w} × ${output.h}`),
      el('dt', {}, 'Artwork'), el('dd', {}, describeSource(output) || 'None'),
    ),
    ...controls,
    el('div', { class: 'actions' },
      output.kind !== 'ios' && state.overrides[output.id]
        ? el('button', { type: 'button', class: 'button small', onclick: () => { delete state.overrides[output.id]; update() } }, 'Reset')
        : null,
      output.id.startsWith('favicon') ? null : el('button', { type: 'button', class: 'button small', onclick: () => saveOne(output, fileName) }, `Save ${fileName}`),
    ),
  )
}

// Code

function absolute(path) {
  try {
    return new URL(path, state.site.url || 'https://example.com').href
  } catch {
    return path
  }
}

function hasSvg() {
  return state.sources.some((s) => s.type === 'svg')
}

function headHtml() {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    hasSvg() ? '<link rel="icon" href="/icon.svg" type="image/svg+xml">' : null,
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/manifest.webmanifest">',
    `<meta name="theme-color" content="${state.theme}">`,
    `<meta property="og:image" content="${absolute('/og.png')}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
  ].filter(Boolean).join('\n')
}

function manifest() {
  return JSON.stringify({
    name: state.site.name,
    short_name: state.site.short || state.site.name,
    icons: [
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/icon-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    theme_color: state.theme,
    background_color: state.background,
    display: 'standalone',
  }, null, 2) + '\n'
}

function renderHead() {
  $('head-code').textContent = headHtml()
}

// Saving

let downloads
async function getDownloads() {
  if (!window.claude?.use) return null
  downloads ??= window.claude.use('downloads').catch(() => null)
  return downloads
}

async function saveFile(filename, blob) {
  const host = await getDownloads()
  if (host) {
    try {
      await host.save({ filename, data: blob })
      status(`Saved ${filename}`)
    } catch (error) {
      if (error?.code !== 'declined') status(`${filename} couldn’t be saved here.`)
    }
    return
  }
  const url = URL.createObjectURL(blob)
  const a = el('a', { href: url, download: filename })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

async function saveOne(output, filename) {
  const canvas = rendered.get(output.id) ?? (await renderOutput(output, state))
  saveFile(filename, await canvasToBlob(canvas))
}

async function buildFiles() {
  const get = async (id) => rendered.get(id) ?? renderOutput(OUTPUTS.find((o) => o.id === id), state)
  const png = async (id) => canvasToBlob(await get(id))
  const files = []

  files.push({ path: 'favicon.ico', data: await makeIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, blob: await png(`favicon-${size}`) })))) })
  const svg = pickSource(state.sources.filter((s) => s.type === 'svg'), 32)
  if (svg) files.push({ path: 'icon.svg', data: serialiseSvg(svg) })
  files.push({ path: 'apple-touch-icon.png', data: await png('apple-touch') })
  files.push({ path: 'icon-192.png', data: await png('icon-192') })
  files.push({ path: 'icon-512.png', data: await png('icon-512') })
  files.push({ path: 'icon-maskable-512.png', data: await png('maskable') })
  files.push({ path: 'og.png', data: await png('og') })
  files.push({ path: 'manifest.webmanifest', data: manifest() })
  files.push({ path: 'head.html', data: headHtml() + '\n' })

  const layers = iosLayers(state)
  if (layers.length) files.push(...makeIconPackage(layers, state, 'ios/AppIcon.icon'))
  for (const appearance of ['light', 'dark', 'tinted']) {
    files.push({ path: `ios/AppIcon-${appearance}.png`, data: await png(`ios-${appearance}`) })
  }
  return files
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site'
}

async function exportZip() {
  if (!state.sources.length) {
    status('Add some artwork first.')
    return
  }
  const button = $('export')
  button.disabled = true
  status('Building…')
  try {
    const files = await buildFiles()
    const zip = await makeZip(files)
    try {
      const names = files.map((f) => f.path.replace(/^ios\//, '').replace(/\/.*$/, ''))
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: new Date().toISOString(), files: [...new Set(names)] }))
    } catch {}
    status('')
    await saveFile(`${slug(state.site.name)}-icons.zip`, zip)
  } finally {
    button.disabled = false
  }
}

// Wiring

function update() {
  renderSources()
  schedule()
}

function bindDrop(id, target) {
  const zone = $(id)
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over') })
  zone.addEventListener('dragleave', () => zone.classList.remove('over'))
  zone.addEventListener('drop', (e) => {
    e.preventDefault()
    e.stopPropagation()
    zone.classList.remove('over')
    addFiles(e.dataTransfer.files, target)
  })
}

function bindColour(id, key) {
  const input = $(id)
  input.addEventListener('input', () => {
    state[key] = input.value
    $(`${id}-value`).textContent = input.value
    schedule()
  })
}

function init() {
  $('artwork-input').addEventListener('change', (e) => { addFiles(e.target.files, 'artwork'); e.target.value = '' })
  $('og-input').addEventListener('change', (e) => { addFiles(e.target.files, 'og'); e.target.value = '' })
  $('layer-input').addEventListener('change', (e) => { addFiles(e.target.files, 'layers'); e.target.value = '' })
  bindDrop('drop-artwork', 'artwork')
  bindDrop('drop-og', 'og')
  bindDrop('drop-layers', 'layers')

  // Anything dropped on the canvas counts as artwork.
  const canvas = $('canvas')
  canvas.addEventListener('dragover', (e) => e.preventDefault())
  canvas.addEventListener('drop', (e) => { e.preventDefault(); addFiles(e.dataTransfer.files, 'artwork') })

  bindColour('bg', 'background')
  bindColour('theme', 'theme')
  $('ios-fill').addEventListener('change', (e) => { state.ios.fill = e.target.value; schedule() })
  for (const [id, key] of [['site-name', 'name'], ['site-short', 'short'], ['site-url', 'url']]) {
    $(id).addEventListener('input', (e) => { state.site[key] = e.target.value; renderHead() })
  }

  const masks = $('masks')
  const setMasks = () => document.body.classList.toggle('masks', masks.checked)
  masks.addEventListener('change', setMasks)
  setMasks()

  $('export').addEventListener('click', exportZip)
  $('copy-head').addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(headHtml())
      e.target.textContent = 'Copied'
    } catch {
      getSelection().selectAllChildren($('head-code'))
      e.target.textContent = 'Selected'
    }
    setTimeout(() => { e.target.textContent = 'Copy' }, 1500)
  })

  buildBoards()
  update()
  loadSamples()
}

// Opens with example artwork, marked by its file names, so every output
// shows something. Removing them leaves a clean slate.
async function loadSamples() {
  try {
    state.sources = await Promise.all(SAMPLES.artwork.map((s) => loadSource(sampleFile(s))))
    const layers = await Promise.all(SAMPLES.layers.map((s) => loadSource(sampleFile(s))))
    state.ios.layers = layers.map((source) => ({ id: source.id, source, scale: 1, glass: true }))
    update()
  } catch (error) {
    status(error.message)
  }
}

init()
