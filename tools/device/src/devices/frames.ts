import desktopDark from './frames/desktop-frame-dark.svg?raw'
import desktopLight from './frames/desktop-frame-light.svg?raw'
import phoneDark from './frames/phone-frame-dark.svg?raw'
import phoneLight from './frames/phone-frame-light.svg?raw'
import { modelById, screenSize, type Model, type ModelId, type Orientation, type Theme } from './models'

export type Corners = [number, number, number, number]
export type Radius = number | Corners

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface Layout {
  width: number
  height: number
  screen: Box & { radius: Radius }
  /** A phone, with a status bar and home indicator over its screen */
  phone?: boolean
}

export interface Art {
  layout: Layout
  /** Under the screen: the body and bezel, as SVG */
  under: string
  /** Over the screen: its island, camera or notch */
  over: string | null
}

type Spec =
  | { type: 'phone'; radius: number; camera: 'island' | 'hole' }
  | { type: 'tablet'; radius: number; bezel: number; camera: 'long' | 'short' }
  | { type: 'laptop'; radius: number; bezel: { top: number; side: number; bottom: number }; notch: number }
  | { type: 'display'; radius: number; bezel: number }

const specs: Record<Exclude<ModelId, 'phone' | 'desktop'>, Spec> = {
  'iphone-17-pro': { type: 'phone', radius: 62, camera: 'island' },
  'iphone-17-pro-max': { type: 'phone', radius: 64, camera: 'island' },
  'iphone-air': { type: 'phone', radius: 62, camera: 'island' },
  android: { type: 'phone', radius: 44, camera: 'hole' },
  'ipad-mini': { type: 'tablet', radius: 22, bezel: 44, camera: 'short' },
  'ipad-air-11': { type: 'tablet', radius: 18, bezel: 40, camera: 'long' },
  'ipad-pro-13': { type: 'tablet', radius: 18, bezel: 32, camera: 'long' },
  'macbook-air-13': { type: 'laptop', radius: 12, bezel: { top: 20, side: 20, bottom: 28 }, notch: 186 },
  'macbook-pro-14': { type: 'laptop', radius: 12, bezel: { top: 18, side: 18, bottom: 26 }, notch: 196 },
  'macbook-pro-16': { type: 'laptop', radius: 12, bezel: { top: 18, side: 18, bottom: 26 }, notch: 196 },
  'studio-display': { type: 'display', radius: 8, bezel: 44 },
}

// The colours of mcknny’s frames. Light frames have a hairline edge, a tint
// and a white wash; dark ones, for a dark page, are plainer and brighter
const p3 = (r: number, g: number, b: number) => `color(display-p3 ${r} ${g} ${b})`

const tones = {
  light: {
    body: p3(0.9804, 0.9725, 0.9765),
    edge: p3(0.5145, 0.5373, 0.4902),
    tint: p3(0.7299, 0.7451, 0.7137),
    metal: [
      [0.06, p3(0.949, 0.9569, 0.9373)],
      [0.145, p3(0.7882, 0.8157, 0.8118)],
      [0.215, p3(0.8627, 0.8863, 0.8824)],
      [0.527, p3(0.8627, 0.8863, 0.8824)],
      [0.794, p3(0.9474, 0.9569, 0.9373)],
      [0.85, p3(0.7882, 0.8157, 0.8118)],
      [0.894, p3(0.7882, 0.8157, 0.8118)],
      [0.947, p3(0.949, 0.9569, 0.9373)],
      [1, p3(0.949, 0.9569, 0.9373)],
    ],
    seam: p3(0.5184, 0.5373, 0.4902),
    seamOpacity: 0.48,
    deck: [
      [0, p3(0.9608, 0.9647, 0.9569)],
      [0.45, p3(0.8667, 0.8745, 0.8588)],
      [1, p3(0.6157, 0.6314, 0.6)],
    ],
  },
  dark: {
    body: p3(0.9474, 0.9569, 0.9373),
    edge: null,
    tint: null,
    metal: [
      [0.06, p3(0.8706, 0.8784, 0.8588)],
      [0.145, p3(0.949, 0.9569, 0.9373)],
      [0.215, p3(0.949, 0.9569, 0.9373)],
      [0.527, p3(0.949, 0.9569, 0.9373)],
      [0.794, p3(0.8706, 0.8784, 0.8588)],
      [0.85, p3(0.949, 0.9569, 0.9373)],
      [0.91, p3(0.949, 0.9569, 0.9373)],
      [1, p3(0.8706, 0.8784, 0.8588)],
    ],
    seam: p3(0.585, 0.6039, 0.5647),
    seamOpacity: 0.4,
    deck: [
      [0, p3(0.9529, 0.9608, 0.9451)],
      [0.45, p3(0.8902, 0.898, 0.8824)],
      [1, p3(0.6941, 0.7059, 0.6824)],
    ],
  },
} as const satisfies Record<Theme, unknown>

