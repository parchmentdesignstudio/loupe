import data from '../data.js'

export const variants = ['line', 'solid']
export const sizes = [16, 24]

// The drawn size closest to what’s asked for, so a 20px icon uses the 24 grid
// and a 16 icon missing at 16 falls back to its 24 drawing.
export function resolveIcon(name, { variant = 'line', size = 16 } = {}) {
  const order = [...sizes].sort((a, b) => Math.abs(a - size) - Math.abs(b - size) || b - a)
  for (const drawn of order) {
    const icon = data[`${variant}/${drawn}/${name}`]
    if (icon) return { ...icon, name, variant, drawn }
  }
  return null
}

export function iconAttributes({ size = 16, label } = {}) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    fill: 'none',
    focusable: 'false',
    ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }),
  }
}

function escape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

// A complete <svg> string, for templates, emails or anything without a component.
export function toSvg(name, { variant = 'line', size = 16, label, class: className } = {}) {
  const icon = resolveIcon(name, { variant, size })
  if (!icon) throw new Error(`Unknown icon: ${variant}/${name}`)
  const attrs = { ...iconAttributes({ size, label }), viewBox: icon.viewBox, ...(className ? { class: className } : {}) }
  const open = Object.entries(attrs).map(([k, v]) => `${k}="${escape(v)}"`).join(' ')
  return `<svg ${open}>${icon.body}</svg>`
}

export function iconNames({ variant, size } = {}) {
  return Object.keys(data)
    .map((key) => key.split('/'))
    .filter(([v, s]) => (!variant || v === variant) && (!size || Number(s) === size))
    .map(([, , name]) => name)
    .filter((name, i, list) => list.indexOf(name) === i)
    .sort()
}
