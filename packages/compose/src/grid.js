// A grid's tracks: reading a track list as its sizes and line names, writing one back, and working out where the
// tracks sit and which lines an item lies between. Nothing here touches the page, so it can be tested on its own

/** A track list split at its top level: `[names]` and sizes, whose functions may hold spaces */
function tokens(template) {
  const found = []
  let depth = 0
  let current = ''
  for (const character of template.trim()) {
    if (character === '(' || character === '[') depth++
    if (character === ')' || character === ']') depth--
    if (/\s/.test(character) && depth === 0) {
      if (current) found.push(current)
      current = ''
    } else current += character
  }
  if (current) found.push(current)
  return found
}

/**
 * A track list as its sizes and the names on each line, so there's always one more list of names than sizes.
 * Null for one that can't be changed a line at a time: subgrid, auto-fill, auto-fit or anything built from var()
 */
export function parseTemplate(template) {
  const text = (template ?? '').trim()
  if (!text || text === 'none') return { sizes: [], names: [[]] }
  if (/^subgrid\b|auto-fi(ll|t)|var\(|^masonry\b/.test(text)) return null
  const sizes = []
  const names = [[]]
  const read = (list) => {
    for (const token of list) {
      const repeat = /^repeat\(\s*(\d+)\s*,\s*([\s\S]+)\)$/.exec(token)
      if (repeat) {
        const inner = tokens(repeat[2])
        for (let count = 0; count < Number(repeat[1]); count++) read(inner)
      } else if (token.startsWith('[')) names.at(-1).push(...token.slice(1, -1).trim().split(/\s+/).filter(Boolean))
      else {
        sizes.push(token)
        names.push([])
      }
    }
  }
  read(tokens(text))
  return { sizes, names }
}

/** A track list from its sizes and names, with a run of the same size and no names inside it as a repeat() */
export function formatTemplate({ sizes, names }) {
  if (!sizes.length) return 'none'
  const named = (line) => (names[line]?.length ? [`[${names[line].join(' ')}]`] : [])
  const parts = [...named(0)]
  for (let index = 0; index < sizes.length; ) {
    let run = 1
    while (index + run < sizes.length && sizes[index + run] === sizes[index] && !names[index + run]?.length) run++
    parts.push(run > 1 ? `repeat(${run}, ${sizes[index]})` : sizes[index])
    index += run
    parts.push(...named(index))
  }
  return parts.join(' ')
}

/** The same track list with a different number of tracks, each new one the size of the last. The last line keeps its names */
export function withCount(template, count, fallback) {
  const sizes = [...template.sizes]
  const names = template.names.map((line) => [...line])
  while (sizes.length < count) {
    sizes.push(sizes.at(-1) ?? fallback)
    names.splice(-1, 0, [])
  }
  while (sizes.length > Math.max(count, 1)) {
    sizes.pop()
    names.splice(-2, 1)
  }
  return { sizes, names }
}

/**
 * Where each track starts and ends along one axis, from the sizes the browser resolved, the gap between them and
 * how the container spreads what's left over (justify-content or align-content)
 */
export function placeTracks(sizes, { start, extent, gap = 0, distribute = 'normal' }) {
  const count = sizes.length
  const free = Math.max(0, extent - sizes.reduce((sum, size) => sum + size, 0) - gap * Math.max(0, count - 1))
  let offset = 0
  let between = gap
  if (/^(safe |unsafe )?(end|flex-end)$/.test(distribute)) offset = free
  else if (/^(safe |unsafe )?center$/.test(distribute)) offset = free / 2
  else if (distribute === 'space-between' && count > 1) between += free / (count - 1)
  else if (distribute === 'space-around' && count) {
    between += free / count
    offset = free / count / 2
  } else if (distribute === 'space-evenly' && count) {
    between += free / (count + 1)
    offset = free / (count + 1)
  }
  let at = start + offset
  return sizes.map((size) => {
    const track = { start: at, end: at + size }
    at += size + between
    return track
  })
}

/** Where a line is drawn: the grid's edge for the first and last, and the middle of the gap for the rest */
export function linePosition(tracks, line) {
  if (!tracks.length) return 0
  if (line <= 1) return tracks[0].start
  if (line > tracks.length) return tracks.at(-1).end
  return (tracks[line - 2].end + tracks[line - 1].start) / 2
}

/** The line nearest a point, from 1. With `extend`, far enough past the last one counts as a line that isn't there yet */
export function nearestLine(tracks, point, extend = 0) {
  if (!tracks.length) return 1
  if (extend && point > tracks.at(-1).end + extend) return tracks.length + 2
  let best = 1
  for (let line = 2; line <= tracks.length + 1; line++) {
    if (Math.abs(linePosition(tracks, line) - point) < Math.abs(linePosition(tracks, best) - point)) best = line
  }
  return best
}

/** The track a point is in, or nearest to, from 0. With `extend`, far enough past the last one counts as a new track */
export function nearestTrack(tracks, point, extend = 0) {
  if (!tracks.length) return 0
  if (extend && point > tracks.at(-1).end + extend) return tracks.length
  let best = 0
  const distance = ({ start, end }) => (point < start ? start - point : point > end ? point - end : 0)
  tracks.forEach((track, index) => {
    if (distance(track) < distance(tracks[best])) best = index
  })
  return best
}

/**
 * The lines an item lies between on one axis, from 1. What the item's own style says wins, as a whole number or a
 * span. Otherwise it's read off where the item sits, which the browser doesn't report for an item it placed itself
 */
export function linesOf(tracks, { start, end, from, to }) {
  const count = tracks.length
  const whole = (value) => (/^-?\d+$/.test(value) ? (Number(value) > 0 ? Number(value) : count + 2 + Number(value)) : null)
  const span = (value) => (/^span \d+$/.test(value) ? Number(value.slice(5)) : null)
  let first = whole(start)
  let last = whole(end)
  if (first === null && last !== null && span(start)) first = last - span(start)
  // The track its leading edge is in, then the first track that reaches its trailing edge, so an item that doesn't
  // fill its area is still read as being in it
  if (first === null) {
    first = 1
    for (let line = 2; line <= count; line++) if (tracks[line - 1].start <= from + 1) first = line
  }
  if (last === null && span(end)) last = first + span(end)
  if (last === null) {
    last = first + 1
    while (last <= count && tracks[last - 2].end < to - 1) last++
  }
  first = Math.max(1, first)
  return { start: first, end: Math.max(first + 1, last) }
}

/** grid-column or grid-row for an item between two lines, by a line's name where only that line has it */
export function placement(names, start, end) {
  const name = (line) => names[line - 1]?.find((candidate) => names.filter((other) => other.includes(candidate)).length === 1)
  const first = name(start) ?? start
  if (name(end)) return `${first} / ${name(end)}`
  if (end - start === 1 && typeof first === 'number') return `${first}`
  return `${first} / span ${end - start}`
}