const bezel = p3(0.1255, 0.1255, 0.1255)
const glass = p3(0.0706, 0.0706, 0.0706)
const band = p3(0.6575, 0.6745, 0.6392)

const n = (value: number) => String(Math.round(value * 1000) / 1000)

function corners(radius: Radius): Corners {
  return typeof radius === 'number' ? [radius, radius, radius, radius] : radius
}

export function radiusCss(radius: Radius): string {
  return corners(radius).map((corner) => `${corner}px`).join(' ')
}

export function roundedRect({ x, y, width, height }: Box, radius: Radius): string {
  const [tl, tr, br, bl] = corners(radius)
  const arc = (r: number, ex: number, ey: number) => (r ? `A${n(r)} ${n(r)} 0 0 1 ${n(ex)} ${n(ey)}` : '')
  return (
    `M${n(x + tl)} ${n(y)}H${n(x + width - tr)}${arc(tr, x + width, y + tr)}` +
    `V${n(y + height - br)}${arc(br, x + width - br, y + height)}` +
    `H${n(x + bl)}${arc(bl, x, y + height - bl)}` +
    `V${n(y + tl)}${arc(tl, x + tl, y)}Z`
  )
}

function svg(width: number, height: number, content: string, defs = ''): string {
  const size = `width="${n(width)}" height="${n(height)}" viewBox="0 0 ${n(width)} ${n(height)}"`
  return `<svg xmlns="http://www.w3.org/2000/svg" ${size} fill="none">${content}${defs && `<defs>${defs}</defs>`}</svg>`
}

function gradient(id: string, stops: readonly (readonly [number, string])[], direction: 'up' | 'down') {
  const [y1, y2] = direction === 'up' ? [1, 0] : [0, 1]
  const body = stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('')
  return `<linearGradient id="${id}" x1="0" y1="${y1}" x2="0" y2="${y2}">${body}</linearGradient>`
}

/** A device’s body, as mcknny’s frames draw it, with a 2px white rim inside its edge */
function shell(box: Box, radius: Radius, theme: Theme) {
  const tone = tones[theme]
  const d = roundedRect(box, radius)
  const rim = `<path d="${d}" stroke="#fff" stroke-width="4" clip-path="url(#rim)"/>`
  const defs = `<clipPath id="rim"><path d="${d}"/></clipPath>`
  if (!tone.edge || !tone.tint) return { body: `<path d="${d}" fill="${tone.body}"/>${rim}`, defs }

  const outset = corners(radius).map((corner) => (corner ? corner + 0.5 : 0)) as Corners
  const edge = roundedRect({ x: box.x - 0.5, y: box.y - 0.5, width: box.width + 1, height: box.height + 1 }, outset)
  return {
    body:
      `<path d="${d}" fill="${tone.body}"/>` +
      `<path d="${edge}" stroke="${tone.edge}" stroke-opacity=".48"/>` +
      `<path d="${d}" fill="${tone.tint}" fill-opacity=".24"/>` +
      `<path d="${d}" fill="#fff" fill-opacity=".76"/>${rim}`,
    defs,
  }
}

