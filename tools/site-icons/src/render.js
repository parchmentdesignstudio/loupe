// Loading artwork and drawing each output to a canvas.

let nextId = 1

function parseLength(value) {
  if (!value || value.endsWith('%')) return null
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function svgSize(svg) {
  const viewBox = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
  const vw = viewBox.length === 4 ? viewBox[2] : null
  const vh = viewBox.length === 4 ? viewBox[3] : null
  const w = parseLength(svg.getAttribute('width')) ?? vw ?? 1024
  const h = parseLength(svg.getAttribute('height')) ?? vh ?? w
  return { w, h, hasViewBox: viewBox.length === 4 }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.addEventListener('load', () => resolve(img), { once: true })
    img.addEventListener('error', () => reject(new Error('This file couldn’t be read as an image.')), { once: true })
    img.src = url
  })
}

// Read a dropped file into something the renderer can draw.
export async function loadSource(file) {
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
  const base = { id: `s${nextId++}`, name: file.name, file }
  if (isSvg) {
    const text = await file.text()
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
    const svg = doc.documentElement
    if (svg.nodeName !== 'svg' || doc.querySelector('parsererror')) throw new Error(`${file.name} isn’t a valid SVG.`)
    const { w, h, hasViewBox } = svgSize(svg)
    if (!hasViewBox) svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    const source = { ...base, type: 'svg', doc, width: w, height: h, size: Math.round(Math.max(w, h)), cache: new Map() }
    source.preview = await rasterSvg(source, 128)
    return source
  }
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)
  return { ...base, type: 'raster', img, url, width: img.naturalWidth, height: img.naturalHeight, size: Math.max(img.naturalWidth, img.naturalHeight), preview: img }
}

// SVGs are rasterised at the size they're drawn, so they stay sharp.
async function rasterSvg(source, longest) {
  const scale = longest / Math.max(source.width, source.height)
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))
  const key = `${w}x${h}`
  if (source.cache.has(key)) return source.cache.get(key)
  const svg = source.doc.documentElement.cloneNode(true)
  svg.setAttribute('width', w)
  svg.setAttribute('height', h)
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const promise = loadImage(url).finally(() => setTimeout(() => URL.revokeObjectURL(url), 1000))
  source.cache.set(key, promise)
  return promise
}

// Large bitmaps shrink in halves so small sizes don't turn grainy.
function stepDown(img, srcW, srcH, w, h) {
  let canvas = img
  let cw = srcW
  let ch = srcH
  while (cw / 2 >= w && ch / 2 >= h) {
    const next = document.createElement('canvas')
    next.width = Math.round(cw / 2)
    next.height = Math.round(ch / 2)
    const ctx = next.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(canvas, 0, 0, next.width, next.height)
    canvas = next
    cw = next.width
    ch = next.height
  }
  return canvas
}

async function drawable(source, w, h) {
  if (source.type === 'svg') return rasterSvg(source, Math.max(w, h))
  return stepDown(source.img, source.width, source.height, w, h)
}

// Fit artwork into a box, keeping its proportions.
async function place(ctx, source, x, y, boxW, boxH, fit = 'contain') {
  const ratio = fit === 'cover'
    ? Math.max(boxW / source.width, boxH / source.height)
    : Math.min(boxW / source.width, boxH / source.height)
  const w = source.width * ratio
  const h = source.height * ratio
  const img = await drawable(source, Math.round(w), Math.round(h))
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, x + (boxW - w) / 2, y + (boxH - h) / 2, w, h)
}

// The artwork drawn for the size closest above this one wins. Anything
// bigger than every artwork uses the largest.
export function pickSource(sources, px) {
  if (!sources.length) return null
  const sorted = sources.toSorted((a, b) => a.size - b.size)
  return sorted.find((s) => s.size >= px) ?? sorted[sorted.length - 1]
}

function mix(hex, other, amount) {
  const a = hexToRgb(hex)
  const b = hexToRgb(other)
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount))
  return `rgb(${c.join(',')})`
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

function iosBackground(ctx, size, state, appearance) {
  if (appearance === 'tinted') {
    ctx.fillStyle = '#000'
  } else if (appearance === 'dark') {
    const g = ctx.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0, '#323234')
    g.addColorStop(1, '#0d0d0e')
    ctx.fillStyle = g
  } else if (state.ios.fill === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0, mix(state.background, '#ffffff', 0.18))
    g.addColorStop(1, state.background)
    ctx.fillStyle = g
  } else {
    ctx.fillStyle = state.background
  }
  ctx.fillRect(0, 0, size, size)
}

// The layers an iOS icon is built from. Without any, the main artwork
// stands in as a single layer.
export function iosLayers(state) {
  if (state.ios.layers.length) return state.ios.layers
  const source = pickSource(state.sources, 1024)
  return source ? [{ id: 'main', source, scale: 0.7, glass: true, fallback: true }] : []
}

export function settingsFor(output, state) {
  const o = state.overrides[output.id] || {}
  return {
    pad: o.pad ?? output.pad ?? 0,
    bg: output.lockBg ? true : (o.bg ?? output.bg ?? false),
    source: o.source ?? 'auto',
  }
}

export function sourceFor(output, state) {
  const { source } = settingsFor(output, state)
  if (source !== 'auto') return state.sources.find((s) => s.id === source) ?? null
  if (output.kind === 'og' && state.og.source) return state.og.source
  return pickSource(state.sources, Math.min(output.w, output.h))
}

export async function renderOutput(output, state) {
  const canvas = document.createElement('canvas')
  canvas.width = output.w
  canvas.height = output.h
  const ctx = canvas.getContext('2d')

  if (output.kind === 'ios') {
    iosBackground(ctx, output.w, state, output.appearance)
    if (output.appearance === 'tinted') ctx.filter = 'grayscale(1) brightness(1.15)'
    // Layers are listed front first, so draw them back to front.
    for (const layer of iosLayers(state).toReversed()) {
      const box = output.w * layer.scale
      const offset = (output.w - box) / 2
      await place(ctx, layer.source, offset, offset, box, box)
    }
    ctx.filter = 'none'
    return canvas
  }

  const { pad, bg } = settingsFor(output, state)
  if (bg) {
    ctx.fillStyle = state.background
    ctx.fillRect(0, 0, output.w, output.h)
  }

  if (output.kind === 'og' && state.og.source && settingsFor(output, state).source === 'auto') {
    await place(ctx, state.og.source, 0, 0, output.w, output.h, 'cover')
    return canvas
  }

  const source = sourceFor(output, state)
  if (!source) return canvas
  const inset = Math.min(output.w, output.h) * pad
  await place(ctx, source, inset, inset, output.w - inset * 2, output.h - inset * 2)
  return canvas
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export function serialiseSvg(source) {
  return new XMLSerializer().serializeToString(source.doc)
}
