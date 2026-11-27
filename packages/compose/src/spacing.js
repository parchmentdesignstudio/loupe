// Gaps and padding on Tailwind's spacing scale, where a bare number is that many steps: 4 is gap-4 or p-4, which is
// 1rem unless the site has changed --spacing

const STEP = /^calc\(var\(--spacing\) \* (\d*\.?\d+)\)$/
const REM = /^(\d*\.?\d+)rem$/

/** What was typed, with each bare number as a length. `scaled` says the page has Tailwind's --spacing to work from */
export function gapValue(text, scaled) {
  return text
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (!/^\d*\.?\d+$/.test(part)) return part
      if (Number(part) === 0) return '0px'
      return scaled ? `calc(var(--spacing) * ${Number(part)})` : `${Number(part) * 0.25}rem`
    })
    .join(' ')
}

/** A gap as steps of the scale, as it's typed, or null where any part of it isn't on the scale */
export function gapSteps(value) {
  const parts = value.trim().split(/\s+(?![^(]*\))/).map((part) => {
    if (part === '0px') return 0
    if (STEP.test(part)) return Number(STEP.exec(part)[1])
    return REM.test(part) ? Number(REM.exec(part)[1]) * 4 : null
  })
  // The scale goes up in halves at the small end, and anything finer isn't on it
  return value.trim() && parts.every((step) => step !== null && Number.isInteger(step * 2)) ? parts.join(' ') : null
}

/** The Tailwind classes for a gap: gap-4, or gap-y-4 gap-x-8 for rows then columns */
export function gapClasses(value) {
  const steps = gapSteps(value)?.split(' ')
  if (!steps || steps.length > 2) return null
  if (steps.length === 1 || steps[0] === steps[1]) return `gap-${steps[0]}`
  // No gap one way needs no class of its own
  return [steps[0] !== '0' && `gap-y-${steps[0]}`, steps[1] !== '0' && `gap-x-${steps[1]}`].filter(Boolean).join(' ')
}

const PREFIXES = { padding: 'p', 'padding-inline': 'px', 'padding-block': 'py', 'padding-top': 'pt', 'padding-right': 'pr', 'padding-bottom': 'pb', 'padding-left': 'pl' }

/** The Tailwind classes for a gap or a padding on the scale, or null */
export function spacingClasses(property, value) {
  if (property === 'gap') return gapClasses(value)
  const steps = gapSteps(value)
  return PREFIXES[property] && steps && !steps.includes(' ') ? `${PREFIXES[property]}-${steps}` : null
}

/** Declarations with padding's sides gathered: four alike as padding, and a matching pair as padding-inline or padding-block */
export function gatherPadding(declarations) {
  const gathered = new Map(declarations)
  const side = (name) => gathered.get(`padding-${name}`)
  const gather = (names, property) => {
    const value = side(names[0])
    if (!value || names.some((name) => side(name) !== value)) return false
    for (const name of names) gathered.delete(`padding-${name}`)
    gathered.set(property, value)
    return true
  }
  if (!gather(['top', 'right', 'bottom', 'left'], 'padding')) {
    gather(['left', 'right'], 'padding-inline')
    gather(['top', 'bottom'], 'padding-block')
  }
  return gathered
}