/** A side button, as mcknny’s phone draws its four */
function button(side: 'left' | 'right', top: number, length: number, width: number, theme: Theme) {
  const tone = tones[theme]
  const seam = `fill="${tone.seam}" fill-opacity="${tone.seamOpacity}"`
  if (side === 'left') {
    const shape = `M1 ${top + 2}a2 2 0 0 1 2-2h1v${length}H3a2 2 0 0 1-2-2z`
    if (theme === 'dark') return `<path fill="url(#metal)" d="${shape}"/><path ${seam} d="M4 ${top}h1v${length}H4z"/>`
    const edge = `M4.5 ${top - 0.5}v${length + 1}H3A2.5 2.5 0 0 1 .5 ${top + length - 2}v-${length - 4}a2.5 2.5 0 0 1 2.5-2.5z`
    return (
      `<path fill="url(#metal)" d="${shape}"/><path fill="#fff" fill-opacity=".4" d="${shape}"/>` +
      `<path stroke="${tone.seam}" stroke-opacity=".48" d="${edge}"/><path ${seam} d="M4 ${top - 1}h1v${length + 2}H4z"/>`
    )
  }
  const x = width - 4
  const shape = `M${x} ${top}h1a2 2 0 0 1 2 2v${length - 4}a2 2 0 0 1-2 2h-1z`
  if (theme === 'dark') return `<path fill="url(#metal)" d="${shape}"/><path ${seam} d="M${x - 1} ${top}h1v${length}h-1z"/>`
  const edge = `M${x - 0.5} ${top - 0.5}v${length + 1}H${x + 1}a2.5 2.5 0 0 0 2.5-2.5v-${length - 4}a2.5 2.5 0 0 0-2.5-2.5z`
  return (
    `<path fill="url(#metal)" d="${shape}"/><path fill="#fff" fill-opacity=".4" d="${shape}"/>` +
    `<path stroke="${tone.seam}" stroke-opacity=".48" d="${edge}"/><path ${seam} d="M${x - 1} ${top - 1}h1v${length + 2}h-1z"/>`
  )
}

/** mcknny’s Dynamic Island, from its status bar: 120 × 36, centred, 14 down the screen */
function island(cx: number, top: number) {
  const x = cx - 60
  const y = top + 14
  const lens = (id: string, from: string, to: string) =>
    `<linearGradient id="${id}" x1="${n(x + 98)}" y1="${n(y + 10)}" x2="${n(x + 98)}" y2="${n(y + 26)}" gradientUnits="userSpaceOnUse">` +
    `<stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`
  return {
    content:
      `<rect x="${n(x)}" y="${n(y)}" width="120" height="36" rx="18" fill="#000"/>` +
      `<rect x="${n(x + 89.5)}" y="${n(y + 9.5)}" width="17" height="17" rx="8.5" fill="url(#lens-fill)" stroke="url(#lens-edge)"/>` +
      `<rect x="${n(x + 93.5)}" y="${n(y + 13.5)}" width="9" height="9" rx="4.5" fill="#001434" stroke="#000"/>`,
    defs: lens('lens-fill', '#000', '#171717') + lens('lens-edge', '#0c0c0c', '#1e1e1e'),
  }
}

function hole(cx: number, top: number) {
  const cy = n(top + 24)
  return `<circle cx="${n(cx)}" cy="${cy}" r="7" fill="#000"/><circle cx="${n(cx)}" cy="${cy}" r="2.75" fill="#001434" stroke="#000"/>`
}

function camera(cx: number, cy: number) {
  return (
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="4.5" fill="#0d0e0e" stroke="#2a2b2b" stroke-width=".75"/>` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="2" fill="#15202c"/>`
  )
}

// Buttons down a phone’s sides, from the top: mcknny’s phone has the action
// button and volume on the left and the side button on the right
const phoneButtons = {
  island: { left: [[188, 40], [259, 68], [346, 68]], right: [[324, 98]] },
  hole: { left: [], right: [[220, 72], [320, 136]] },
} as const

