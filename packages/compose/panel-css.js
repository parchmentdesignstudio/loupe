// Compiles src/panel.css with Tailwind and hands it over as a string, for Compose to put in its shadow root.
// Tailwind's own Vite plugin would put it on the page, where its reset would restyle the site being worked on
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { compile, optimize } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'

const name = 'virtual:compose-panel-styles'
const base = fileURLToPath(new URL('./src', import.meta.url))
const from = `${base}/panel.css`
const ui = fileURLToPath(new URL('../ui/lib', import.meta.url))

// The files of Loupe's that the panel is drawn with: the components panel.jsx names, and each file those bring in.
// Tailwind reads only these, so the sheet holds the panel's classes rather than every component's, at under half the size
async function used(watch) {
  const index = await readFile(`${ui}/index.js`, 'utf8')
  const names = (await readFile(`${base}/panel.jsx`, 'utf8')).match(/import \{([^}]+)\} from '@parchment\/ui'/)?.[1].split(',').map((each) => each.trim()) ?? []
  const files = new Set()
  const visit = async (file) => {
    if (files.has(file)) return
    files.add(file)
    watch(`${ui}/${file}`)
    for (const [, next] of (await readFile(`${ui}/${file}`, 'utf8')).matchAll(/from '\.\/([\w-]+\.js)'/g)) await visit(next)
  }
  for (const each of names) {
    const file = index.match(new RegExp(`^export \\{[^}]*\\b${each}\\b[^}]*\\} from '\\./([\\w-]+\\.js)'`, 'm'))?.[1]
    if (!file) throw new Error(`panel.jsx uses ${each}, which packages/ui/lib/index.js doesn’t export. Build @parchment/ui first`)
    await visit(file)
  }
  return [...files].map((file) => ({ base: ui, pattern: file, negated: false }))
}

// Tailwind's shadows and rings start from registered properties, which a shadow root can't register, and registering
// them on the page instead makes the browser restyle all of it. Tailwind also writes each one's first value as a
// plain declaration on every element, for browsers without @property, behind an @supports that only they pass. Here
// that @supports is taken off, so the values are always set, on the panel's own elements and nowhere else, and the
// @property rules go. The sheet is written for a page, so its :root becomes the shadow root's host, and Compose's
// reset layer (src/styles.js) is named first, to sit under Tailwind's own
const FALLBACK = /@layer properties\{@supports [^{]+\{([^{}]*\{[^{}]*\})\}\}/
function forShadowRoot(css, fail) {
  if (!FALLBACK.test(css)) fail('Tailwind’s sheet no longer has its fallback for @property, which the panel’s styles in a shadow root are made from. See forShadowRoot in panel-css.js')
  const made = css.replace(FALLBACK, '@layer properties{$1}').replace(/@property[^{]+\{[^}]*\}/g, '').replaceAll(':root', ':host')
  return `@layer reset;${made}`
}

export function panelCss() {
  return {
    name: 'compose-panel-css',
    resolveId: (source) => (source === name ? `\0${name}` : undefined),
    async load(id) {
      if (id !== `\0${name}`) return
      const compiler = await compile(await readFile(from, 'utf8'), { base, from, onDependency: (file) => this.addWatchFile(file) })
      const root = compiler.root === 'none' ? [] : compiler.root === null ? [{ base, pattern: '**/*', negated: false }] : [{ ...compiler.root, negated: false }]
      const scanner = new Scanner({ sources: [...root, ...compiler.sources, ...(await used((file) => this.addWatchFile(file)))] })
      const { code } = optimize(compiler.build(scanner.scan()), { minify: true })
      return `export default ${JSON.stringify(forShadowRoot(code, (message) => this.error(message)))}`
    },
  }
}
