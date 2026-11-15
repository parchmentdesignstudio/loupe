import { resolveIcon, iconAttributes } from './index.js'

// Icons that move, drawn from the solid 16px icons' parts (data-part). Each move happens inside the icon's own 16 grid,
// in its units, and the svg clips at that box, so a plane or car leaves and comes back at the icon's edges at any size

const bodyOf = (name) => {
  const icon = resolveIcon(name)
  if (!icon) throw new Error(`No solid 16px icon called ${name}`)
  return icon.body
}

/** An icon's part, by its data-part name, as markup */
function partOf(name, part) {
  const body = bodyOf(name)
  const at = body.indexOf(`data-part="${part}"`)
  if (at < 0) throw new Error(`${name} has no part called ${part}`)
  const start = body.lastIndexOf('<', at)
  const tag = /^<(\w+)/.exec(body.slice(start))[1]
  const open = body.indexOf('>', at)
  if (body[open - 1] === '/') return body.slice(start, open + 1)
  // Its closing tag, past any of the same name inside it
  const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g')
  tags.lastIndex = open + 1
  let depth = 1
  for (let match = tags.exec(body); match; match = tags.exec(body)) {
    if (match[1]) depth--
    else if (!match[0].endsWith('/>')) depth++
    if (depth === 0) return body.slice(start, match.index + match[0].length)
  }
  throw new Error(`${name}'s ${part} doesn't close`)
}

const clipOf = (name) => /<clipPath[^>]*>([\s\S]*?)<\/clipPath>/.exec(bodyOf(name))[1]
const at = (x, markup) => `<g transform="translate(${x} 0)">${markup}</g>`

const SHEET = 'cubic-bezier(.32, .72, 0, 1)'
const TAKE_OFF = 'cubic-bezier(.4, 0, 1, 1)'
const SET_OFF = 'cubic-bezier(.55, 0, .85, .45)'
const ROLL_IN = 'cubic-bezier(.2, .6, .35, 1)'
const GLIDE = 'cubic-bezier(.45, 0, .25, 1)'

// Off to the right and back in from the left, out of sight `at` of the way through. 18 clears the 16 grid either way
const across = (at, off = TAKE_OFF, on = SHEET) => [
  { translate: '0 0', easing: off },
  { translate: '18px 0', offset: at },
  { translate: '-18px 0', offset: at, easing: on },
  { translate: '0 0' },
]

const sway = (property, values) => values.map((value) => ({ [property]: value, easing: 'ease-in-out' }))

// A body sits back on its wheels as it sets off, and settles forward as it rolls to a stop
const ride = [
  { rotate: '0deg', easing: 'ease-in-out' },
  { rotate: '-2deg', offset: 0.2, easing: 'ease-in-out' },
  { rotate: '0deg', offset: 0.42 },
  { rotate: '0deg', offset: 0.7, easing: 'ease-in-out' },
  { rotate: '1.5deg', offset: 0.88, easing: 'ease-in-out' },
  { rotate: '0deg' },
]

// The takeoff and landing planes as a turn about the grid's middle and a shift from the level one, so a flight passes
// exactly through airplane-departure and airplane-arrival. Read from Sketch, so they need updating if one moves there
const TAKEOFF = { x: 0.2879, y: 0, turn: -15 }
const LANDING = { x: -0.2621, y: -0.0405, turn: 15 }
const pose = ({ x, y, turn }, dx = 0, dy = 0) => ({ translate: `${x + dx}px ${y + dy}px`, rotate: `${turn}deg` })

const fly = [
  { translate: '0 0', rotate: '0deg', easing: 'ease-in' },
  { translate: '1px 0', rotate: '0deg', offset: 0.1, easing: 'ease-in-out' },
  { ...pose(TAKEOFF), offset: 0.24, easing: 'ease-in-out' },
  { ...pose(TAKEOFF, 0.5, -0.25), offset: 0.3, easing: TAKE_OFF },
  { ...pose(TAKEOFF, 18, -6), offset: 0.46 },
  { ...pose(LANDING, -18, -6), offset: 0.46, easing: SHEET },
  { ...pose(LANDING), offset: 0.78, easing: 'ease-in-out' },
  { ...pose(LANDING), offset: 0.84, easing: 'ease-in-out' },
  { translate: '0 0', rotate: '0deg' },
]

// The shadow underneath, there only near the ground
const shade = [
  { opacity: 0 },
  { opacity: 0, offset: 0.1, easing: 'ease-in-out' },
  { opacity: 1, offset: 0.24 },
  { opacity: 1, offset: 0.3, easing: 'ease-in' },
  { opacity: 0, offset: 0.42 },
  { opacity: 0, offset: 0.56, easing: 'ease-in-out' },
  { opacity: 1, offset: 0.78 },
  { opacity: 1, offset: 0.86, easing: 'ease-in-out' },
  { opacity: 0 },
]

const rocking = sway('rotate', ['0deg', '-5deg', '4deg', '-3deg', '2deg', '-1deg', '0deg'])
const drifting = sway('translate', ['0 0', '-0.5px 0', '0.4px 0', '-0.3px 0', '0.2px 0', '-0.1px 0', '0 0'])

// Turns about a point on the 16 grid, rather than the part's own box
const pivot = (element, x, y) => {
  element.style.transformBox = 'view-box'
  element.style.transformOrigin = `${x}px ${y}px`
  return element
}