function phone(model: Model, spec: Extract<Spec, { type: 'phone' }>, theme: Theme): Art {
  // The same build as mcknny’s phone: 4 for the buttons, 6 of metal and 8 of
  // black round the screen at the sides, 1, 6 and 8 at the top and bottom
  const { width: W, height: H } = model.screen
  const r = spec.radius
  const width = W + 36
  const height = H + 30
  const { body, defs } = shell({ x: 4, y: 1, width: W + 28, height: H + 28 }, r + 14, theme)
  const { left, right } = phoneButtons[spec.camera]
  const keys = [
    ...left.map(([top, length]) => button('left', top, length, width, theme)),
    ...right.map(([top, length]) => button('right', top, length, width, theme)),
  ].join('')
  const bands =
    spec.camera === 'island'
      ? `<path fill="${band}" fill-opacity=".32" d="M4 95h7v6H4zM${width - 11} 95h7v6h-7zM4 ${height - 102}h7v6H4zM${width - 11} ${height - 102}h7v6h-7z"/>`
      : ''
  const black = `<rect x="10" y="7" width="${W + 16}" height="${H + 16}" rx="${r + 8}" fill="${bezel}"/>`
  const content = theme === 'light' ? keys + body + bands + black : body + bands + black + keys
  const top = spec.camera === 'island' ? island(width / 2, 15) : { content: hole(width / 2, 15), defs: '' }

  return {
    layout: { width, height, screen: { x: 18, y: 15, width: W, height: H, radius: r }, phone: true },
    under: svg(width, height, content, defs + gradient('metal', tones[theme].metal, 'up')),
    over: svg(width, height, top.content, top.defs),
  }
}

function tablet(model: Model, spec: Extract<Spec, { type: 'tablet' }>, orientation: Orientation, theme: Theme): Art {
  const { width: W, height: H } = screenSize(model, orientation)
  const { radius: r, bezel: b } = spec
  const m = 6
  const width = W + 2 * (b + m) + 2
  const height = H + 2 * (b + m) + 2
  const { body, defs } = shell({ x: 1, y: 1, width: width - 2, height: height - 2 }, r + b + m, theme)
  const screen = { x: 1 + m + b, y: 1 + m + b, width: W, height: H }
  const black = `<path d="${roundedRect({ x: 1 + m, y: 1 + m, width: W + 2 * b, height: H + 2 * b }, r + b)}" fill="${bezel}"/>`

  // On a long edge, the camera’s at the top in landscape and on the right in
  // portrait. On a short edge, at the top in portrait and on the left in landscape
  const middle = 1 + m + b / 2
  const atTop = (spec.camera === 'long') === (orientation === 'landscape')
  const lens = atTop
    ? camera(width / 2, middle)
    : camera(spec.camera === 'long' ? width - middle : middle, height / 2)

  return {
    layout: { width, height, screen: { ...screen, radius: r } },
    under: svg(width, height, body + black + `<path d="${roundedRect(screen, r)}" fill="${glass}"/>` + lens, defs),
    over: null,
  }
}

