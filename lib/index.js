import data from '../data.js'

// A version drawn for the size wins. Otherwise the company’s own logo scales to it.
export function resolveLogo(name, { size = 16 } = {}) {
  const drawn = data[`${size}/${name}`]
  const logo = drawn ?? data[name]
  if (!logo) return null
  const [, , w, h] = logo.viewBox.split(/[\s,]+/).map(Number)
  return { ...logo, name, size, drawn: Boolean(drawn), width: Math.round((size * w * 100) / h) / 100, height: size }
}

export function logoAttributes({ width, height, viewBox }, { label } = {}) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width,
    height,
    viewBox,
    fill: 'currentColor',
    focusable: 'false',
    ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }),
  }
}

function escape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

// A complete <svg> string, for templates, emails or anything without a component.
export function toSvg(name, { size = 16, label, class: className } = {}) {
  const logo = resolveLogo(name, { size })
  if (!logo) throw new Error(`No logo called ${name} at ${size}px`)
  const attrs = { ...logoAttributes(logo, { label }), ...(className ? { class: className } : {}) }
  const open = Object.entries(attrs).map(([k, v]) => `${k}="${escape(v)}"`).join(' ')
  return `<svg ${open}>${logo.body}</svg>`
}

export function logoNames() {
  return [...new Set(Object.keys(data).map((key) => key.split('/').pop()))].sort()
}
