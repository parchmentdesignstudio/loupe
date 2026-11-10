#!/usr/bin/env node
// Writes Parchment’s colours, type, corners, spacing and elevation from packages/ui/tokens.css into the Elyx design
// project: colour, type and length tokens in design/tokens, and a component per shadow and per text style in
// design/components. The CSS is the source, so edit it and run this again. --check writes nothing, and fails when
// the files are out of date, or a component uses a tint, corner or spacing step the tokens don’t have
//
//   pnpm elyx:tokens
//   pnpm elyx:tokens --check

import fs from 'node:fs'
import path from 'node:path'

const root = path.join(import.meta.dirname, '..')
const css = fs.readFileSync(path.join(root, 'packages/ui/tokens.css'), 'utf8')

// The strengths tokens.css mixes tints at. Elyx can’t mix a token by the theme, so each bleed gets one per strength
const strengths = [4, 8, 12, 16, 24, 32]

// The steps of --spacing that Elyx gets, as tokens.css lists them. Tailwind takes any multiple, but Elyx needs a token
// for each
const steps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 16]

// The fill and corners each shadow goes with in the components, and what it’s for
const levels = {
  raised: { fill: 'raised', corners: 'radius-lg', caption: 'Buttons, chips and fields' },
  floating: { fill: 'overlay', corners: 'radius-xl', caption: 'Floating toolbars' },
  overlay: { fill: 'overlay', corners: 'radius-lg', caption: 'Popovers and menus. Dialogs and sheets round to radius-3xl' },
  invalid: { fill: 'raised', corners: 'radius-lg', caption: 'A field whose value is wrong' },
}

// The families tokens.css names, from their Adobe Fonts web names to the names the same fonts have on the desktop,
// which is where Elyx finds them
const families = { 'elza-round-variable': 'Elza Round Variable', 'auger-mono': 'Auger Mono' }

// What each text style is for. Weights aren’t tokens, so the captions say where the components change one
const styles = {
  body: 'Running text. A toast’s title sets it in Medium',
  control: 'Buttons, fields, labels, options and tabs. Buttons, selects, tabs, toggles, navigation links and a chosen option set it in Medium',
  label: 'Descriptions, errors, tags, tooltips and a toast’s message. Section headers set it in Auger Mono',
  title: 'Dialog headings, set in Medium',
}

// Colours Elyx writes by name
const named = { '#ffffff': '.white', '#000000': '.black' }

// The inside of each block the selector opens, in order
function blocks(selector) {
  const found = []
  for (let at = css.indexOf(`${selector} {`); at !== -1; at = css.indexOf(`${selector} {`, at + 1)) {
    const open = css.indexOf('{', at)
    for (let i = open, depth = 0; i < css.length; i++) {
      if (css[i] === '{') depth++
      if (css[i] === '}' && --depth === 0) {
        found.push(css.slice(open + 1, i))
        break
      }
    }
  }
  return found
}
const block = (selector) => blocks(selector)[0]

// Each custom property in a block, with the comment above it
function declarations(body) {
  const list = []
  let comment = []
  for (const [, note, name, value] of body.matchAll(/\/\*([\s\S]*?)\*\/|(--[\w-]+):\s*([^;]+);/g)) {
    if (note) comment.push(...note.trim().split('\n').map((line) => line.trim()))
    else {
      list.push({ name: name.slice(2), value: value.trim(), comment })
      comment = []
    }
  }
  return list
}

// Splits a function’s arguments at its top-level commas
function split(inner) {
  const parts = ['']
  let depth = 0
  for (const char of inner) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === ',' && depth === 0) parts.push('')
    else parts[parts.length - 1] += char
  }
  return parts.map((part) => part.trim())
}

// OKLCH to sRGB hex, as the design project keeps its colours in hex
function hex(l, c, h) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lms = [l + 0.3963377774 * a + 0.2158037573 * b, l - 0.1055613458 * a - 0.0638541728 * b, l - 0.0894841775 * a - 1.291485548 * b].map((x) => x ** 3)
  const rgb = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ]
  const value = `#${rgb
    .map((x) => {
      const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
      if (v < -0.001 || v > 1.001) throw new Error(`oklch(${l} ${c} ${h}) is outside sRGB, which hex can’t hold`)
      return Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')
    })
    .join('')}`
  return named[value] ?? value
}