function laptop(model: Model, spec: Extract<Spec, { type: 'laptop' }>, theme: Theme): Art {
  const { width: W, height: H } = model.screen
  const { radius: r, bezel: { top, side, bottom }, notch } = spec
  const m = 5
  const lidWidth = W + 2 * (side + m)
  const lidHeight = H + top + bottom + 2 * m
  const overhang = Math.round(lidWidth * 0.06)
  const deckHeight = Math.round(lidWidth * 0.021)
  const width = lidWidth + 2 * overhang
  const height = 1 + lidHeight + deckHeight
  const tone = tones[theme]

  const R = r + side + m
  const { body, defs } = shell({ x: overhang, y: 1, width: lidWidth, height: lidHeight }, [R, R, 0, 0], theme)
  const black = `<path d="${roundedRect({ x: overhang + m, y: 1 + m, width: W + 2 * side, height: H + top + bottom }, [r + side, r + side, 2, 2])}" fill="${bezel}"/>`
  const screen = { x: overhang + m + side, y: 1 + m + top, width: W, height: H }

  // The deck, seen from the front: wider than the lid, with a scoop to open it by
  const y = 1 + lidHeight
  const deck = roundedRect({ x: 0, y, width, height: deckHeight }, [1, 1, deckHeight * 0.8, deckHeight * 0.8])
  const scoopWidth = Math.round(lidWidth * 0.16)
  const scoopDepth = Math.round(deckHeight * 0.42)
  const scoop = roundedRect({ x: (width - scoopWidth) / 2, y, width: scoopWidth, height: scoopDepth }, [0, 0, scoopDepth, scoopDepth])
  const edge = tone.edge ? `<path d="${deck}" stroke="${tone.edge}" stroke-opacity=".48" stroke-width=".5"/>` : ''
  const base =
    `<path d="${deck}" fill="url(#deck)"/>${edge}` +
    `<path d="${scoop}" fill="${tone.seam}" fill-opacity=".24"/>` +
    `<rect x="${overhang}" y="${y}" width="${lidWidth}" height="1" fill="${tone.seam}" fill-opacity=".4"/>`

  // The notch, which hangs into the top of the screen, with the camera in it,
  // and curves out to the screen’s edge either side
  const notchX = screen.x + (W - notch) / 2
  const flare = (x: number, side: -1 | 1) =>
    `<path d="M${n(x)} ${n(screen.y)}V${n(screen.y + 6)}A6 6 0 0 ${side === 1 ? 1 : 0} ${n(x + 6 * side)} ${n(screen.y)}Z" fill="${bezel}"/>`
  const over =
    `<path d="${roundedRect({ x: notchX, y: screen.y, width: notch, height: 32 }, [0, 0, 10, 10])}" fill="${bezel}"/>` +
    flare(notchX, -1) +
    flare(notchX + notch, 1) +
    camera(screen.x + W / 2, screen.y + 15)

  return {
    layout: { width, height, screen: { ...screen, radius: [r, r, 0, 0] } },
    under: svg(width, height, base + body + black + `<path d="${roundedRect(screen, [r, r, 0, 0])}" fill="${glass}"/>`, defs + gradient('deck', tone.deck, 'down')),
    over: svg(width, height, over),
  }
}

function display(model: Model, spec: Extract<Spec, { type: 'display' }>, theme: Theme): Art {
  const { width: W, height: H } = model.screen
  const { radius: r, bezel: b } = spec
  const m = 8
  const bodyWidth = W + 2 * (b + m)
  const bodyHeight = H + 2 * (b + m)
  const width = bodyWidth + 2
  const armWidth = Math.round(bodyWidth * 0.27)
  const armHeight = Math.round(bodyHeight * 0.3)
  const footHeight = Math.round(bodyWidth * 0.008)
  const height = 2 + bodyHeight + armHeight + footHeight
  const tone = tones[theme]

  const { body, defs } = shell({ x: 1, y: 1, width: bodyWidth, height: bodyHeight }, r + b + m, theme)
  const black = `<path d="${roundedRect({ x: 1 + m, y: 1 + m, width: W + 2 * b, height: H + 2 * b }, r + b)}" fill="${bezel}"/>`
  const screen = { x: 1 + m + b, y: 1 + m + b, width: W, height: H }

  // The stand: an arm behind the display, down to its foot
  const armX = (width - armWidth) / 2
  const armTop = 1 + bodyHeight - 40
  const arm =
    `<rect x="${armX}" y="${armTop}" width="${armWidth}" height="${armHeight + 40}" fill="url(#deck)"/>` +
    `<rect x="${armX}" y="${1 + bodyHeight}" width="${armWidth}" height="${Math.round(armHeight * 0.12)}" fill="${tone.seam}" fill-opacity=".2"/>`
  const foot = roundedRect({ x: armX - footHeight, y: 1 + bodyHeight + armHeight, width: armWidth + 2 * footHeight, height: footHeight }, [2, 2, footHeight / 2, footHeight / 2])
  const stand = `${arm}<path d="${foot}" fill="url(#foot)"/>`

  return {
    layout: { width, height, screen: { ...screen, radius: r } },
    under: svg(
      width,
      height,
      stand + body + black + `<path d="${roundedRect(screen, r)}" fill="${glass}"/>`,
      defs + gradient('deck', [...tone.deck].reverse().map(([offset, colour]) => [1 - offset, colour] as const), 'down') + gradient('foot', tone.deck, 'down'),
    ),
    over: null,
  }
}