const flight = (plane, shadow) => ({
  draw: () => `<g data-shadow fill="currentColor" opacity="0">${partOf(shadow, 'shadow')}</g>${partOf(plane, 'plane')}`,
  play: (svg) => [
    pivot(svg.querySelector('[data-part="plane"]'), 8, 8).animate(fly, { duration: 2000 }),
    svg.querySelector('[data-shadow]').animate(shade, { duration: 2000 }),
  ],
})

// Sets off and rolls back in, out of sight just before halfway, its body riding on its wheels
const road = (name) => ({
  draw: () => `<g data-vehicle>${bodyOf(name)}</g>`,
  play: (svg) => [
    svg.querySelector('[data-vehicle]').animate(across(0.45, SET_OFF, ROLL_IN), { duration: 1600 }),
    pivot(svg.querySelector('[data-part="body"]'), 8, 11.75).animate(ride, { duration: 1600 }),
  ],
})

// Rocks about its waterline and sways with it, less and less, on still water
const rock = (name) => ({
  draw: () => bodyOf(name),
  play: (svg) => {
    const boat = pivot(svg.querySelector('[data-part="boat"]'), 8, 11)
    return [boat.animate(rocking, { duration: 1100 }), boat.animate(drifting, { duration: 1100 })]
  },
})

const strip = (distance, duration) => (svg) => [svg.querySelector('[data-strip]').animate([{ translate: '0 0' }, { translate: `${distance}px 0` }], { duration, easing: GLIDE })]

const moves = {
  'airplane-side': flight('airplane-side', 'airplane-departure'),
  'airplane-side-belly': flight('airplane-side-belly', 'airplane-departure-belly'),
  'car-side': road('car-side'),
  'bus-side': road('bus-side'),
  // A train runs through as a strip of cars at a 17 pitch, 3 between bodies: its front car pulls away, the rest go by,
  // and the next front car, 104 back, pulls in where the first one was
  'train-side-front-car': {
    draw: () =>
      `<g data-strip>${[
        ['train-side-front-car', -104],
        ['train-side-rear-car', -68],
        ['train-side-middle-car', -51],
        ['train-side-middle-car', -34],
        ['train-side-middle-car', -17],
        ['train-side-front-car', 0],
      ].map(([name, x]) => at(x, bodyOf(name))).join('')}</g>`,
    play: strip(104, 1600),
  },
  // A ferry sails through in its three sections, under a waterline and over water that stay put, the next front 64 back
  'ferry-side-front': {
    draw: (id) =>
      `<clipPath id="${id}">${clipOf('ferry-side-front')}</clipPath><g clip-path="url(#${id})"><g data-strip>${[
        ['ferry-side-front', -64],
        ['ferry-side-rear', -32],
        ['ferry-side-middle', -16],
        ['ferry-side-front', 0],
      ].map(([name, x]) => at(x, partOf(name, 'boat'))).join('')}</g></g>${partOf('ferry-side-front', 'wave')}`,
    play: strip(64, 2200),
  },
  'ferry-side': rock('ferry-side'),
  sailboat: rock('sailboat'),
}

export const motionNames = Object.keys(moves)

let count = 0

/**
 * A moving icon's markup, at rest, to go in an <svg> with its viewBox and a data-motion of its name, which toMotionSvg
 * and MotionIcon give it. `id` names anything it clips by, so give each on a page its own
 */
export function resolveMotionIcon(name, { id = `motion-${++count}` } = {}) {
  const move = moves[name]
  if (!move) throw new Error(`No moving icon called ${name}`)
  return { name, viewBox: '0 0 16 16', body: move.draw(id) }
}

/** A complete <svg> string of a moving icon, at rest */
export function toMotionSvg(name, { label, class: className, id } = {}) {
  const icon = resolveMotionIcon(name, { id })
  const attrs = { ...iconAttributes({ label }), viewBox: icon.viewBox, 'data-motion': name, ...(className ? { class: className } : {}) }
  const open = Object.entries(attrs).map(([k, v]) => `${k}="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`).join(' ')
  return `<svg ${open}>${icon.body}</svg>`
}

/** Plays a moving icon's move through once, unless it's moving already. Not with reduced motion */
export function playMotion(svg) {
  const move = moves[svg?.dataset?.motion]
  if (!move || svg.getAnimations({ subtree: true }).length > 0) return []
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return []
  return move.play(svg)
}

/**
 * Plays moving icons as a mouse comes onto them, or onto what holds them, marked data-motion-trigger, such as a button.
 * One listener on `root`, so icons added later play too. Returns what stops it
 */
export function playMotionOnHover(root = document) {
  const listener = ({ pointerType, target, relatedTarget }) => {
    if (pointerType !== 'mouse' || !(target instanceof Element)) return
    const trigger = target.closest('[data-motion-trigger], svg[data-motion]')
    // As the pointer comes in, rather than as it moves onto something inside
    if (!trigger || (relatedTarget instanceof Node && trigger.contains(relatedTarget))) return
    const icons = trigger.matches('svg') ? [trigger] : trigger.querySelectorAll('svg[data-motion]')
    for (const icon of icons) playMotion(icon)
  }
  root.addEventListener('pointerover', listener)
  return () => root.removeEventListener('pointerover', listener)
}