// A colour as a value for each theme, or nothing for a value that isn’t a colour, such as a font. A value is
// a hex, the name of a colour above it, or a mix of one
const known = new Set()
function colour(value) {
  const [, fn, inner] = /^([\w-]+)\((.*)\)$/s.exec(value.trim()) ?? []
  if (fn === 'oklch') {
    const [l, c, h] = inner.split(/\s+/).map((part) => (part.endsWith('%') ? parseFloat(part) / 100 : parseFloat(part)))
    const literal = { hex: hex(l, c, h) }
    return { light: literal, dark: literal }
  }
  if (fn === 'var') {
    const name = inner.trim().slice(2)
    return known.has(name) ? { light: { name }, dark: { name } } : undefined
  }
  if (fn === 'light-dark') {
    const [light, dark] = split(inner).map(colour)
    return light && dark && { light: light.light, dark: dark.dark }
  }
  if (fn === 'color-mix') {
    const [, base, amount] = /^in oklab, (.+) (\d+)%, transparent$/.exec(inner.trim()) ?? []
    const mixed = base && colour(base)
    return mixed && { light: { ...mixed.light, amount }, dark: { ...mixed.dark, amount } }
  }
}

const palette = []
const roles = []
for (const declaration of declarations(block(':root'))) {
  const value = colour(declaration.value)
  if (!value) continue
  known.add(declaration.name)
  ;(value.light.hex ? palette : roles).push({ ...declaration, ...value })
}
const paletteNames = new Set(palette.map(({ name }) => name))
const bleeds = roles.filter(({ name }) => name.endsWith('-bleed'))

// A colour in Elyx. The dark roles name the palette through colors.elyx, as they only inherit it
const write = (value, prefix = '') => {
  const name = value.hex ?? (paletteNames.has(value.name) ? prefix : '') + value.name
  return value.amount ? `opacity(${name}, ${value.amount}%)` : name
}

const theme = declarations(block('@theme inline'))
const shadows = theme
  .filter(({ name }) => name.startsWith('shadow-'))
  .map(({ name, value }) => {
    const level = levels[name.slice('shadow-'.length)]
    if (!level) throw new Error(`Add --${name} to the levels in scripts/elyx-tokens.mjs`)
    const drops = split(value).map((layer) => {
      const [, lengths, colourName] = /^(.*) var\(--([\w-]+)\)$/.exec(layer)
      if (!known.has(colourName)) throw new Error(`--${name} uses --${colourName}, which isn’t a colour in :root`)
      const [x, y, blur = 0, spread = 0] = lengths.split(/\s+/).map(parseFloat)
      const drop = { color: `base.colors.${colourName}` }
      if (x || y) drop.offset = `point(${x}px, ${y}px)`
      if (blur) drop['blur-radius'] = `${blur}px`
      if (spread) drop.spread = `${spread}px`
      return { 'drop-shadow': drop }
    })
    // CSS paints its first shadow on top, and Elyx its last, so the order flips
    return { name: name.slice('shadow-'.length), ...level, shadow: drops.length === 1 ? drops[0] : drops.toReversed() }
  })

// The type: the sizes and leadings the text-* utilities point at, in points and as multiples of the size, and the
// families behind font-*
const variable = (value) => /^var\(--([\w-]+)\)$/.exec(value.trim())?.[1]
// Elyx keeps a number to two decimal places, and rounds a line to the nearest pixel
const round = (value) => Number(value.toFixed(2))
const number = (value) => {
  const [, amount, unit] = /^([\d.]+)(rem|px)?$/.exec(value.trim()) ?? []
  if (!amount) throw new Error(`${value} isn’t a size or a multiple, which Elyx takes as a number`)
  return String(round(parseFloat(amount) * (unit === 'rem' ? 16 : 1)))
}
const textStyles = theme
  .filter(({ name }) => name.startsWith('text-') && !name.includes('--'))
  .map(({ name, value }) => {
    const style = name.slice('text-'.length)
    if (!styles[style]) throw new Error(`Add --${name} to the styles in scripts/elyx-tokens.mjs`)
    const leading = theme.find((declaration) => declaration.name === `${name}--line-height`)
    return { name: style, caption: styles[style], size: variable(value), leading: leading && variable(leading.value) }
  })
const rootDeclarations = declarations(block(':root'))
// A leading is a multiple of the size, or a fixed line, such as control text’s 20px. Elyx takes line height only as a
// multiple, so a fixed line becomes one: the line over its text style’s size, in each context
const lineHeights = textStyles
  .filter(({ leading }) => /(?:rem|px)$/.test(rootDeclarations.find(({ name }) => name === leading)?.value.trim() ?? ''))
  .map(({ size, leading }) => ({ name: leading, size }))