function mcknnyPhone(theme: Theme): Art {
  const top = island(220, 15)
  return {
    layout: { width: 440, height: 936, screen: { x: 18, y: 15, width: 404, height: 906, radius: 64 }, phone: true },
    under: theme === 'light' ? phoneLight : phoneDark,
    over: svg(440, 936, top.content, top.defs),
  }
}

function mcknnyDesktop(theme: Theme): Art {
  // The dark frame is 4 wider, and is drawn at the light one’s size, where its screen lines up
  return {
    layout: { width: 1464, height: 892, screen: { x: 12, y: 12, width: 1440, height: 868, radius: 28 } },
    under: theme === 'light' ? desktopLight : desktopDark.replace('<svg ', '<svg preserveAspectRatio="none" '),
    over: null,
  }
}

function build(model: Model, orientation: Orientation, theme: Theme): Art {
  if (model.id === 'phone') return mcknnyPhone(theme)
  if (model.id === 'desktop') return mcknnyDesktop(theme)
  const spec = specs[model.id as keyof typeof specs]
  switch (spec.type) {
    case 'phone':
      return phone(model, spec, theme)
    case 'tablet':
      return tablet(model, spec, orientation, theme)
    case 'laptop':
      return laptop(model, spec, theme)
    case 'display':
      return display(model, spec, theme)
  }
}

const arts = new Map<string, Art>()

export function frameArt(modelId: string, orientation: Orientation, theme: Theme): Art {
  const model = modelById(modelId)
  const turned = model.rotates ? orientation : 'portrait'
  const key = `${model.id} ${turned} ${theme}`
  let art = arts.get(key)
  if (!art) {
    art = build(model, turned, theme)
    arts.set(key, art)
  }
  return art
}

export function layoutOf(modelId: string, orientation: Orientation): Layout {
  return frameArt(modelId, orientation, 'light').layout
}

const urls = new Map<string, string>()

export function svgUrl(source: string): string {
  let url = urls.get(source)
  if (!url) {
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
    urls.set(source, url)
  }
  return url
}

export type Tone = 'dark' | 'light'

/** Over a phone’s screen as mcknny’s Phone lays it: 3 wider each side, and 2 above */
export function statusBarBox({ screen }: Layout): Box {
  return { x: screen.x - 3, y: screen.y - 2, width: screen.width + 7, height: 64 }
}

/** The bar to swipe up from, 134 × 5, centred, 6 above the screen’s foot */
export function homeIndicatorBox({ screen }: Layout): Box {
  return { x: screen.x + (screen.width - 134) / 2, y: screen.y + screen.height - 11, width: 134, height: 5 }
}

export const homeIndicatorColour: Record<Tone, string> = { dark: '#090909', light: '#f2f4ef' }

