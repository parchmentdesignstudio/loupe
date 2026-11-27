// Gaps on Tailwind's spacing scale, where a bare number is that many steps: 4 is gap-4, which is 1rem unless the
// site has changed --spacing

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
  return steps.length === 1 || steps[0] === steps[1] ? `gap-${steps[0]}` : `gap-y-${steps[0]} gap-x-${steps[1]}`
}