const typeNames = new Set(textStyles.flatMap(({ size, leading }) => [size, leading]))
const typeDeclarations = rootDeclarations.filter(({ name }) => typeNames.has(name))
// The type in points and multiples, with a context’s changes on top
const typeValues = (changes = []) => {
  const values = new Map([...typeDeclarations, ...changes].map(({ name, value }) => [name, Number(number(value))]))
  for (const { name, size } of lineHeights) values.set(name, round(values.get(name) / values.get(size)))
  return values
}
const baseType = typeValues()
const typography = typeDeclarations.map((declaration) => {
  const line = lineHeights.find(({ name }) => name === declaration.name)
  const comment = line ? [...declaration.comment, `${number(declaration.value)}px in the CSS, and a multiple of ${line.size} here, as Elyx takes line height`] : declaration.comment
  return { ...declaration, comment, value: String(baseType.get(declaration.name)) }
})
const fontUtilities = new Map(theme.filter(({ name }) => name.startsWith('font-')).map(({ name, value }) => [variable(value), name]))
const fonts = rootDeclarations
  .filter(({ name }) => fontUtilities.has(name))
  .map((declaration) => {
    const first = split(declaration.value)[0].replace(/['"]/g, '')
    if (!families[first]) throw new Error(`Add ${first}’s desktop name to the families in scripts/elyx-tokens.mjs`)
    return { ...declaration, value: `"${families[first]}"` }
  })
const face = [...fontUtilities].find(([, utility]) => utility === 'font-sans')?.[0]

// The corners and spacing, in pixels: each --radius-* as it is, and --spacing at each step, named for Tailwind’s, so
// spacing-1-5 is p-1.5. Elyx keeps a length token as a number, as it does the type
const lengthDeclarations = blocks('@theme').flatMap(declarations)
const corners = lengthDeclarations.filter(({ name }) => name.startsWith('radius-')).map((declaration) => ({ ...declaration, value: number(declaration.value) }))
const spacing = lengthDeclarations.find(({ name }) => name === 'spacing')
if (!spacing) throw new Error('Set --spacing in an @theme block in tokens.css, as Elyx gets its spacing steps from it')
const space = steps.map((step, i) => ({
  name: `spacing-${String(step).replace('.', '-')}`,
  comment: i ? [] : [...spacing.comment, 'Named for Tailwind’s steps, so spacing-3 is p-3 or gap-3, and spacing-1-5 is p-1.5'],
  value: String(round(step * Number(number(spacing.value)))),
}))
for (const level of Object.values(levels)) {
  if (!corners.some(({ name }) => name === level.corners)) throw new Error(`A level in scripts/elyx-tokens.mjs rounds to --${level.corners}, which tokens.css doesn’t set`)
}

// A media query that changes the type, such as control text on touch screens, becomes a context of its own
const contexts = [...css.matchAll(/(?:\/\*((?:[^*]|\*(?!\/))*)\*\/\s*)?@media \(([\w-]+): ([\w-]+)\) \{/g)].map(([, note, feature, choice]) => {
  const changes = declarations(block(`@media (${feature}: ${choice})`))
  for (const { name } of changes) {
    if (!typeNames.has(name)) throw new Error(`--${name} changes in @media (${feature}: ${choice}), and only the type carries into Elyx as a context`)
  }
  // What the context changes, and any line whose multiple changes with its size
  const values = typeValues(changes)
  const changed = typeDeclarations
    .filter(({ name }) => values.get(name) !== baseType.get(name))
    .map(({ name, value }) => {
      const line = lineHeights.find((item) => item.name === name)
      const comment = line && !changes.some((change) => change.name === name) ? [`Still ${number(value)}px, as a multiple of ${line.size}`] : []
      return { name, comment, value: String(values.get(name)) }
    })
  return { feature, choice, note: note?.trim().replace(/\s+/g, ' '), changes: changed }
})

// A value as Elyx lays it out: on one line when that fits in 80 columns, otherwise an entry a line
const inline = (value) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return `[${value.map(inline).join(', ')}]`
  return `{${Object.entries(value).map(([key, entry]) => `${key}: ${inline(entry)}`).join(', ')}}`
}
function layout(value, indent, prefix = '', suffix = '') {
  const flat = `${indent}${prefix}${inline(value)}${suffix}`
  if (typeof value === 'string' || flat.length <= 80) return flat
  const entries = Array.isArray(value) ? value.map((entry) => ['', entry]) : Object.entries(value).map(([key, entry]) => [`${key}: `, entry])
  const inner = entries.map(([key, entry], i) => layout(entry, `${indent}  `, key, i < entries.length - 1 ? ',' : ''))
  const [open, close] = Array.isArray(value) ? '[]' : '{}'
  return `${indent}${prefix}${open}\n${inner.join('\n')}\n${indent}${close}${suffix}`
}

const lines = (comment, indent = '  ') => comment.map((line) => `${indent}// ${line}`).join('\n') + (comment.length ? '\n' : '')
// A comment of one paragraph, wrapped to 120 columns
const paragraph = (text) =>
  text
    .split(' ')
    .reduce((rows, word) => (rows.length && `// ${rows.at(-1)} ${word}`.length <= 120 ? [...rows.slice(0, -1), `${rows.at(-1)} ${word}`] : [...rows, word]), [])
    .map((row) => `// ${row}`)
    .join('\n')
const members = (list, value) => list.map((item) => `${lines(item.comment ?? [])}  ${item.name}: ${value(item)}`).join(',\n')
const tints = (group) =>
  bleeds.flatMap((bleed) => strengths.map((strength) => ({ name: `${bleed.name.replace(/-bleed$/, '')}-${strength}`, value: `opacity(${group}.${bleed.name}, ${strength}%)` })))
const source = 'Written from packages/ui/tokens.css by pnpm elyx:tokens, so edit the CSS rather than this file.'

// A component, with its properties in the order Elyx writes them
const component = (kind, name, properties) => {
  const entries = Object.entries(properties).filter(([, value]) => value !== undefined)
  return `export ${name} = ${kind} {\n${entries.map(([key, value], i) => layout(value, '  ', `${key}: `, i < entries.length - 1 ? ',' : '')).join('\n')}\n}`
}

// A frame per shadow and a text layer per text style, each set side by side on the canvas
const frame = (level, index) =>
  component('frame', level.name, {
    caption: `"${level.caption}"`,
    left: `${index * 208}px`,
    top: '0px',
    width: '160px',
    height: '96px',
    fill: `base.colors.${level.fill}`,
    shadow: level.shadow,
    'corner-radius': `l.lengths.${level.corners}`,
    slot: '.true',
  })
const textLayer = (style, index) =>
  component('text', style.name, {
    caption: `"${style.caption}"`,
    left: `${index * 208}px`,
    top: '0px',
    fill: 'base.colors.ink',
    contents: `"${style.name[0].toUpperCase()}${style.name.slice(1)}"`,
    'font-size': `t.typography.${style.size}`,
    'font-family': `f.fonts.${face}`,
    'line-height': style.leading && `t.typography.${style.leading}`,
  })

const files = {
  'tokens/colors.elyx': `import "./colors-dark.elyx" as dark

// Parchment’s colours: the palette, and the roles components use. colors-dark.elyx holds the roles’ dark values.
// ${source}
file {}

@variants(dark.dark-colors)
export colors = tokens {
${members(palette, (item) => write(item.light))},
${members(roles, (item) => write(item.light))}
}

// A tint is a layer’s bleed at ${strengths.slice(0, -1).join(', ')} or ${strengths.at(-1)}%, named for the layer it sits on, such as overlay-8 for a
// hovered menu item
@variants(dark.dark-tints)
export tints = tokens {
${members(tints('colors'), (item) => item.value)}
}
`,
  'tokens/colors-dark.elyx': `import "./colors.elyx" as base

// The dark values of colors.elyx. Every role is here, even one that only names another, as a role colors.elyx
// gives keeps its light value in the dark. ${source}
@context(theme="dark")
file {}

export dark-colors = tokens : base.colors {
${members(roles, (item) => write(item.dark, 'base.colors.'))}
}

export dark-tints = tokens : base.tints {
${members(tints('dark-colors'), (item) => item.value)}
}
`,
  'tokens/typography.elyx': `${contexts.map(({ choice }) => `import "./typography-${choice}.elyx" as ${choice}\n`).join('')}${contexts.length ? '\n' : ''}// Parchment’s type: the sizes the text components use, in points, and their leadings, as multiples of the size.
// fonts.elyx names the families.${contexts.map(({ feature, choice }) => ` typography-${choice}.elyx holds the sizes in the ${feature}=${choice} context.`).join('')}
// ${source}
file {}

${contexts.length ? `@variants(${contexts.map(({ choice }) => `${choice}.${choice}-typography`).join(', ')})\n` : ''}export typography = tokens {
${members(typography, (item) => item.value)}
}
`,
  'tokens/lengths.elyx': `// Parchment’s lengths: the corners and the steps of the spacing, in pixels, named as in Tailwind, so radius-lg is
// rounded-lg and spacing-3 is p-3.
// ${source}
file {}

export lengths = tokens {
${members([...corners, ...space], (item) => item.value)}
}
`,
  'tokens/fonts.elyx': `// Parchment’s families, by the names they have on the desktop, which is where Elyx finds them once they’re activated
// in Adobe Fonts.
// ${source}
file {}

export fonts = tokens {
${members(fonts, (item) => item.value)}
}
`,
  ...Object.fromEntries(
    contexts.map(({ feature, choice, note, changes }) => [
      `tokens/typography-${choice}.elyx`,
      `import "./typography.elyx" as base

${paragraph(`The type in the ${feature}=${choice} context${note ? `: ${note}` : ''}.`)}
// ${source}
@context(${feature}="${choice}")
file {}

export ${choice}-typography = tokens : base.typography {
${members(changes, (item) => item.value)}
}
`,
    ]),
  ),
  'components/elevation.elyx': `import "tokens/colors.elyx" as base
import "tokens/lengths.elyx" as l

// Parchment’s elevation: a frame per shadow, with the fill and corners it goes with. Instance one and give it a size
// and contents. Each shadow is a soft drop and a 1px edge, in colours from colors.elyx, so it follows the theme.
// ${source}
file {}

${shadows.map(frame).join('\n\n')}
`,
  'components/text.elyx': `import "tokens/typography.elyx" as t
import "tokens/fonts.elyx" as f
import "tokens/colors.elyx" as base

// Parchment’s text styles: a text layer per text-* utility, in ink, with its size and leading from typography.elyx and
// its family from fonts.elyx. Instance one, then set its contents, and its colour or weight where the design needs them.
// ${source}
file {}

${textStyles.map(textLayer).join('\n\n')}
`,
}

// What the components use that Elyx needs a token for: the tints they mix, the corners they round to and the steps
// they space by, in padding, margins and gaps
const problems = []
const used = { strengths: new Set(), corners: new Set(), steps: new Set() }
for (const file of fs.readdirSync(path.join(root, 'packages/ui/src'))) {
  const text = fs.readFileSync(path.join(root, 'packages/ui/src', file), 'utf8')
  for (const [, strength] of text.matchAll(/bleed\/(\d+)/g)) used.strengths.add(Number(strength))
  for (const [, size] of text.matchAll(/\brounded(?:-(?:[setblr]|ss|se|es|ee|tl|tr|bl|br))?-(xs|sm|md|lg|xl|\dxl)\b/g)) used.corners.add(`radius-${size}`)
  for (const [, name] of text.matchAll(/var\(--(radius-[\w-]+)\)/g)) used.corners.add(name)
  for (const [, step] of text.matchAll(/(?<![\w-])-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?)-(\d+(?:\.\d+)?)(?![\w.])/g)) used.steps.add(Number(step))
  for (const [, step] of text.matchAll(/--spacing\(([\d.]+)\)/g)) used.steps.add(Number(step))
}
for (const strength of used.strengths) {
  if (!strengths.includes(strength)) problems.push(`A component mixes bleed at ${strength}%, which has no tint. Use one of ${strengths.join(', ')}, or add it to scripts/elyx-tokens.mjs`)
}
const cornerNames = corners.map(({ name }) => name)
for (const corner of used.corners) {
  if (!cornerNames.includes(corner)) problems.push(`A component rounds to --${corner}, which tokens.css doesn’t set. Use one of ${cornerNames.join(', ')}, or add it to tokens.css`)
}
for (const step of used.steps) {
  if (step && !steps.includes(step)) problems.push(`A component spaces by ${step}, a step Elyx has no token for. Use one of ${steps.join(', ')}, or add it to tokens.css and scripts/elyx-tokens.mjs`)
}

const check = process.argv.includes('--check')
for (const [name, text] of Object.entries(files)) {
  const file = path.join(root, 'design', name)
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  if (current === text) continue
  if (check) problems.push(`design/${name} is out of date with tokens.css. Run pnpm elyx:tokens`)
  else {
    fs.writeFileSync(file, text)
    console.log(`Wrote design/${name}`)
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
if (check) console.log('The Elyx tokens match tokens.css')