const time =
  'M55.2298 40.221C52.9348 40.221 51.3538 38.912 51.0648 36.821H53.0028C53.1898 37.926 54.0058 38.589 55.2298 38.589C56.9298 38.589 57.9498 37.467 57.9498 34.407V34.084C57.4058 35.053 56.2838 35.716 54.8388 35.716C52.6968 35.716 50.9628 34.254 50.9628 31.959V31.772C50.9628 29.409 52.7308 27.709 55.2468 27.709C58.0518 27.709 59.8198 29.8 59.8198 33.625V34.254C59.8198 38.028 58.0858 40.221 55.2298 40.221ZM55.2468 34.152C56.6408 34.152 57.5928 33.217 57.5928 31.908V31.687C57.5928 30.31 56.6408 29.307 55.2468 29.307C53.8868 29.307 52.9688 30.242 52.9688 31.687V31.925C52.9688 33.251 53.8868 34.152 55.2468 34.152ZM63.9268 33.302H61.9038V31.245H63.9268V33.302ZM63.9268 40H61.9038V37.96H63.9268V40ZM73.0383 40H71.1683V37.11H65.6433V35.546L71.0833 27.93H73.0383V35.529H74.7553V37.11H73.0383V40ZM71.1683 30.344L67.4963 35.546H71.1683V30.344ZM84.7952 40H76.4482V38.317H79.9162V30.293C79.0492 31.007 77.9442 31.483 76.8052 31.687V29.919C78.0802 29.613 79.5762 28.933 80.4602 27.93H81.9052V38.317H84.7952V40Z'
const signal =
  'M295.125 35.25C295.47 35.25 295.75 35.5299 295.75 35.875C295.75 37.125 295.75 38.375 295.75 39.625C295.75 39.9701 295.47 40.2499 295.125 40.25H293.875C293.53 40.25 293.25 39.9702 293.25 39.625V35.875C293.25 35.5299 293.53 35.2501 293.875 35.25H295.125ZM300.125 32.75C300.47 32.7501 300.75 33.0299 300.75 33.375C300.75 35.4583 300.75 37.5417 300.75 39.625C300.75 39.9701 300.47 40.2498 300.125 40.25H298.875C298.53 40.25 298.25 39.9702 298.25 39.625V33.375C298.25 33.0299 298.53 32.7502 298.875 32.75H300.125ZM305.125 30.25C305.47 30.2501 305.75 30.5299 305.75 30.875C305.75 33.7917 305.75 36.7083 305.75 39.625C305.75 39.9701 305.47 40.2498 305.125 40.25H303.875C303.53 40.25 303.25 39.9702 303.25 39.625V30.875C303.25 30.5299 303.53 30.2502 303.875 30.25H305.125ZM310.125 27.75C310.47 27.7501 310.75 28.0299 310.75 28.375C310.75 32.125 310.75 35.875 310.75 39.625C310.75 39.9701 310.47 40.2498 310.125 40.25H308.875C308.53 40.25 308.25 39.9702 308.25 39.625V28.375C308.25 28.0299 308.53 27.7502 308.875 27.75H310.125Z'
const wifi =
  'M328.392 41.034 325.74 38.382A3.75 3.75 0 0 1 331.044 38.382ZM322.205 34.847A8.75 8.75 0 0 1 334.579 34.847L332.811 36.615A6.25 6.25 0 0 0 323.973 36.615ZM318.669 31.311A13.75 13.75 0 0 1 338.115 31.311L336.347 33.079A11.25 11.25 0 0 0 320.437 33.079Z'

/**
 * mcknny’s status bar, from iOS: the time, signal, wifi and battery, drawn
 * for a screen this wide. The island is the frame’s, so it stays without one
 */
export function statusBar(screenWidth: number, tone: Tone): string {
  const colour = tone === 'light' ? '#f2f4ef' : '#202020'
  const icons =
    `<path fill="${colour}" d="${signal}"/><path fill="${colour}" d="${wifi}"/>` +
    `<rect x="346.5" y="29" width="15" height="10" rx=".3125" stroke="${colour}" stroke-width="2.5"/>` +
    `<rect x="349" y="31.5" width="10" height="5" fill="${colour}" opacity=".4"/>` +
    `<rect x="361.5" y="32.75" width="1.25" height="2.5" stroke="${colour}" stroke-width="2.5"/>`
  return svg(screenWidth + 7, 64, `<path fill="${colour}" d="${time}"/><g transform="translate(${n(screenWidth - 404)})">${icons}</g>`)
}
